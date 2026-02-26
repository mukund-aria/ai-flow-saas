/**
 * Configuration Loader
 *
 * Loads and parses YAML configuration files.
 * Provides access to constraints, defaults, and step type definitions.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

// Get the config directory path
// Use different variable names to avoid conflict with CommonJS globals
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);
const currentDirPath = dirname(currentFilePath);
const CONFIG_DIR = join(currentDirPath, '../../config');

// ============================================================================
// Types
// ============================================================================

export interface ConstraintsConfig {
  version: string;
  lastUpdated: string;
  branching: {
    maxParallelPaths: number;
    maxDecisionOutcomes: number;
    maxNestingDepth: number;
    milestonesInsideBranches: boolean;
    branchMustFitSingleMilestone: boolean;
  };
  goto: {
    allowedInside: string[];
    targetMustBeOnMainPath: boolean;
  };
  terminate: {
    allowedInside: string[];
    validStatuses: string[];
  };
  variables: {
    allowedTypes: string[];
    setOnlyAtInitiation: boolean;
    immutable: boolean;
  };
  features: {
    subflowSupported: boolean;
  };
  completionModes: string[];
  assigneeOrderOptions: string[];
  skipSequentialOrder?: {
    description: string;
    appliesToStepTypes: string;
    notes: string[];
  };
  subflow?: {
    maxNestingDepth: number;
    notes: string[];
  };
  multiChoiceBranch?: {
    maxPaths: number;
    notes: string[];
  };
}

export interface DefaultsConfig {
  version: string;
  assignees: {
    defaultResolution: string;
    roleOptions: {
      allowViewAllActions: boolean;
      coordinatorToggle: boolean;
    };
  };
  steps: {
    executionOrder: string;
    visibleToAllAssignees: boolean;
    skipSequentialOrder: boolean;
    completionMode: string;
    assigneeOrder: string;
  };
  kickoff: {
    defaultStartMode: string;
    supportedStartModes: string[];
  };
  milestones: {
    defaultToSingleMilestone: boolean;
    defaultMilestoneName: string;
  };
  flow: {
    chatAssistanceEnabled: boolean;
    autoArchiveEnabled: boolean;
  };
  [key: string]: unknown;
}

export interface StepTypeConfig {
  stepType: string;
  category: 'HUMAN_ACTION' | 'CONTROL' | 'AUTOMATION';
  displayName: string;
  description: string;
  schema: {
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
      default?: unknown;
      constraints?: Record<string, unknown>;
    }>;
  };
  completion?: {
    multipleAssignees?: boolean;
    completionMode?: string;
    sequentialSupported?: boolean;
    singleAssigneeOnly?: boolean;
    autoCompletes?: boolean;
    noAssignee?: boolean;
    [key: string]: unknown;
  };
  specialRules?: string[];
  validationRules?: Array<{
    rule: string;
    message: string;
  }>;
  aiGuidance?: {
    whenToUse: string;
    whenNotToUse?: string;
    seQuestions?: string[];
    editQuestions?: Array<{
      question: string;
      aspect: string;
      quickSuggestions?: boolean;
    }>;
    defaults?: string[];
    examples?: Array<{
      trigger: string;
      mapsTo: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  outputs?: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

export interface SEPlaybookConfig {
  version: string;
  personality: {
    role: string;
    greeting: string;
    tone: string;
    style: string;
  };
  consultationStages: Array<{
    stage: string;
    order: number;
    keyQuestion: string;
    secondaryQuestions?: string[];
    perStepQuestions?: string[];
    stepTypeQuestions?: Record<string, string[]>;
    proactiveReview?: string[];
    validation?: string[];
    defaults?: string[];
    explanation?: string;
    permissions?: Record<string, string>;
    experienceOptions?: Record<string, string>;
    [key: string]: unknown;
  }>;
  behaviors: {
    askingPolicy: {
      askWhen: string[];
      applyDefaultWhen?: string[];
      // Primary questions for workflow design (simple strings)
      genericPromptQuestions?: string[];
      neverAskAbout?: string[];
      inferApprovalsFromContext?: string[];
      afterClarificationAnswers?: string[];
      proactiveSuggestionsAfterCreate?: Array<{
        question: string;
        recommendation: string;
        subQuestions?: Array<{
          id: string;
          text: string;
          hint?: string;
          mapsTo: string;
        }>;
      }>;
    };
    proactiveSuggestions: {
      enabled: boolean;
      areas: string[];
    };
    whenConstraintViolated: {
      action: string;
      example: string;
    };
    whenUnsupported: {
      action: string;
      example: string;
    };
  };
}

// ============================================================================
// Loader Functions
// ============================================================================

/**
 * Load a YAML file and parse it
 */
export function loadYamlFile<T>(relativePath: string): T {
  const fullPath = join(CONFIG_DIR, relativePath);

  if (!existsSync(fullPath)) {
    throw new Error(`Config file not found: ${fullPath}`);
  }

  const content = readFileSync(fullPath, 'utf-8');
  return parseYaml(content) as T;
}

/**
 * Load constraints configuration
 */
export function loadConstraints(): ConstraintsConfig {
  return loadYamlFile<ConstraintsConfig>('constraints.yaml');
}

/**
 * Load defaults configuration
 */
export function loadDefaults(): DefaultsConfig {
  return loadYamlFile<DefaultsConfig>('defaults.yaml');
}

/**
 * Load SE playbook configuration
 */
export function loadSEPlaybook(): SEPlaybookConfig {
  return loadYamlFile<SEPlaybookConfig>('se-playbook.yaml');
}

/**
 * Load all step type configurations from a directory
 */
export function loadStepTypesFromDir(subDir: string): StepTypeConfig[] {
  const dirPath = join(CONFIG_DIR, 'step-types', subDir);

  if (!existsSync(dirPath)) {
    return [];
  }

  const files = readdirSync(dirPath).filter(f => f.endsWith('.yaml'));
  const stepTypes: StepTypeConfig[] = [];

  for (const file of files) {
    try {
      const config = loadYamlFile<StepTypeConfig>(join('step-types', subDir, file));
      stepTypes.push(config);
    } catch (error) {
      console.warn(`Failed to load step type config: ${file}`, error);
    }
  }

  return stepTypes;
}

/**
 * Load all step type configurations
 */
export function loadAllStepTypes(): StepTypeConfig[] {
  const humanActions = loadStepTypesFromDir('human-actions');
  const controls = loadStepTypesFromDir('controls');
  const automations = loadStepTypesFromDir('automations');

  return [...humanActions, ...controls, ...automations];
}

// ============================================================================
// Cached Singleton Access
// ============================================================================

export interface TemplateCatalogTemplate {
  name: string;
  roles: string[];
  pattern: string;
}

export interface TemplateCatalogCategory {
  name: string;
  templates: TemplateCatalogTemplate[];
}

export interface TemplateCatalogConfig {
  enabled: boolean;
  categories: TemplateCatalogCategory[];
}

let cachedConstraints: ConstraintsConfig | null = null;
let cachedDefaults: DefaultsConfig | null = null;
let cachedStepTypes: StepTypeConfig[] | null = null;
let cachedPlaybook: SEPlaybookConfig | null = null;
let cachedTemplateCatalog: TemplateCatalogConfig | null | undefined = undefined;

/**
 * Get constraints (cached)
 */
export function getConstraints(): ConstraintsConfig {
  if (!cachedConstraints) {
    cachedConstraints = loadConstraints();
  }
  return cachedConstraints;
}

/**
 * Get defaults (cached)
 */
export function getDefaults(): DefaultsConfig {
  if (!cachedDefaults) {
    cachedDefaults = loadDefaults();
  }
  return cachedDefaults;
}

/**
 * Get all step types (cached)
 */
export function getStepTypes(): StepTypeConfig[] {
  if (!cachedStepTypes) {
    cachedStepTypes = loadAllStepTypes();
  }
  return cachedStepTypes;
}

/**
 * Get template catalog (cached, returns null if file missing or disabled)
 */
export function getTemplateCatalog(): TemplateCatalogConfig | null {
  if (cachedTemplateCatalog === undefined) {
    try {
      const catalog = loadYamlFile<TemplateCatalogConfig>('template-catalog.yaml');
      cachedTemplateCatalog = catalog?.enabled ? catalog : null;
    } catch {
      // File missing or invalid — gracefully disable template awareness
      cachedTemplateCatalog = null;
    }
  }
  return cachedTemplateCatalog;
}

/**
 * Get SE playbook (cached)
 */
export function getPlaybook(): SEPlaybookConfig {
  if (!cachedPlaybook) {
    cachedPlaybook = loadSEPlaybook();
  }
  return cachedPlaybook;
}

/**
 * Clear all caches (useful for testing or hot-reload)
 */
export function clearConfigCache(): void {
  cachedConstraints = null;
  cachedDefaults = null;
  cachedStepTypes = null;
  cachedPlaybook = null;
  cachedTemplateCatalog = undefined;
}

/**
 * Reload all configurations
 */
export function reloadConfig(): void {
  clearConfigCache();
  // Trigger lazy load
  getConstraints();
  getDefaults();
  getStepTypes();
  getPlaybook();
}
