/**
 * Step Type Registry
 *
 * Provides a registry of known step types loaded from configuration.
 * Used for validation and backwards compatibility checks.
 */

import { getStepTypes, type StepTypeConfig } from './loader.js';
import type { StepType } from '../models/steps.js';

// ============================================================================
// Built-in Integration Types
// ============================================================================

/**
 * Integration step types that are registered programmatically.
 * These are recognized even before individual YAML config files are created.
 */
const BUILTIN_INTEGRATION_TYPES: StepTypeConfig[] = [
  {
    stepType: 'INTEGRATION_AIRTABLE',
    category: 'AUTOMATION',
    displayName: 'Airtable',
    description: 'Create or update records in Airtable bases',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
  {
    stepType: 'INTEGRATION_CLICKUP',
    category: 'AUTOMATION',
    displayName: 'ClickUp',
    description: 'Create tasks or update statuses in ClickUp',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
  {
    stepType: 'INTEGRATION_DROPBOX',
    category: 'AUTOMATION',
    displayName: 'Dropbox',
    description: 'Upload files or create folders in Dropbox',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
  {
    stepType: 'INTEGRATION_GMAIL',
    category: 'AUTOMATION',
    displayName: 'Gmail',
    description: 'Send emails via Gmail with dynamic content',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
  {
    stepType: 'INTEGRATION_GOOGLE_DRIVE',
    category: 'AUTOMATION',
    displayName: 'Google Drive',
    description: 'Upload files or manage folders in Google Drive',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
  {
    stepType: 'INTEGRATION_GOOGLE_SHEETS',
    category: 'AUTOMATION',
    displayName: 'Google Sheets',
    description: 'Add rows or update cells in Google Sheets',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
  {
    stepType: 'INTEGRATION_WRIKE',
    category: 'AUTOMATION',
    displayName: 'Wrike',
    description: 'Create or update tasks in Wrike projects',
    schema: { fields: [] },
    completion: { autoCompletes: true, noAssignee: true },
  },
];

// ============================================================================
// Registry
// ============================================================================

class StepRegistry {
  private registry: Map<string, StepTypeConfig> = new Map();
  private initialized = false;

  /**
   * Initialize the registry from config files and built-in definitions.
   * Built-in integration types are registered first, then YAML configs
   * override them if present (YAML takes precedence).
   */
  initialize(): void {
    if (this.initialized) return;

    // Register built-in integration types first
    for (const config of BUILTIN_INTEGRATION_TYPES) {
      this.registry.set(config.stepType, config);
    }

    // Load from YAML config files (overrides built-ins if present)
    const stepTypes = getStepTypes();
    for (const config of stepTypes) {
      this.registry.set(config.stepType, config);
    }
    this.initialized = true;
  }

  /**
   * Check if a step type is known
   */
  isKnown(stepType: string): boolean {
    this.ensureInitialized();
    return this.registry.has(stepType);
  }

  /**
   * Get configuration for a step type
   */
  getConfig(stepType: string): StepTypeConfig | undefined {
    this.ensureInitialized();
    return this.registry.get(stepType);
  }

  /**
   * Get all known step types
   */
  getAllKnownTypes(): string[] {
    this.ensureInitialized();
    return Array.from(this.registry.keys());
  }

  /**
   * Get step types by category
   */
  getByCategory(category: 'HUMAN_ACTION' | 'CONTROL' | 'AUTOMATION'): StepTypeConfig[] {
    this.ensureInitialized();
    return Array.from(this.registry.values()).filter(
      config => config.category === category
    );
  }

  /**
   * Get validation rules for a step type
   */
  getValidationRules(stepType: string): Array<{ rule: string; message: string }> {
    const config = this.getConfig(stepType);
    return config?.validationRules ?? [];
  }

  /**
   * Get AI guidance for a step type
   */
  getAIGuidance(stepType: string): StepTypeConfig['aiGuidance'] | undefined {
    const config = this.getConfig(stepType);
    return config?.aiGuidance;
  }

  /**
   * Get special rules for a step type
   */
  getSpecialRules(stepType: string): string[] {
    const config = this.getConfig(stepType);
    return config?.specialRules ?? [];
  }

  /**
   * Check if step type supports multiple assignees
   */
  supportsMultipleAssignees(stepType: string): boolean {
    const config = this.getConfig(stepType);
    return config?.completion?.multipleAssignees ?? false;
  }

  /**
   * Check if step type requires single assignee
   */
  requiresSingleAssignee(stepType: string): boolean {
    const config = this.getConfig(stepType);
    return config?.completion?.singleAssigneeOnly ?? false;
  }

  /**
   * Check if step type auto-completes (no human action needed)
   */
  autoCompletes(stepType: string): boolean {
    const config = this.getConfig(stepType);
    return config?.completion?.autoCompletes ?? false;
  }

  /**
   * Get display name for a step type
   */
  getDisplayName(stepType: string): string {
    const config = this.getConfig(stepType);
    return config?.displayName ?? stepType;
  }

  /**
   * Clear and reinitialize registry
   */
  reload(): void {
    this.registry.clear();
    this.initialized = false;
    this.initialize();
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const stepRegistry = new StepRegistry();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Check if a step type is known to the system
 */
export function isKnownStepType(stepType: string): boolean {
  return stepRegistry.isKnown(stepType);
}

/**
 * Get all known step types
 */
export function getKnownStepTypes(): string[] {
  return stepRegistry.getAllKnownTypes();
}

/**
 * Get step type configuration
 */
export function getStepTypeConfig(stepType: string): StepTypeConfig | undefined {
  return stepRegistry.getConfig(stepType);
}

/**
 * Get human action step types
 */
export function getHumanActionTypes(): StepTypeConfig[] {
  return stepRegistry.getByCategory('HUMAN_ACTION');
}

/**
 * Get control step types
 */
export function getControlTypes(): StepTypeConfig[] {
  return stepRegistry.getByCategory('CONTROL');
}

/**
 * Get automation step types
 */
export function getAutomationTypes(): StepTypeConfig[] {
  return stepRegistry.getByCategory('AUTOMATION');
}
