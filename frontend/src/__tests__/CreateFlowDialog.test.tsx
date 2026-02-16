import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateFlowDialog } from '@/components/workflow/CreateFlowDialog';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('CreateFlowDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockOnOpenChange.mockClear();
  });

  it('renders nothing when open={false}', () => {
    const { container } = render(
      <CreateFlowDialog open={false} onOpenChange={mockOnOpenChange} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders two mode cards (AI Mode, Manual Mode) when open={true}', () => {
    render(
      <CreateFlowDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText('AI Mode')).toBeInTheDocument();
    expect(screen.getByText('Manual Mode')).toBeInTheDocument();
  });

  it('renders the dialog header when open', () => {
    render(
      <CreateFlowDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText('Create New Template')).toBeInTheDocument();
    expect(screen.getByText("Choose how you'd like to build your workflow")).toBeInTheDocument();
  });

  it('clicking AI Mode navigates to /flows/new?mode=ai', () => {
    render(
      <CreateFlowDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    fireEvent.click(screen.getByText('AI Mode'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/templates/new?mode=ai');
  });

  it('clicking Manual Mode navigates to /flows/new?mode=manual', () => {
    render(
      <CreateFlowDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    fireEvent.click(screen.getByText('Manual Mode'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/templates/new?mode=manual');
  });
});
