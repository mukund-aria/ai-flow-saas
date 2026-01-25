---
name: update-config
description: Update configuration files when Moxo features change or are added
context: fork
disable-model-invocation: true
agent: general-purpose
---

# Update Configuration for New Features

When Moxo releases new features, step types, or platform changes, use this skill to update the configuration files that drive the AI SE behavior.

## Configuration Architecture

The system is configuration-driven. Changes to Moxo's platform should be reflected in config files, NOT code:

```
backend/config/
├── step-types/           # Step type definitions
│   ├── human-actions/    # FORM, APPROVAL, DECISION, etc.
│   ├── controls/         # SINGLE_CHOICE_BRANCH, GOTO, etc.
│   └── automations/      # AI_AUTOMATION, SYSTEM_WEBHOOK, etc.
├── constraints.yaml      # Platform limits (max branches, etc.)
├── defaults.yaml         # Default values
└── se-playbook.yaml      # Consultation guidance for AI
```

## What to Update for Each Change Type

### 1. New Step Type Added
**Files to update:**
- Create `backend/config/step-types/{category}/{step-type}.yaml`
- Add questions to `backend/config/se-playbook.yaml` under `stepTypeQuestions`

**Template for new step type:**
```yaml
stepType: NEW_STEP_TYPE
category: HUMAN_ACTION  # or CONTROL, AUTOMATION
displayName: "New Step"
description: "What this step does"

schema:
  fields:
    - name: name
      type: string
      required: true
      description: "Step name"
    # Add other fields...

completion:
  multipleAssignees: true  # or false
  completionMode: "ALL"    # or "ANY", "FIRST"

aiGuidance:
  whenToUse: "Use when..."
  whenNotToUse: "Don't use when..."
  seQuestions:
    - "Question to ask user"
  defaults:
    - "Default assumption"
```

**Add to se-playbook.yaml stepTypeQuestions:**
```yaml
NEW_STEP_TYPE:
  - "Key question 1?"
  - "Key question 2?"
```

### 2. Platform Constraint Changed
**File:** `backend/config/constraints.yaml`

Examples:
- Max parallel branches: `branching.maxParallelPaths`
- Max decision outcomes: `branching.maxDecisionOutcomes`
- Max nesting depth: `branching.maxNestingDepth`

### 3. Default Behavior Changed
**File:** `backend/config/defaults.yaml`

Examples:
- Default completion mode: `steps.completionMode`
- Default assignee order: `steps.assigneeOrder`
- Chat assistance: `flow.chatAssistanceEnabled`

### 4. SE Consultation Approach Changed
**File:** `backend/config/se-playbook.yaml`

Update:
- `consultationStages` - Add/modify consultation stages
- `stepTypeQuestions` - Questions for specific step types
- `behaviors.askingPolicy` - When to ask vs apply defaults
- `behaviors.proactiveSuggestions` - What to proactively suggest

### 5. New Integration/Trigger Added
**Files:**
- `backend/config/step-types/automations/` - Add webhook/integration config
- `backend/config/se-playbook.yaml` - Add integration questions

## Verification Steps

After updating configs:

1. **Rebuild backend:** `cd backend && npm run build`
2. **Run tests:** `npm test`
3. **Check generated prompt:** Add a test or log to see the generated system prompt includes new content
4. **Test with sample prompts:** Verify AI responds correctly to new feature requests

## When to Invoke This Skill

The assistant should invoke this skill when:
- User mentions Moxo released a new feature
- User says a step type behavior changed
- User reports AI doesn't know about a feature
- User wants to add new consultation questions
- Platform constraints have changed
