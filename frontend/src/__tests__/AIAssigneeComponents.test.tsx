import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIPrepareNotice } from '@/components/assignee/AIPrepareNotice';
import { AIAdviseCard } from '@/components/assignee/AIAdviseCard';
import { AIReviewFeedback } from '@/components/assignee/AIReviewFeedback';

describe('AIPrepareNotice', () => {
  it('renders pre-filled count', () => {
    render(
      <AIPrepareNotice
        result={{ status: 'COMPLETED', prefilledFields: { name: 'John' }, preparedAt: '' }}
        fieldCount={5}
      />
    );
    expect(screen.getByText(/1 of 5 fields/)).toBeInTheDocument();
  });

  it('returns null for FAILED status', () => {
    const { container } = render(
      <AIPrepareNotice
        result={{ status: 'FAILED', prefilledFields: {}, preparedAt: '' }}
        fieldCount={5}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('toggles reasoning details', () => {
    render(
      <AIPrepareNotice
        result={{ status: 'COMPLETED', prefilledFields: { a: '1' }, reasoning: 'Test reasoning', preparedAt: '' }}
        fieldCount={1}
      />
    );
    fireEvent.click(screen.getByText('Details'));
    expect(screen.getByText('Test reasoning')).toBeInTheDocument();
  });
});

describe('AIAdviseCard', () => {
  it('renders recommendation', () => {
    render(
      <AIAdviseCard
        result={{ status: 'COMPLETED', recommendation: 'Approve this', reasoning: 'Because...', advisedAt: '' }}
      />
    );
    expect(screen.getByText('Approve this')).toBeInTheDocument();
  });

  it('toggles reasoning', () => {
    render(
      <AIAdviseCard
        result={{ status: 'COMPLETED', recommendation: 'Do X', reasoning: 'Reason here', advisedAt: '' }}
      />
    );
    fireEvent.click(screen.getByText('Show reasoning'));
    expect(screen.getByText('Reason here')).toBeInTheDocument();
  });

  it('returns null for FAILED status', () => {
    const { container } = render(
      <AIAdviseCard
        result={{ status: 'FAILED', recommendation: '', reasoning: '', advisedAt: '' }}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('AIReviewFeedback', () => {
  it('renders issues list', () => {
    render(
      <AIReviewFeedback
        result={{ status: 'REVISION_NEEDED', feedback: 'Fix these', issues: ['Issue 1', 'Issue 2'], reviewedAt: '' }}
      />
    );
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
    expect(screen.getByText('Issue 2')).toBeInTheDocument();
  });

  it('returns null for APPROVED status', () => {
    const { container } = render(
      <AIReviewFeedback
        result={{ status: 'APPROVED', feedback: 'Good', reviewedAt: '' }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders feedback text', () => {
    render(
      <AIReviewFeedback
        result={{ status: 'REVISION_NEEDED', feedback: 'Please fix the address field', reviewedAt: '' }}
      />
    );
    expect(screen.getByText('Please fix the address field')).toBeInTheDocument();
    expect(screen.getByText('Revision Needed')).toBeInTheDocument();
  });
});
