-- Migration: Rename flow_runs → flows, flows → templates
-- Renames tables and columns to align with the new naming convention:
--   "templates" = workflow blueprints (was "flows")
--   "flows" = active workflow instances (was "flow_runs")
-- IMPORTANT: Rename flows→templates FIRST to free up the "flows" name.

-- Step 1: Rename tables (order matters to avoid name collisions)
ALTER TABLE "flows" RENAME TO "templates";
--> statement-breakpoint
ALTER TABLE "flow_runs" RENAME TO "flows";
--> statement-breakpoint
ALTER TABLE "flow_run_accounts" RENAME TO "flow_accounts";
--> statement-breakpoint
ALTER TABLE "flow_run_conversations" RENAME TO "flow_conversations";
--> statement-breakpoint
ALTER TABLE "flow_run_messages" RENAME TO "flow_messages";
--> statement-breakpoint
ALTER TABLE "flow_run_message_attachments" RENAME TO "flow_message_attachments";
--> statement-breakpoint
ALTER TABLE "portal_flows" RENAME TO "portal_templates";
--> statement-breakpoint

-- Step 2: Rename foreign key columns
ALTER TABLE "flows" RENAME COLUMN "flow_id" TO "template_id";
--> statement-breakpoint
ALTER TABLE "flows" RENAME COLUMN "parent_run_id" TO "parent_flow_id";
--> statement-breakpoint
ALTER TABLE "portal_templates" RENAME COLUMN "flow_id" TO "template_id";
--> statement-breakpoint
ALTER TABLE "schedules" RENAME COLUMN "flow_id" TO "template_id";
--> statement-breakpoint
ALTER TABLE "webhook_endpoints" RENAME COLUMN "flow_id" TO "template_id";
--> statement-breakpoint
ALTER TABLE "step_executions" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "audit_logs" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "notification_log" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "flow_accounts" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "flow_conversations" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "flow_messages" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint
ALTER TABLE "files" RENAME COLUMN "flow_run_id" TO "flow_id";
--> statement-breakpoint

-- Step 3: Rename indexes
ALTER INDEX IF EXISTS "portal_flow_unique" RENAME TO "portal_template_unique";
