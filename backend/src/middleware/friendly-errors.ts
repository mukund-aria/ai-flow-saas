/**
 * User-Friendly Error Messages
 *
 * Maps technical error codes and messages to conversational,
 * human-friendly error messages that feel like an SE talking.
 */

// Technical patterns to friendly messages
const ERROR_MAPPINGS: Array<{ pattern: RegExp | string; friendly: string }> = [
  // JSON/Parsing errors
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

  // LLM/API errors
  {
    pattern: /LLM.*failed|LLM_ERROR/i,
    friendly: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
  },
  {
    pattern: /rate.?limit/i,
    friendly: "I'm getting a lot of requests right now. Let's wait a moment and try again.",
  },
  {
    pattern: /timeout/i,
    friendly: "That took longer than expected. Let me try a simpler approach.",
  },

  // Session errors
  {
    pattern: /Session not found|SESSION_NOT_FOUND/i,
    friendly: "This conversation has expired. Let's start a fresh one!",
  },
  {
    pattern: /No workflow exists|NO_WORKFLOW/i,
    friendly: "There's no workflow to edit yet. Would you like me to create one first?",
  },
  {
    pattern: /Plan not found/i,
    friendly: "That workflow preview is no longer available. Would you like to start over?",
  },

  // Validation errors
  {
    pattern: /Validation failed|VALIDATION_FAILED/i,
    friendly: "I couldn't process that request. Could you try again with different details?",
  },
  {
    pattern: /Platform limit|maximum.*branches/i,
    friendly: "That exceeds what the platform can handle. Let me suggest an alternative.",
  },

  // Network/connection errors
  {
    pattern: /network|fetch|ECONNREFUSED/i,
    friendly: "I'm having trouble connecting. Please check your connection and try again.",
  },
  {
    pattern: /HTTP error.*500/i,
    friendly: "Something went wrong on our end. Please try again.",
  },
  {
    pattern: /HTTP error.*503/i,
    friendly: "The service is temporarily unavailable. Please try again in a moment.",
  },

  // Generic errors
  {
    pattern: /Internal.*error|INTERNAL_ERROR/i,
    friendly: "Something unexpected happened. Please try again.",
  },
];

/**
 * Convert a technical error message to a user-friendly one
 */
export function getUserFriendlyError(technicalError: string): string {
  if (!technicalError) {
    return "Sorry, I'm unable to help with your request right now. Please try again later.";
  }

  for (const { pattern, friendly } of ERROR_MAPPINGS) {
    if (typeof pattern === 'string') {
      if (technicalError.toLowerCase().includes(pattern.toLowerCase())) {
        return friendly;
      }
    } else if (pattern.test(technicalError)) {
      return friendly;
    }
  }

  // If no match, return a generic friendly message
  // This ensures technical details are never exposed to users
  return "Sorry, I'm unable to help with your request right now. Please try again later.";
}

/**
 * Get a friendly error for an error code
 */
export function getFriendlyErrorByCode(code: string): string {
  const codeMap: Record<string, string> = {
    'BAD_REQUEST': "I couldn't process that request. Please try again.",
    'NOT_FOUND': "I couldn't find what you're looking for.",
    'VALIDATION_FAILED': "That request had some issues. Please check and try again.",
    'LLM_ERROR': "I'm having trouble thinking right now. Please try again in a moment.",
    'INTERNAL_ERROR': "Something unexpected happened. Please try again.",
    'SESSION_NOT_FOUND': "This conversation has expired. Let's start fresh!",
    'NO_WORKFLOW': "There's no workflow yet. Would you like me to create one?",
    'STREAM_ERROR': "The connection was interrupted. Please try again.",
  };

  return codeMap[code] || "Sorry, I'm unable to help with your request right now. Please try again later.";
}

/**
 * Wrap an error object with a friendly message
 */
export interface FriendlyError {
  code: string;
  technicalMessage: string;
  friendlyMessage: string;
}

export function wrapError(code: string, technicalMessage: string): FriendlyError {
  return {
    code,
    technicalMessage,
    friendlyMessage: getUserFriendlyError(technicalMessage) || getFriendlyErrorByCode(code),
  };
}
