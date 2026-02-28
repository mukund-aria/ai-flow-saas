import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { streamMessage, publishPlan, uploadFile, getSession, createTemplate } from '@/lib/api';
import { getUserFriendlyError } from '@/lib/friendly-errors';
import { isSmallEdit, buildChangeStatusMap, summarizeOperations } from '@/lib/proposal-utils';
import type { PendingPlan, Flow, MessageAttachment, Message, Clarification, SuggestedAction } from '@/types';

export function useChat() {
  const {
    messages,
    isStreaming,
    isThinking,
    thinkingStatus,
    streamingContent,
    pendingPlan,
    addUserMessage,
    addAssistantMessage,
    updateMessage,
    setStreaming,
    setThinking,
    appendStreamingContent,
    clearStreamingContent,
    setPendingPlan,
    setMessagePendingPlan,
    setMessageClarifications,
    setMessageRejection,
    setMessageEnhancement,
    setPrefillMessage,
    clearMessages,
    loadMessages,
  } = useChatStore();

  const { currentSessionId, setCurrentSession } = useSessionStore();
  const { setWorkflow, workflow, setSavedFlow, setSaving } = useWorkflowStore();

  // Track if we've already tried to load history for this session
  const historyLoadedRef = useRef<string | null>(null);

  // Load session history when reconnecting to an existing session
  useEffect(() => {
    async function loadHistory() {
      // Only load if we have a session ID, no messages, and haven't tried already
      if (
        currentSessionId &&
        messages.length === 0 &&
        historyLoadedRef.current !== currentSessionId
      ) {
        historyLoadedRef.current = currentSessionId;

        try {
          const session = await getSession(currentSessionId);

          let loadedMessages: Message[] = [];
          if (session?.messages?.length > 0) {
            // Convert session messages to Message format
            loadedMessages = session.messages.map(
              (m: {
                id: string;
                role: 'user' | 'assistant';
                content: string;
                timestamp: string;
                mode?: string;
                clarifications?: Clarification[];
                clarificationsLocked?: boolean;
                pendingPlan?: {
                  planId: string;
                  workflow: Flow;
                  message: string;
                  mode: 'create' | 'edit';
                };
                planPublished?: boolean;
              }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.timestamp),
                mode: m.mode as Message['mode'],
                clarifications: m.clarifications,
                clarificationsLocked: m.clarificationsLocked,
                pendingPlan: m.pendingPlan,
                planPublished: m.planPublished,
              })
            );
            loadMessages(loadedMessages);
          }

          if (session?.workflow && !workflow) {
            setWorkflow(session.workflow);
          }

          // Reconstruct proposal for unpublished pending plans
          const unpublishedPlan = loadedMessages.find(
            (m: Message) => m.pendingPlan && !m.planPublished
          )?.pendingPlan;
          if (unpublishedPlan && !isSmallEdit(unpublishedPlan)) {
            const changeStatusMap = buildChangeStatusMap(unpublishedPlan.operations || []);
            const operationSummary = summarizeOperations(
              unpublishedPlan.operations || [],
              unpublishedPlan.workflow.steps || []
            );
            useWorkflowStore.getState().setPendingProposal({
              plan: unpublishedPlan,
              changeStatusMap,
              operationSummary,
            });
          }
        } catch (e) {
          // Session may have expired - clear it and start fresh
          console.warn('Failed to load session history:', e);
          setCurrentSession(null);
          historyLoadedRef.current = null;
        }
      }
    }

    loadHistory();
  }, [currentSessionId, messages.length, loadMessages, setWorkflow, setCurrentSession, workflow]);

  const sendMessage = useCallback(
    async (
      content: string,
      attachment?: MessageAttachment,
      options?: {
        hideUserMessage?: boolean;
        thinkingStatus?: 'thinking' | 'analyzing' | 'creating' | 'editing' | 'refining';
      }
    ) => {
      if (!content.trim() && !attachment) return;

      // Lock any unlocked clarification cards when user sends a message directly
      // (instead of filling out the card)
      const currentMsgs = useChatStore.getState().messages;
      currentMsgs.forEach((msg) => {
        if (msg.clarifications && msg.clarifications.length > 0 && !msg.clarificationsLocked) {
          updateMessage(msg.id, { clarificationsLocked: true });
        }
      });

      // Add user message (unless hidden - e.g., for clarification answers shown in locked card)
      if (!options?.hideUserMessage) {
        addUserMessage(content, attachment);
      }

      // Start streaming - use provided status, or make smart initial guess based on context
      // If workflow exists, likely editing; otherwise likely creating
      const initialStatus = options?.thinkingStatus ?? (workflow ? 'editing' : 'creating');
      setStreaming(true);
      setThinking(true, initialStatus);
      clearStreamingContent();

      // Create abort controller for cancellation
      const abortController = new AbortController();
      useChatStore.getState().setAbortController(abortController);

      let assistantMessageId: string | null = null;
      let currentMode: string | null = null;

      try {
        console.log('[Chat] Sending message:', { content: content.substring(0, 100), sessionId: currentSessionId });

        const stream = streamMessage({
          message: content,
          sessionId: currentSessionId || undefined,
          stream: true,
          preview: true,
        }, abortController.signal);

        let eventCount = 0;
        for await (const event of stream) {
          eventCount++;
          console.log('[Chat] Event received:', event.type, event.data);

          switch (event.type) {
            case 'session': {
              const data = event.data as { sessionId: string; isNew: boolean };
              if (data.sessionId !== currentSessionId) {
                setCurrentSession(data.sessionId);
              }
              break;
            }

            case 'thinking': {
              setThinking(true);
              break;
            }

            case 'content': {
              const data = event.data as { chunk: string };
              // Stream real text content for ALL modes (create, edit, clarify, reject, respond)
              // Empty chunks (from JSON accumulation) are ignored
              if (data.chunk) {
                setThinking(false);
                appendStreamingContent(data.chunk);
              }
              break;
            }

            case 'mode': {
              const data = event.data as { mode: string; friendlyMessage?: string };
              currentMode = data.mode;

              // Update thinking status based on mode
              if (data.mode === 'create') {
                setThinking(true, 'creating');
              } else if (data.mode === 'edit') {
                setThinking(true, 'editing');
              }

              // For create/edit, we'll add the message when we get the workflow event
              // For clarify/reject/respond, create the message now and stream text
              if (data.mode !== 'create' && data.mode !== 'edit') {
                assistantMessageId = addAssistantMessage(
                  data.friendlyMessage || '',
                  data.mode as 'clarify' | 'reject' | 'respond'
                );
              }
              break;
            }

            case 'workflow': {
              const data = event.data as {
                workflow: Flow;
                message: string;
                isPreview: boolean;
                planId?: string;
                assumptions?: string[];
                operations?: Array<{ op: string; [key: string]: unknown }>;
              };

              // For workflow events, create the message now with pendingPlan
              // This replaces the thinking indicator with the plan preview card
              setThinking(false);
              clearStreamingContent();

              // Determine the mode - use currentMode or default to 'create'
              const workflowMode = (currentMode === 'edit' ? 'edit' : 'create') as 'create' | 'edit';

              if (data.isPreview && data.planId) {
                // Lock any existing pending plans before creating a new one
                // This prevents version conflicts from multiple pending plans
                const currentMsgs = useChatStore.getState().messages;
                currentMsgs.forEach((msg) => {
                  if (msg.pendingPlan && !msg.planPublished) {
                    updateMessage(msg.id, { planPublished: true });
                  }
                });
                const plan: PendingPlan = {
                  planId: data.planId,
                  workflow: data.workflow,
                  message: data.message,
                  assumptions: data.assumptions,
                  mode: workflowMode,
                  operations: data.operations as PendingPlan['operations'],
                };
                // Create message with pendingPlan in one go - use actual mode
                assistantMessageId = addAssistantMessage('', workflowMode);
                setMessagePendingPlan(assistantMessageId, plan);

                // Push to right-panel proposal for large edits / creates
                if (!isSmallEdit(plan)) {
                  const changeStatusMap = buildChangeStatusMap(plan.operations || []);
                  const operationSummary = summarizeOperations(plan.operations || [], plan.workflow.steps || []);
                  useWorkflowStore.getState().setPendingProposal({
                    plan,
                    changeStatusMap,
                    operationSummary,
                  });
                }
              } else if (!data.isPreview) {
                // Directly published (preview=false)
                assistantMessageId = addAssistantMessage(data.message, workflowMode);
                setWorkflow(data.workflow);
              }
              break;
            }

            case 'clarify': {
              const data = event.data as {
                questions: Array<{ id: string; text: string }>;
                context: string;
              };
              if (assistantMessageId) {
                updateMessage(assistantMessageId, { content: data.context });
                setMessageClarifications(assistantMessageId, data.questions);
              }
              break;
            }

            case 'reject': {
              const data = event.data as { reason: string; suggestion: string; message?: string };
              if (assistantMessageId) {
                if (data.message) {
                  updateMessage(assistantMessageId, { content: data.message });
                }
                setMessageRejection(assistantMessageId, {
                  reason: data.reason,
                  suggestion: data.suggestion,
                });
              }
              break;
            }

            case 'respond': {
              // Conversational response with optional suggested actions
              const data = event.data as {
                message: string;
                suggestedActions?: Array<{
                  label: string;
                  prompt?: string;
                  actionType?: 'approve_plan' | 'discard_plan' | 'edit_plan' | 'prompt';
                }>;
              };
              setThinking(false);
              clearStreamingContent();
              if (assistantMessageId) {
                updateMessage(assistantMessageId, {
                  content: data.message,
                  suggestedActions: data.suggestedActions,
                });
              }
              break;
            }

            case 'done': {
              const data = event.data as { success?: boolean; errors?: string[]; friendlyMessage?: string };
              console.log('[Chat] Stream complete, events received:', eventCount, 'success:', data.success);

              // If the response wasn't successful and we don't have a message yet, show error as message
              if (data.success === false && !assistantMessageId) {
                const errorMessage = data.friendlyMessage ||
                  (data.errors?.length ? data.errors[0] : 'Something went wrong. Please try again.');
                addAssistantMessage(errorMessage, 'respond');
              }
              break;
            }

            case 'error': {
              const data = event.data as { code: string; message: string; friendlyMessage?: string };
              console.error('[Chat Error]', { code: data.code, message: data.message, friendlyMessage: data.friendlyMessage });
              // Show error as chat message
              const errorMessage = data.friendlyMessage || getUserFriendlyError(data.message);
              addAssistantMessage(errorMessage, 'respond');
              break;
            }
          }
        }
        console.log('[Chat] Stream ended, total events:', eventCount);
      } catch (err) {
        // Don't show error for intentional abort (stop button)
        if (err instanceof DOMException && err.name === 'AbortError') {
          addAssistantMessage('Generation stopped.', 'respond');
        } else {
          console.error('[Chat Exception]', err);
          const friendlyMessage = getUserFriendlyError(err instanceof Error ? err : 'Failed to send message');
          addAssistantMessage(friendlyMessage, 'respond');
        }
      } finally {
        setStreaming(false);
        setThinking(false);
        clearStreamingContent();
        useChatStore.getState().setAbortController(null);
      }
    },
    [
      currentSessionId,
      addUserMessage,
      addAssistantMessage,
      updateMessage,
      setStreaming,
      setThinking,
      appendStreamingContent,
      clearStreamingContent,
      setCurrentSession,
      setWorkflow,
      setMessagePendingPlan,
      setMessageClarifications,
      setMessageRejection,
      streamingContent,
    ]
  );

  const handleFileUpload = useCallback(
    async (file: File, message?: string) => {
      // Add user message with attachment preview
      // Include message content if provided (user's context about the file)
      const attachment: MessageAttachment = {
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        name: file.name,
        url: URL.createObjectURL(file),
      };
      addUserMessage(message || '', attachment);

      setStreaming(true);
      setThinking(true, 'analyzing');  // Use 'analyzing' for file uploads

      try {
        const result = await uploadFile({
          file,
          sessionId: currentSessionId || undefined,
          prompt: message,  // Pass message as context/prompt to the API
        });

        if (result.success) {
          // Handle the response similar to regular chat
          const assistantMessageId = addAssistantMessage(
            result.response.message,
            result.response.mode
          );

          if (result.response.workflow && result.response.isPreview && result.response.planId) {
            setMessagePendingPlan(assistantMessageId, {
              planId: result.response.planId,
              workflow: result.response.workflow,
              message: result.response.message,
            });
          }

          if (result.sessionId !== currentSessionId) {
            setCurrentSession(result.sessionId);
          }
        } else {
          addAssistantMessage(getUserFriendlyError(result.error?.message || 'Upload failed'), 'respond');
        }
      } catch (err) {
        const friendlyMessage = getUserFriendlyError(err instanceof Error ? err : 'Failed to upload file');
        addAssistantMessage(friendlyMessage, 'respond');
      } finally {
        setStreaming(false);
        setThinking(false);
      }
    },
    [
      currentSessionId,
      addUserMessage,
      addAssistantMessage,
      setStreaming,
      setThinking,
      setCurrentSession,
      setMessagePendingPlan,
    ]
  );

  const handleApprovePlan = useCallback(
    async (planId: string) => {
      if (!currentSessionId) return;

      try {
        const result = await publishPlan(currentSessionId, planId);
        if (result.success) {
          // Use approveProposal if there's a pending proposal, otherwise set directly
          const approvedWorkflow = useWorkflowStore.getState().approveProposal();
          if (!approvedWorkflow) {
            setWorkflow(result.workflow);
          }
          setPendingPlan(null);
          // Lock the plan card instead of removing it
          const msgs = useChatStore.getState().messages;
          const msgWithPlan = msgs.find((m) => m.pendingPlan?.planId === planId);
          if (msgWithPlan) {
            updateMessage(msgWithPlan.id, { planPublished: true });
          }

          const workflowName = result.workflow.name || 'Your workflow';

          // Auto-save to database as DRAFT
          setSaving(true);
          try {
            const savedFlow = await createTemplate({
              name: workflowName,
              description: result.workflow.description || '',
              definition: result.workflow as Record<string, unknown>,
              status: 'DRAFT',
            });
            setSavedFlow(savedFlow.id, 'DRAFT');

            // Track onboarding: flow built
            useOnboardingStore.getState().completeBuildTemplate();

            // Message 1: Workflow saved confirmation
            addAssistantMessage(
              `**${workflowName}** has been saved as a draft. You can see it in the panel on the right.\n\nWhen you're ready, click **Publish** in the header to make it active.`,
              'create'
            );
          } catch (saveErr) {
            console.error('Failed to save flow to database:', saveErr);
            // Still show workflow even if save failed
            addAssistantMessage(
              `**${workflowName}** has been created. You can see it in the panel on the right.\n\n⚠️ Note: Failed to save to database. You may need to save manually.`,
              'create'
            );
          }

          // Message 2: Enhancement options (only if user hasn't dismissed them this session)
          const { enhancementsDismissed } = useChatStore.getState();
          if (!enhancementsDismissed) {
            const enhancementMessageId = addAssistantMessage(
              `Would you like me to enhance this workflow with any of these options?`,
              'create'
            );

            // Attach enhancement data to the second message
            setMessageEnhancement(enhancementMessageId, {
              workflowName,
              isLocked: false,
            });
          }
        }
      } catch (err) {
        const friendlyMessage = getUserFriendlyError(err instanceof Error ? err : 'Failed to approve plan');
        addAssistantMessage(friendlyMessage, 'respond');
      }
    },
    [currentSessionId, setWorkflow, setPendingPlan, updateMessage, addAssistantMessage, setMessageEnhancement, setSaving, setSavedFlow]
  );

  const handleRequestChanges = useCallback(
    async (changes: string) => {
      if (!changes.trim()) return;

      // Clear proposal from right panel
      useWorkflowStore.getState().clearProposal();

      // Lock any existing plan cards and save the change request text
      const msgs = useChatStore.getState().messages;
      msgs.forEach((msg) => {
        if (msg.pendingPlan && !msg.planPublished) {
          updateMessage(msg.id, { savedChangeRequest: changes.trim() });
        }
      });

      // Send the change request (hidden - already displayed in the card)
      // The AI will generate a new preview based on the changes
      await sendMessage(`Please make these changes to the workflow: ${changes}`, undefined, {
        hideUserMessage: true,
        thinkingStatus: 'editing',
      });
    },
    [sendMessage, updateMessage]
  );

  const handleAnswerClarification = useCallback(
    async (answers: Record<string, string>, questions: Clarification[]) => {
      // Format answers with question context for better AI understanding
      const formattedParts: string[] = [];

      questions.forEach((question) => {
        const answer = answers[question.id]?.trim();
        if (answer) {
          formattedParts.push(`**Q: ${question.text}**\nA: ${answer}`);
        }
      });

      if (formattedParts.length === 0) return;

      const answerText = formattedParts.join('\n\n');

      // Lock all clarification cards and store their answers (instead of removing them)
      const msgs = useChatStore.getState().messages;
      msgs.forEach((msg) => {
        if (msg.clarifications && msg.clarifications.length > 0 && !msg.clarificationsLocked) {
          updateMessage(msg.id, {
            clarificationsLocked: true,
            clarificationAnswers: answers,
          });
        }
      });

      // Send answers to AI but don't show as user message (answers are visible in locked card)
      // Use 'refining' status since we're building a workflow from clarification answers
      await sendMessage(answerText, undefined, { hideUserMessage: true, thinkingStatus: 'refining' });
    },
    [sendMessage, updateMessage]
  );

  const startNewChat = useCallback(() => {
    // Clear everything and reset for a fresh start
    clearMessages();
    setCurrentSession(null);
    setWorkflow(null);
    useWorkflowStore.getState().clearProposal();
    // Reset the history loading ref so future sessions can load history
    historyLoadedRef.current = null;
  }, [clearMessages, setCurrentSession, setWorkflow]);

  const handleEnhancementSubmit = useCallback(
    async (messageId: string, selections: Record<string, string | Record<string, string>>) => {
      // Lock the enhancement card with the selections
      const msgs = useChatStore.getState().messages;
      const enhancementMsg = msgs.find((m) => m.id === messageId);
      if (enhancementMsg?.enhancement) {
        updateMessage(messageId, {
          enhancement: {
            ...enhancementMsg.enhancement,
            isLocked: true,
            selections,
          },
        });
      }

      // Format the selections as a message to the AI
      const enhancementParts: string[] = [];

      if (selections.milestones) {
        const value = typeof selections.milestones === 'string' ? selections.milestones : 'yes';
        enhancementParts.push(`• **Organize into stages:** ${value}`);
      }
      if (selections.aiAutomation) {
        const value = typeof selections.aiAutomation === 'string' ? selections.aiAutomation : 'yes';
        enhancementParts.push(`• **Add AI automation:** ${value} (available AI types: AI_EXTRACT for data extraction, AI_SUMMARIZE for summaries, AI_TRANSLATE for translations, AI_TRANSCRIBE for transcription, AI_WRITE for content generation, AI_CUSTOM_PROMPT for custom tasks)`);
      }
      if (selections.integrations) {
        const value = typeof selections.integrations === 'string' ? selections.integrations : 'yes';
        enhancementParts.push(`• **Connect to systems:** ${value}`);
      }
      if (selections.naming) {
        const value = typeof selections.naming === 'string' ? selections.naming : 'yes';
        enhancementParts.push(`• **Naming convention:** ${value}`);
      }
      if (selections.permissions && typeof selections.permissions === 'object') {
        const perms = selections.permissions as Record<string, string>;
        const permParts: string[] = [];
        if (perms.execute) permParts.push(`Execute: ${perms.execute}`);
        if (perms.coordinate) permParts.push(`Coordinate: ${perms.coordinate}`);
        if (perms.edit) permParts.push(`Edit: ${perms.edit}`);
        if (permParts.length > 0) {
          enhancementParts.push(`• **Permissions:**\n  - ${permParts.join('\n  - ')}`);
        }
      }

      if (enhancementParts.length > 0) {
        const enhancementRequest = `Please enhance the workflow with these additions:\n\n${enhancementParts.join('\n')}`;
        // Hide user message since the locked card already shows the selections
        // Use 'editing' status since we're enhancing an existing workflow
        await sendMessage(enhancementRequest, undefined, { hideUserMessage: true, thinkingStatus: 'editing' });
      }
    },
    [sendMessage, updateMessage]
  );

  const handleEnhancementSkip = useCallback(
    (messageId: string) => {
      // Lock the enhancement card as skipped
      const msgs = useChatStore.getState().messages;
      const enhancementMsg = msgs.find((m) => m.id === messageId);
      if (enhancementMsg?.enhancement) {
        updateMessage(messageId, {
          enhancement: {
            ...enhancementMsg.enhancement,
            isLocked: true,
            wasSkipped: true,
          },
        });

        // Mark enhancements as dismissed for this session
        // (won't show enhancement options on future workflow approvals)
        useChatStore.getState().setEnhancementsDismissed(true);

        // Add a simple guidance message
        addAssistantMessage(
          `No problem! You can always ask me to add milestones, AI automation (extraction, summarization, translation, and more), integrations, or update permissions later.\n\nJust tell me what you'd like to change!`,
          'create'
        );
      }
    },
    [updateMessage, addAssistantMessage]
  );

  const handleSuggestedAction = useCallback(
    async (action: SuggestedAction) => {
      switch (action.actionType) {
        case 'approve_plan': {
          // Find the pending plan and approve it
          const msgs = useChatStore.getState().messages;
          const msgWithPlan = msgs.find((m) => m.pendingPlan && !m.planPublished);
          if (msgWithPlan?.pendingPlan?.planId) {
            await handleApprovePlan(msgWithPlan.pendingPlan.planId);
          }
          break;
        }
        case 'discard_plan': {
          // Find and remove the pending plan
          const msgs = useChatStore.getState().messages;
          const msgWithPlan = msgs.find((m) => m.pendingPlan && !m.planPublished);
          if (msgWithPlan) {
            // Mark the plan as discarded (similar to published but without setting workflow)
            updateMessage(msgWithPlan.id, { planPublished: true });
            addAssistantMessage(
              "I've discarded that workflow. Let me know when you'd like to try again or if you want something different!",
              'respond'
            );
          }
          break;
        }
        case 'edit_plan': {
          // For edit_plan, we could scroll to the plan card or open an edit modal
          // For now, just prompt the user to describe their changes
          addAssistantMessage(
            "What changes would you like me to make to the workflow?",
            'respond'
          );
          break;
        }
        case 'prompt':
        default: {
          // Prefill the input so user can review/edit before sending
          if (action.prompt) {
            setPrefillMessage(action.prompt);
          }
          break;
        }
      }
    },
    [handleApprovePlan, updateMessage, addAssistantMessage, setPrefillMessage]
  );

  const cancelGeneration = useCallback(() => {
    useChatStore.getState().cancelStream();
  }, []);

  return {
    messages,
    isStreaming,
    isThinking,
    thinkingStatus,
    streamingContent,
    pendingPlan,
    sendMessage,
    handleFileUpload,
    handleApprovePlan,
    handleRequestChanges,
    handleAnswerClarification,
    handleEnhancementSubmit,
    handleEnhancementSkip,
    handleSuggestedAction,
    cancelGeneration,
    startNewChat,
  };
}
