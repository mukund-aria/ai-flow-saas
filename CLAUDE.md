# AI Flow SaaS - Project Context

## Overview
AI Flow SaaS is a complete workflow automation platform that enables organizations to **build, run, and manage** business processes. The unique differentiator is AI-powered flow creation through natural conversation.

**Two User Experiences:**
1. **Coordinator Portal** - Internal team members who build, run, and manage flows
2. **Assignee Portal** - External participants who complete tasks via magic links

## Tech Stack
- **Frontend:** React + Vite + TypeScript (port 5173)
- **Backend:** Node.js + Express + TypeScript (port 3001)
- **Database:** SQLite (dev) / PostgreSQL (prod) via Drizzle ORM
- **Structure:** Monorepo with `/frontend` and `/backend` directories

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI Flow SaaS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐     ┌─────────────────────────────────────┐   │
│  │   Coordinator Portal     │     │        Assignee Portal              │   │
│  │   (Authenticated)        │     │        (Magic Link Access)          │   │
│  ├─────────────────────────┤     ├─────────────────────────────────────┤   │
│  │ • Home (AI Builder)      │     │ • Task completion UI                │   │
│  │ • Flows (Templates)      │     │ • Form submission                   │   │
│  │ • Flow Runs (Instances)  │     │ • File upload                       │   │
│  │ • Reports (Analytics)    │     │ • Approvals                         │   │
│  │ • Contacts (Assignees)   │     │ • E-Sign                            │   │
│  │ • Schedules              │     │ • Acknowledgement                   │   │
│  │ • Integrations           │     │                                     │   │
│  └─────────────────────────┘     └─────────────────────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Backend Services                                │
│  API Server • Execution Engine • Magic Link Service • Notification Service  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Data Layer                                      │
│  PostgreSQL via Drizzle ORM                                                 │
│  Users • Organizations • Flows • FlowRuns • Steps • Contacts • Audit        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

Core tables (see `backend/src/db/schema.ts`):
- **organizations** - Multi-tenant org support
- **users** - Authenticated team members
- **flows** - Workflow templates (the blueprints)
- **flow_runs** - Active workflow instances
- **step_executions** - Individual step progress
- **contacts** - External assignees (no account needed)
- **magic_links** - Token-based access for assignees
- **audit_logs** - Activity tracking

---

## Key Concepts

### Flow vs Flow Run
- **Flow**: A reusable workflow template (the blueprint)
- **Flow Run**: An active instance of a flow (the execution)

### Step Types
**Human Actions:** FORM, APPROVAL, FILE_REQUEST, TODO, ACKNOWLEDGEMENT, DECISION
**Controls:** SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH, PARALLEL_BRANCH
**Automations:** (deferred) AI_AUTOMATION, SYSTEM_WEBHOOK, SYSTEM_EMAIL

### Dynamic Data References (DDR)
Reference data from prior steps in later steps:
```
{Kickoff / Client Name}     → Kickoff form field
{Step 2 / Country}          → Output from step 2
{Role: Client / Email}      → Assigned contact's email
{Workspace / Name}          → Organization name
```

### Magic Links
External assignees access tasks without accounts via secure, time-limited tokens.

---

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev        # Development with hot reload
npm run build      # Compile TypeScript
npm test           # Run tests
npm run db:push    # Push schema to database
npm run db:studio  # Open Drizzle Studio (DB UI)
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server
npm run build      # Production build
```

---

## Project Structure

```
frontend/src/
├── layouts/              # Page layouts (Coordinator, Public)
├── pages/                # Route pages (Home, Flows, Runs, etc.)
├── components/
│   ├── nav/              # Sidebar, navigation
│   ├── chat/             # AI chat UI
│   ├── flows/            # Flow cards, grid
│   ├── runs/             # Run items, progress
│   ├── workflow/         # Visual workflow editor
│   └── ui/               # Shared UI components
├── hooks/                # Custom React hooks
├── stores/               # Zustand state stores
└── contexts/             # React contexts

backend/src/
├── db/                   # Database (Drizzle schema, client)
├── services/             # Business logic
│   ├── execution.ts      # Flow execution engine
│   ├── magic-link.ts     # Token generation
│   └── notification.ts   # Email sending
├── routes/               # API endpoints
├── llm/                  # AI integration
├── config/               # YAML configs
└── middleware/           # Express middleware
```

---

## API Endpoints

### Coordinator Portal
- `GET/POST /api/flows` - List/create flows
- `GET/PUT/DELETE /api/flows/:id` - Flow CRUD
- `POST /api/flows/:id/runs` - Start a flow run
- `GET /api/runs` - List flow runs
- `GET /api/runs/:id` - Run details
- `GET /api/contacts` - Contact management
- `GET /api/reports/summary` - Dashboard metrics

### Assignee Portal (Public)
- `GET /api/public/task/:token` - Get task context
- `POST /api/public/task/:token/complete` - Submit task

### AI Chat
- `POST /api/chat` - Chat with AI (SSE streaming)

---

## Implementation Phases

| Phase | Status | Description |
|-------|--------|-------------|
| A | ✅ Done | Database setup (Drizzle + SQLite) |
| B | 🔄 In Progress | Coordinator Portal shell |
| C | Pending | Flow Management (save/list/edit) |
| D | Pending | Execution Engine |
| E | Pending | Flow Runs Dashboard |
| F | Pending | Assignee Portal (magic links) |
| G | Pending | Step Type UIs |
| H | Pending | Reports & Analytics |
| I | Pending | Contacts Management |
| J | Pending | Polish & Production |

---

## AI Builder

The AI builder (original AI Flow Copilot) is integrated into the Home page and Flow Builder. It creates workflows through natural conversation.

### AI Output Modes
- `create`: Full workflow JSON
- `edit`: Patch operations array
- `clarify`: Questions for user
- `reject`: With reason and suggestion
- `respond`: Conversational responses

### Configuration Files
- `backend/config/se-playbook.yaml` - AI consultation guidance
- `backend/config/constraints.yaml` - Platform limits
- `backend/config/step-types/` - Step type definitions

---

## AI Builder Design Principles

1. **Quality over speed** — Never compromise AI output quality for performance. Use infrastructure-level optimizations (caching, streaming) not content-level shortcuts (prompt trimming, model downgrading).

2. **Generalized architecture** — No hardcoded heuristics for request type detection or response routing. The AI always gets the full context and decides how to respond. Step type configs, constraints, and playbook are data-driven from YAML files.

3. **Data-driven configuration** — Step types, constraints, and consultation behavior are loaded from YAML config files (`backend/config/`), not hardcoded. Adding a new step type means adding a YAML file, not changing code.

4. **Session-level caching** — Use Anthropic API's `cache_control` to cache the static system prompt across turns in a session. Dynamic context (workflow state) is always fresh.

5. **Scalable prompt architecture** — The system prompt is assembled from modular sections (role, constraints, step types, consultation, defaults). Each section is independently maintainable.

6. **Streaming-first** — All AI responses use SSE streaming for perceived speed. The UI shows thinking indicators while the model processes.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Drizzle | Lightweight, SQL-like, type-safe |
| Dev DB | SQLite | Zero setup, works offline |
| Prod DB | PostgreSQL (Railway) | Managed, scalable |
| Auth | Google OAuth + Sessions | Simple, secure |
| Assignee Access | Magic Links | No accounts needed |
| E-Sign | Deferred | MVP scope |
