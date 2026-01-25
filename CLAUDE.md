# AI Flow Copilot - Project Context

## Overview
AI Flow Copilot is an AI-powered virtual Solutions Engineer for Moxo.com that helps non-technical business users create and edit workflow templates through natural conversation.

## Tech Stack
- **Frontend:** React + Vite + TypeScript (port 5173)
- **Backend:** Node.js + Express + TypeScript (port 3000)
- **Structure:** Monorepo with `/frontend` and `/backend` directories

## Repository
- **GitHub:** https://github.com/max-rao/ai-flow-copilot (private)

---

## Architecture: Configuration-Driven Design

The system is designed to evolve as Moxo adds features. Key principle: **changes via config, not code**.

### Config Directory Structure
```
backend/config/
├── step-types/           # Step type definitions (YAML)
│   ├── human-actions/    # FORM, APPROVAL, DECISION, etc.
│   ├── controls/         # SINGLE_CHOICE_BRANCH, GOTO, etc.
│   └── automations/      # AI_AUTOMATION, SYSTEM_WEBHOOK, etc.
├── constraints.yaml      # Platform limits (max branches, etc.)
├── defaults.yaml         # Default values
├── se-playbook.yaml      # Consultation guidance for AI
└── prompts/              # AI prompt templates
```

### How to Evolve the System
| Change | What To Do |
|--------|------------|
| Add step type | Add YAML file to `config/step-types/` + add to `se-playbook.yaml` stepTypeQuestions |
| Change constraint | Edit `config/constraints.yaml` |
| Improve SE guidance | Edit `config/se-playbook.yaml` |

**See `docs/CONFIGURATION-GUIDE.md` for detailed instructions.**

### Backwards Compatibility
- Unknown step types: preserved, not errors
- Unknown fields: pass through unchanged
- Generate only known features

---

## Key Concepts

### Workflow Structure
- **Flow**: Reusable process template
- **Steps**: Ordered list (main path), run top-to-bottom
- **Milestones**: UI grouping markers
- **Branches**: Contain nested steps per path

### Step Types
**Human Actions:** FORM, QUESTIONNAIRE, FILE_REQUEST, TODO, APPROVAL, ACKNOWLEDGEMENT, ESIGN, DECISION, CUSTOM_ACTION, WEB_APP

**Controls:** SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH, PARALLEL_BRANCH, GOTO, GOTO_DESTINATION, TERMINATE, WAIT

**Automations:** AI_AUTOMATION, SYSTEM_WEBHOOK, SYSTEM_EMAIL, SYSTEM_CHAT_MESSAGE, BUSINESS_RULE

### Platform Constraints
- Max parallel branches: 3
- Max decision outcomes: 3
- Max branch nesting depth: 2
- No milestones inside branches
- GOTO/TERMINATE only in Decision/Single Choice paths

### AI Output Modes
- `create`: Full workflow JSON
- `edit`: Patch operations array
- `clarify`: Questions for user
- `reject`: With reason and suggestion
- `respond`: Conversational responses for informational questions (with suggested action buttons)

### Respond Mode Details
The `respond` mode is used for answering questions without taking workflow actions. It supports suggested actions with special action types:

| Action Type | Description |
|-------------|-------------|
| `approve_plan` | Trigger plan approval from the response |
| `discard_plan` | Discard pending plan |
| `edit_plan` | Open edit input for the plan |
| `prompt` | Send a new message (value contains the message) |

### Pending Plan Context
When a plan is pending approval, the AI receives context about it. This enables the AI to:
- Include relevant action buttons in responses
- Answer questions about the pending plan
- Suggest approving, editing, or discarding the plan contextually

---

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev      # Development with hot reload
npm run build    # Compile TypeScript
npm test         # Run tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Key Files
- `PRD.md` - Full product requirements
- `Content/` - Reference docs from Moxo (SE consultation flow, IR spec, etc.)
- `backend/config/` - Configuration files (source of truth)
- `backend/src/models/` - TypeScript interfaces
- `backend/src/validator/` - Workflow validation
- `backend/src/engine/` - Patch operations
- `backend/src/llm/` - LLM integration (prompts, parsing, handlers)
- `backend/src/routes/` - API endpoints
- `backend/src/middleware/` - Express middleware

---

## Frontend Features

### Milestone Visualization
- Steps are visually grouped by milestones in both preview cards and workflow canvas
- Milestone groups have dashed borders matching Moxo UI style
- Steps without milestones are displayed in an "Uncategorized" group

### Multi-step Thinking Indicator
Contextual status messages that progress based on operation type:
- **Creating**: "Understanding your request" → "Designing workflow structure" → "Generating steps" → "Finalizing workflow"
- **Editing**: "Analyzing changes" → "Planning modifications" → "Applying updates" → "Validating workflow"
- **Analyzing**: "Reading your input" → "Analyzing content" → "Formulating response"

### Edit Operations Summarization
Instead of showing individual "Update step_X" operations, edits are intelligently summarized:
- "Added milestones: Onboarding, Review, Completion"
- "Added 3 new steps after step_2"
- "Updated step titles and descriptions"

### File Upload
Users can upload files with accompanying text context that's passed to the AI for analysis.

---

## API Endpoints

### Chat
- `POST /api/chat` - Main chat endpoint (SSE streaming by default)
  - `message`: User's message
  - `sessionId`: Optional session ID
  - `stream`: Enable SSE (default: true)
  - `preview`: Show workflow as preview first (default: true)
  - `file`: Optional file upload with name, content, and mimeType
  - `pendingPlan`: Context about pending plan for smart action suggestions

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session details
- `DELETE /api/sessions/:id` - Delete session
- `GET /api/sessions/:id/workflow` - Export workflow
- `POST /api/sessions/:id/workflow` - Import workflow
- `POST /api/sessions/:id/publish` - Publish pending plan
- `DELETE /api/sessions/:id/plan` - Discard pending plan

---

## Current Phase: Polish & Testing (Phase 7)

### Completed:
- ✅ Phase 1: Backend Core (models, validator, patch engine)
- ✅ Phase 2: LLM Integration (prompts, parsing, handlers)
- ✅ Phase 3: API Layer (REST + SSE streaming, plan/preview)
- ✅ Phase 4: Frontend (chat UI, workflow visualizer, SSE handling)
- ✅ Phase 5: Conversational AI SE Experience (friendly responses, no raw JSON, welcome screen, industry templates)
- ✅ Phase 6: Enhanced UX Features

### Phase 6 Highlights:
- **Respond mode**: New AI output mode for conversational questions without workflow actions
- **Suggested action buttons**: Actions with types (approve_plan, discard_plan, edit_plan, prompt)
- **Pending plan context**: AI receives context about pending plans to offer smart action buttons
- **File upload with message**: Users can upload files with accompanying text context
- **Multi-step thinking indicator**: Contextual progress messages that vary by operation type
- **Edit operations summarization**: Intelligent summaries instead of raw operation lists
- **Milestone visualization**: Steps grouped by milestones with dashed borders matching Moxo UI

### Phase 5 Highlights:
- Conversational responses (explain first, JSON in code block)
- Welcome screen with 10 industry workflow templates
- Resizable chat/workflow panels (1/3 and 2/3 default)
- Post-action guidance after workflow approval
- Enhanced SE consultation with per-step-type questions
- User-friendly error messages
- Sparkles icon for AI avatar

### Next:
1. End-to-end testing with real Claude API
2. Session persistence across page reloads
3. Workflow export/import functionality
