import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddStepPopover } from '@/components/workflow/AddStepPopover';
import { STEP_TYPE_META } from '@/types';
import type { StepType } from '@/types';

describe('AddStepPopover', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockOnSelect.mockClear();
  });

  it('renders nothing when open={false}', () => {
    const { container } = render(
      <AddStepPopover open={false} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders step groups (Human Actions, Control Flow, Automations) when open', () => {
    render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('Human Actions')).toBeInTheDocument();
    expect(screen.getByText('Control Flow')).toBeInTheDocument();
    expect(screen.getByText('Automations')).toBeInTheDocument();
  });

  it('renders the "Add Step" header when open', () => {
    render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('Add Step')).toBeInTheDocument();
  });

  it('shows correct step type labels from STEP_TYPE_META', () => {
    render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    // Human Actions group types
    const humanTypes: StepType[] = ['FORM', 'APPROVAL', 'FILE_REQUEST', 'TODO', 'ACKNOWLEDGEMENT', 'DECISION', 'ESIGN'];
    for (const type of humanTypes) {
      expect(screen.getByText(STEP_TYPE_META[type].label)).toBeInTheDocument();
    }

    // Control Flow group types
    const controlTypes: StepType[] = ['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT'];
    for (const type of controlTypes) {
      expect(screen.getByText(STEP_TYPE_META[type].label)).toBeInTheDocument();
    }

    // Automations group types
    const automationTypes: StepType[] = ['SYSTEM_EMAIL', 'SYSTEM_WEBHOOK', 'AI_CUSTOM_PROMPT'];
    for (const type of automationTypes) {
      expect(screen.getByText(STEP_TYPE_META[type].label)).toBeInTheDocument();
    }
  });

  it('clicking a step type calls onSelect with the correct type', () => {
    render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    fireEvent.click(screen.getByText(STEP_TYPE_META.FORM.label));

    expect(mockOnSelect).toHaveBeenCalledWith('FORM');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('clicking a step type also closes the popover', () => {
    render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    fireEvent.click(screen.getByText(STEP_TYPE_META.APPROVAL.label));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnSelect).toHaveBeenCalledWith('APPROVAL');
  });

  it('clicking different step types calls onSelect with correct types', () => {
    const { unmount } = render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    fireEvent.click(screen.getByText(STEP_TYPE_META.TODO.label));
    expect(mockOnSelect).toHaveBeenCalledWith('TODO');

    mockOnSelect.mockClear();
    unmount();

    // Re-render since it closes after selection
    render(
      <AddStepPopover open={true} onOpenChange={mockOnOpenChange} onSelect={mockOnSelect} />
    );

    fireEvent.click(screen.getByText(STEP_TYPE_META.WAIT.label));
    expect(mockOnSelect).toHaveBeenCalledWith('WAIT');
  });
});
