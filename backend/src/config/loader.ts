/**
 * Configuration Loader
 *
 * Loads, validates, and caches YAML configuration files.
 *
 * Config structure (3 layers):
 *   1. Technical:      config/technical/ — constraints, defaults, triggers, step-types/
 *   2. Consultative:   config/consultative/ — consultation stages, inference, templates
 *   3. UX:             config/ux/ — response format, question policy, edit behavior
 *
 * All configs are validated at load time via Zod schemas. A malformed YAML
 * will throw a descriptive error at startup instead of producing a broken prompt.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

// Get the config directory path
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);
const currentDirPath = dirname(currentFilePath);
const CONFIG_DIR = join(currentDirPath, '../../config');

// ============================================================================
// Zod Schemas
// ============================================================================

const ConstraintsSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().optional(),
  branching: z.object({
    maxParallelPaths: z.number(),
    maxDecisionOutcomes: z.number(),
    maxNestingDepth: z.number(),
    milestonesInsideBranches: z.boolean(),
    branchMustFitSingleMilestone: z.boolean(),
  }),
  goto: z.object({
    allowedInside: z.array(z.string()),
    targetMustBeOnMainPath: z.boolean(),
  }),
  terminate: z.object({
    allowedInside: z.array(z.string()),
    validStatuses: z.array(z.string()),
  }),
  variables: z.object({
    allowedTypes: z.array(z.string()),
    setOnlyAtInitiation: z.boolean(),
    immutable: z.boolean(),
  }),
  features: z.object({
    subflowSupported: z.boolean(),
  }),
  completionModes: z.array(z.string()),
  assigneeOrderOptions: z.array(z.string()),
  skipSequentialOrder: z.object({
    description: z.string(),
    appliesToStepTypes: z.string(),
    notes: z.array(z.string()),
  }).optional(),
  subflow: z.object({
    maxNestingDepth: z.number(),
    notes: z.array(z.string()),
  }).optional(),
  multiChoiceBranch: z.object({
    maxPaths: z.number(),
    notes: z.array(z.string()),
  }).optional(),
}).passthrough();

const DefaultsSchema = z.object({
  version: z.string(),
  assignees: z.object({
    defaultResolution: z.string(),
    roleOptions: z.object({
      allowViewAllActions: z.boolean(),
      coordinatorToggle: z.boolean(),
    }),
  }),
  steps: z.object({
    executionOrder: z.string(),
    visibleToAllAssignees: z.boolean(),
    skipSequentialOrder: z.boolean(),
    completionMode: z.string(),
    assigneeOrder: z.string(),
  }),
  kickoff: z.object({
    defaultStartMode: z.string(),
    supportedStartModes: z.array(z.string()),
  }),
  milestones: z.object({
    defaultToSingleMilestone: z.boolean(),
    defaultMilestoneName: z.string(),
  }),
  flow: z.object({
    chatAssistanceEnabled: z.boolean(),
    autoArchiveEnabled: z.boolean(),
  }),
}).passthrough();

const StepTypeSchema = z.object({
  stepType: z.string(),
  category: z.enum(['HUMAN_ACTION', 'CONTROL', 'AUTOMATION']),
  displayName: z.string(),
  description: z.string(),
  deprecated: z.boolean().optional(),
  schema: z.object({
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
      default: z.unknown().optional(),
      constraints: z.record(z.string(), z.unknown()).optional(),
    })),
  }),
  completion: z.object({
    multipleAssignees: z.boolean().optional(),
    completionMode: z.string().optional(),
    sequentialSupported: z.boolean().optional(),
    singleAssigneeOnly: z.boolean().optional(),
    autoCompletes: z.boolean().optional(),
    noAssignee: z.boolean().optional(),
  }).passthrough().optional(),
  specialRules: z.array(z.string()).optional(),
  validationRules: z.array(z.object({
    rule: z.string(),
    message: z.string(),
  })).optional(),
  aiGuidance: z.object({
    whenToUse: z.string(),
    whenNotToUse: z.string().optional(),
    seQuestions: z.array(z.string()).optional(),
    editQuestions: z.array(z.object({
      question: z.string(),
      aspect: z.string(),
      quickSuggestions: z.boolean().optional(),
    })).optional(),
    defaults: z.array(z.string()).optional(),
    examples: z.array(z.object({
      trigger: z.string(),
      mapsTo: z.string(),
    }).passthrough()).optional(),
  }).passthrough().optional(),
  outputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
  })).optional(),
}).passthrough();

const ConsultationStageSchema = z.object({
  stage: z.string(),
  order: z.number(),
  keyQuestion: z.string(),
  explanation: z.string().optional(),
  secondaryQuestions: z.array(z.string()).optional(),
  perStepQuestions: z.array(z.string()).optional(),
  proactiveReview: z.array(z.string()).optional(),
  validation: z.array(z.string()).optional(),
  defaults: z.array(z.string()).optional(),
  permissions: z.record(z.string(), z.string()).optional(),
  experienceOptions: z.record(z.string(), z.string()).optional(),
  availableTypes: z.record(z.string(), z.string()).optional(),
}).passthrough();

const PostCreateSuggestionSchema = z.object({
  question: z.string(),
  recommendation: z.string(),
  subQuestions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    mapsTo: z.string(),
  })).optional(),
});

const ConsultationSchema = z.object({
  version: z.string(),
  personality: z.object({
    role: z.string(),
    greeting: z.string(),
    tone: z.string(),
    style: z.array(z.string()),
  }),
  stages: z.array(ConsultationStageSchema),
  inferenceRules: z.object({
    principle: z.string(),
    negative: z.array(z.string()),
    positive: z.array(z.string()),
  }),
  postCreateSuggestions: z.array(PostCreateSuggestionSchema),
});

const UXGuidelinesSchema = z.object({
  version: z.string(),
  scope: z.object({
    allowed: z.array(z.string()),
    declineMessage: z.string(),
    neverDisclose: z.array(z.string()),
  }),
  questionPolicy: z.object({
    reworkRiskTest: z.object({
      askWhen: z.array(z.string()),
      createWhen: z.array(z.string()),
    }),
    genericPromptQuestions: z.array(z.string()),
    neverAskAbout: z.array(z.string()),
    afterClarification: z.array(z.string()),
  }),
  quickSuggestions: z.object({
    rules: z.array(z.string()),
  }),
  questionTypes: z.record(z.string(), z.object({
    description: z.string(),
    roleGuidance: z.string().optional(),
  })),
  editClarification: z.object({
    when: z.string(),
    clearIntentExamples: z.array(z.string()),
    neverOfferAsEditOptions: z.array(z.string()),
  }),
  editStepReferences: z.object({
    rules: z.array(z.string()),
  }),
  messageGuidelines: z.record(z.string(), z.string()),
  proactiveSuggestions: z.object({
    enabled: z.boolean(),
    areas: z.array(z.string()),
    format: z.string(),
  }),
  assumptions: z.object({
    instruction: z.string(),
    guideline: z.string(),
  }),
  whenConstraintViolated: z.object({
    action: z.string(),
    example: z.string(),
  }),
  whenUnsupported: z.object({
    action: z.string(),
    example: z.string(),
  }),
});

const DueDateTypeSchema = z.object({
  description: z.string(),
  example: z.string(),
});

const ResponseFormatSchema = z.object({
  version: z.string(),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  respondVsClarify: z.object({
    useRespond: z.array(z.string()),
    useClarify: z.array(z.string()),
  }),
  askVsCreate: z.object({
    askExamples: z.array(z.object({
      trigger: z.string(),
      followUp: z.string(),
    })),
    createWhen: z.array(z.string()),
  }),
  clarificationRecognition: z.object({
    instruction: z.string(),
  }),
  avoidRedundantQuestions: z.array(z.string()),
  questionTypeExamples: z.object({
    text: z.string(),
    textWithFile: z.string(),
    selection: z.string(),
    availableIcons: z.array(z.string()),
  }),
  branchNesting: z.object({
    rule: z.string(),
    wrongExample: z.string(),
    correctExample: z.string(),
    singleChoiceBranch: z.object({
      pathCount: z.string(),
      conditionFields: z.string(),
      conditionTypes: z.array(z.string()),
    }),
    multiChoiceBranch: z.object({
      description: z.string(),
    }),
    decisionExample: z.string(),
  }),
  concurrentExecution: z.object({
    skipSequentialOrder: z.object({
      description: z.string(),
      example: z.string(),
      note: z.string(),
    }),
    parallelBranch: z.object({
      description: z.string(),
    }),
    decisionTree: z.array(z.string()),
  }),
  gotoRevisionLoops: z.object({
    example: z.string(),
    rules: z.array(z.string()),
  }),
  milestones: z.object({
    description: z.string(),
    example: z.string(),
    rules: z.array(z.string()),
  }),
  stepSpecificConfig: z.record(z.string(), z.string()),
  dueDates: z.object({
    types: z.record(z.string(), DueDateTypeSchema),
    flowLevel: z.string(),
    validUnits: z.array(z.string()),
  }),
});

const TemplateCatalogSchema = z.object({
  enabled: z.boolean(),
  categories: z.array(z.object({
    name: z.string(),
    templates: z.array(z.object({
      name: z.string(),
      roles: z.array(z.string()),
      pattern: z.string(),
    })),
  })),
});

const AnalysisRuleConditionSchema = z.object({
  has_step_types: z.array(z.string()).optional(),
  missing_step_types: z.array(z.string()).optional(),
  min_steps: z.number().optional(),
  missing_milestones: z.boolean().optional(),
  missing_naming_convention: z.boolean().optional(),
  always: z.boolean().optional(),
});

const AnalysisRuleSchema = z.object({
  id: z.string(),
  category: z.string(),
  priority: z.enum(['high', 'medium', 'low', 'lowest']),
  condition: AnalysisRuleConditionSchema,
  suggestion: z.object({
    prompt: z.string(),
    hint: z.string().optional(),
  }),
  surfaces: z.array(z.string()),
  enhancement_default: z.boolean().optional(),
});

const AnalysisRulesSchema = z.object({
  version: z.string(),
  rules: z.array(AnalysisRuleSchema),
});

// ============================================================================
// Exported Types (inferred from Zod schemas)
// ============================================================================

export type ConstraintsConfig = z.infer<typeof ConstraintsSchema>;
export type DefaultsConfig = z.infer<typeof DefaultsSchema>;
export type StepTypeConfig = z.infer<typeof StepTypeSchema>;
export type ConsultationStage = z.infer<typeof ConsultationStageSchema>;
export type PostCreateSuggestion = z.infer<typeof PostCreateSuggestionSchema>;
export type ConsultationConfig = z.infer<typeof ConsultationSchema>;
export type UXGuidelinesConfig = z.infer<typeof UXGuidelinesSchema>;
export type ResponseFormatConfig = z.infer<typeof ResponseFormatSchema>;
export type TemplateCatalogConfig = z.infer<typeof TemplateCatalogSchema>;
export type AnalysisRuleCondition = z.infer<typeof AnalysisRuleConditionSchema>;
export type AnalysisRule = z.infer<typeof AnalysisRuleSchema>;
export type AnalysisRulesConfig = z.infer<typeof AnalysisRulesSchema>;

// Also export sub-types needed by other modules
export type TemplateCatalogTemplate = TemplateCatalogConfig['categories'][number]['templates'][number];
export type TemplateCatalogCategory = TemplateCatalogConfig['categories'][number];

// ============================================================================
// Loader Functions
// ============================================================================

/**
 * Load a YAML file, parse, and optionally validate against a Zod schema.
 * Throws a descriptive error if validation fails.
 */
export function loadYamlFile<T = unknown>(relativePath: string, schema?: z.ZodType<T>): T {
  const fullPath = join(CONFIG_DIR, relativePath);

  if (!existsSync(fullPath)) {
    throw new Error(`Config file not found: ${fullPath}`);
  }

  const content = readFileSync(fullPath, 'utf-8');
  const parsed = parseYaml(content);

  if (schema) {
    const result = schema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues
        .map(i => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(`Config validation failed for ${relativePath}:\n${issues}`);
    }
    return result.data;
  }

  return parsed as T;
}

/**
 * Load constraints configuration (technical layer)
 */
export function loadConstraints(): ConstraintsConfig {
  return loadYamlFile('technical/constraints.yaml', ConstraintsSchema);
}

/**
 * Load defaults configuration (technical layer)
 */
export function loadDefaults(): DefaultsConfig {
  return loadYamlFile('technical/defaults.yaml', DefaultsSchema);
}

/**
 * Load consultation configuration (consultative layer)
 */
export function loadConsultation(): ConsultationConfig {
  return loadYamlFile('consultative/consultation.yaml', ConsultationSchema);
}

/**
 * Load UX guidelines configuration (UX layer)
 */
export function loadUXGuidelines(): UXGuidelinesConfig {
  return loadYamlFile('ux/ux-guidelines.yaml', UXGuidelinesSchema);
}

/**
 * Load response format configuration (UX layer)
 */
export function loadResponseFormat(): ResponseFormatConfig {
  return loadYamlFile('ux/response-format.yaml', ResponseFormatSchema);
}

/**
 * Load analysis rules configuration (consultative layer)
 */
export function loadAnalysisRules(): AnalysisRulesConfig {
  return loadYamlFile('consultative/analysis-rules.yaml', AnalysisRulesSchema);
}

/**
 * Load all step type configurations from a directory (technical layer).
 * Filters out deprecated step types.
 */
export function loadStepTypesFromDir(subDir: string): StepTypeConfig[] {
  const dirPath = join(CONFIG_DIR, 'technical/step-types', subDir);

  if (!existsSync(dirPath)) {
    return [];
  }

  const files = readdirSync(dirPath).filter(f => f.endsWith('.yaml'));
  const stepTypes: StepTypeConfig[] = [];

  for (const file of files) {
    try {
      const config = loadYamlFile<StepTypeConfig>(
        join('technical/step-types', subDir, file),
        StepTypeSchema,
      );
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
 * Load all step type configurations (technical layer)
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
let cachedConsultation: ConsultationConfig | null = null;
let cachedUXGuidelines: UXGuidelinesConfig | null = null;
let cachedResponseFormat: ResponseFormatConfig | null = null;
let cachedTemplateCatalog: TemplateCatalogConfig | null | undefined = undefined;
let cachedAnalysisRules: AnalysisRulesConfig | null = null;

export function getConstraints(): ConstraintsConfig {
  if (!cachedConstraints) {
    cachedConstraints = loadConstraints();
  }
  return cachedConstraints;
}

export function getDefaults(): DefaultsConfig {
  if (!cachedDefaults) {
    cachedDefaults = loadDefaults();
  }
  return cachedDefaults;
}

export function getStepTypes(): StepTypeConfig[] {
  if (!cachedStepTypes) {
    cachedStepTypes = loadAllStepTypes();
  }
  return cachedStepTypes;
}

export function getConsultation(): ConsultationConfig {
  if (!cachedConsultation) {
    cachedConsultation = loadConsultation();
  }
  return cachedConsultation;
}

export function getUXGuidelines(): UXGuidelinesConfig {
  if (!cachedUXGuidelines) {
    cachedUXGuidelines = loadUXGuidelines();
  }
  return cachedUXGuidelines;
}

export function getResponseFormat(): ResponseFormatConfig {
  if (!cachedResponseFormat) {
    cachedResponseFormat = loadResponseFormat();
  }
  return cachedResponseFormat;
}

export function getAnalysisRules(): AnalysisRulesConfig {
  if (!cachedAnalysisRules) {
    cachedAnalysisRules = loadAnalysisRules();
  }
  return cachedAnalysisRules;
}

/**
 * Get template catalog (cached, returns null if file missing or disabled)
 */
export function getTemplateCatalog(): TemplateCatalogConfig | null {
  if (cachedTemplateCatalog === undefined) {
    try {
      const catalog = loadYamlFile('consultative/template-catalog.yaml', TemplateCatalogSchema);
      cachedTemplateCatalog = catalog?.enabled ? catalog : null;
    } catch {
      cachedTemplateCatalog = null;
    }
  }
  return cachedTemplateCatalog;
}

/**
 * Clear all caches (useful for testing or hot-reload)
 */
export function clearConfigCache(): void {
  cachedConstraints = null;
  cachedDefaults = null;
  cachedStepTypes = null;
  cachedConsultation = null;
  cachedUXGuidelines = null;
  cachedResponseFormat = null;
  cachedTemplateCatalog = undefined;
  cachedAnalysisRules = null;
}

/**
 * Reload all configurations (validates all at once — good for startup health check)
 */
export function reloadConfig(): void {
  clearConfigCache();
  getConstraints();
  getDefaults();
  getStepTypes();
  getConsultation();
  getUXGuidelines();
  getResponseFormat();
  getAnalysisRules();
}
