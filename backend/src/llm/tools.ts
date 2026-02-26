/**
 * Claude Tools Definitions
 *
 * Defines structured tools for Claude to guarantee valid JSON responses.
 * Using tool_use ensures the LLM returns properly structured data.
 */

import type Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// Tool Definitions
// ============================================================================

export const AI_RESPONSE_TOOLS: Anthropic.Tool[] = [
  {
    name: 'create_workflow',
    description: 'Create a new workflow based on user requirements. Use this when you have enough information to design a complete workflow.',
    input_schema: {
      type: 'object' as const,
      properties: {
        workflow: {
          type: 'object',
          description: 'The complete workflow definition',
          properties: {
            name: { type: 'string', description: 'Name of the workflow' },
            description: { type: 'string', description: 'Brief description of the workflow' },
            steps: {
              type: 'array',
              description: 'List of workflow steps',
              items: {
                type: 'object',
                properties: {
                  stepId: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: [
                      // Human Actions
                      'FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL',
                      'ACKNOWLEDGEMENT', 'ESIGN', 'DECISION', 'CUSTOM_ACTION', 'WEB_APP',
                      'PDF_FORM',
                      // Controls
                      'SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH',
                      'GOTO', 'GOTO_DESTINATION', 'TERMINATE', 'WAIT',
                      'SUB_FLOW',
                      // AI Automations
                      'AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE',
                      'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE',
                      // System Automations
                      'SYSTEM_WEBHOOK', 'SYSTEM_EMAIL',
                      'SYSTEM_CHAT_MESSAGE', 'BUSINESS_RULE',
                      // Integration Automations
                      'INTEGRATION_AIRTABLE', 'INTEGRATION_CLICKUP', 'INTEGRATION_DROPBOX',
                      'INTEGRATION_GMAIL', 'INTEGRATION_GOOGLE_DRIVE',
                      'INTEGRATION_GOOGLE_SHEETS', 'INTEGRATION_WRIKE'
                    ]
                  },
                  config: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Step name/title' },
                      description: { type: 'string', description: 'Step description' },
                      assignee: { type: 'string', description: 'Role name assigned to this step' },
                      paths: {
                        type: 'array',
                        description: 'For SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH, PARALLEL_BRANCH: Array of branch paths. IMPORTANT: Steps that should only run in a specific path must be NESTED inside that path, NOT at the top level.',
                        items: {
                          type: 'object',
                          properties: {
                            pathId: { type: 'string', description: 'Unique path identifier (e.g., path_1)' },
                            label: { type: 'string', description: 'Human-readable path label (e.g., "Small Amount", "Large Amount")' },
                            condition: { type: 'string', description: 'Optional condition expression' },
                            steps: {
                              type: 'array',
                              description: 'Steps that run ONLY in this path. These steps are NESTED inside the path, not at the top level.',
                              items: { type: 'object', description: 'Step object with type and config' }
                            }
                          },
                          required: ['pathId', 'label', 'steps']
                        }
                      },
                      outcomes: {
                        type: 'array',
                        description: 'For DECISION steps: Array of possible outcomes chosen by user. IMPORTANT: Steps that run after a specific decision must be NESTED inside that outcome.',
                        items: {
                          type: 'object',
                          properties: {
                            outcomeId: { type: 'string', description: 'Unique outcome identifier (e.g., outcome_1)' },
                            label: { type: 'string', description: 'Human-readable outcome label (e.g., "Approve", "Reject")' },
                            steps: {
                              type: 'array',
                              description: 'Steps that run ONLY when this outcome is chosen. These steps are NESTED inside the outcome.',
                              items: { type: 'object', description: 'Step object with type and config' }
                            }
                          },
                          required: ['outcomeId', 'label', 'steps']
                        }
                      },
                      skipSequentialOrder: { type: 'boolean', description: 'When true, this step starts without waiting for the previous step. Use for 2-3 concurrent steps.' },
                      // GOTO
                      targetGotoDestinationId: { type: 'string', description: 'For GOTO steps: stepId of the GOTO_DESTINATION to jump to' },
                      destinationLabel: { type: 'string', description: 'For GOTO_DESTINATION steps: label like "Point A"' },
                      // TERMINATE
                      terminateStatus: { type: 'string', enum: ['COMPLETED', 'CANCELLED'], description: 'For TERMINATE steps: the final flow status' },
                      // WAIT
                      waitType: { type: 'string', enum: ['DURATION', 'DATE', 'CONDITION'], description: 'For WAIT steps: type of wait' },
                      waitDuration: { type: 'object', properties: { value: { type: 'number' }, unit: { type: 'string', enum: ['minutes', 'hours', 'days'] } } },
                      // FORM
                      formFields: {
                        type: 'array', description: 'For FORM steps: fields to collect',
                        items: { type: 'object', properties: {
                          fieldId: { type: 'string' }, label: { type: 'string' },
                          type: { type: 'string', enum: ['TEXT_SINGLE_LINE', 'TEXT_MULTI_LINE', 'SINGLE_SELECT', 'MULTI_SELECT', 'DROPDOWN', 'FILE_UPLOAD', 'DATE', 'NUMBER', 'EMAIL', 'PHONE', 'CURRENCY', 'NAME', 'ADDRESS', 'SIGNATURE'] },
                          required: { type: 'boolean' }, options: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'string' } } } }
                        }}
                      },
                      // QUESTIONNAIRE
                      questionnaire: {
                        type: 'object', properties: {
                          questions: { type: 'array', items: { type: 'object', properties: {
                            questionId: { type: 'string' }, question: { type: 'string' },
                            answerType: { type: 'string', enum: ['SINGLE_SELECT', 'MULTI_SELECT', 'TEXT', 'YES_NO'] },
                            choices: { type: 'array', items: { type: 'string' } }, required: { type: 'boolean' }
                          }}}
                        }
                      },
                      // FILE_REQUEST
                      fileRequest: { type: 'object', properties: {
                        maxFiles: { type: 'number' }, allowedTypes: { type: 'array', items: { type: 'string' } }, instructions: { type: 'string' }
                      }},
                      // ESIGN
                      esign: { type: 'object', properties: {
                        documentName: { type: 'string' }, documentDescription: { type: 'string' },
                        signingOrder: { type: 'string', enum: ['SEQUENTIAL', 'PARALLEL'] }
                      }},
                      // AI Automation
                      aiAutomation: { type: 'object', properties: {
                        actionType: { type: 'string', enum: ['CUSTOM_PROMPT', 'EXTRACT', 'SUMMARIZE', 'TRANSCRIBE', 'TRANSLATE', 'WRITE'] },
                        prompt: { type: 'string', description: 'AI instructions' },
                        inputFields: { type: 'array', items: { type: 'object' } },
                        outputFields: { type: 'array', items: { type: 'object' } }
                      }},
                      // System Email
                      systemEmail: { type: 'object', properties: {
                        to: { type: 'array', items: { type: 'string' }, description: 'Recipients (supports DDR like "{Role: Client / Email}")' },
                        subject: { type: 'string' }, body: { type: 'string' }
                      }},
                      // System Webhook
                      systemWebhook: { type: 'object', properties: {
                        url: { type: 'string' }, method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH'] },
                        headers: { type: 'object' }, payload: { type: 'string' }
                      }},
                      // Sub Flow
                      subFlow: { type: 'object', properties: {
                        flowTemplateId: { type: 'string' },
                        assigneeMappings: { type: 'array', items: { type: 'object' } },
                        variableMappings: { type: 'array', items: { type: 'object' } }
                      }},
                      // PDF Form
                      pdfForm: { type: 'object', properties: {
                        documentUrl: { type: 'string' },
                        fields: { type: 'array', items: { type: 'object', properties: {
                          pdfFieldName: { type: 'string' }, label: { type: 'string' },
                          fieldType: { type: 'string', enum: ['text', 'checkbox', 'dropdown', 'radio', 'signature'] },
                          required: { type: 'boolean' }, dataRef: { type: 'string', description: 'DDR for pre-population' }
                        }}}
                      }},
                      // Integration
                      integration: { type: 'object', properties: {
                        provider: { type: 'string', enum: ['AIRTABLE', 'CLICKUP', 'DROPBOX', 'GMAIL', 'GOOGLE_DRIVE', 'GOOGLE_SHEETS', 'WRIKE'] },
                        event: { type: 'string' },
                        fieldMappings: { type: 'array', items: { type: 'object' } }
                      }}
                    },
                    required: ['name']
                  }
                },
                required: ['type', 'config']
              }
            },
            assigneePlaceholders: {
              type: 'array',
              description: 'Roles involved in the workflow',
              items: {
                type: 'object',
                properties: {
                  placeholderId: { type: 'string' },
                  roleName: { type: 'string', description: 'Name of the role (e.g., "Client", "Manager")' },
                  description: { type: 'string', description: 'Description of who fills this role' }
                },
                required: ['roleName']
              }
            },
            milestones: {
              type: 'array',
              description: 'Phases/stages of the workflow. Each milestone groups steps that follow it.',
              items: {
                type: 'object',
                properties: {
                  milestoneId: { type: 'string' },
                  name: { type: 'string', description: 'Phase name (e.g., "Initiation", "Review", "Completion")' },
                  afterStepId: { type: 'string', description: 'The stepId after which this milestone starts' }
                },
                required: ['name', 'afterStepId']
              }
            },
            triggerConfig: {
              type: 'object',
              description: 'How the workflow gets started. Always include this based on clarification answers about kickoff.',
              properties: {
                type: {
                  type: 'string',
                  enum: ['manual', 'kickoff_form', 'start_link', 'webhook', 'scheduled', 'integration'],
                  description: 'manual = someone clicks to start, kickoff_form = collect data first, start_link = shareable URL, webhook = triggered by external system, scheduled = runs on a schedule, integration = triggered by connected app'
                },
                initiator: { type: 'string', description: 'Who starts the workflow (for manual). e.g., "HR", "Manager", "Sales Rep"' },
                kickoffFields: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Data collected at kickoff via a form (for kickoff_form). e.g., ["Client Name", "Contact Email", "Project Type"]'
                },
                triggerSource: { type: 'string', description: 'External system that triggers (for webhook/integration). e.g., "Salesforce", "HubSpot webhook"' },
                schedule: { type: 'string', description: 'Schedule expression (for scheduled). e.g., "Daily at 9am", "Every Monday"' },
                flowVariables: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      key: { type: 'string' },
                      type: { type: 'string', enum: ['TEXT', 'FILE'] },
                      required: { type: 'boolean' },
                      description: { type: 'string' }
                    }
                  },
                  description: 'Variables available at flow initiation'
                }
              }
            },
            permissions: {
              type: 'object', description: 'Who can start, edit, and coordinate this flow',
              properties: {
                execute: { type: 'object', properties: { type: { type: 'string', enum: ['EXPLICIT_USERS', 'ALL_MEMBERS', 'ADMINS_ONLY'] } } },
                edit: { type: 'object', properties: { type: { type: 'string', enum: ['EXPLICIT_USERS', 'ALL_MEMBERS', 'ADMINS_ONLY'] } } },
                coordinate: { type: 'object', properties: { type: { type: 'string', enum: ['EXPLICIT_USERS', 'ALL_MEMBERS', 'ADMINS_ONLY'] } } }
              }
            },
            settings: {
              type: 'object', description: 'Flow-level settings',
              properties: {
                chatAssistanceEnabled: { type: 'boolean' },
                autoArchiveEnabled: { type: 'boolean' },
                assigneeExperience: { type: 'object', properties: {
                  viewMode: { type: 'string', enum: ['SPOTLIGHT', 'GALLERY'], description: 'SPOTLIGHT = focused task view, GALLERY = all visible steps' }
                }}
              }
            }
          },
          required: ['name', 'steps', 'assigneePlaceholders']
        },
        message: {
          type: 'string',
          description: 'Friendly message explaining what you created for the user'
        },
        assumptions: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of assumptions you made while designing the workflow'
        }
      },
      required: ['workflow', 'message']
    }
  },
  {
    name: 'ask_clarification',
    description: 'Ask clarifying questions before creating a workflow. Use this when you need more information from the user.',
    input_schema: {
      type: 'object' as const,
      properties: {
        questions: {
          type: 'array',
          description: 'List of questions to ask the user',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique question ID (e.g., q_roles, q_steps)' },
              text: { type: 'string', description: 'The question text' },
              inputType: {
                type: 'string',
                enum: ['text', 'text_with_file', 'selection'],
                description: 'Type of input expected'
              },
              placeholder: { type: 'string', description: 'Placeholder text for text inputs' },
              options: {
                type: 'array',
                description: 'Options for selection type questions',
                items: {
                  type: 'object',
                  properties: {
                    optionId: { type: 'string' },
                    label: { type: 'string' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    conditionalFields: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          fieldId: { type: 'string' },
                          label: { type: 'string' },
                          type: { type: 'string', enum: ['text', 'textarea'] },
                          placeholder: { type: 'string' },
                          required: { type: 'boolean' }
                        },
                        required: ['fieldId', 'label', 'type']
                      }
                    }
                  },
                  required: ['optionId', 'label']
                }
              }
            },
            required: ['id', 'text']
          }
        },
        context: {
          type: 'string',
          description: 'Friendly explanation of why you need this information'
        }
      },
      required: ['questions', 'context']
    }
  },
  {
    name: 'edit_workflow',
    description: 'Edit an existing workflow with patch operations. Use this when the user wants to modify their existing workflow.',
    input_schema: {
      type: 'object' as const,
      properties: {
        operations: {
          type: 'array',
          description: 'List of edit operations to apply',
          items: {
            type: 'object',
            properties: {
              op: {
                type: 'string',
                enum: [
                  'ADD_STEP_AFTER', 'ADD_STEP_BEFORE', 'REMOVE_STEP',
                  'UPDATE_STEP', 'MOVE_STEP',
                  'ADD_PATH_STEP_AFTER', 'ADD_PATH_STEP_BEFORE',
                  'ADD_BRANCH_PATH', 'REMOVE_BRANCH_PATH',
                  'ADD_OUTCOME', 'REMOVE_OUTCOME',
                  'UPDATE_GOTO_TARGET',
                  'ADD_MILESTONE', 'REMOVE_MILESTONE', 'MOVE_TO_MILESTONE',
                  'UPDATE_FLOW_METADATA', 'UPDATE_FLOW_SETTINGS',
                  'UPDATE_TRIGGER_CONFIG', 'UPDATE_PERMISSIONS'
                ],
                description: 'The operation type'
              },
              stepId: { type: 'string', description: 'Target step ID' },
              afterStepId: { type: 'string', description: 'Step to add after' },
              beforeStepId: { type: 'string', description: 'Step to add before' },
              branchStepId: { type: 'string', description: 'Branch step ID for path operations' },
              pathId: { type: 'string', description: 'Path ID for path operations' },
              step: {
                type: 'object',
                description: 'New step definition (for add operations)',
                properties: {
                  type: { type: 'string' },
                  config: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      assignee: { type: 'string' }
                    }
                  }
                }
              },
              updates: {
                type: 'object',
                description: 'Updates to apply (for update operations)'
              }
            },
            required: ['op']
          }
        },
        message: {
          type: 'string',
          description: 'Friendly message explaining what changes you made'
        },
        assumptions: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of assumptions you made about the changes'
        }
      },
      required: ['operations', 'message']
    }
  },
  {
    name: 'reject_request',
    description: 'Politely decline a request that cannot be fulfilled. Use this when the request violates platform constraints or is not appropriate for workflow design.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Clear explanation of why the request cannot be fulfilled'
        },
        suggestion: {
          type: 'string',
          description: 'Alternative approach or suggestion for the user'
        }
      },
      required: ['reason', 'suggestion']
    }
  },
  {
    name: 'respond',
    description: 'Respond conversationally to the user WITHOUT taking any workflow action. Use this for: answering questions about the current workflow, explaining what you did, providing information, or general conversation. Do NOT use ask_clarification for informational questions - use this instead. IMPORTANT: If there is a pending workflow preview waiting for approval, include approve/edit actions so the user can act directly from your response.',
    input_schema: {
      type: 'object' as const,
      properties: {
        message: {
          type: 'string',
          description: 'Your conversational response to the user. Can include markdown formatting.'
        },
        suggestedActions: {
          type: 'array',
          description: 'Quick actions the user might want to take. IMPORTANT: If there is a pending plan awaiting approval, ALWAYS include approve_plan and edit_plan actions.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Button label (e.g., "Approve workflow", "Make changes", "Rename milestones")' },
              prompt: { type: 'string', description: 'The prompt to send if user clicks this (required for "prompt" actionType)' },
              actionType: {
                type: 'string',
                enum: ['approve_plan', 'discard_plan', 'edit_plan', 'prompt'],
                description: 'Action type: approve_plan (approves pending workflow), discard_plan (discards it), edit_plan (opens edit input), prompt (sends the prompt as new message). Defaults to "prompt".'
              }
            },
            required: ['label']
          }
        }
      },
      required: ['message']
    }
  }
];

// ============================================================================
// Tool Name to Mode Mapping
// ============================================================================

/**
 * Map tool names to response modes
 */
export function toolNameToMode(toolName: string): 'create' | 'edit' | 'clarify' | 'reject' | 'respond' {
  switch (toolName) {
    case 'create_workflow':
      return 'create';
    case 'edit_workflow':
      return 'edit';
    case 'ask_clarification':
      return 'clarify';
    case 'reject_request':
      return 'reject';
    case 'respond':
      return 'respond';
    default:
      throw new Error(`Unknown tool name: ${toolName}`);
  }
}

/**
 * Map response modes to tool names (for instruction prompts)
 */
export function modeToToolName(mode: 'create' | 'edit' | 'clarify' | 'reject' | 'respond'): string {
  switch (mode) {
    case 'create':
      return 'create_workflow';
    case 'edit':
      return 'edit_workflow';
    case 'clarify':
      return 'ask_clarification';
    case 'reject':
      return 'reject_request';
    case 'respond':
      return 'respond';
  }
}
