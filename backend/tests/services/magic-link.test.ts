/**
 * Magic Link Service Tests
 *
 * Tests for creating and validating magic link tokens for external assignees.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Setup mock data
const mockReturning = jest.fn();
const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
const mockInsert = jest.fn().mockReturnValue({ values: mockValues });

const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();

jest.unstable_mockModule('../../src/db/client.js', () => ({
  db: {
    insert: mockInsert,
    query: {
      magicLinks: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      flows: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      contacts: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      stepExecutions: { findMany: (...args: unknown[]) => mockFindMany(...args) },
      stepExecutionAssignees: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      users: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      organizations: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      portals: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
  },
}));

jest.unstable_mockModule('../../src/db/schema.js', () => ({
  magicLinks: { stepExecutionId: 'step_execution_id', token: 'token' },
  stepExecutions: { id: 'id' },
  stepExecutionAssignees: { id: 'id' },
  flows: { id: 'id' },
  templates: { id: 'id' },
  contacts: { id: 'id' },
  users: { id: 'id' },
  organizations: { id: 'id' },
  portals: { id: 'id' },
}));

jest.unstable_mockModule('drizzle-orm', () => ({
  eq: jest.fn((field: string, value: string) => ({ field, value })),
  and: jest.fn((...conditions: unknown[]) => ({ conditions })),
}));

// Dynamic import after mocks are registered
const { createMagicLink, validateMagicLink } = await import('../../src/services/magic-link.js');

describe('Magic Link Service', () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    mockReturning.mockClear();
    mockFindFirst.mockClear();
    mockFindMany.mockClear();

    // Reset default implementations
    mockValues.mockReturnValue({ returning: mockReturning });
    mockInsert.mockReturnValue({ values: mockValues });
    // Default findMany returns empty array
    mockFindMany.mockResolvedValue([] as never);
  });

  describe('createMagicLink', () => {
    it('should create a token and insert into DB', async () => {
      const generatedToken = 'generated-uuid-token';
      mockReturning.mockResolvedValueOnce([{ token: generatedToken }] as never);

      const token = await createMagicLink('step-exec-123');

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledTimes(1);

      const insertedValues = mockValues.mock.calls[0]![0] as Record<string, unknown>;
      expect(insertedValues.stepExecutionId).toBe('step-exec-123');
      expect(insertedValues.expiresAt).toBeInstanceOf(Date);

      expect(token).toBe(generatedToken);
    });

    it('should set expiration based on provided hours', async () => {
      mockReturning.mockResolvedValueOnce([{ token: 'token-abc' }] as never);

      const beforeCall = new Date();
      await createMagicLink('step-exec-456', 24); // 24 hours

      const insertedValues = mockValues.mock.calls[0]![0] as Record<string, unknown>;
      const expiresAt = insertedValues.expiresAt as Date;

      // The expiration should be roughly 24 hours from now (within a small margin)
      const expectedMin = new Date(beforeCall.getTime() + 23 * 60 * 60 * 1000);
      const expectedMax = new Date(beforeCall.getTime() + 25 * 60 * 60 * 1000);

      expect(expiresAt.getTime()).toBeGreaterThan(expectedMin.getTime());
      expect(expiresAt.getTime()).toBeLessThan(expectedMax.getTime());
    });

    it('should default to 168 hours (7 days) expiration', async () => {
      mockReturning.mockResolvedValueOnce([{ token: 'token-def' }] as never);

      const beforeCall = new Date();
      await createMagicLink('step-exec-789');

      const insertedValues = mockValues.mock.calls[0]![0] as Record<string, unknown>;
      const expiresAt = insertedValues.expiresAt as Date;

      // Should be roughly 168 hours (7 days) from now
      const expectedMin = new Date(beforeCall.getTime() + 167 * 60 * 60 * 1000);
      const expectedMax = new Date(beforeCall.getTime() + 169 * 60 * 60 * 1000);

      expect(expiresAt.getTime()).toBeGreaterThan(expectedMin.getTime());
      expect(expiresAt.getTime()).toBeLessThan(expectedMax.getTime());
    });
  });

  describe('validateMagicLink', () => {
    it('should return task context for valid token', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      // First call: magicLinks.findFirst - returns the magic link
      mockFindFirst.mockResolvedValueOnce({
        token: 'valid-token',
        expiresAt: futureDate,
        usedAt: null,
        stepExecution: {
          flowId: 'run-1',
          stepId: 'step-1',
          status: 'PENDING',
          assignedToContactId: 'contact-1',
        },
      } as never);

      // Second call: flows.findFirst - returns the flow
      mockFindFirst.mockResolvedValueOnce({
        name: 'Test Run',
        template: {
          name: 'Test Flow',
          definition: {
            steps: [
              {
                stepId: 'step-1',
                type: 'FORM',
                config: {
                  name: 'Fill Form',
                  description: 'Fill out the form',
                  formFields: [{ label: 'Name', type: 'text' }],
                },
              },
            ],
          },
        },
      } as never);

      // Third call: contacts.findFirst - returns the contact
      mockFindFirst.mockResolvedValueOnce({
        name: 'John Doe',
        email: 'john@example.com',
      } as never);

      const result = await validateMagicLink('valid-token');

      expect(result).not.toBeNull();
      expect(result!.token).toBe('valid-token');
      expect(result!.flowName).toBe('Test Flow');
      expect(result!.runName).toBe('Test Run');
      expect(result!.stepName).toBe('Fill Form');
      expect(result!.stepType).toBe('FORM');
      expect(result!.contactName).toBe('John Doe');
      expect(result!.contactEmail).toBe('john@example.com');
      expect(result!.expired).toBe(false);
      expect(result!.completed).toBe(false);
    });

    it('should return expired=true for expired tokens', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 24);

      mockFindFirst.mockResolvedValueOnce({
        token: 'expired-token',
        expiresAt: pastDate,
        usedAt: null,
        stepExecution: {
          flowId: 'run-2',
          stepId: 'step-2',
          status: 'PENDING',
          assignedToContactId: null,
        },
      } as never);

      mockFindFirst.mockResolvedValueOnce({
        name: 'Expired Run',
        template: {
          name: 'Some Flow',
          definition: { steps: [] },
        },
      } as never);

      const result = await validateMagicLink('expired-token');

      expect(result).not.toBeNull();
      expect(result!.expired).toBe(true);
      expect(result!.completed).toBe(false);
    });

    it('should return completed=true for used tokens', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      mockFindFirst.mockResolvedValueOnce({
        token: 'used-token',
        expiresAt: futureDate,
        usedAt: new Date(),
        stepExecution: {
          flowId: 'run-3',
          stepId: 'step-3',
          status: 'COMPLETED',
          assignedToContactId: null,
        },
      } as never);

      mockFindFirst.mockResolvedValueOnce({
        name: 'Completed Run',
        template: {
          name: 'Done Flow',
          definition: { steps: [] },
        },
      } as never);

      const result = await validateMagicLink('used-token');

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
    });

    it('should return null for non-existent tokens', async () => {
      mockFindFirst.mockResolvedValueOnce(null as never);

      const result = await validateMagicLink('nonexistent-token');

      expect(result).toBeNull();
    });

    it('should return null when stepExecution is missing', async () => {
      mockFindFirst.mockResolvedValueOnce({
        token: 'broken-token',
        expiresAt: new Date(),
        usedAt: null,
        stepExecution: null,
      } as never);

      const result = await validateMagicLink('broken-token');

      expect(result).toBeNull();
    });

    it('should return null when flow run is not found', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      mockFindFirst.mockResolvedValueOnce({
        token: 'orphan-token',
        expiresAt: futureDate,
        usedAt: null,
        stepExecution: {
          flowId: 'nonexistent-run',
          stepId: 'step-x',
          status: 'PENDING',
          assignedToContactId: null,
        },
      } as never);

      // flows.findFirst returns null
      mockFindFirst.mockResolvedValueOnce(null as never);

      const result = await validateMagicLink('orphan-token');

      expect(result).toBeNull();
    });

    it('should use default contact name when contact is not found', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      mockFindFirst.mockResolvedValueOnce({
        token: 'no-contact-token',
        expiresAt: futureDate,
        usedAt: null,
        stepExecution: {
          flowId: 'run-4',
          stepId: 'step-4',
          status: 'PENDING',
          assignedToContactId: 'missing-contact',
        },
      } as never);

      mockFindFirst.mockResolvedValueOnce({
        name: 'Some Run',
        template: {
          name: 'Some Flow',
          definition: { steps: [] },
        },
      } as never);

      // contacts.findFirst returns null (contact not found)
      mockFindFirst.mockResolvedValueOnce(null as never);

      const result = await validateMagicLink('no-contact-token');

      expect(result).not.toBeNull();
      expect(result!.contactName).toBe('Participant');
      expect(result!.contactEmail).toBe('');
    });

    it('should use default step name when step is not in definition', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      mockFindFirst.mockResolvedValueOnce({
        token: 'no-step-token',
        expiresAt: futureDate,
        usedAt: null,
        stepExecution: {
          flowId: 'run-5',
          stepId: 'step-not-in-definition',
          status: 'PENDING',
          assignedToContactId: null,
        },
      } as never);

      mockFindFirst.mockResolvedValueOnce({
        name: 'Another Run',
        template: {
          name: 'Another Flow',
          definition: {
            steps: [
              { stepId: 'step-other', type: 'FORM', config: { name: 'Other Step' } },
            ],
          },
        },
      } as never);

      const result = await validateMagicLink('no-step-token');

      expect(result).not.toBeNull();
      expect(result!.stepName).toBe('Task');
      expect(result!.stepType).toBe('FORM');
    });
  });
});
