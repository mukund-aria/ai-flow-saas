/**
 * Step Type Registry
 *
 * Provides a registry of known step types loaded from configuration.
 * Used for validation and backwards compatibility checks.
 */

import { getStepTypes, type StepTypeConfig } from './loader.js';
import type { StepType } from '../models/steps.js';

// ============================================================================
// Registry
// ============================================================================

class StepRegistry {
  private registry: Map<string, StepTypeConfig> = new Map();
  private initialized = false;

  /**
   * Initialize the registry from config files
   */
  initialize(): void {
    if (this.initialized) return;

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
