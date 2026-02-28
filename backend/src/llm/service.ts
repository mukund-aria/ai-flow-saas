/**
 * LLM Service
 *
 * Handles communication with Anthropic's Claude API.
 * Uses Claude's tool_use feature for guaranteed valid JSON responses.
 */

import Anthropic from '@anthropic-ai/sdk';
import { generateSystemPrompt, generateWorkflowContext } from './prompt-generator.js';
import { AI_RESPONSE_TOOLS, toolNameToMode } from './tools.js';
import { lookupGalleryTemplate } from '../data/template-lookup.js';
import type {
  AIResponse,
  LLMResult,
  LLMRequestOptions,
  ConversationMessage,
  StreamEvent,
  CreateResponse,
  EditResponse,
  ClarifyResponse,
  RejectResponse,
  RespondResponse,
} from './types.js';
import type { Flow } from '../models/workflow.js';

// ============================================================================
// Prompt Caching Types
// ============================================================================

type SystemContentBlock = {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
};

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TEMPERATURE = 0.7;

// ============================================================================
// LLM Service Class
// ============================================================================

export class LLMService {
  private client: Anthropic;
  private systemPrompt: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    // Anthropic SDK automatically reads ANTHROPIC_API_KEY from env
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.model = model || DEFAULT_MODEL;
    this.systemPrompt = generateSystemPrompt();
  }

  /**
   * Send a chat completion request to the LLM using tool_use
   * This guarantees valid JSON responses - no parsing errors possible
   */
  async chat(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    currentWorkflow: Flow | null,
    options: LLMRequestOptions & {
      hasPendingPlan?: boolean;
      pendingPlanName?: string;
      clarificationsPending?: boolean;
      publicPreview?: boolean;
    } = {}
  ): Promise<LLMResult> {
    try {
      // Build messages array
      const messages = this.buildMessages(
        userMessage,
        conversationHistory,
        currentWorkflow
      );

      // Build system prompt with workflow context and pending plan info
      const systemWithContext = this.buildSystemPromptWithContext(
        currentWorkflow,
        options.hasPendingPlan,
        options.pendingPlanName,
        options.clarificationsPending,
        options.publicPreview
      );

      // Call Claude API with tools for guaranteed structured output
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        system: systemWithContext,
        messages,
        tools: AI_RESPONSE_TOOLS,
        tool_choice: { type: 'any' }, // Force tool use
      });

      // Extract tool use block - guaranteed to be valid JSON
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');

      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        // Fallback: try to extract text (shouldn't happen with tool_choice: any)
        const textBlock = response.content.find(block => block.type === 'text');
        const rawContent = textBlock && textBlock.type === 'text' ? textBlock.text : '';
        return {
          success: false,
          rawContent,
          error: 'No tool use in response - Claude did not return structured data',
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      }

      // ── Agentic Tool Loop: handle lookup_template ──
      if (toolUseBlock.name === 'lookup_template') {
        const lookupInput = toolUseBlock.input as { templateName: string; category?: string };
        const template = lookupGalleryTemplate(lookupInput.templateName, lookupInput.category);
        const toolResultContent = template
          ? JSON.stringify(template, null, 2)
          : `No template found matching "${lookupInput.templateName}"${lookupInput.category ? ` in category "${lookupInput.category}"` : ''}. Proceed with creating the workflow from scratch based on the user's description.`;

        // Build continuation messages with tool_result
        const continuationMessages: Anthropic.MessageParam[] = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: toolResultContent,
            }],
          },
        ];

        // Second API call — the AI now has the template details
        const followUpResponse = await this.client.messages.create({
          model: this.model,
          max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
          temperature: options.temperature ?? DEFAULT_TEMPERATURE,
          system: systemWithContext,
          messages: continuationMessages,
          tools: AI_RESPONSE_TOOLS,
          tool_choice: { type: 'any' },
        });

        const followUpToolUse = followUpResponse.content.find(block => block.type === 'tool_use');

        if (!followUpToolUse || followUpToolUse.type !== 'tool_use') {
          return {
            success: false,
            error: 'No tool use in follow-up response after template lookup',
            usage: {
              inputTokens: response.usage.input_tokens + followUpResponse.usage.input_tokens,
              outputTokens: response.usage.output_tokens + followUpResponse.usage.output_tokens,
            },
          };
        }

        // If the follow-up also calls lookup_template, fall back (max 1 lookup per turn)
        if (followUpToolUse.name === 'lookup_template') {
          return {
            success: false,
            error: 'Template lookup loop detected - falling back',
            usage: {
              inputTokens: response.usage.input_tokens + followUpResponse.usage.input_tokens,
              outputTokens: response.usage.output_tokens + followUpResponse.usage.output_tokens,
            },
          };
        }

        const followUpMode = toolNameToMode(followUpToolUse.name);
        const followUpInput = followUpToolUse.input as Record<string, unknown>;
        const followUpRawContent = JSON.stringify(followUpInput, null, 2);
        const followUpAiResponse = this.buildAIResponseFromToolUse(followUpMode, followUpInput);

        return {
          success: true,
          response: followUpAiResponse,
          rawContent: followUpRawContent,
          usage: {
            inputTokens: response.usage.input_tokens + followUpResponse.usage.input_tokens,
            outputTokens: response.usage.output_tokens + followUpResponse.usage.output_tokens,
          },
        };
      }

      // Convert tool use to AIResponse format
      const mode = toolNameToMode(toolUseBlock.name);
      const toolInput = toolUseBlock.input as Record<string, unknown>;
      const rawContent = JSON.stringify(toolInput, null, 2);

      // Build the AIResponse based on mode
      const aiResponse = this.buildAIResponseFromToolUse(mode, toolInput);

      return {
        success: true,
        response: aiResponse,
        rawContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `LLM request failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Build AIResponse from tool_use input
   */
  private buildAIResponseFromToolUse(
    mode: 'create' | 'edit' | 'clarify' | 'reject' | 'respond' | 'lookup_template',
    toolInput: Record<string, unknown>
  ): AIResponse {
    switch (mode) {
      case 'create':
        return {
          mode: 'create',
          workflow: toolInput.workflow as Flow,
          message: toolInput.message as string,
          assumptions: toolInput.assumptions as string[] | undefined,
        } as CreateResponse;

      case 'edit':
        return {
          mode: 'edit',
          operations: toolInput.operations as EditResponse['operations'],
          message: toolInput.message as string,
          assumptions: toolInput.assumptions as string[] | undefined,
        } as EditResponse;

      case 'clarify':
        return {
          mode: 'clarify',
          questions: toolInput.questions as ClarifyResponse['questions'],
          context: toolInput.context as string,
        } as ClarifyResponse;

      case 'reject':
        return {
          mode: 'reject',
          reason: toolInput.reason as string,
          suggestion: toolInput.suggestion as string | undefined,
        } as RejectResponse;

      case 'respond':
        return {
          mode: 'respond',
          message: toolInput.message as string,
          suggestedActions: toolInput.suggestedActions as RespondResponse['suggestedActions'],
        } as RespondResponse;

      case 'lookup_template':
        // This should never be reached — lookup_template is handled by the agentic loop
        // before buildAIResponseFromToolUse is called. Fallback to a respond message.
        return {
          mode: 'respond',
          message: 'I looked up a template but encountered an unexpected state. Please try again.',
        } as RespondResponse;
    }
  }

  /**
   * Build message array for Claude API
   */
  private buildMessages(
    userMessage: string,
    history: ConversationMessage[],
    currentWorkflow: Flow | null
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message with workflow context if exists
    let finalUserMessage = userMessage;
    if (currentWorkflow && history.length === 0) {
      // First message with existing workflow - add context
      finalUserMessage = `${generateWorkflowContext(currentWorkflow)}\n\nUser request: ${userMessage}`;
    }

    messages.push({
      role: 'user',
      content: finalUserMessage,
    });

    return messages;
  }

  /**
   * Build system prompt with workflow context
   *
   * Returns an array of content blocks for the Anthropic API system parameter.
   * The static base prompt is marked with cache_control for prompt caching,
   * while dynamic per-request context is kept in a separate uncached block.
   */
  private buildSystemPromptWithContext(
    currentWorkflow: Flow | null,
    hasPendingPlan: boolean = false,
    pendingPlanName?: string,
    clarificationsPending: boolean = false,
    publicPreview: boolean = false
  ): SystemContentBlock[] {
    // Static base prompt — cached across turns via prompt caching
    const staticBlock: SystemContentBlock = {
      type: 'text',
      text: this.systemPrompt,
      cache_control: { type: 'ephemeral' },
    };

    // Dynamic context — changes per request, not cached
    let dynamicContext = '';

    if (currentWorkflow) {
      dynamicContext += `\n\n# Current Workflow Context

A workflow already exists. When the user requests changes, you should:
1. Generate "edit" mode responses with patch operations
2. Only generate "create" mode if the user explicitly wants to start over

The current workflow has ${currentWorkflow.steps.length} steps.`;
    } else {
      dynamicContext += `\n\n# Current Workflow Context

No workflow exists yet. When the user describes a process, generate a "create" mode response with a complete workflow.`;
    }

    if (hasPendingPlan) {
      dynamicContext += `\n\n# IMPORTANT: Pending Plan Awaiting Approval

There is a workflow preview ("${pendingPlanName || 'New Workflow'}") waiting for user approval.

When responding to questions or comments (using the "respond" tool):
- ALWAYS include approve/edit actions so the user can act directly from your response
- Include: { "label": "Approve workflow", "actionType": "approve_plan" }
- Include: { "label": "Make changes", "actionType": "edit_plan" }
- Optionally include: { "label": "Discard", "actionType": "discard_plan" }

Example suggestedActions when there's a pending plan:
[
  { "label": "Approve workflow", "actionType": "approve_plan" },
  { "label": "Make changes", "actionType": "edit_plan" },
  { "label": "Rename milestones", "prompt": "Rename the milestones to...", "actionType": "prompt" }
]`;
    }

    // Add context note if clarifications were asked in previous message
    if (clarificationsPending) {
      dynamicContext += `\n\nNote: You asked clarification questions in your previous message. The user's response follows.`;
    }

    // Public preview mode: one-shot creation, no clarification, concise output
    if (publicPreview) {
      dynamicContext += `\n\n# PUBLIC PREVIEW MODE

This is a public website preview. You MUST:
- ALWAYS use the "create" tool to generate a workflow immediately
- NEVER use the "clarify" tool — make reasonable assumptions instead
- NEVER use the "reject" or "respond" tools
- Keep workflows concise: maximum 10 steps
- Document your assumptions in the assumptions field
- Use simple, clear step names that demonstrate the workflow's value`;
    }

    const blocks: SystemContentBlock[] = [staticBlock];
    if (dynamicContext) {
      blocks.push({ type: 'text', text: dynamicContext });
    }
    return blocks;
  }

  /**
   * Refresh the system prompt (useful after config changes)
   */
  refreshSystemPrompt(): void {
    this.systemPrompt = generateSystemPrompt();
  }

  /**
   * Get the current system prompt (for debugging)
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * Set a custom model
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Analyze an image using Claude's vision capabilities
   * Used for extracting workflow descriptions from diagrams
   */
  async analyzeImage(
    imageData: string,
    mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
    userPrompt: string | undefined,
    conversationHistory: ConversationMessage[],
    currentWorkflow: Flow | null,
    options: LLMRequestOptions = {}
  ): Promise<LLMResult> {
    try {
      // Build vision-specific system prompt
      const visionSystemPrompt = `${this.systemPrompt}

# Image Analysis Instructions

You are analyzing a business process diagram or flowchart uploaded by the user.

Your task is to:
1. Carefully examine the uploaded diagram/image
2. Identify all steps, decision points, roles/actors, and transitions
3. Extract a structured understanding of the workflow
4. Generate a workflow in the standard ServiceFlow format

When analyzing the diagram:
- Map visual elements to workflow step types (FORM, APPROVAL, DECISION, etc.)
- Identify any branch/decision points and their paths
- Note any roles or assignees mentioned
- Preserve the logical flow order from the diagram
- If the diagram is unclear, use "clarify" mode to ask specific questions

${currentWorkflow
  ? `A workflow already exists. Consider whether the diagram represents changes to the existing workflow or a completely new workflow.`
  : `No workflow exists yet. Generate a "create" mode response with a complete workflow based on the diagram.`
}`;

      // Build messages with image content
      const messages: Anthropic.MessageParam[] = [];

      // Add conversation history
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add the image message
      const imageContent: Anthropic.ImageBlockParam = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageData,
        },
      };

      const textContent: Anthropic.TextBlockParam = {
        type: 'text',
        text: userPrompt
          ? `Please analyze this business process diagram and create a workflow based on it.\n\nAdditional context from user: ${userPrompt}`
          : 'Please analyze this business process diagram and create a workflow based on it.',
      };

      messages.push({
        role: 'user',
        content: [imageContent, textContent],
      });

      // Call Claude API with vision and tools
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        system: visionSystemPrompt,
        messages,
        tools: AI_RESPONSE_TOOLS,
        tool_choice: { type: 'any' }, // Force tool use
      });

      // Extract tool use block - guaranteed to be valid JSON
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');

      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        const textBlock = response.content.find(block => block.type === 'text');
        const rawContent = textBlock && textBlock.type === 'text' ? textBlock.text : '';
        return {
          success: false,
          rawContent,
          error: 'No tool use in response - Claude did not return structured data',
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      }

      // Convert tool use to AIResponse format
      const mode = toolNameToMode(toolUseBlock.name);
      const toolInput = toolUseBlock.input as Record<string, unknown>;
      const rawContent = JSON.stringify(toolInput, null, 2);

      // Build the AIResponse based on mode
      const aiResponse = this.buildAIResponseFromToolUse(mode, toolInput);

      return {
        success: true,
        response: aiResponse,
        rawContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Vision analysis failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Analyze a PDF document using Claude's document capabilities
   * Used for extracting workflow descriptions from process documentation
   */
  async analyzeDocument(
    documentData: string,
    userPrompt: string | undefined,
    conversationHistory: ConversationMessage[],
    currentWorkflow: Flow | null,
    options: LLMRequestOptions = {}
  ): Promise<LLMResult> {
    try {
      // Build document-specific system prompt
      const documentSystemPrompt = `${this.systemPrompt}

# Document Analysis Instructions

You are analyzing a business process document (PDF) uploaded by the user.

Your task is to:
1. Carefully examine the uploaded document
2. Identify all steps, decision points, roles/actors, and transitions described
3. Extract a structured understanding of the workflow
4. Generate a workflow in the standard ServiceFlow format

When analyzing the document:
- Map described processes to workflow step types (FORM, APPROVAL, DECISION, etc.)
- Identify any branch/decision points and their paths
- Note any roles or assignees mentioned
- Preserve the logical flow order from the document
- If the document is unclear or describes multiple workflows, use "clarify" mode to ask specific questions

${currentWorkflow
  ? `A workflow already exists. Consider whether the document represents changes to the existing workflow or a completely new workflow.`
  : `No workflow exists yet. Generate a "create" mode response with a complete workflow based on the document.`
}`;

      // Build messages with document content
      const messages: Anthropic.MessageParam[] = [];

      // Add conversation history
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add the document message using the document content block
      const documentContent: Anthropic.DocumentBlockParam = {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: documentData,
        },
      };

      const textContent: Anthropic.TextBlockParam = {
        type: 'text',
        text: userPrompt
          ? `Please analyze this business process document and create a workflow based on it.\n\nAdditional context from user: ${userPrompt}`
          : 'Please analyze this business process document and create a workflow based on it.',
      };

      messages.push({
        role: 'user',
        content: [documentContent, textContent],
      });

      // Call Claude API with document and tools
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        system: documentSystemPrompt,
        messages,
        tools: AI_RESPONSE_TOOLS,
        tool_choice: { type: 'any' }, // Force tool use
      });

      // Extract tool use block - guaranteed to be valid JSON
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');

      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        const textBlock = response.content.find(block => block.type === 'text');
        const rawContent = textBlock && textBlock.type === 'text' ? textBlock.text : '';
        return {
          success: false,
          rawContent,
          error: 'No tool use in response - Claude did not return structured data',
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      }

      // Convert tool use to AIResponse format
      const mode = toolNameToMode(toolUseBlock.name);
      const toolInput = toolUseBlock.input as Record<string, unknown>;
      const rawContent = JSON.stringify(toolInput, null, 2);

      // Build the AIResponse based on mode
      const aiResponse = this.buildAIResponseFromToolUse(mode, toolInput);

      return {
        success: true,
        response: aiResponse,
        rawContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Document analysis failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Stream a chat completion request to the LLM using tool_use
   * Yields events as they arrive for real-time UI updates
   * Tool use guarantees valid JSON - no parsing errors possible
   */
  async *chatStream(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    currentWorkflow: Flow | null,
    options: LLMRequestOptions & {
      hasPendingPlan?: boolean;
      pendingPlanName?: string;
      clarificationsPending?: boolean;
      publicPreview?: boolean;
    } = {}
  ): AsyncGenerator<StreamEvent, LLMResult, unknown> {
    try {
      // Build messages array
      const messages = this.buildMessages(
        userMessage,
        conversationHistory,
        currentWorkflow
      );

      // Build system prompt with workflow context and pending plan info
      const systemWithContext = this.buildSystemPromptWithContext(
        currentWorkflow,
        options.hasPendingPlan,
        options.pendingPlanName,
        options.clarificationsPending,
        options.publicPreview
      );

      // Yield thinking event
      yield { type: 'thinking', status: 'Analyzing request...' };

      // Create streaming request with tools
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        system: systemWithContext,
        messages,
        tools: AI_RESPONSE_TOOLS,
        tool_choice: { type: 'any' }, // Force tool use
      });

      // Track tool use data
      let toolInputJson = '';

      // Process stream events
      for await (const event of stream) {
        if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
          yield { type: 'thinking', status: 'Designing workflow...' };
        } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          // Stream the AI's conversational preamble text in real-time
          yield { type: 'content', chunk: event.delta.text };
        } else if (event.type === 'content_block_delta' && event.delta.type === 'input_json_delta') {
          // Accumulate the tool input JSON
          toolInputJson += event.delta.partial_json;
          // Yield empty chunk to keep connection alive (no raw JSON shown to user)
          yield { type: 'content', chunk: '' };
        }
      }

      // Get final message for usage stats
      const finalMessage = await stream.finalMessage();

      // Extract tool use from final message
      const toolUseBlock = finalMessage.content.find(block => block.type === 'tool_use');

      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        return {
          success: false,
          rawContent: toolInputJson,
          error: 'No tool use in response - Claude did not return structured data',
          usage: {
            inputTokens: finalMessage.usage.input_tokens,
            outputTokens: finalMessage.usage.output_tokens,
          },
        };
      }

      // ── Agentic Tool Loop: handle lookup_template in streaming ──
      if (toolUseBlock.name === 'lookup_template') {
        yield { type: 'thinking', status: 'Loading template details...' };

        const lookupInput = toolUseBlock.input as { templateName: string; category?: string };
        const template = lookupGalleryTemplate(lookupInput.templateName, lookupInput.category);
        const toolResultContent = template
          ? JSON.stringify(template, null, 2)
          : `No template found matching "${lookupInput.templateName}"${lookupInput.category ? ` in category "${lookupInput.category}"` : ''}. Proceed with creating the workflow from scratch based on the user's description.`;

        // Build continuation messages with tool_result
        const continuationMessages: Anthropic.MessageParam[] = [
          ...messages,
          { role: 'assistant', content: finalMessage.content },
          {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: toolResultContent,
            }],
          },
        ];

        yield { type: 'thinking', status: 'Adapting template to your needs...' };

        // Second streaming API call — the AI now has the template details
        const followUpStream = this.client.messages.stream({
          model: this.model,
          max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
          temperature: options.temperature ?? DEFAULT_TEMPERATURE,
          system: systemWithContext,
          messages: continuationMessages,
          tools: AI_RESPONSE_TOOLS,
          tool_choice: { type: 'any' },
        });

        // Process follow-up stream events
        let followUpToolInputJson = '';
        for await (const event of followUpStream) {
          if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
            yield { type: 'thinking', status: 'Designing workflow...' };
          } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield { type: 'content', chunk: event.delta.text };
          } else if (event.type === 'content_block_delta' && event.delta.type === 'input_json_delta') {
            followUpToolInputJson += event.delta.partial_json;
            yield { type: 'content', chunk: '' };
          }
        }

        const followUpFinalMessage = await followUpStream.finalMessage();
        const followUpToolUse = followUpFinalMessage.content.find(block => block.type === 'tool_use');

        if (!followUpToolUse || followUpToolUse.type !== 'tool_use') {
          return {
            success: false,
            rawContent: followUpToolInputJson,
            error: 'No tool use in follow-up response after template lookup',
            usage: {
              inputTokens: finalMessage.usage.input_tokens + followUpFinalMessage.usage.input_tokens,
              outputTokens: finalMessage.usage.output_tokens + followUpFinalMessage.usage.output_tokens,
            },
          };
        }

        // If the follow-up also calls lookup_template, fall back (max 1 lookup per turn)
        if (followUpToolUse.name === 'lookup_template') {
          return {
            success: false,
            error: 'Template lookup loop detected - falling back',
            usage: {
              inputTokens: finalMessage.usage.input_tokens + followUpFinalMessage.usage.input_tokens,
              outputTokens: finalMessage.usage.output_tokens + followUpFinalMessage.usage.output_tokens,
            },
          };
        }

        const followUpMode = toolNameToMode(followUpToolUse.name);
        const followUpInput = followUpToolUse.input as Record<string, unknown>;
        const followUpRawContent = JSON.stringify(followUpInput, null, 2);
        const followUpAiResponse = this.buildAIResponseFromToolUse(followUpMode, followUpInput);

        return {
          success: true,
          response: followUpAiResponse,
          rawContent: followUpRawContent,
          usage: {
            inputTokens: finalMessage.usage.input_tokens + followUpFinalMessage.usage.input_tokens,
            outputTokens: finalMessage.usage.output_tokens + followUpFinalMessage.usage.output_tokens,
          },
        };
      }

      // Convert tool use to AIResponse format
      const mode = toolNameToMode(toolUseBlock.name);
      const toolInput = toolUseBlock.input as Record<string, unknown>;
      const rawContent = JSON.stringify(toolInput, null, 2);

      // Build the AIResponse based on mode
      const aiResponse = this.buildAIResponseFromToolUse(mode, toolInput);

      return {
        success: true,
        response: aiResponse,
        rawContent,
        usage: {
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `LLM request failed: ${errorMessage}`,
      };
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let llmServiceInstance: LLMService | null = null;

/**
 * Get the LLM service singleton
 */
export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService();
  }
  return llmServiceInstance;
}

/**
 * Create a new LLM service instance (useful for testing)
 */
export function createLLMService(apiKey?: string, model?: string): LLMService {
  return new LLMService(apiKey, model);
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetLLMService(): void {
  llmServiceInstance = null;
}
