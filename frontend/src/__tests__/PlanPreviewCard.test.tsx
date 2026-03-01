/**
 * PlanPreviewCard Component Tests
 *
 * Tests the plan preview card handles:
 * - Valid workflows
 * - Missing/null roles
 * - Missing/null steps
 * - Malformed step configs
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanSummaryCard as PlanPreviewCard } from '@/components/chat/PlanSummaryCard';
import {
  VALID_PENDING_PLAN,
  PENDING_PLAN_NO_ASSUMPTIONS,
  PENDING_PLAN_EMPTY_ASSUMPTIONS,
  ALL_PENDING_PLAN_EDGE_CASES,
} from './fixtures';
import type { PendingPlan, Flow } from '@/types';

describe('PlanPreviewCard', () => {
  const mockOnApprove = vi.fn();
  const mockOnRequestChanges = vi.fn();

  beforeEach(() => {
    mockOnApprove.mockClear();
    mockOnRequestChanges.mockClear();
  });

  // ============================================================================
  // Happy Path Tests
  // ============================================================================

  describe('Happy Path', () => {
    it('renders workflow name', () => {
      render(
        <PlanPreviewCard
          plan={VALID_PENDING_PLAN}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      expect(screen.getByText('Client Onboarding')).toBeInTheDocument();
    });

    it('renders step count and role count', () => {
      render(
        <PlanPreviewCard
          plan={VALID_PENDING_PLAN}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      expect(screen.getByText(/2 steps/)).toBeInTheDocument();
      expect(screen.getByText(/2 roles/)).toBeInTheDocument();
    });

    it('renders step and role stats', () => {
      render(
        <PlanPreviewCard
          plan={VALID_PENDING_PLAN}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      // Component shows counts, not individual step/role names
      expect(screen.getByText(/2 steps/)).toBeInTheDocument();
      expect(screen.getByText(/2 roles/)).toBeInTheDocument();
    });

    it('renders assumptions toggle when present', () => {
      render(
        <PlanPreviewCard
          plan={VALID_PENDING_PLAN}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      // Assumptions are behind a collapsible toggle
      const toggle = screen.getByText(/Assumptions \(2\)/);
      expect(toggle).toBeInTheDocument();

      // Click to expand
      fireEvent.click(toggle);
      expect(screen.getByText(/Client is external/)).toBeInTheDocument();
    });

    it('calls onApprove when approve button clicked', () => {
      render(
        <PlanPreviewCard
          plan={VALID_PENDING_PLAN}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      fireEvent.click(screen.getByText(/Approve & Create/));
      expect(mockOnApprove).toHaveBeenCalledTimes(1);
    });

    it('shows Make Changes input when clicked', () => {
      render(
        <PlanPreviewCard
          plan={VALID_PENDING_PLAN}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      // Click "Make Changes" button
      fireEvent.click(screen.getByText('Make Changes'));

      // Should show textarea for entering changes
      expect(screen.getByPlaceholderText(/Describe the changes/)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Edge Case Tests - This is what catches bugs like missing roles
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles plan without assumptions', () => {
      render(
        <PlanPreviewCard
          plan={PENDING_PLAN_NO_ASSUMPTIONS}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      expect(screen.queryByText(/Assumptions/)).not.toBeInTheDocument();
    });

    it('handles plan with empty assumptions array', () => {
      render(
        <PlanPreviewCard
          plan={PENDING_PLAN_EMPTY_ASSUMPTIONS}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      expect(screen.queryByText(/Assumptions/)).not.toBeInTheDocument();
    });

    // Test all edge cases don't crash
    ALL_PENDING_PLAN_EDGE_CASES.forEach(({ name, plan }) => {
      it(`renders without crashing: ${name}`, () => {
        // This is the key test - the component should NEVER crash
        expect(() => {
          render(
            <PlanPreviewCard
              plan={plan}
              onApprove={mockOnApprove}
              onRequestChanges={mockOnRequestChanges}
            />
          );
        }).not.toThrow();
      });
    });

    it('shows 0 steps when steps array is empty', () => {
      const planWithNoSteps: PendingPlan = {
        planId: 'plan-empty-steps',
        workflow: {
          flowId: 'flow-1',
          name: 'Empty Workflow',
          steps: [],
          milestones: [],
          roles: [],
        },
        message: 'Empty workflow',
      };

      render(
        <PlanPreviewCard
          plan={planWithNoSteps}
          onApprove={mockOnApprove}
          onRequestChanges={mockOnRequestChanges}
        />
      );

      expect(screen.getByText(/0 steps/)).toBeInTheDocument();
    });

    it('handles workflow with null roles', () => {
      const planWithNullAssignees: PendingPlan = {
        planId: 'plan-null',
        workflow: {
          flowId: 'flow-1',
          name: 'Null Assignees',
          steps: [{ stepId: 's1', type: 'TODO', config: { name: 'Task' } }],
          milestones: [],
          // @ts-expect-error - Testing null case
          roles: null,
        },
        message: 'Test',
      };

      // Should NOT throw
      expect(() => {
        render(
          <PlanPreviewCard
            plan={planWithNullAssignees}
            onApprove={mockOnApprove}
            onRequestChanges={mockOnRequestChanges}
          />
        );
      }).not.toThrow();

      // Should still render
      expect(screen.getByText('Null Assignees')).toBeInTheDocument();
    });

    it('handles workflow with undefined roles', () => {
      const planWithUndefinedAssignees: PendingPlan = {
        planId: 'plan-undef',
        workflow: {
          flowId: 'flow-1',
          name: 'Undefined Assignees',
          steps: [{ stepId: 's1', type: 'TODO', config: { name: 'Task' } }],
          milestones: [],
          // Intentionally missing roles
        } as unknown as Flow,
        message: 'Test',
      };

      // Should NOT throw
      expect(() => {
        render(
          <PlanPreviewCard
            plan={planWithUndefinedAssignees}
            onApprove={mockOnApprove}
            onRequestChanges={mockOnRequestChanges}
          />
        );
      }).not.toThrow();

      expect(screen.getByText('Undefined Assignees')).toBeInTheDocument();
    });

    it('handles step with missing config', () => {
      const planWithBadStep: PendingPlan = {
        planId: 'plan-bad-step',
        workflow: {
          flowId: 'flow-1',
          name: 'Bad Step Config',
          steps: [
            {
              stepId: 's1',
              type: 'FORM',
              // @ts-expect-error - Missing config
              config: undefined,
            },
          ],
          milestones: [],
          roles: [],
        },
        message: 'Test',
      };

      // Should NOT throw
      expect(() => {
        render(
          <PlanPreviewCard
            plan={planWithBadStep}
            onApprove={mockOnApprove}
            onRequestChanges={mockOnRequestChanges}
          />
        );
      }).not.toThrow();
    });

    it('handles step with null config', () => {
      const planWithNullConfig: PendingPlan = {
        planId: 'plan-null-config',
        workflow: {
          flowId: 'flow-1',
          name: 'Null Config',
          steps: [
            {
              stepId: 's1',
              type: 'FORM',
              // @ts-expect-error - Null config
              config: null,
            },
          ],
          milestones: [],
          roles: [],
        },
        message: 'Test',
      };

      // Should NOT throw
      expect(() => {
        render(
          <PlanPreviewCard
            plan={planWithNullConfig}
            onApprove={mockOnApprove}
            onRequestChanges={mockOnRequestChanges}
          />
        );
      }).not.toThrow();
    });
  });
});
