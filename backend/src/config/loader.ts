/**
 * Configuration Loader
 *
 * Loads and parses YAML configuration files.
 * Provides access to constraints, defaults, step type definitions,
 * consultation playbook, UX guidelines, and template catalog.
 *
 * Config structure (3 layers):
 *   1. Technical: constraints.yaml, defaults.yaml, step-types/, triggers.yaml
 *   2. Consultative: consultation.yaml (stages, inference rules, post-create suggestions)
 *   3. UX: ux-guidelines.yaml (response formatting, question policy, edit behavior)
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

// Get the config directory path
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
  deprecated?: boolean;
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

// --- Consultation config types (consultation.yaml) ---

export interface ConsultationStage {
  stage: string;
  order: number;
  keyQuestion: string;
  explanation?: string;
  secondaryQuestions?: string[];
  perStepQuestions?: string[];
  proactiveReview?: string[];
  validation?: string[];
  defaults?: string[];
  permissions?: Record<string, string>;
  experienceOptions?: Record<string, string>;
  availableTypes?: Record<string, string>;
  [key: string]: unknown;
}

export interface PostCreateSuggestion {
  question: string;
  recommendation: string;
  subQuestions?: Array<{
    id: string;
    text: string;
    mapsTo: string;
  }>;
}

export interface ConsultationConfig {
  version: string;
  personality: {
    role: string;
    greeting: string;
    tone: string;
    style: string[];
  };
  stages: ConsultationStage[];
  inferenceRules: {
    principle: string;
    negative: string[];
    positive: string[];
  };
  postCreateSuggestions: PostCreateSuggestion[];
}

// --- UX Guidelines config types (ux-guidelines.yaml) ---

export interface UXGuidelinesConfig {
  version: string;
  scope: {
    allowed: string[];
    declineMessage: string;
    neverDisclose: string[];
  };
  questionPolicy: {
    reworkRiskTest: {
      askWhen: string[];
      createWhen: string[];
    };
    genericPromptQuestions: string[];
    neverAskAbout: string[];
    afterClarification: string[];
  };
  quickSuggestions: {
    rules: string[];
  };
  questionTypes: Record<string, { description: string; roleGuidance?: string }>;
  editClarification: {
    when: string;
    clearIntentExamples: string[];
    neverOfferAsEditOptions: string[];
  };
  editStepReferences: {
    rules: string[];
  };
  messageGuidelines: Record<string, string>;
  proactiveSuggestions: {
    enabled: boolean;
    areas: string[];
    format: string;
  };
  assumptions: {
    instruction: string;
    guideline: string;
  };
  whenConstraintViolated: {
    action: string;
    example: string;
  };
  whenUnsupported: {
    action: string;
    example: string;
  };
}

// --- Legacy SE Playbook types (se-playbook.yaml, backward compat) ---

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

// --- Template Catalog types ---

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
 * Load SE playbook configuration (legacy — still used as fallback)
 */
export function loadSEPlaybook(): SEPlaybookConfig {
  return loadYamlFile<SEPlaybookConfig>('se-playbook.yaml');
}

/**
 * Load consultation configuration (new modular structure)
 */
export function loadConsultation(): ConsultationConfig {
  return loadYamlFile<ConsultationConfig>('consultation.yaml');
}

/**
 * Load UX guidelines configuration (new modular structure)
 */
export function loadUXGuidelines(): UXGuidelinesConfig {
  return loadYamlFile<UXGuidelinesConfig>('ux-guidelines.yaml');
}

/**
 * Load all step type configurations from a directory.
 * Filters out deprecated step types.
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
      // Skip deprecated step types (e.g., AI_AUTOMATION replaced by specialized types)
      if (config.deprecated) {
        continue;
      }
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

let cachedConstraints: ConstraintsConfig | null = null;
let cachedDefaults: DefaultsConfig | null = null;
let cachedStepTypes: StepTypeConfig[] | null = null;
let cachedPlaybook: SEPlaybookConfig | null = null;
let cachedConsultation: ConsultationConfig | null = null;
let cachedUXGuidelines: UXGuidelinesConfig | null = null;
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
 * Get all step types (cached, excludes deprecated)
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
      cachedTemplateCatalog = null;
    }
  }
  return cachedTemplateCatalog;
}

/**
 * Get SE playbook (cached, legacy)
 */
export function getPlaybook(): SEPlaybookConfig {
  if (!cachedPlaybook) {
    cachedPlaybook = loadSEPlaybook();
  }
  return cachedPlaybook;
}

/**
 * Get consultation config (cached)
 */
export function getConsultation(): ConsultationConfig {
  if (!cachedConsultation) {
    cachedConsultation = loadConsultation();
  }
  return cachedConsultation;
}

/**
 * Get UX guidelines (cached)
 */
export function getUXGuidelines(): UXGuidelinesConfig {
  if (!cachedUXGuidelines) {
    cachedUXGuidelines = loadUXGuidelines();
  }
  return cachedUXGuidelines;
}

/**
 * Clear all caches (useful for testing or hot-reload)
 */
export function clearConfigCache(): void {
  cachedConstraints = null;
  cachedDefaults = null;
  cachedStepTypes = null;
  cachedPlaybook = null;
  cachedConsultation = null;
  cachedUXGuidelines = null;
  cachedTemplateCatalog = undefined;
}

/**
 * Reload all configurations
 */
export function reloadConfig(): void {
  clearConfigCache();
  getConstraints();
  getDefaults();
  getStepTypes();
  getConsultation();
  getUXGuidelines();
}
