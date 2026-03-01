# Production Readiness TODO

Last updated: 2026-02-28

---

## 1. Assignee Portal (Priority: High)

- [x] **Magic link task UI** — Build the public task completion pages (`/task/:token`) for each step type: FORM, APPROVAL, FILE_REQUEST, TODO, ACKNOWLEDGEMENT, DECISION
- [x] **Public task route** — Wire `POST /api/public/task/:token/complete` to update step executions and advance the flow
- [ ] **Token expiry & revocation** — Enforce expiry on magic link tokens; allow coordinators to revoke/regenerate links
- [x] **Mobile-responsive assignee views** — Ensure all public task pages render well on mobile devices
- [x] **File upload for assignees** — Support file uploads in FILE_REQUEST steps via the public portal

## 2. Authentication & Security (Priority: High)

- [ ] **Session store** — Move session storage from in-memory to a persistent store (Redis or DB-backed) for multi-instance deploys
- [ ] **CSRF protection** — Add CSRF tokens to all state-changing requests
- [x] **Rate limiting** — Add rate limits to public endpoints (magic links, webhook triggers, public chat)
- [ ] **Environment variable validation** — Add startup validation for required env vars (GOOGLE_CLIENT_ID, RESEND_API_KEY, DATABASE_URL, etc.)
- [ ] **Secrets management** — Ensure webhook signing secrets and API keys are never logged or exposed in API responses

## 3. Database & Data (Priority: High)

- [ ] **PostgreSQL migration** — Test full schema against PostgreSQL (currently dev uses SQLite)
- [ ] **Drizzle migrations** — Generate and test migration files for production deploys (`drizzle-kit generate` → `drizzle-kit migrate`)
- [ ] **Schedules persistence** — Replace in-memory schedule store (`backend/src/routes/schedules.ts`) with DB-backed storage
- [ ] **Soft delete cascades** — Cascade archive status to scheduled triggers when a template is archived
- [ ] **Data retention** — Add cleanup jobs for expired magic links, old audit logs, and completed notification logs

## 4. Job Queue & Background Tasks (Priority: High)

- [ ] **Redis for BullMQ** — Provision Redis and configure `REDIS_URL` for BullMQ job processing (notifications, webhooks, schedules)
- [ ] **Queue dashboard** — Add Bull Board or similar for monitoring job queues in production
- [ ] **Dead letter handling** — Configure DLQ for permanently failed webhook/notification jobs
- [ ] **Graceful shutdown** — Ensure scheduler workers drain cleanly on SIGTERM

## 5. Email & Notifications (Priority: Medium)

- [ ] **Resend integration** — Configure production Resend API key and verified sender domain
- [ ] **Email templates** — Design HTML email templates for: task assignment, due date reminder, overdue alert, escalation, flow completion, team invite
- [ ] **Notification preferences enforcement** — Wire `userNotificationPrefs` into the notification dispatch pipeline (check prefs before sending)
- [ ] **Digest emails** — Implement daily/weekly digest aggregation and sending based on user preferences

## 6. Webhook System (Priority: Medium)

- [ ] **Webhook delivery logs UI** — Show delivery history (status, response code, timestamp) per endpoint in the flow settings panel
- [ ] **Retry visibility** — Surface failed/retrying webhook deliveries to coordinators
- [ ] **Webhook endpoint verification** — Optional endpoint ownership verification (challenge-response)
- [ ] **Chat message webhook event** — Wire `chat.message` event dispatch when assignees send messages in-flow

## 7. Integrations (Priority: Medium)

- [ ] **Slack OAuth** — Implement Slack app installation flow and channel creation per flow run
- [ ] **Microsoft Teams** — Implement Teams webhook/bot integration for flow notifications
- [ ] **Zapier trigger app** — Publish a Zapier trigger that uses the webhook system

## 8. Reports & Analytics (Priority: Medium)

- [ ] **Historical comparison** — Add period-over-period comparison to dashboard status cards (vs. previous week/month)
- [ ] **Export** — Add CSV/PDF export for flow, assignee, and member reports
- [ ] **Caching** — Cache report queries for dashboards to avoid re-computing on every page load

## 9. Flow Builder Polish (Priority: Medium)

- [x] **Step reordering** — Drag-and-drop step reordering in the workflow canvas
- [x] **Undo/redo** — Add undo/redo support for workflow edits
- [ ] **Version history** — Show template version history with diff view
- [ ] **Template gallery** — Import from the pre-built template gallery (see `docs/TEMPLATE-GALLERY-SPEC.md`)
- [x] **Dynamic Data References** — Implement DDR resolution in step configs (reference prior step outputs)

## 10. Testing (Priority: Medium)

- [ ] **Backend API tests** — Add integration tests for all route handlers (flows, runs, reports, schedules, webhooks, team, notifications)
- [x] **Frontend component tests** — Add key component tests (WorkflowPanel, StepCard, SettingsPage, ReportsPage)
- [ ] **E2E tests** — Add Playwright tests for critical flows: create template → start run → complete step → verify completion
- [ ] **Webhook dispatch tests** — Unit tests for HMAC signing, payload formatting, retry logic

## 11. Deployment & Infrastructure (Priority: Low)

- [ ] **Docker** — Create Dockerfile and docker-compose for local dev and deployment
- [ ] **CI/CD** — Set up GitHub Actions: lint, type-check, test, build, deploy
- [ ] **Health check endpoint** — Add `GET /api/health` returning DB + Redis connectivity status
- [ ] **Logging** — Structured JSON logging with request IDs for production observability
- [ ] **Error tracking** — Integrate Sentry or similar for error capture

## 12. UI/UX Polish (Priority: Low)

- [ ] **Loading skeletons** — Replace spinner-only loading states with skeleton placeholders
- [ ] **Toast notifications** — Add toast/snackbar for success/error feedback on actions
- [x] **Keyboard shortcuts** — Add keyboard shortcuts for common actions (Cmd+K search, Cmd+Z undo, etc.)
- [ ] **Dark mode** — Theme support (low priority, cosmetic)

## 13. AI Assignee System (Priority: High) — COMPLETED

- [x] **AI Prepare** — Pre-fill FORM fields from prior step data + kickoff context (async, fire-and-forget)
- [x] **AI Advise** — Recommendation card for DECISION/APPROVAL/FORM/FILE_REQUEST steps (async)
- [x] **AI Review** — Synchronous submission validation; reverts step with feedback if REVISION_NEEDED
- [x] **Form Chat Assistant** — Floating SSE chat widget for assignees on FORM steps (rate-limited)
- [x] **AI Chat (Coordinator)** — SSE streaming chat endpoint for flow run guidance
- [x] **AI Summarize** — Auto-generate executive summary on flow completion
- [x] **Config Panel** — Toggle + prompt fields for AI Prepare/Advise/Review in StepConfigPanel
- [x] **Assignee Portal Integration** — Polling, pre-fill, AI components rendered in task page
- [x] **Backend Tests** — Comprehensive tests for all AI service functions
- [x] **Frontend Tests** — Tests for AI components, config panel, and FormChatAssistant

## 14. AI Copilot UX Improvements (Priority: High)

- [ ] **Real thinking transparency** — Replace filler status messages with actual AI progress (token streaming, step detection)
- [ ] **Modern chat input** — Upgrade entry point with prompt suggestions, slash commands, better empty state
- [ ] **Rich markdown rendering** — Add code blocks, tables, inline code support (use react-markdown or similar)
- [ ] **Streaming visibility for create/edit** — Show intermediate progress during plan generation instead of blank thinking
- [ ] **Cancel generation** — Allow users to abort long-running AI requests

---

## Backlog

### @Mentions in Chat
Allow coordinators to be @mentioned in flow chat. Only show @mentioned messages in Attention Needed (as opt-in alternative to all-messages default).

**Current behavior:** All unread assignee messages on runs you're involved in show as "Attention Needed."
**Proposed:** Add @mention support. When enabled, only @mentioned messages appear in Attention Needed, reducing noise for coordinators on high-volume flows.

### Bring Your Own Model (BYOM)
Allow organizations to connect their own Claude, Gemini, or OpenAI API keys at the org level instead of using the platform default. Requires model abstraction layer and org-level settings UI.

### AI-Native Improvements

- [ ] **AI-powered attention dashboard** — Contextual "why" for each attention item (why this needs your attention, suggested action)
- [ ] **Smart email content** — AI-written contextual task assignment emails (personalized, referencing flow context instead of generic templates)
- [ ] **Post-run insights** — 3-sentence completion summary with metrics (duration, bottlenecks, key decisions) generated on flow completion
- [ ] **AI-suggested enhancements during conversation** — Surface analyzer rules conversationally while building flows (e.g., "This step could benefit from an AI Review gate")
- [ ] **Semantic template search** — Find templates by description/intent, not just name (e.g., "client onboarding" matches "New Customer Setup")
- [ ] **Run pattern analysis** — After 10+ runs, surface bottleneck/failure patterns (e.g., "Step 3 takes 3x longer than average on Tuesdays")
- [ ] **Per-role preview in template builder** — Preview the assignee experience for each role directly from the flow builder
- [ ] **AI Review / AI automation test with sample data** — Test AI features with sample inputs before publishing to validate behavior
- [ ] **Contextual builder tooltips for self-service onboarding** — Info icons with hover tooltips on key builder concepts for first-time users
