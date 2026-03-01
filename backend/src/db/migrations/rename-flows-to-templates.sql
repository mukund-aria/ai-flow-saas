-- Migration: Rename flow_runs → flows, flows → templates
-- This migration renames tables and columns to align with the new naming convention:
--   - "templates" = workflow blueprints (was "flows")
--   - "flows" = active workflow instances (was "flow_runs")
--
-- IMPORTANT: Run in a transaction. Execute flows→templates FIRST to avoid name collisions.

BEGIN;

-- ============================================================================
-- Step 1: Rename tables (templates first to free up the "flows" name)
-- ============================================================================

-- Old "flows" (blueprints) → "templates"
ALTER TABLE flows RENAME TO templates;

-- Old "flow_runs" (instances) → "flows"
ALTER TABLE flow_runs RENAME TO flows;

-- Junction/child tables
ALTER TABLE flow_run_accounts RENAME TO flow_accounts;
ALTER TABLE flow_run_conversations RENAME TO flow_conversations;
ALTER TABLE flow_run_messages RENAME TO flow_messages;
ALTER TABLE flow_run_message_attachments RENAME TO flow_message_attachments;
ALTER TABLE portal_flows RENAME TO portal_templates;

-- ============================================================================
-- Step 2: Rename foreign key columns
-- ============================================================================

-- In "flows" (was flow_runs): flow_id → template_id, parent_run_id → parent_flow_id
ALTER TABLE flows RENAME COLUMN flow_id TO template_id;
ALTER TABLE flows RENAME COLUMN parent_run_id TO parent_flow_id;

-- In "portal_templates" (was portal_flows): flow_id → template_id
ALTER TABLE portal_templates RENAME COLUMN flow_id TO template_id;

-- In "schedules": flow_id → template_id
ALTER TABLE schedules RENAME COLUMN flow_id TO template_id;

-- In "webhook_endpoints": flow_id → template_id
ALTER TABLE webhook_endpoints RENAME COLUMN flow_id TO template_id;

-- In "step_executions": flow_run_id → flow_id
ALTER TABLE step_executions RENAME COLUMN flow_run_id TO flow_id;

-- In "audit_logs": flow_run_id → flow_id
ALTER TABLE audit_logs RENAME COLUMN flow_run_id TO flow_id;

-- In "notifications": flow_run_id → flow_id
ALTER TABLE notifications RENAME COLUMN flow_run_id TO flow_id;

-- In "notification_log": flow_run_id → flow_id
ALTER TABLE notification_log RENAME COLUMN flow_run_id TO flow_id;

-- In "flow_accounts" (was flow_run_accounts): flow_run_id → flow_id
ALTER TABLE flow_accounts RENAME COLUMN flow_run_id TO flow_id;

-- In "flow_conversations" (was flow_run_conversations): flow_run_id → flow_id
ALTER TABLE flow_conversations RENAME COLUMN flow_run_id TO flow_id;

-- In "flow_messages" (was flow_run_messages): flow_run_id → flow_id
ALTER TABLE flow_messages RENAME COLUMN flow_run_id TO flow_id;

-- In "files": flow_run_id → flow_id
ALTER TABLE files RENAME COLUMN flow_run_id TO flow_id;

-- ============================================================================
-- Step 3: Rename indexes
-- ============================================================================

ALTER INDEX IF EXISTS portal_flow_unique RENAME TO portal_template_unique;

COMMIT;
