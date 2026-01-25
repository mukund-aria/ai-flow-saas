# Flow Copilot – Canonical Master Docs (v1)

This document is the **single source of truth** for building the Moxo Flow Copilot. It consolidates **product capabilities, constraints, and execution semantics** and is designed to be stable, explicit, and future‑proof.

---

## 1. Purpose & Scope

**Purpose**
- Provide a canonical reference for what the Flow Copilot can generate, edit, and recommend.
- Eliminate ambiguity for AI prompting, IR generation, patching, and validation.

**Audience**
- Product Management
- Engineering
- AI / Copilot implementation
- Solutions Engineering (enablement reference)

**Out of Scope**
- UI pixel-level details
- Backend storage implementation
- Subflows (explicitly not supported in v1)

---

## 2. Core Concepts

### Flow vs Run
- **Flow**: A reusable process template designed in the Flow Builder.
- **Run / Workspace**: A single execution instance created from a Flow.

### Milestones
- Milestones are **UI-only grouping markers**.
- Architecturally lightweight: not a parent container.
- Each milestone has a sequence number.
- In UI, a milestone visually groups all steps until the next milestone.

**Constraints (Current)**
- No milestones inside branches.
- A branch (control + all paths) must be fully contained within a **single milestone**.

---

## 3. Initiation & Kickoff

### Initiation Methods
- Manual execution (user clicks **Execute**)
- Kickoff Form
- Start Link (post-publish)
- Webhook / External integration

### Kickoff Data
- Variable types supported: **Text**, **File**
- Variables are:
  - Set only at initiation
  - Global and immutable
  - Referenceable anywhere later in the flow

**Notes**
- Kickoff form fields are automatically referenceable.
- Webhook custom data must be passed via variables.

---

## 4. Assignees & Roles

### Assignees
- Assignees are placeholders that resolve to an email string.
- No distinction between internal vs external users at modeling level.

### Assignment Options
- Contact TBD (default)
- Fixed contact
- Workspace initializer
- Kickoff form field
- Variable-based
- Conditional rules (first match wins)
- Round-robin routing

### Visibility
- Role-level toggle: **Allow assignee to view all actions**
- Per-step toggle: **Visible to all assignees**

### Coordinators
- Coordinators can:
  - See entire process
  - Manage actions
  - Access coordinator view

**Coordinator Sources**
- Users with flow-level Coordinate permission
- Assignees with Coordinator toggle enabled
- Admins (implicit)

---

## 5. Actions (Human Steps)

All actions support:
- Title & Description
- Optional step-level due date
- Assignees (single or multiple)
- Visibility toggles

### Supported Action Types

#### Form
- Rich form fields (text, select, file, etc.)
- Multiple assignees fill concurrently
- One submission completes the step
- Outputs: typed form responses

#### Questionnaire
- Single question
- Single-select or multi-select
- Optional review required
- Outputs: selected choices

#### File Request
- Multiple files allowed
- Optional reviewer (any assignee)
- Reviewer completion drives step completion
- Output: uploaded files

#### To-Do
- Multiple assignees
- Completion modes: one / majority / all
- Optional sequential order across assignees

#### Approval
- Similar to To-Do
- Multiple assignees, parallel or sequential

#### Acknowledgement
- Optional file attachment
- "Require attachment review" forces open before completion

#### E‑sign
- Multiple signers
- Parallel or sequential signing
- All required
- Document immutable after signing starts
- Output: signed document

---

## 6. Flow Controls & Execution

### Default Execution
- Steps run sequentially by default.
- Per-step advanced option: **Skip sequential order** (runs in parallel with previous step).

### Branching Controls

#### Single Choice Branch
- 2 paths (if / else)
- Exactly one path executes

#### Multi Choice Branch
- Multiple paths
- Any matching paths execute

#### Parallel Branch
- Branches run concurrently
- Default: 2 branches
- Max: 3 branches

**Branching Constraints**
- Max nesting depth: 2 levels
- Entire branch must live within one milestone

---

## 7. Decision, Goto & Looping

### Decision
- Single assignee
- Supports up to 3 outcomes (most common: 2)

### Goto & Goto Destination
- Goto Destination exists only on main path
- Goto can be placed inside:
  - Decision branch paths
  - Single Choice branch paths
- Goto can only jump to main-path destinations

**Loop Semantics**
- Jumping reopens and re-executes affected steps

### Flow Terminate
- Can be placed inside Decision or Single Choice branch paths
- Terminates the flow
- Marks run as:
  - Cancelled OR Completed (configurable)

---

## 8. Wait

- Standalone step
- No assignee
- Auto-completes on:
  - External app event

**Note**
- Subflow-based wait exists conceptually but is **not supported in v1**.

---

## 9. Automations

### AI Automation
- Standalone step
- Auto-completes
- Visible only to coordinators
- Inputs: variables, files, prior outputs
- Config: prompt, optional knowledge
- Outputs: typed values
- Outputs referenceable anywhere later

### System Automations
- External webhook / system update
- Send email
- Send chat message
- Update workspace info

#### Business Rule Automation
- Rule table mapping inputs → outputs
- First matching rule applies
- Outputs usable later in flow

---

## 10. Governance

### Permissions (Template Level)
- Execute
- Edit
- Coordinate

Only explicitly granted users have permissions.
Admins override implicitly.

### Due Dates
- Flow-level due date (relative, e.g. 2 weeks)
- Optional per-step due dates

### Chat Assistance
- Optional per flow
- Default: ON

### Workspace Naming
- Template-defined
- Supports variable interpolation
- Recommended to include at least one dynamic reference

---

## 11. Platform Constraints (Centralized)

- Parallel branch max: 3
- Decision outcomes max: 3
- Branch nesting depth max: 2
- No milestones inside branches
- Branch must fit within a single milestone
- Goto targets only on main path
- Variables only set at initiation
- Subflow not supported (v1)

---

## 12. Usage by Flow Copilot

This document is the authoritative constraint layer for:
- First-time flow generation
- Flow editing (via patches)
- Copilot recommendations
- Validation and guardrails

Copilot must:
- Never generate unsupported constructs
- Ask minimal clarifying questions
- Prefer defaults and placeholders
- Explain limitations and suggest alternatives when constrained

---

**End of Canonical Master Doc (v1)**

