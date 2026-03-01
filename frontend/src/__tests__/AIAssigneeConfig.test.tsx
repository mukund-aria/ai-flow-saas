import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepConfigPanel } from '@/components/workflow/StepConfigPanel';
import type { Step, Role } from '@/types';

const mockPlaceholders: Role[] = [
  { roleId: 'role-1', name: 'Client' },
];

function makeStep(type: string, config: Record<string, unknown> = {}): Step {
  return {
    stepId: 'step-1',
    type: type as Step['type'],
    config: {
      name: 'Test Step',
      description: '',
      assignee: '',
      ...config,
    },
  };
}

describe('AIAssigneeConfigSection (via StepConfigPanel)', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it('FORM step shows all 3 AI toggles (Prepare, Advise, Review)', () => {
    render(
      <StepConfigPanel
        step={makeStep('FORM')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('AI Prepare')).toBeInTheDocument();
    expect(screen.getByText('AI Advise')).toBeInTheDocument();
    expect(screen.getByText('AI Review')).toBeInTheDocument();
  });

  it('DECISION step shows only Advise toggle', () => {
    render(
      <StepConfigPanel
        step={makeStep('DECISION')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.queryByText('AI Prepare')).not.toBeInTheDocument();
    expect(screen.getByText('AI Advise')).toBeInTheDocument();
    expect(screen.queryByText('AI Review')).not.toBeInTheDocument();
  });

  it('FILE_REQUEST step shows Advise and Review toggles', () => {
    render(
      <StepConfigPanel
        step={makeStep('FILE_REQUEST')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.queryByText('AI Prepare')).not.toBeInTheDocument();
    expect(screen.getByText('AI Advise')).toBeInTheDocument();
    expect(screen.getByText('AI Review')).toBeInTheDocument();
  });

  it('APPROVAL step shows only Advise toggle', () => {
    render(
      <StepConfigPanel
        step={makeStep('APPROVAL')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.queryByText('AI Prepare')).not.toBeInTheDocument();
    expect(screen.getByText('AI Advise')).toBeInTheDocument();
    expect(screen.queryByText('AI Review')).not.toBeInTheDocument();
  });

  it('toggling a checkbox reveals the textarea', () => {
    render(
      <StepConfigPanel
        step={makeStep('FORM')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Textarea should not be visible initially
    expect(screen.queryByPlaceholderText(/Add instructions for AI preparation/)).not.toBeInTheDocument();

    // Find the AI Prepare checkbox (it's in the AI Assistants section)
    const checkboxes = screen.getAllByRole('checkbox');
    // The AI Prepare checkbox is the one in the AI section - find it by looking at nearby text
    const aiPrepareCheckbox = checkboxes.find((cb) => {
      const parent = cb.closest('.border.border-violet-100');
      return parent?.textContent?.includes('AI Prepare');
    });

    expect(aiPrepareCheckbox).toBeDefined();
    fireEvent.click(aiPrepareCheckbox!);

    // Now the textarea should appear
    expect(screen.getByPlaceholderText(/Add instructions for AI preparation/)).toBeInTheDocument();
  });

  it('TODO step shows no AI section (none of the 3 apply)', () => {
    render(
      <StepConfigPanel
        step={makeStep('TODO')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // The AI Assistants section should not render since TODO has no applicable AI features
    expect(screen.queryByText('AI Assistants')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Prepare')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Advise')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Review')).not.toBeInTheDocument();
  });

  it('config saves correctly with AI settings', () => {
    render(
      <StepConfigPanel
        step={makeStep('FORM')}
        roles={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Enable AI Prepare
    const checkboxes = screen.getAllByRole('checkbox');
    const aiPrepareCheckbox = checkboxes.find((cb) => {
      const parent = cb.closest('.border.border-violet-100');
      return parent?.textContent?.includes('AI Prepare');
    });
    fireEvent.click(aiPrepareCheckbox!);

    // Save
    fireEvent.click(screen.getByText('Save'));

    expect(mockOnSave).toHaveBeenCalledWith(
      'step-1',
      expect.objectContaining({
        aiPrepare: { enabled: true },
        aiAdvise: { enabled: false },
        aiReview: { enabled: false },
      })
    );
  });
});
