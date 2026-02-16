import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepConfigPanel } from '@/components/workflow/StepConfigPanel';
import type { Step, AssigneePlaceholder } from '@/types';

const mockStep: Step = {
  stepId: 'step-1',
  type: 'FORM' as const,
  config: {
    name: 'Test Step',
    description: 'Test desc',
    assignee: '',
  },
};

const mockPlaceholders: AssigneePlaceholder[] = [
  { placeholderId: 'role-1', roleName: 'Client' },
  { placeholderId: 'role-2', roleName: 'Manager' },
];

describe('StepConfigPanel', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders name, description, and assignee fields', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Step Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Assignee')).toBeInTheDocument();
  });

  it('pre-fills fields from step.config', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter step name...') as HTMLInputElement;
    const descInput = screen.getByPlaceholderText('Describe what this step does...') as HTMLTextAreaElement;

    expect(nameInput.value).toBe('Test Step');
    expect(descInput.value).toBe('Test desc');
  });

  it('save button calls onSave with updated values', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter step name...');
    const descInput = screen.getByPlaceholderText('Describe what this step does...');

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(descInput, { target: { value: 'Updated description' } });

    fireEvent.click(screen.getByText('Save'));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith('step-1', {
      name: 'Updated Name',
      description: 'Updated description',
      assignee: undefined,
    });
  });

  it('cancel button calls onCancel', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('assignee dropdown shows placeholder options', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options);

    expect(options).toHaveLength(3); // Unassigned + Client + Manager
    expect(options[0].textContent).toBe('Unassigned');
    expect(options[1].textContent).toBe('Client');
    expect(options[2].textContent).toBe('Manager');
  });

  it('saves with selected assignee', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Client' } });

    fireEvent.click(screen.getByText('Save'));

    expect(mockOnSave).toHaveBeenCalledWith('step-1', {
      name: 'Test Step',
      description: 'Test desc',
      assignee: 'Client',
    });
  });

  it('pre-fills assignee when step has one set', () => {
    const stepWithAssignee: Step = {
      ...mockStep,
      config: { ...mockStep.config, assignee: 'Manager' },
    };

    render(
      <StepConfigPanel
        step={stepWithAssignee}
        assigneePlaceholders={mockPlaceholders}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('Manager');
  });

  it('renders with empty placeholders list', () => {
    render(
      <StepConfigPanel
        step={mockStep}
        assigneePlaceholders={[]}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options);

    expect(options).toHaveLength(1); // Only "Unassigned"
    expect(options[0].textContent).toBe('Unassigned');
  });
});
