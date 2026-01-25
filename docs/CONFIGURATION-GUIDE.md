# Configuration Guide: Updating AI Flow Copilot

This document explains how to update the AI SE when Moxo's platform changes.

## Architecture Overview

AI Flow Copilot uses a **configuration-driven architecture**. The AI's knowledge comes from YAML config files, not hardcoded logic. This means:

- **New features** → Add/update config files
- **Constraint changes** → Edit constraints.yaml
- **Consultation improvements** → Edit se-playbook.yaml
- **No code changes required** for most updates

## Configuration Files

```
backend/config/
├── step-types/           # Step type definitions (one file per type)
│   ├── human-actions/    # FORM, APPROVAL, DECISION, TODO, etc.
│   ├── controls/         # SINGLE_CHOICE_BRANCH, GOTO, WAIT, etc.
│   └── automations/      # AI_AUTOMATION, SYSTEM_WEBHOOK, etc.
├── constraints.yaml      # Platform limits
├── defaults.yaml         # Default values applied by AI
└── se-playbook.yaml      # AI consultation behavior
```

---

## What to Update for Each Change Type

### 1. New Step Type Added to Moxo

| File | Action |
|------|--------|
| `config/step-types/{category}/{type}.yaml` | Create new file |
| `config/se-playbook.yaml` | Add stepTypeQuestions entry |

**Step type file template:**
```yaml
stepType: NEW_STEP_TYPE
category: HUMAN_ACTION  # HUMAN_ACTION | CONTROL | AUTOMATION
displayName: "Display Name"
description: "What this step does"

schema:
  fields:
    - name: name
      type: string
      required: true
    - name: description
      type: string
      required: false
    # ... other fields

completion:
  multipleAssignees: true
  completionMode: "ALL"  # ALL | ANY | FIRST

aiGuidance:
  whenToUse: "Use this step when..."
  whenNotToUse: "Don't use when..."
  seQuestions:
    - "Key question to ask user?"
  defaults:
    - "Default assumption to apply"
```

**Add to se-playbook.yaml:**
```yaml
stepTypeQuestions:
  # ... existing types ...
  NEW_STEP_TYPE:
    - "Question 1 about this step type?"
    - "Question 2 about configuration?"
```

---

### 2. Platform Constraint Changed

**File:** `config/constraints.yaml`

| Constraint | YAML Path |
|------------|-----------|
| Max parallel branches | `branching.maxParallelPaths` |
| Max decision outcomes | `branching.maxDecisionOutcomes` |
| Max branch nesting | `branching.maxNestingDepth` |
| Milestones in branches | `branching.milestonesInsideBranches` |
| GOTO allowed locations | `goto.allowedInside` |
| TERMINATE allowed locations | `terminate.allowedInside` |
| Variable types | `variables.allowedTypes` |
| Subflow support | `features.subflowSupported` |

**Example:**
```yaml
# Before: max 3 parallel branches
branching:
  maxParallelPaths: 3

# After: Moxo now supports 5
branching:
  maxParallelPaths: 5
```

---

### 3. Default Behavior Changed

**File:** `config/defaults.yaml`

| Default | YAML Path |
|---------|-----------|
| Assignee resolution | `assignees.defaultResolution` |
| Step execution order | `steps.executionOrder` |
| Completion mode | `steps.completionMode` |
| Assignee order | `steps.assigneeOrder` |
| Kickoff mode | `kickoff.defaultStartMode` |
| Single milestone | `milestones.defaultToSingleMilestone` |
| Chat assistance | `flow.chatAssistanceEnabled` |
| Auto-archive | `flow.autoArchiveEnabled` |

---

### 4. AI Consultation Behavior Changed

**File:** `config/se-playbook.yaml`

#### Consultation Stages
The AI follows a 7-stage consultation flow. Each stage can have:
- `keyQuestion` - Primary question to ask
- `secondaryQuestions` - Follow-up questions
- `perStepQuestions` - Questions for each step (steps stage only)
- `stepTypeQuestions` - Questions per step type (steps stage only)
- `validation` - Criteria to check
- `defaults` - What to assume if not specified
- `explanation` - Context to share with user

#### Asking Policy
Controls when AI asks vs assumes:
```yaml
behaviors:
  askingPolicy:
    askWhen:
      - "Multiple valid approaches exist"
      - "User's description is ambiguous"
    applyDefaultWhen:
      - "Standard pattern applies"
      - "Choice doesn't impact goal"
```

#### Proactive Suggestions
What the AI should proactively suggest:
```yaml
behaviors:
  proactiveSuggestions:
    enabled: true
    areas:
      - "AI automation opportunities"
      - "Process improvements"
```

---

### 5. Step Type Field Changed

**File:** `config/step-types/{category}/{type}.yaml`

Update the `schema.fields` array:
```yaml
schema:
  fields:
    - name: newField
      type: string  # string | number | boolean | array | object
      required: false
      description: "What this field does"
      default: "default value"
```

---

### 6. New Integration/Trigger Added

| File | Action |
|------|--------|
| `config/step-types/automations/{integration}.yaml` | Create if new automation type |
| `config/se-playbook.yaml` | Add to integrations stage questions |

---

## How Configuration Flows to AI

```
YAML Config Files
       ↓
config/loader.ts (parses YAML, provides typed access)
       ↓
llm/prompt-generator.ts (generates system prompt)
       ↓
System prompt sent to Claude
       ↓
AI responds with knowledge of current platform
```

Key function: `generateSystemPrompt()` in `prompt-generator.ts` assembles all config into the AI's instructions.

---

## Verification Checklist

After updating any config:

- [ ] `npm run build` passes (no TypeScript errors)
- [ ] `npm test` passes (all tests green)
- [ ] Test with a sample prompt that uses the new feature
- [ ] Verify AI correctly uses new constraints/defaults
- [ ] Check AI asks appropriate questions for new step types

---

## Examples

### Example 1: Moxo adds VIDEO_CALL step type

1. Create `config/step-types/human-actions/video-call.yaml`:
```yaml
stepType: VIDEO_CALL
category: HUMAN_ACTION
displayName: "Video Call"
description: "Schedule and conduct a video meeting"

schema:
  fields:
    - name: name
      type: string
      required: true
    - name: duration
      type: number
      required: false
      default: 30
    - name: participants
      type: array
      required: true

aiGuidance:
  whenToUse: "Use for real-time meetings, interviews, consultations"
  seQuestions:
    - "How long should the call be?"
    - "Who needs to join?"
```

2. Add to `se-playbook.yaml`:
```yaml
stepTypeQuestions:
  VIDEO_CALL:
    - "How long should the video call be?"
    - "Who needs to participate in the call?"
    - "Should it be recorded?"
```

### Example 2: Max branches increased from 3 to 5

Edit `config/constraints.yaml`:
```yaml
branching:
  maxParallelPaths: 5  # Changed from 3
```

The AI will now allow up to 5 parallel branches and update its constraint violation messages accordingly.

---

## Quick Reference

| Change Type | Primary File |
|-------------|--------------|
| New step type | `step-types/{category}/{type}.yaml` + `se-playbook.yaml` |
| Constraint change | `constraints.yaml` |
| Default change | `defaults.yaml` |
| Consultation change | `se-playbook.yaml` |
| Field schema change | `step-types/{category}/{type}.yaml` |
