/**
 * Audit Service Tests
 *
 * Tests for the audit logging service which inserts records into the audit_logs table.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockValues = jest.fn().mockResolvedValue(undefined as never);
const mockInsert = jest.fn().mockReturnValue({ values: mockValues });

jest.unstable_mockModule('../../src/db/client.js', () => ({
  db: {
    insert: mockInsert,
  },
}));

jest.unstable_mockModule('../../src/db/schema.js', () => ({
  auditLogs: Symbol('auditLogs'),
}));

// Dynamic import after mocks are registered
const { logAction } = await import('../../src/services/audit.js');

describe('Audit Service', () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined as never);
  });

  describe('logAction', () => {
    it('should insert into auditLogs with correct values', async () => {
      await logAction({
        flowRunId: 'run-123',
        action: 'STEP_COMPLETED',
        actorId: 'user-456',
        actorEmail: 'alice@example.com',
        details: { stepId: 'step-1', result: 'approved' },
      });

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledWith({
        flowRunId: 'run-123',
        action: 'STEP_COMPLETED',
        actorId: 'user-456',
        actorEmail: 'alice@example.com',
        details: { stepId: 'step-1', result: 'approved' },
      });
    });

    it('should insert with optional fields undefined', async () => {
      await logAction({
        flowRunId: 'run-789',
        action: 'FLOW_STARTED',
      });

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledWith({
        flowRunId: 'run-789',
        action: 'FLOW_STARTED',
        actorId: undefined,
        actorEmail: undefined,
        details: undefined,
      });
    });

    it('should not throw on database error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockValues.mockRejectedValueOnce(new Error('DB connection failed') as never);

      await expect(
        logAction({
          flowRunId: 'run-error',
          action: 'SOME_ACTION',
        })
      ).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedArgs = consoleErrorSpy.mock.calls[0] as unknown[];
      expect(loggedArgs[0]).toContain('[Audit]');

      consoleErrorSpy.mockRestore();
    });

    it('should not throw when insert itself throws synchronously', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockInsert.mockImplementationOnce(() => {
        throw new Error('Schema not found');
      });

      await expect(
        logAction({
          flowRunId: 'run-bad',
          action: 'CRASH',
        })
      ).resolves.toBeUndefined();

      consoleErrorSpy.mockRestore();
    });
  });
});
