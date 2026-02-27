/**
 * Copilot UX Settings
 *
 * Centralized configuration for how the frontend renders AI copilot output.
 * These do NOT affect what the AI generates — only how it's presented.
 *
 * Backend configs (backend/config/) control AI prompt & behavior.
 * This file controls frontend UX routing & display.
 */

export const COPILOT_SETTINGS = {
  /** Proposal display thresholds */
  proposal: {
    /** Max operations to qualify as a "small edit" (chat-only, no panel takeover) */
    smallEditMaxOps: 2,
    /** Operation types that always trigger full panel proposal regardless of count */
    alwaysFullPreviewOps: [
      'ADD_STEP_AFTER',
      'ADD_STEP_BEFORE',
      'REMOVE_STEP',
      'ADD_PATH_STEP_AFTER',
      'ADD_PATH_STEP_BEFORE',
    ],
    /** Max steps to show in the PlanSummaryCard preview (before "View all") */
    chatCardPreviewSteps: 0, // 0 = no step preview in chat card (handled by panel)
  },

  /** ProposalBanner settings */
  banner: {
    /** Max change summary lines before "and N more..." */
    maxSummaryLines: 3,
    /** Max assumptions to show before collapsing */
    maxVisibleAssumptions: 2,
  },
} as const;
