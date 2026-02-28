# ServiceFlow - Product Requirements Document

## Overview

**Product**: ServiceFlow for Moxo
**Purpose**: An AI-powered virtual Solutions Engineer that helps non-technical business users create and edit workflow templates through natural conversation.

**Value Proposition**: Moxo customers often struggle with the complexity of the flow builder. This AI Copilot replaces the need for human SE consultation, enabling any business user to design sophisticated workflows by simply describing their process.

---

## 1. User Experience

### Chat Interface (Left Panel)
- Conversational AI that behaves like an expert Solutions Engineer
- Friendly, consultative tone: "Hi! I'm your AI SE, here to help you build and edit your flow."
- Asks minimal clarifying questions - applies smart defaults otherwise
- Supports natural language for both creation and editing
- File upload with accompanying text context for AI analysis
- Multi-step thinking indicator with contextual progress messages
- Suggested action buttons for quick responses (approve, edit, discard plans)

### Workflow Visualizer (Right Panel)
- Displays the current workflow as a visual step list
- Shows milestones as section headers with dashed borders matching Moxo UI
- Steps are visually grouped by their milestone in both preview cards and canvas
- Expands branch paths to show nested steps
- MVP: Display-only (not interactive), but must render branches clearly

---

## 2. Core Operations

### 2.1 Create Workflow
User describes a process → AI generates complete workflow JSON

**Output Format:**
```json
{ "mode": "create", "workflow": { "...full workflow IR..." } }
```

### 2.2 Edit Workflow
User requests changes → AI generates patch operations (not full rewrite)

**Output Format:**
```json
{ "mode": "edit", "operations": [ { "op": "ADD_STEP_AFTER", ... } ] }
```

### 2.3 Clarify
When AI needs more information to proceed

**Output Format:**
```json
{ "mode": "clarify", "questions": [ { "id": "q1", "text": "..." } ] }
```

### 2.4 Reject
When request violates platform constraints

**Output Format:**
```json
{ "mode": "reject", "reason": "...", "suggestion": "..." }
```

### 2.5 Respond
Conversational responses for informational questions that don't require workflow actions

**Output Format:**
```json
{
  "mode": "respond",
  "message": "...",
  "suggestedActions": [
    {
      "label": "Approve Plan",
      "actionType": "approve_plan"
    }
  ]
}
```

**Action Types for Suggested Actions:**
| Action Type | Description |
|-------------|-------------|
| `approve_plan` | Trigger plan approval from the response |
| `discard_plan` | Discard pending plan |
| `edit_plan` | Open edit input for the plan |
| `prompt` | Send a new message (value contains the message) |

---

## 3. Workflow Data Model

### 3.1 Flow Structure
```
Flow
├── flowId, name, workspaceNameTemplate
├── kickoff (trigger configuration)
├── permissions (execute, edit, coordinate)
├── settings (chat, archive, cover image)
├── milestones[] (UI grouping markers)
├── assigneePlaceholders[] (role definitions)
├── constraints (platform limits)
└── steps[] (main path - ordered list)
```

### 3.2 Step Types

**Human Action Steps:**
| Type | Key Characteristics |
|------|---------------------|
| FORM | Rich fields, multiple assignees, any-one-completes |
| QUESTIONNAIRE | Single question, single/multi-select, optional review |
| FILE_REQUEST | Multiple files, optional reviewer gates completion |
| TODO | Multiple assignees, completion: one/majority/all |
| APPROVAL | Like TODO, cannot be declined |
| ACKNOWLEDGEMENT | Optional require-attachment-review |
| ESIGN | Multiple signers, sequential/parallel, all required, doc immutable |
| DECISION | Single assignee, up to 3 outcomes with nested steps |
| CUSTOM_ACTION | Placeholder for custom integrations |
| WEB_APP | Embedded web application |

**Control Steps:**
| Type | Behavior |
|------|----------|
| SINGLE_CHOICE_BRANCH | If/else - exactly one path executes |
| MULTI_CHOICE_BRANCH | Any matching paths execute (max 3) |
| PARALLEL_BRANCH | All paths run concurrently (max 3) |
| GOTO | Jump to destination (inside Decision/Single Choice only) |
| GOTO_DESTINATION | Target marker (main path only) |
| TERMINATE | End flow as COMPLETED or CANCELLED |
| WAIT | Pause for external event |

**Automation Steps:**
| Type | Behavior |
|------|----------|
| AI_AUTOMATION | Auto-completes, coordinator-only, has inputs/prompt/outputs |
| SYSTEM_WEBHOOK | POST to external URL |
| SYSTEM_EMAIL | Send email |
| SYSTEM_CHAT_MESSAGE | Send chat message |
| SYSTEM_UPDATE_WORKSPACE | Update workspace metadata |
| BUSINESS_RULE | Rule table mapping inputs → outputs |

### 3.3 Assignees (Placeholders)
Assignees are role placeholders resolved at runtime to an email.

**Resolution Types:**
- `CONTACT_TBD` (default) - determined later
- `FIXED_CONTACT` - always same person
- `WORKSPACE_INITIALIZER` - person who starts the run
- `KICKOFF_FORM_FIELD` - from kickoff form input
- `FLOW_VARIABLE` - from variable passed at kickoff
- `RULES_BASED` - conditional routing (first match wins)
- `ROUND_ROBIN` - rotates among a list

**Role Options:**
- `allowViewAllActions`: boolean
- `coordinatorToggle`: boolean

### 3.4 Kickoff / Trigger
**Start Modes:**
- MANUAL_EXECUTE (default)
- KICKOFF_FORM
- START_LINK
- WEBHOOK
- SCHEDULE
- INTEGRATION

**Flow Variables:**
- Types: TEXT, FILE only
- Set at initiation, immutable
- Globally referenceable

---

## 4. Platform Constraints (Hard Rules)

| Constraint | Limit |
|------------|-------|
| Max parallel branches | 3 |
| Max decision outcomes | 3 |
| Max branch nesting depth | 2 |
| Milestones inside branches | NOT ALLOWED |
| Branch span milestones | NOT ALLOWED (must fit in one) |
| GOTO targets | Main path only |
| GOTO placement | Decision/Single Choice paths only |
| TERMINATE placement | Decision/Single Choice paths only |
| Subflows | NOT SUPPORTED (v1) |
| Variable types | TEXT, FILE only |
| Variables mutability | Immutable after kickoff |

---

## 5. Patch Operations

### Main Path Operations
- `ADD_STEP_AFTER` / `ADD_STEP_BEFORE`
- `REMOVE_STEP`
- `UPDATE_STEP`
- `MOVE_STEP`

### Branch Path Operations
- `ADD_PATH_STEP_AFTER` / `ADD_PATH_STEP_BEFORE`
- `REMOVE_PATH_STEP`
- `UPDATE_PATH_STEP`
- `MOVE_PATH_STEP`

### Branch Structure Operations
- `ADD_BRANCH_PATH` / `REMOVE_BRANCH_PATH`
- `UPDATE_BRANCH_PATH_CONDITION`

### Decision Operations
- `ADD_DECISION_OUTCOME` / `REMOVE_DECISION_OUTCOME`
- `UPDATE_DECISION_OUTCOME_LABEL`

### Milestone Operations
- `ADD_MILESTONE` - Add a new milestone to the workflow
- `REMOVE_MILESTONE` - Remove a milestone (fails if steps assigned to it)
- `UPDATE_MILESTONE` - Update milestone name or sequence

### Flow Metadata Operations
- `UPDATE_FLOW_NAME` - Update the workflow name

### Special Operations
- `UPDATE_TERMINATE_STATUS`
- `UPDATE_GOTO_TARGET`

---

## 6. AI SE Consultation Flow

The AI should follow this consultative process (from SE Flow Consultation doc):

### Stage 1: Goal
- "What process do you want to run?"
- Validate it's a good fit for Moxo

### Stage 2: Assignees
- "Who is involved in this process?"
- Identify roles, coordinators, visibility needs

### Stage 3: Kickoff / Trigger
- "How does this process get started?"
- Determine start mode and initial data

### Stage 4: Steps
- "What happens step by step?"
- Map each action to appropriate step type
- Discover branching/decision points naturally

### Stage 5: AI Automations
- "Are there tasks AI could automate?"
- Proactively suggest AI opportunities

### Stage 6: System Integrations
- "Any other systems to connect?"
- Identify webhook/integration needs

### Stage 7: Governance
- Naming, permissions, due dates, chat settings

### Default Assumptions (Apply Unless Overridden)
- All assignees: Contact TBD
- Sequential execution order
- No milestones, no subflows
- Single assignee/reviewer
- No advanced visibility settings
- Chat assistance enabled
- Auto-archive enabled

---

## 7. Technical Architecture

### Backend Components
1. **Workflow Data Model** - TypeScript interfaces for IR schema
2. **Validator** - `validateWorkflow(workflow)` enforcing all constraints
3. **Patch Engine** - `applyOperations(workflow, operations)` for deterministic updates
4. **LLM Integration** - Send user message + current workflow + constraints → receive structured output
5. **Workflow Storage** - Persist current workflow state

### Frontend Components
1. **Chat Interface** - Message history + input
2. **Workflow Visualizer** - Render workflow IR as visual steps
3. **State Management** - Sync chat and workflow state

---

## 8. Implementation Phases

### Phase 1: Backend Core ✅
- [x] Workflow data model (TypeScript types/interfaces)
- [x] `validateWorkflow()` with all constraint checks
- [x] Patch operation format definition
- [x] `applyOperations()` implementation
- [x] Unit tests with sample workflows

### Phase 2: LLM Integration ✅
- [x] System prompt engineering
- [x] Structured output parsing
- [x] Create/Edit/Clarify/Reject handling
- [x] Conversation context management

### Phase 3: API Layer ✅
- [x] REST endpoints for chat with SSE streaming
- [x] Plan/preview mode (workflows shown as preview first)
- [x] Workflow CRUD operations
- [x] Session management

### Phase 4: Frontend
- [x] Chat UI component
- [x] Workflow visualizer with milestone grouping
- [x] Real-time SSE handling
- [x] Plan preview/publish flow

### Phase 5: Conversational AI SE Experience
- [x] Friendly conversational responses (explain first, JSON in code block)
- [x] Welcome screen with industry workflow templates
- [x] Resizable chat/workflow panels
- [x] Post-action guidance after workflow approval
- [x] Enhanced SE consultation with per-step-type questions

### Phase 6: Enhanced UX Features
- [x] Respond mode for conversational questions
- [x] Suggested action buttons with action types
- [x] File upload with message context
- [x] Multi-step thinking indicator with contextual progress
- [x] Edit operations summarization
- [x] Milestone visualization with dashed borders
- [x] Pending plan context for smart action suggestions

### Phase 7: Polish & Testing
- [ ] End-to-end testing
- [ ] Error handling improvements
- [ ] Edge case coverage

### Future Enhancements
- [ ] Voice input for workflow description
- [ ] Workflow templates library expansion
- [ ] Advanced document analysis (diagrams, flowcharts)

---

## 9. Sample IR Reference

See: `Content/Documents for Reference/Sample IR JSON` for a complete example workflow demonstrating:
- Milestones
- Forms, Questionnaires, File Requests
- AI Automation and Business Rules
- Parallel Branch
- Decision with GOTO loop
- Single Choice Branch with TERMINATE
- E-Sign and Approval

---

## 10. Evolvability & Configuration Architecture

### Design Philosophy
The flow builder will continuously evolve - new step types, changed constraints, improved SE guidance. The system must be **configuration-driven** so changes require updating config files, not rewriting code.

### 10.1 Configuration Layers

```
config/
├── step-types/           # Step type definitions
│   ├── human-actions/
│   │   ├── form.yaml
│   │   ├── approval.yaml
│   │   └── ...
│   ├── controls/
│   │   ├── decision.yaml
│   │   ├── parallel-branch.yaml
│   │   └── ...
│   └── automations/
│       ├── ai-automation.yaml
│       └── ...
├── constraints.yaml      # Platform limits (configurable)
├── defaults.yaml         # Default values for steps/assignees
├── se-playbook.yaml      # Consultation guidance for AI
└── prompts/              # AI prompt templates
    ├── system.md
    ├── step-guidance/    # Per-step-type guidance
    └── consultation/     # Consultation flow prompts
```

### 10.2 Step Type Registry

Each step type is defined in a YAML file with:

```yaml
# config/step-types/human-actions/form.yaml
stepType: FORM
category: HUMAN_ACTION
displayName: "Form"

schema:
  fields:
    - name: title
      type: string
      required: true
    - name: description
      type: string
      required: false
    - name: assignees
      type: assignee[]
      required: true
      constraints:
        min: 1
    - name: form.fields
      type: formField[]
      required: true

completion:
  multipleAssignees: true
  completionMode: ANY_ONE  # ANY_ONE | MAJORITY | ALL
  sequentialSupported: false

outputs:
  - name: "form.*"
    type: "dynamic"
    description: "Form field values keyed by field name"

validationRules:
  - rule: "assignees.length >= 1"
    message: "Form requires at least one assignee"

aiGuidance:
  whenToUse: "Collecting structured data with multiple fields"
  seQuestions:
    - "Do you have an existing form or should we build one?"
    - "Does anyone need to review submissions before proceeding?"
  defaults:
    - "Use placeholder fields unless user specifies"
    - "No review gate unless explicitly requested"
```

### 10.3 Constraint Configuration

```yaml
# config/constraints.yaml
version: "1.0"
lastUpdated: "2025-01-23"

branching:
  maxParallelPaths: 3
  maxDecisionOutcomes: 3
  maxNestingDepth: 2
  milestonesInsideBranches: false
  branchMustFitSingleMilestone: true

goto:
  allowedInside: [DECISION, SINGLE_CHOICE_BRANCH]
  targetMustBeOnMainPath: true

terminate:
  allowedInside: [DECISION, SINGLE_CHOICE_BRANCH]
  validStatuses: [COMPLETED, CANCELLED]

variables:
  allowedTypes: [TEXT, FILE]
  setOnlyAtInitiation: true
  immutable: true

features:
  subflowSupported: false
```

**When constraints change** (e.g., maxParallelPaths: 3 → 10):
1. Update `constraints.yaml`
2. Validator automatically picks up new limits
3. AI prompt auto-regenerates from config
4. No code changes needed

### 10.4 SE Playbook Configuration

```yaml
# config/se-playbook.yaml
version: "1.0"

consultationStages:
  - stage: goal
    order: 1
    keyQuestion: "What process do you want to run?"
    validationChecks:
      - "Is this a good business process for Moxo?"
    defaults:
      - "Not a recurring process unless stated"

  - stage: assignees
    order: 2
    keyQuestion: "Who is involved in this process?"
    secondaryQuestions:
      - "Are any roles always the same person?"
      - "How is the right person determined?"
      - "Does any role need to see all actions?"
      - "Who needs coordinator controls?"
    defaults:
      - "All assignees default to Contact TBD"

  - stage: steps
    order: 4
    keyQuestion: "What happens in this process, step by step?"
    perStepQuestions:
      - "What type of action is this?"
      - "Who should it be assigned to?"
      - "Should it run in parallel with previous step?"
    defaults:
      - "Sequential execution unless stated"
      - "Visible only to assignee unless stated"

defaultAssumptions:
  foundational:
    - key: assigneeResolution
      value: CONTACT_TBD
    - key: executionOrder
      value: SEQUENTIAL
    - key: visibility
      value: ASSIGNEE_ONLY
    - key: milestones
      value: SINGLE_DEFAULT
    - key: chatAssistance
      value: ENABLED
```

### 10.5 AI Prompt Generation

The system prompt is **assembled from config files**, not hardcoded:

```typescript
// Prompt generator reads configs and builds system prompt
function generateSystemPrompt(): string {
  const constraints = loadYaml('config/constraints.yaml');
  const stepTypes = loadStepTypeRegistry('config/step-types/');
  const playbook = loadYaml('config/se-playbook.yaml');

  return `
## Platform Constraints
${generateConstraintDocs(constraints)}

## Supported Step Types
${generateStepTypeDocs(stepTypes)}

## Consultation Approach
${generatePlaybookDocs(playbook)}

## Default Assumptions
${generateDefaultsDocs(playbook.defaultAssumptions)}
  `;
}
```

### 10.6 Adding a New Feature (Example)

**Scenario:** Adding a new step type `VIDEO_MEETING`

1. Create `config/step-types/human-actions/video-meeting.yaml`
2. Define schema, completion rules, AI guidance
3. Restart server → automatically registered
4. AI immediately knows about it (prompt regenerated)
5. Validator automatically validates it
6. No core code changes

**Scenario:** Increasing branch limit from 3 to 10

1. Edit `config/constraints.yaml`: `maxParallelPaths: 10`
2. Restart server
3. Validator now allows 10 paths
4. AI prompt updated automatically
5. Done

### 10.7 Versioning & Changelog

```yaml
# config/changelog.yaml
versions:
  - version: "1.1.0"
    date: "2025-02-15"
    changes:
      - type: CONSTRAINT_CHANGE
        description: "Increased maxParallelPaths from 3 to 10"
        file: constraints.yaml

      - type: NEW_STEP_TYPE
        description: "Added VIDEO_MEETING step type"
        file: step-types/human-actions/video-meeting.yaml

      - type: PLAYBOOK_UPDATE
        description: "Added guidance for AI automation opportunities"
        file: se-playbook.yaml
```

### 10.8 Benefits of This Architecture

| Concern | How It's Handled |
|---------|------------------|
| New step types | Add YAML file → auto-registered |
| Constraint changes | Edit constraints.yaml → immediate effect |
| SE guidance improvements | Edit se-playbook.yaml |
| AI prompt tuning | Edit prompts/ templates |
| Audit trail | Git history of config files |
| Documentation | Configs ARE the documentation |
| Testing | Test against config, not hardcoded values |

### 10.9 Example: Adding a New Step Type (VIDEO_MEETING)

**Step 1:** Create config file `config/step-types/human-actions/video-meeting.yaml`

```yaml
stepType: VIDEO_MEETING
category: HUMAN_ACTION
displayName: "Video Meeting"
description: "Schedule and conduct a video meeting with participants"

schema:
  fields:
    - name: title
      type: string
      required: true
    - name: description
      type: string
      required: false
    - name: assignees
      type: assignee[]
      required: true
      constraints:
        min: 1
        max: 10
    - name: duration
      type: number
      required: true
      default: 30
      unit: minutes
    - name: recordingEnabled
      type: boolean
      required: false
      default: false

completion:
  multipleAssignees: true
  completionMode: ALL  # Meeting ends when all join or host ends
  sequentialSupported: false

outputs:
  - name: "meeting.recording_url"
    type: "string"
    description: "URL to meeting recording (if enabled)"
  - name: "meeting.transcript"
    type: "string"
    description: "Meeting transcript (if available)"

validationRules:
  - rule: "assignees.length >= 1"
    message: "Video meeting requires at least one participant"
  - rule: "duration >= 5 && duration <= 480"
    message: "Meeting duration must be between 5 and 480 minutes"

aiGuidance:
  whenToUse: "When face-to-face video communication is needed"
  seQuestions:
    - "How long should the meeting be?"
    - "Should we record the meeting?"
    - "Who needs to attend?"
  defaults:
    - "30 minute duration unless specified"
    - "Recording disabled unless requested"
  examples:
    - trigger: "schedule a call with the client"
      maps_to: VIDEO_MEETING
    - trigger: "video consultation"
      maps_to: VIDEO_MEETING
```

**Step 2:** Restart server - type is auto-registered

**Step 3:** Test
- AI now knows about VIDEO_MEETING
- Validator accepts VIDEO_MEETING steps
- Operations engine can add/edit VIDEO_MEETING steps

**No code changes required.**

---

## 11. Backwards Compatibility & Graceful Degradation

### The Problem
Moxo's flow builder will release new features before the AI Copilot is updated. The Copilot must NOT break - it should simply not leverage features it doesn't know about.

### Design Principles

**1. Unknown Features Are Ignored, Not Errors**
```typescript
// When parsing a workflow from Moxo:
// - Unknown step types → preserve but don't modify
// - Unknown fields → preserve (pass-through)
// - Unknown constraints → ignore (use our known limits)

interface ParseResult {
  workflow: Workflow;
  unknownStepTypes: string[];  // e.g., ["VIDEO_MEETING"]
  unknownFields: string[];     // e.g., ["steps[3].newField"]
  warnings: string[];          // Log but don't fail
}
```

**2. Generate Only What We Know**
- AI only suggests step types defined in our config
- If user asks for unknown feature: politely explain it's not yet supported
- Never generate invalid JSON for the Moxo backend

**3. Preserve Unknown Data (Pass-Through)**
```typescript
// When editing a workflow with unknown step types:
// 1. Parse known steps normally
// 2. Keep unknown steps as opaque JSON blobs
// 3. Don't delete or corrupt unknown data
// 4. Only modify steps we understand

function applyOperations(workflow, operations): Workflow {
  // Operations only target known step types
  // Unknown steps are preserved untouched
}
```

**4. Version Awareness**
```yaml
# config/schema-version.yaml
supportedSchemaVersion: "2.3"
minCompatibleVersion: "2.0"

knownStepTypes:
  - FORM
  - APPROVAL
  - DECISION
  # ... all types we support

# When we encounter version > supportedSchemaVersion:
# - Parse what we can
# - Warn about potential unknown features
# - Never fail
```

**5. Validation Modes**
```typescript
enum ValidationMode {
  STRICT,  // Fail on unknown (for our generated output)
  LENIENT  // Warn on unknown (for incoming Moxo data)
}

validateWorkflow(workflow, { mode: ValidationMode.LENIENT });
```

### Example Scenarios

**Scenario 1: Moxo adds VIDEO_MEETING, Copilot not updated**
- User opens existing workflow containing VIDEO_MEETING step
- Copilot loads it successfully, marks VIDEO_MEETING as "unknown"
- User can edit other steps normally
- VIDEO_MEETING step preserved unchanged
- If user asks to add VIDEO_MEETING: "This step type isn't available in the AI Copilot yet"

**Scenario 2: Moxo increases branch limit from 3 to 10**
- Copilot still enforces limit of 3 (our config)
- Existing workflows with 5 branches load fine (lenient mode)
- Copilot won't add more than 3 branches until config updated
- No breaking changes

**Scenario 3: Moxo adds new field to FORM step**
- Existing FORM steps with new field load fine
- Unknown field preserved in JSON
- Copilot edits other FORM fields normally
- New field passed through unchanged

### Implementation Notes

```typescript
// Step type registry tracks what we know
const stepRegistry = loadStepTypes('config/step-types/');

function isKnownStepType(type: string): boolean {
  return stepRegistry.has(type);
}

// When parsing workflow
function parseWorkflow(json: any): ParseResult {
  const warnings: string[] = [];

  const steps = json.steps.map(step => {
    if (!isKnownStepType(step.type)) {
      warnings.push(`Unknown step type: ${step.type}`);
      return { ...step, _unknown: true }; // Preserve as-is
    }
    return parseKnownStep(step);
  });

  return { workflow: { ...json, steps }, warnings };
}
```

---

## 12. Open Decisions (Resolved)

| Decision | Resolution |
|----------|------------|
| Backend language | Node.js + TypeScript (matches spec) |
| Configuration format | YAML for readability |
| Evolvability | Config-driven architecture |
| Backwards compatibility | Graceful degradation - preserve unknown, don't break |

---

## 13. File Editing Guide

When making changes to the flow builder logic, here are the files that should potentially be edited:

### Configuration Changes (No Code Changes Needed)

| Change Type | Files to Edit |
|-------------|---------------|
| Add new step type | `backend/config/step-types/<category>/<step-name>.yaml` |
| Change platform constraint | `backend/config/constraints.yaml` |
| Update SE consultation flow | `backend/config/se-playbook.yaml` |
| Change default values | `backend/config/defaults.yaml` |

### Code Changes Required

| Change Type | Files to Edit |
|-------------|---------------|
| Add new operation type | `backend/src/models/operations.ts`, `backend/src/engine/operations.ts`, `backend/src/llm/parser.ts` |
| Modify workflow structure | `backend/src/models/workflow.ts`, `backend/src/llm/handlers.ts` |
| Add new step interface | `backend/src/models/steps.ts` |
| Change assignee behavior | `backend/src/models/assignees.ts` |
| Add validation rule | `backend/src/validator/index.ts` |
| Modify AI prompts | `backend/src/llm/prompt-generator.ts` |
| Change AI response handling | `backend/src/llm/parser.ts`, `backend/src/llm/handlers.ts` |
| Add session/context features | `backend/src/llm/context.ts` |

### Backend Source Code Structure

```
backend/src/
├── config/                    # Configuration loading
│   ├── loader.ts              # YAML config file loader
│   ├── constraints.ts         # Constraint constants and types
│   ├── step-registry.ts       # Step type registry
│   └── index.ts               # Config exports
├── models/                    # Data model types
│   ├── workflow.ts            # Flow, Milestone, Permissions
│   ├── steps.ts               # Step types and interfaces
│   ├── assignees.ts           # Assignee placeholders
│   ├── operations.ts          # Patch operation types
│   └── index.ts               # Model exports
├── validator/                 # Workflow validation
│   └── index.ts               # validateWorkflow() function
├── engine/                    # Patch operations engine
│   ├── operations.ts          # applyOperations() implementation
│   ├── utils.ts               # Helper functions for operations
│   └── index.ts               # Engine exports
├── llm/                       # LLM integration (Phase 2)
│   ├── prompt-generator.ts    # System prompt from configs
│   ├── service.ts             # Anthropic API integration
│   ├── parser.ts              # AI response parsing
│   ├── handlers.ts            # Response handlers
│   ├── context.ts             # Conversation/session management
│   ├── types.ts               # LLM-specific types
│   └── index.ts               # LLM exports
├── routes/                    # API routes (Phase 3)
│   ├── chat.ts                # POST /api/chat with SSE streaming
│   ├── sessions.ts            # Session CRUD + publish/discard
│   ├── types.ts               # Request/response type definitions
│   └── index.ts               # Route aggregator
├── middleware/                # Express middleware
│   ├── error-handler.ts       # Global error handling
│   ├── async-handler.ts       # Async route wrapper
│   ├── validate-request.ts    # Request validation
│   └── index.ts               # Middleware exports
└── index.ts                   # Express server entry point
```

### Test Files

When modifying any code, update corresponding tests:

| Source File | Test File |
|-------------|-----------|
| `src/validator/index.ts` | `tests/validator.test.ts` |
| `src/engine/operations.ts` | `tests/operations.test.ts` |
| `src/llm/parser.ts` | `tests/llm-parser.test.ts` |
| `src/llm/context.ts` | `tests/llm-context.test.ts` |
| `src/routes/chat.ts` | `tests/routes-chat.test.ts` |
| `src/routes/sessions.ts` | `tests/routes-sessions.test.ts` |

---

## 14. API Layer (Phase 3)

### 14.1 Chat Endpoint

**POST /api/chat**

Main chat endpoint supporting real-time streaming.

**Request:**
```typescript
{
  message: string;        // User's message
  sessionId?: string;     // Optional - creates new session if not provided
  stream?: boolean;       // Enable SSE streaming (default: true)
  preview?: boolean;      // Show workflow as preview first (default: true)
}
```

**Request (with file upload):**
```typescript
{
  message: string;        // User's message
  sessionId?: string;     // Optional - creates new session if not provided
  stream?: boolean;       // Enable SSE streaming (default: true)
  preview?: boolean;      // Show workflow as preview first (default: true)
  file?: {                // Optional file upload
    name: string;
    content: string;      // Base64 encoded or text content
    mimeType: string;
  };
}
```

**Response (stream=false):**
```typescript
{
  success: boolean;
  sessionId: string;
  response: {
    mode: 'create' | 'edit' | 'clarify' | 'reject' | 'respond';
    message: string;
    workflow?: Flow;
    isPreview?: boolean;
    planId?: string;        // ID to use when publishing
    clarifications?: Array<{ id: string; text: string }>;
    suggestedActions?: Array<{  // For respond mode
      label: string;
      actionType: 'approve_plan' | 'discard_plan' | 'edit_plan' | 'prompt';
      value?: string;       // For prompt action type
    }>;
    errors?: string[];
  };
  usage?: { inputTokens: number; outputTokens: number };
}
```

**SSE Events (stream=true):**
| Event | Description |
|-------|-------------|
| `session` | Session info: `{ sessionId, isNew }` |
| `thinking` | AI processing status with contextual steps: `{ status, step, totalSteps }` |
| `content` | Streaming content chunk: `{ chunk }` |
| `mode` | Response mode determined: `{ mode }` |
| `workflow` | Workflow data: `{ workflow, message, isPreview, planId, operationsSummary }` |
| `clarify` | Questions: `{ questions, context }` |
| `reject` | Rejection: `{ reason, suggestion }` |
| `respond` | Conversational response: `{ message, suggestedActions }` |
| `done` | Stream complete: `{ success, usage, errors }` |
| `error` | Error occurred: `{ code, message }` |

**Multi-step Thinking Indicator:**
The `thinking` event progresses through contextual steps based on operation type:
- **Creating**: "Understanding your request" → "Designing workflow structure" → "Generating steps" → "Finalizing workflow"
- **Editing**: "Analyzing changes" → "Planning modifications" → "Applying updates" → "Validating workflow"
- **Analyzing**: "Reading your input" → "Analyzing content" → "Formulating response"

**Edit Operations Summary:**
Instead of showing individual "Update step_X" operations, the `operationsSummary` field provides intelligent summarization:
- "Added milestones: Onboarding, Review, Completion"
- "Added 3 new steps after step_2"
- "Updated step titles and descriptions"

### 14.2 Plan/Preview Flow

By default (`preview=true`), workflows are shown as previews before being published:

1. User sends message
2. AI generates workflow
3. Workflow returned with `isPreview: true` and `planId`
4. Frontend displays preview in chat
5. User can:
   - **Approve**: Call `POST /api/sessions/:id/publish` with `planId`
   - **Discard**: Call `DELETE /api/sessions/:id/plan`
   - **Request changes**: Send another chat message

**Pending Plan Context:**
When a plan is pending approval, the AI receives context about it in subsequent requests. This allows the AI to:
- Include "Approve Plan" buttons in conversational responses
- Provide "Edit Plan" buttons to open the edit input
- Offer "Discard Plan" buttons when appropriate
- Answer questions about the pending plan with relevant action buttons

**Publish Endpoint:**
```
POST /api/sessions/:id/publish
Body: { planId: string }
Response: { success, message, workflow, sessionId }
```

**Discard Endpoint:**
```
DELETE /api/sessions/:id/plan
Response: { success, message }
```

### 14.3 Session Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/sessions` | List all sessions |
| `POST /api/sessions` | Create new session |
| `GET /api/sessions/:id` | Get session details |
| `DELETE /api/sessions/:id` | Delete session |
| `GET /api/sessions/:id/workflow` | Export workflow JSON |
| `POST /api/sessions/:id/workflow` | Import workflow |

### 14.4 Error Responses

All errors follow consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `SESSION_NOT_FOUND` | 404 | Session doesn't exist |
| `LLM_ERROR` | 500 | AI processing failed |
| `SERVER_ERROR` | 500 | Internal error |

---

### Common Change Scenarios

**Adding a New Step Type (e.g., VIDEO_MEETING):**
1. Create `backend/config/step-types/human-actions/video-meeting.yaml`
2. (Optional) Add TypeScript interface in `backend/src/models/steps.ts`
3. Restart server - automatically registered

**Changing a Constraint (e.g., max branches from 3 to 10):**
1. Edit `backend/config/constraints.yaml`: `maxParallelPaths: 10`
2. Restart server - validator and AI prompt updated automatically

**Adding a New Patch Operation:**
1. Add operation interface in `backend/src/models/operations.ts`
2. Add to Operation union type
3. Implement in `backend/src/engine/operations.ts`
4. Add validation in `backend/src/llm/parser.ts`
5. Add tests in `tests/operations.test.ts`

**Modifying AI Behavior:**
1. For consultation style: Edit `backend/config/se-playbook.yaml`
2. For prompt structure: Edit `backend/src/llm/prompt-generator.ts`
3. For response handling: Edit `backend/src/llm/handlers.ts`

---

## Appendix: Key Reference Documents

| Document | Purpose |
|----------|---------|
| ServiceFlow Instructions.pdf | High-level requirements and step 1 task |
| SE Flow Consultation.pdf | How human SEs consult - AI should mimic this |
| flow_copilot_master_docs.md | Product constraints and action specs |
| flow_copilot_canonical_master_docs.md | Canonical constraint reference |
| flow_copilot_ir_steps_paths_specification.md | IR schema and patch contract |
| Sample IR JSON | Complete example workflow |
