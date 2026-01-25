/**
 * User-Friendly Error Messages (Frontend)
 *
 * Converts technical error messages to conversational,
 * human-friendly messages that feel like an AI SE talking.
 */

// Error pattern to friendly message mappings
const ERROR_MAPPINGS: Array<{ pattern: RegExp; friendly: string }> = [
  // LLM/Parsing errors
  {
    pattern: /Could not find valid JSON/i,
    friendly: "I had trouble formulating my response. Let me try that again.",
  },
  {
    pattern: /Invalid JSON/i,
    friendly: "Something went wrong with my response. Could you try rephrasing your request?",
  },
  {
    pattern: /Parse error/i,
    friendly: "I'm having trouble understanding that. Could you try again?",
  },
  {
    pattern: /LLM.*failed|LLM_ERROR/i,
    friendly: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
  },
  {
    pattern: /Failed to parse AI response/i,
    friendly: "I had trouble formulating my response. Let me try that again.",
  },
  {
    pattern: /Response must have a "mode" field/i,
    friendly: "I got confused there. Let me try that again.",
  },

  // Network errors
  {
    pattern: /Failed to fetch|NetworkError|network/i,
    friendly: "I'm having trouble connecting. Please check your connection and try again.",
  },
  {
    pattern: /timeout|ETIMEDOUT/i,
    friendly: "That took longer than expected. Let's try again.",
  },
  {
    pattern: /HTTP error.*5\d{2}/i,
    friendly: "Something went wrong on our end. Please try again.",
  },
  {
    pattern: /HTTP error.*4\d{2}/i,
    friendly: "There was a problem with that request. Please try again.",
  },

  // Chat errors
  {
    pattern: /Failed to send message/i,
    friendly: "I couldn't send that message. Please try again.",
  },
  {
    pattern: /Failed to upload/i,
    friendly: "I couldn't upload that file. Please try again or try a different file.",
  },
  {
    pattern: /Failed to approve plan/i,
    friendly: "I couldn't publish the workflow. Please try again.",
  },
  {
    pattern: /Failed to discard plan/i,
    friendly: "I couldn't discard that preview. Please try again.",
  },

  // Session errors
  {
    pattern: /Session.*expired|Session not found/i,
    friendly: "This conversation has expired. Let's start a fresh one!",
  },
  {
    pattern: /No response body/i,
    friendly: "I received an empty response. Let me try again.",
  },
];

/**
 * Convert a technical error message to a user-friendly one
 */
export function getUserFriendlyError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;

  if (!message) {
    return "Sorry, I'm unable to help with your request right now. Please try again later.";
  }

  for (const { pattern, friendly } of ERROR_MAPPINGS) {
    if (pattern.test(message)) {
      return friendly;
    }
  }

  // Return a generic friendly message for unknown errors
  // This ensures technical details are never exposed to users
  return "Sorry, I'm unable to help with your request right now. Please try again later.";
}
