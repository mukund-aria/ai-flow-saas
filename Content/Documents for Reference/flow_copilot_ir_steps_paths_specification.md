# Flow Copilot – IR & Patch Specification (v1, Step-List)

This document defines the **Copilot-facing IR** and **Patch contract** using terminology and structure that match the product UI.

Key design choice:
- The IR is an **ordered list of Steps** (main path), plus **Branch blocks** that contain **ordered Steps per path**.
- We do **not** use “nodes/edges” language.
- We do **not** require an `edges[]` graph in the Copilot IR.

---

## 1) IR Goals

The IR must be:
- **Human-readable** (PM/SE friendly)
- **Deterministic** (same intent → same structure)
- **Patchable** (edits produce minimal diffs)
- **Validatable** against platform constraints

The IR is:
- **Not** the backend storage JSON
- A stable contract between Copilot ↔ mapping/validation layer

---

## 2) High-Level Shape

```json
{
  "flow": {
    "flowId": "...",
    "name": "...",
    "kickoff": { ... },
    "permissions": { ... },
    "settings": { ... },
    "milestones": [ ... ],
    "steps": [ ... ],
    "constraints": { ... }
  }
}
```

### Main-path rule
- `flow.steps[]` is the **main path**, in order.

### Branch rule
- Branching is represented as a **Branch Step** placed in the main path.
- Each Branch Step contains one or more **paths**, each of which contains ordered `steps[]`.

This mirrors the builder: you *drag a branch block*, then populate its paths with steps.

---

## 3) Core Objects

## 3.1 Milestone
Milestones are UI grouping markers.

```json
{ "milestoneId": "ms1", "name": "Intake", "sequence": 1 }
```

Milestone assignment:
- Every main-path step must have a `milestoneId`.
- Steps inside a branch path also have `milestoneId`, but **must match the branch’s milestone** (see constraints).

---

## 3.2 Step (Base)

```json
{
  "stepId": "s_123",
  "type": "FORM",
  "milestoneId": "ms1",
  "title": "...",
  "description": "...",
  "assignees": { ... },
  "due": { ... },
  "options": { ... },
  "outputs": [ ... ]
}
```

Common fields (where applicable):
- `title` (required)
- `description` (optional)
- `assignees` (varies; Decision = single assignee)
- `due` (optional, relative)
- `options.visibleToAllAssignees` (optional)
- `options.skipSequentialOrder` (optional; default false)

---

## 3.3 Assignees (Reference)

```json
{
  "mode": "PLACEHOLDER",
  "placeholderId": "role_client",
  "resolution": {
    "type": "CONTACT_TBD" | "FIXED_CONTACT" | "WORKSPACE_INITIALIZER" | "KICKOFF_FORM_FIELD" | "FLOW_VARIABLE" | "RULES" | "ROUND_ROBIN",
    "config": { }
  },
  "roleOptions": {
    "allowViewAllActions": false,
    "coordinatorToggle": false
  }
}
```

Note: the above is a template; map to your internal representation as needed.

---

## 4) Step Types

### 4.1 Human Action Steps
- `FORM`
- `QUESTIONNAIRE`
- `FILE_REQUEST`
- `TO_DO`
- `APPROVAL`
- `ACKNOWLEDGEMENT`
- `E_SIGN`
- `CUSTOM_ACTION`

Each action uses the fields you’ve specified in the Canonical Master Docs.

### 4.2 Automation Steps
- `AI_AUTOMATION` (standalone; coordinator-only; auto-complete)
- `SYSTEM_WEBHOOK`
- `SYSTEM_EMAIL`
- `SYSTEM_CHAT_MESSAGE`
- `SYSTEM_UPDATE_WORKSPACE`
- `BUSINESS_RULE`

### 4.3 Control Steps
- `DECISION` (up to 3 outcomes)
- `WAIT` (external event)
- `GOTO_DESTINATION` (main path only)

### 4.4 Branch Step (Control Block)
Branching controls are represented by a Branch Step on the main path.

#### Single Choice Branch
```json
{
  "stepId": "b_1",
  "type": "SINGLE_CHOICE_BRANCH",
  "milestoneId": "ms2",
  "paths": [
    { "pathId": "p_if", "label": "If", "condition": { ... }, "steps": [ ... ] },
    { "pathId": "p_else", "label": "Else", "condition": { "type": "ELSE" }, "steps": [ ... ] }
  ]
}
```

#### Multi Choice Branch
```json
{
  "stepId": "b_2",
  "type": "MULTI_CHOICE_BRANCH",
  "milestoneId": "ms2",
  "paths": [
    { "pathId": "p_a", "label": "Condition A", "condition": { ... }, "steps": [ ... ] },
    { "pathId": "p_b", "label": "Condition B", "condition": { ... }, "steps": [ ... ] }
  ]
}
```

#### Parallel Branch
```json
{
  "stepId": "b_3",
  "type": "PARALLEL_BRANCH",
  "milestoneId": "ms2",
  "paths": [
    { "pathId": "p1", "label": "Branch 1", "steps": [ ... ] },
    { "pathId": "p2", "label": "Branch 2", "steps": [ ... ] }
  ]
}
```

Steps allowed inside branch paths:
- Any step type **except milestones** (milestones are not steps in IR)
- `GOTO` and `TERMINATE` are allowed inside paths (with restrictions)

---

## 5) Decision, Goto, Terminate

### 5.1 Decision
Decision is a Step with up to 3 outcomes.

```json
{
  "stepId": "d_1",
  "type": "DECISION",
  "milestoneId": "ms2",
  "title": "Approve?",
  "assignee": { ... },
  "outcomes": [
    { "outcomeId": "o_yes", "label": "Yes", "steps": [ ... ] },
    { "outcomeId": "o_no", "label": "No", "steps": [ ... ] }
  ]
}
```

### 5.2 Goto Destination (main path)
```json
{ "stepId": "gd_1", "type": "GOTO_DESTINATION", "milestoneId": "ms2", "label": "Back to upload" }
```

### 5.3 Goto (inside Decision branch path or Single Choice branch path)
```json
{ "stepId": "g_1", "type": "GOTO", "targetGotoDestinationId": "gd_1" }
```

Rules:
- Goto can only appear inside:
  - Decision outcomes’ `steps[]`
  - Single Choice Branch path `steps[]`
- Goto target must be a `GOTO_DESTINATION` on the **main path**.

### 5.4 Terminate (inside Decision branch path or Single Choice branch path)
```json
{ "stepId": "t_1", "type": "TERMINATE", "status": "CANCELLED" | "COMPLETED" }
```

---

## 6) Kickoff, Variables, References

### 6.1 Kickoff
```json
"kickoff": {
  "defaultStartMode": "EXECUTE",
  "supports": ["EXECUTE", "KICKOFF_FORM", "START_LINK", "WEBHOOK", "SCHEDULE", "INTEGRATION"],
  "flowVariables": [
    { "key": "case_id", "type": "TEXT", "required": true },
    { "key": "intake_pdf", "type": "FILE", "required": false }
  ]
}
```

Variable rules:
- Only `TEXT` and `FILE`
- Set only at initiation
- Immutable
- Referenceable anywhere

References:
- Kickoff form outputs are globally referenceable
- Step outputs + automation outputs are referenceable anywhere

---

## 7) Constraints (Authoritative)

These must be checked by the validator and obeyed by Copilot.

```json
"constraints": {
  "maxParallelBranches": 3,
  "maxDecisionOutcomes": 3,
  "maxBranchNestingDepth": 2,
  "milestonesInsideBranchesAllowed": false,
  "branchMustFitSingleMilestone": true,
  "gotoTargetsMainPathOnly": true,
  "subflowSupported": false
}
```

Milestone-related restrictions:
- No milestone markers inside branch paths
- A branch step and **all steps in its paths** must share the same `milestoneId`

---

## 8) Patch Contract

Patch operations are expressed against the Step-list IR.

### 8.1 Identifiers
- Steps are addressed by `stepId`.
- Branch paths addressed by `branchStepId` + `pathId`.
- Decision outcomes addressed by `decisionStepId` + `outcomeId`.

### 8.2 Core Patch Ops

#### Main path operations
- `ADD_STEP_AFTER`
- `ADD_STEP_BEFORE`
- `REMOVE_STEP`
- `UPDATE_STEP`
- `MOVE_STEP` (reorder within main path)

#### Branch path operations
- `ADD_PATH_STEP_AFTER`
- `ADD_PATH_STEP_BEFORE`
- `REMOVE_PATH_STEP`
- `UPDATE_PATH_STEP`
- `MOVE_PATH_STEP`

#### Branch structure operations
- `ADD_BRANCH_PATH` (Multi Choice / Parallel)
- `REMOVE_BRANCH_PATH`
- `UPDATE_BRANCH_PATH_CONDITION`

#### Decision operations
- `ADD_DECISION_OUTCOME` (up to 3)
- `REMOVE_DECISION_OUTCOME`
- `UPDATE_DECISION_OUTCOME_LABEL`

#### Terminate/Goto operations
- `UPDATE_TERMINATE_STATUS`
- `UPDATE_GOTO_TARGET`

### 8.3 Patch Example

**User request:** “Add an AI step after Upload documents to extract the name.”

```json
{
  "patch": [
    {
      "op": "ADD_STEP_AFTER",
      "afterStepId": "s_file",
      "step": {
        "stepId": "s_ai_extract",
        "type": "AI_AUTOMATION",
        "milestoneId": "ms1",
        "title": "Extract name from ID",
        "inputs": [{"ref": "s_file.outputs.id_documents"}],
        "prompt": "Extract full name from the identification documents.",
        "outputs": [{"key": "extracted_name", "type": "TEXT"}]
      }
    }
  ]
}
```

---

## 9) Minimal Regeneration Policy

- Default: **patch** existing IR.
- Only regenerate full IR when the user explicitly asks to “rebuild” or “regenerate from scratch”.

---

**End of IR & Patch Specification (v1, Step-List)**

