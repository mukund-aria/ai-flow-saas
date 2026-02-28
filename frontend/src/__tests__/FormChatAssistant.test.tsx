import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormChatAssistant } from '@/components/assignee/FormChatAssistant';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

describe('FormChatAssistant', () => {
  const defaultProps = {
    token: 'test-token',
    stepName: 'Client Information',
    formFieldLabels: ['Name', 'Email', 'Phone'],
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders toggle button initially', () => {
    render(<FormChatAssistant {...defaultProps} />);
    expect(screen.getByText('Ask AI')).toBeInTheDocument();
  });

  it('opens chat panel on click', () => {
    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Form Assistant')).toBeInTheDocument();
  });

  it('closes chat panel', () => {
    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Form Assistant')).toBeInTheDocument();
    const closeBtn = screen.getByLabelText('Close chat');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Form Assistant')).not.toBeInTheDocument();
    expect(screen.getByText('Ask AI')).toBeInTheDocument();
  });

  it('shows suggestions when empty', () => {
    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('What should I fill in here?')).toBeInTheDocument();
    expect(screen.getByText('Help me understand these fields')).toBeInTheDocument();
    expect(screen.getByText('What information is needed?')).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));
    const sendButton = screen.getAllByRole('button').find(btn => btn.querySelector('.lucide-send'));
    expect(sendButton).toBeDisabled();
  });

  it('populates input when suggestion is clicked', () => {
    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));
    fireEvent.click(screen.getByText('What should I fill in here?'));
    const input = screen.getByPlaceholderText('Ask about form fields...');
    expect(input).toHaveValue('What should I fill in here?');
  });

  it('displays step name in header', () => {
    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByText('Ask about Client Information')).toBeInTheDocument();
  });

  it('shows user message after sending', async () => {
    // Mock a streaming response
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"content":"Hello!"}\n\n'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: [DONE]\n\n'),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));

    const input = screen.getByPlaceholderText('Ask about form fields...');
    fireEvent.change(input, { target: { value: 'Help me' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Help me')).toBeInTheDocument();
    });
  });

  it('streams assistant response', async () => {
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"content":"Hello "}\n\n'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"content":"world!"}\n\n'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: [DONE]\n\n'),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));

    const input = screen.getByPlaceholderText('Ask about form fields...');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Hello world!')).toBeInTheDocument();
    });
  });

  it('handles error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Rate limited' } }),
    });

    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));

    const input = screen.getByPlaceholderText('Ask about form fields...');
    fireEvent.change(input, { target: { value: 'Help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Rate limited')).toBeInTheDocument();
    });
  });

  it('sends correct payload to API', async () => {
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"content":"OK"}\n\n'),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(<FormChatAssistant {...defaultProps} />);
    fireEvent.click(screen.getByText('Ask AI'));

    const input = screen.getByPlaceholderText('Ask about form fields...');
    fireEvent.change(input, { target: { value: 'What is this?' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/public/task/test-token/form-chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'What is this?', history: [] }),
        })
      );
    });
  });
});
