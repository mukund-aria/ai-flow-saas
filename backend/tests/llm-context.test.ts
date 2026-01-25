/**
 * LLM Context Manager Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createSession,
  getSession,
  getOrCreateSession,
  deleteSession,
  clearAllSessions,
  addUserMessage,
  addAssistantMessage,
  getMessageHistory,
  updateSessionWorkflow,
  getSessionStats,
  summarizeConversation,
  exportSession,
  importSession,
} from '../src/llm/context.js';
import type { Flow } from '../src/models/workflow.js';

// Clear sessions before each test
beforeEach(() => {
  clearAllSessions();
});

describe('Session Management', () => {
  describe('createSession', () => {
    it('should create a new session with unique ID', () => {
      const session1 = createSession();
      const session2 = createSession();

      expect(session1.id).toBeDefined();
      expect(session2.id).toBeDefined();
      expect(session1.id).not.toBe(session2.id);
    });

    it('should initialize session with empty messages', () => {
      const session = createSession();

      expect(session.messages).toEqual([]);
      expect(session.workflow).toBeNull();
    });

    it('should accept initial workflow', () => {
      const workflow = { flowId: 'flow_1', name: 'Test' } as Flow;
      const session = createSession(workflow);

      expect(session.workflow).toBe(workflow);
    });
  });

  describe('getSession', () => {
    it('should return existing session by ID', () => {
      const created = createSession();
      const retrieved = getSession(created.id);

      expect(retrieved).toBe(created);
    });

    it('should return null for non-existent session', () => {
      const result = getSession('non_existent_id');

      expect(result).toBeNull();
    });
  });

  describe('getOrCreateSession', () => {
    it('should return existing session if ID provided', () => {
      const existing = createSession();
      const result = getOrCreateSession(existing.id);

      expect(result).toBe(existing);
    });

    it('should create new session if ID not found', () => {
      const result = getOrCreateSession('non_existent');

      expect(result).toBeDefined();
      expect(result.id).not.toBe('non_existent');
    });

    it('should create new session if no ID provided', () => {
      const result = getOrCreateSession();

      expect(result).toBeDefined();
    });
  });

  describe('deleteSession', () => {
    it('should delete existing session', () => {
      const session = createSession();
      const deleted = deleteSession(session.id);

      expect(deleted).toBe(true);
      expect(getSession(session.id)).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const deleted = deleteSession('non_existent');

      expect(deleted).toBe(false);
    });
  });
});

describe('Message Management', () => {
  describe('addUserMessage', () => {
    it('should add user message to session', () => {
      const session = createSession();
      const message = addUserMessage(session, 'Hello');

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(session.messages).toHaveLength(1);
    });

    it('should assign unique IDs to messages', () => {
      const session = createSession();
      const msg1 = addUserMessage(session, 'First');
      const msg2 = addUserMessage(session, 'Second');

      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  describe('addAssistantMessage', () => {
    it('should add assistant message to session', () => {
      const session = createSession();
      const message = addAssistantMessage(session, 'Response');

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Response');
    });

    it('should attach parsed response if provided', () => {
      const session = createSession();
      const parsedResponse = {
        mode: 'clarify' as const,
        questions: [{ id: 'q1', text: 'Question?' }],
        context: 'Need info',
      };

      const message = addAssistantMessage(session, 'raw', parsedResponse);

      expect(message.parsedResponse).toBe(parsedResponse);
    });

    it('should attach error if provided', () => {
      const session = createSession();
      const message = addAssistantMessage(session, 'raw', undefined, 'Parse error');

      expect(message.error).toBe('Parse error');
    });
  });

  describe('getMessageHistory', () => {
    it('should return all messages by default', () => {
      const session = createSession();
      addUserMessage(session, 'Msg 1');
      addAssistantMessage(session, 'Response 1');
      addUserMessage(session, 'Msg 2');

      const history = getMessageHistory(session);

      expect(history).toHaveLength(3);
    });

    it('should limit messages when maxMessages specified', () => {
      const session = createSession();
      addUserMessage(session, 'Msg 1');
      addAssistantMessage(session, 'Response 1');
      addUserMessage(session, 'Msg 2');
      addAssistantMessage(session, 'Response 2');
      addUserMessage(session, 'Msg 3');

      const history = getMessageHistory(session, 3);

      expect(history).toHaveLength(3);
      // Should include first message for context
      expect(history[0].content).toBe('Msg 1');
    });

    it('should not mutate original messages array', () => {
      const session = createSession();
      addUserMessage(session, 'Msg 1');

      const history = getMessageHistory(session);
      history.push({} as any);

      expect(session.messages).toHaveLength(1);
    });
  });
});

describe('Workflow State', () => {
  describe('updateSessionWorkflow', () => {
    it('should update workflow', () => {
      const session = createSession();
      const workflow = { flowId: 'flow_1', name: 'Test Flow' } as Flow;

      updateSessionWorkflow(session, workflow);

      expect(session.workflow).toBe(workflow);
    });

    it('should update metadata with workflow name', () => {
      const session = createSession();
      const workflow = { flowId: 'flow_1', name: 'Test Flow' } as Flow;

      updateSessionWorkflow(session, workflow);

      expect(session.metadata?.workflowName).toBe('Test Flow');
    });

    it('should allow setting workflow to null', () => {
      const session = createSession({ flowId: 'flow_1', name: 'Test' } as Flow);

      updateSessionWorkflow(session, null);

      expect(session.workflow).toBeNull();
    });
  });
});

describe('Session Statistics', () => {
  describe('getSessionStats', () => {
    it('should calculate message counts', () => {
      const session = createSession();
      addUserMessage(session, 'User 1');
      addAssistantMessage(session, 'Assistant 1');
      addUserMessage(session, 'User 2');

      const stats = getSessionStats(session);

      expect(stats.messageCount).toBe(3);
      expect(stats.userMessageCount).toBe(2);
      expect(stats.assistantMessageCount).toBe(1);
    });

    it('should return workflow step count', () => {
      const workflow = {
        flowId: 'flow_1',
        name: 'Test',
        steps: [{ stepId: 's1' }, { stepId: 's2' }, { stepId: 's3' }],
      } as Flow;
      const session = createSession(workflow);

      const stats = getSessionStats(session);

      expect(stats.workflowStepCount).toBe(3);
    });

    it('should return 0 steps for null workflow', () => {
      const session = createSession();

      const stats = getSessionStats(session);

      expect(stats.workflowStepCount).toBe(0);
    });
  });
});

describe('Conversation Summary', () => {
  describe('summarizeConversation', () => {
    it('should include workflow name if present', () => {
      const workflow = {
        flowId: 'flow_1',
        name: 'Test Workflow',
        steps: [],
        assigneePlaceholders: [],
      } as unknown as Flow;
      const session = createSession(workflow);

      const summary = summarizeConversation(session);

      expect(summary).toContain('Test Workflow');
    });

    it('should note when no workflow exists', () => {
      const session = createSession();

      const summary = summarizeConversation(session);

      expect(summary).toContain('No workflow');
    });

    it('should include message count', () => {
      const session = createSession();
      addUserMessage(session, 'Hello');
      addAssistantMessage(session, 'Hi');
      addUserMessage(session, 'Help');

      const summary = summarizeConversation(session);

      expect(summary).toContain('3 messages');
    });

    it('should include recent user requests', () => {
      const session = createSession();
      addUserMessage(session, 'Create onboarding flow');
      addAssistantMessage(session, 'Creating...');
      addUserMessage(session, 'Add approval step');

      const summary = summarizeConversation(session);

      expect(summary).toContain('Add approval step');
    });
  });
});

describe('Session Export/Import', () => {
  describe('exportSession', () => {
    it('should export session to JSON', () => {
      const workflow = { flowId: 'flow_1', name: 'Test' } as Flow;
      const session = createSession(workflow);
      addUserMessage(session, 'Hello');

      const exported = exportSession(session);
      const parsed = JSON.parse(exported);

      expect(parsed.id).toBe(session.id);
      expect(parsed.workflow.name).toBe('Test');
      expect(parsed.messages).toHaveLength(1);
    });
  });

  describe('importSession', () => {
    it('should import session from JSON', () => {
      const json = JSON.stringify({
        id: 'imported_session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workflow: { flowId: 'flow_1', name: 'Imported' },
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date().toISOString(),
          },
        ],
        metadata: { workflowName: 'Imported' },
      });

      const session = importSession(json);

      expect(session).not.toBeNull();
      expect(session?.id).toBe('imported_session');
      expect(session?.workflow?.name).toBe('Imported');
      expect(session?.messages).toHaveLength(1);
    });

    it('should return null for invalid JSON', () => {
      const result = importSession('not valid json');

      expect(result).toBeNull();
    });

    it('should make imported session accessible via getSession', () => {
      const json = JSON.stringify({
        id: 'test_import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workflow: null,
        messages: [],
      });

      importSession(json);
      const retrieved = getSession('test_import');

      expect(retrieved).not.toBeNull();
    });
  });
});
