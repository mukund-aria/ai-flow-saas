/**
 * Email Service Tests
 *
 * Tests for the email service which uses Resend SDK for transactional emails.
 * Covers both production mode (with API key) and dev mode (console logging).
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock send function shared across tests
const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null } as never);

// Register ESM mock for 'resend' before importing the email service
jest.unstable_mockModule('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

describe('Email Service', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    mockSend.mockClear();
  });

  describe('with RESEND_API_KEY set', () => {
    let sendInvitation: typeof import('../../src/services/email.js').sendInvitation;
    let sendMagicLink: typeof import('../../src/services/email.js').sendMagicLink;
    let sendTaskAssigned: typeof import('../../src/services/email.js').sendTaskAssigned;
    let sendFlowCompleted: typeof import('../../src/services/email.js').sendFlowCompleted;

    beforeEach(async () => {
      process.env = { ...originalEnv, RESEND_API_KEY: 'test-api-key' };
      // Re-import the module so it picks up the new env
      const emailModule = await import('../../src/services/email.js');
      sendInvitation = emailModule.sendInvitation;
      sendMagicLink = emailModule.sendMagicLink;
      sendTaskAssigned = emailModule.sendTaskAssigned;
      sendFlowCompleted = emailModule.sendFlowCompleted;
    });

    describe('sendInvitation', () => {
      it('should call resend with correct to, subject, and html', async () => {
        await sendInvitation({
          to: 'user@example.com',
          inviterName: 'Alice',
          organizationName: 'Acme Corp',
          token: 'invite-token-123',
          role: 'admin',
        });

        expect(mockSend).toHaveBeenCalledTimes(1);
        const callArgs = mockSend.mock.calls[0]![0] as Record<string, string>;
        expect(callArgs.to).toBe('user@example.com');
        expect(callArgs.subject).toContain('Acme Corp');
        expect(callArgs.html).toContain('Alice');
        expect(callArgs.html).toContain('Acme Corp');
        expect(callArgs.html).toContain('admin');
        expect(callArgs.html).toContain('invite-token-123');
      });
    });

    describe('sendMagicLink', () => {
      it('should include the task link in HTML', async () => {
        await sendMagicLink({
          to: 'assignee@example.com',
          contactName: 'Bob',
          flowName: 'Onboarding Flow',
          stepName: 'Fill out info',
          token: 'magic-token-456',
        });

        expect(mockSend).toHaveBeenCalledTimes(1);
        const callArgs = mockSend.mock.calls[0]![0] as Record<string, string>;
        expect(callArgs.to).toBe('assignee@example.com');
        expect(callArgs.subject).toContain('Fill out info');
        expect(callArgs.html).toContain('/task/magic-token-456');
        expect(callArgs.html).toContain('Bob');
        expect(callArgs.html).toContain('Onboarding Flow');
      });
    });

    describe('sendTaskAssigned', () => {
      it('should include step name in subject and body', async () => {
        await sendTaskAssigned({
          to: 'member@example.com',
          assigneeName: 'Charlie',
          flowName: 'Review Process',
          stepName: 'Approve document',
        });

        expect(mockSend).toHaveBeenCalledTimes(1);
        const callArgs = mockSend.mock.calls[0]![0] as Record<string, string>;
        expect(callArgs.to).toBe('member@example.com');
        expect(callArgs.subject).toContain('Approve document');
        expect(callArgs.html).toContain('Approve document');
        expect(callArgs.html).toContain('Charlie');
        expect(callArgs.html).toContain('Review Process');
      });
    });

    describe('sendFlowCompleted', () => {
      it('should include flow run name in subject and body', async () => {
        await sendFlowCompleted({
          to: 'owner@example.com',
          userName: 'Diana',
          flowName: 'Client Onboarding',
          runName: 'Onboarding - Acme Corp',
        });

        expect(mockSend).toHaveBeenCalledTimes(1);
        const callArgs = mockSend.mock.calls[0]![0] as Record<string, string>;
        expect(callArgs.to).toBe('owner@example.com');
        expect(callArgs.subject).toContain('Onboarding - Acme Corp');
        expect(callArgs.html).toContain('Onboarding - Acme Corp');
        expect(callArgs.html).toContain('Diana');
        expect(callArgs.html).toContain('Client Onboarding');
      });
    });

    describe('error handling', () => {
      it('should not throw when resend.emails.send fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockSend.mockRejectedValueOnce(new Error('API error') as never);

        await expect(
          sendInvitation({
            to: 'user@example.com',
            inviterName: 'Alice',
            organizationName: 'Acme',
            token: 'token',
            role: 'admin',
          })
        ).resolves.toBeUndefined();

        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('without RESEND_API_KEY (dev mode)', () => {
    let sendInvitation: typeof import('../../src/services/email.js').sendInvitation;
    let sendMagicLink: typeof import('../../src/services/email.js').sendMagicLink;
    let sendTaskAssigned: typeof import('../../src/services/email.js').sendTaskAssigned;
    let sendFlowCompleted: typeof import('../../src/services/email.js').sendFlowCompleted;
    let consoleSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(async () => {
      process.env = { ...originalEnv };
      delete process.env.RESEND_API_KEY;
      jest.resetModules();

      // Re-register the mock after resetModules
      jest.unstable_mockModule('resend', () => ({
        Resend: jest.fn().mockImplementation(() => ({
          emails: {
            send: mockSend,
          },
        })),
      }));

      const emailModule = await import('../../src/services/email.js');
      sendInvitation = emailModule.sendInvitation;
      sendMagicLink = emailModule.sendMagicLink;
      sendTaskAssigned = emailModule.sendTaskAssigned;
      sendFlowCompleted = emailModule.sendFlowCompleted;
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('sendInvitation logs to console instead of sending', async () => {
      await sendInvitation({
        to: 'user@example.com',
        inviterName: 'Alice',
        organizationName: 'Acme',
        token: 'token',
        role: 'admin',
      });

      expect(mockSend).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      const loggedOutput = (consoleSpy.mock.calls as string[][]).map(c => c.join(' ')).join(' ');
      expect(loggedOutput).toContain('user@example.com');
    });

    it('sendMagicLink logs to console instead of sending', async () => {
      await sendMagicLink({
        to: 'bob@example.com',
        contactName: 'Bob',
        flowName: 'Flow',
        stepName: 'Step',
        token: 'token',
      });

      expect(mockSend).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('sendTaskAssigned logs to console instead of sending', async () => {
      await sendTaskAssigned({
        to: 'charlie@example.com',
        assigneeName: 'Charlie',
        flowName: 'Flow',
        stepName: 'Step',
      });

      expect(mockSend).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('sendFlowCompleted logs to console instead of sending', async () => {
      await sendFlowCompleted({
        to: 'diana@example.com',
        userName: 'Diana',
        flowName: 'Flow',
        runName: 'Run',
      });

      expect(mockSend).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
