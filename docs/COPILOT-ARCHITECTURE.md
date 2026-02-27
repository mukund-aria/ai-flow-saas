# AI Copilot Architecture

## How It Works (Simple Version)

A user describes a business process in natural language. The AI copilot consults its knowledge of workflow best practices, step types, and 93 template patterns. It generates a structured workflow definition (JSON) which the user reviews and approves. The approved workflow becomes a reusable template in the platform.

## The Three Knowledge Layers

### 1. Technical Layer — What the platform CAN do
- **Step types** (`backend/config/step-types/`): 35+ step types (FORM, APPROVAL, FILE_REQUEST, branching, AI automation, integrations, etc.) each defined in YAML with fields, constraints, and examples
- **Constraints** (`backend/config/constraints.yaml`): Platform limits (max steps, nesting depth, field counts)
- **Tool schemas** (`backend/src/llm/tools.ts`): 6 structured tools that guarantee valid JSON output

### 2. Consultative Layer — HOW to design good workflows
- **Consultation stages** (`backend/config/consultative/consultation.yaml`): 7-stage consultation flow (goal → assignees → kickoff → steps → AI automation → integrations → governance)
- **Template catalog** (`backend/config/consultative/template-catalog.yaml`): 93 compact workflow patterns the AI always sees
- **Gallery templates** (`backend/src/data/gallery-templates.json`): Full template definitions loaded on demand via `lookup_template` tool
- **Inference rules**: Keyword-to-step-type mappings ("review" → APPROVAL, "upload" → FILE_REQUEST, etc.)
- **Defaults**: Sensible defaults for every decision (manual start, Contact TBD assignees, no integrations)

### 3. UX Layer — How to PRESENT responses
- **Response format**: Forced tool use (`tool_choice: any`) ensures structured JSON — never free-text workflow definitions
- **Copilot settings** (`frontend/src/config/copilot-settings.ts`): Frontend UX routing thresholds (small vs large edit detection, banner display limits)
- **Streaming**: All responses use SSE streaming for perceived speed

## The Copilot Decision Flow

```
User message
  → AI reads all 3 knowledge layers
  → Decides response type:
     ├── Unclear → ASK clarification questions (ask_clarification tool)
     ├── Out of scope → REJECT with reason (reject_request tool)
     ├── Just chatting → RESPOND conversationally (respond tool)
     ├── Ready to build:
     │   ├── Check template catalog for matching pattern
     │   ├── If match → lookup_template → get full details → adapt to user's needs
     │   └── If no match → generate from scratch using step type knowledge
     │   └── CREATE workflow (create_workflow tool)
     └── Editing existing:
         └── EDIT with patch operations (edit_workflow tool)
```

## Template System

- **93 patterns** in `template-catalog.yaml` — the AI always sees these compact patterns
- **Full templates** with form fields in gallery — the AI loads on demand via `lookup_template` tool
- **Agentic loop**: When the AI calls `lookup_template`, the backend resolves it and feeds the result back for a second API call where the AI calls `create_workflow` with rich template data
- Templates are starting skeletons — the AI always adapts them to the user's specific needs

## How the Frontend Presents AI Output

### Small Edits (≤2 operations, no step add/remove)
- Chat shows a **PlanSummaryCard** with change summary + Approve/Make Changes buttons
- Right panel stays unchanged — approval happens entirely in chat
- On approve, the right panel updates in-place

### Large Edits / Creates
- Chat shows a compact **PlanSummaryCard** with "Review workflow in the panel →" cue
- Right panel enters **proposal mode**: ProposalBanner + full workflow rendered with change badges
- For edits: **Current ↔ Proposed** toggle lets users compare before and after
- Change badges (New/Modified/Moved) highlight what changed on each step
- Unchanged steps dim to 60% opacity so changes stand out
- On approve, proposal clears and workflow commits to the store

### Thresholds
Configured in `frontend/src/config/copilot-settings.ts`:
- `smallEditMaxOps: 2` — max operations for chat-only treatment
- `alwaysFullPreviewOps` — operation types that always trigger panel proposal (ADD_STEP*, REMOVE_STEP)

## Configuration Files

| File | Controls |
|------|----------|
| `backend/config/step-types/*.yaml` | Step type definitions (fields, constraints, examples) |
| `backend/config/constraints.yaml` | Platform limits |
| `backend/config/consultative/consultation.yaml` | Consultation stages, inference rules, personality |
| `backend/config/consultative/template-catalog.yaml` | 93 compact template patterns |
| `backend/src/data/gallery-templates.json` | Full template definitions (loaded on demand) |
| `backend/src/llm/tools.ts` | Tool schemas for structured output |
| `backend/src/llm/service.ts` | API orchestration, agentic tool loop, prompt assembly |
| `frontend/src/config/copilot-settings.ts` | Frontend UX routing thresholds |
| `frontend/src/lib/proposal-utils.ts` | Change detection, summarization, small edit logic |

## Key Components

| Component | Purpose |
|-----------|---------|
| `PlanSummaryCard` | Lightweight chat card showing proposal summary |
| `ProposalBanner` | Right-panel banner with stats, toggle, approve/reject |
| `ChangeStatusBadge` | Tiny badge (New/Modified/Moved) on step cards |
| `WorkflowPanel` | Main canvas — switches to proposal mode when pending |
| `StepCard` | Individual step — accepts `changeStatus` for diff styling |
| `StepList` | Step list — passes `proposalChangeMap` through to children |
| `BranchLayout` | Branch rendering — passes change map to nested steps |
| `workflowStore` | Zustand store — holds `pendingProposal` and `proposalViewMode` |
| `useChat` | Chat orchestration — detects small vs large edits, pushes proposals |
