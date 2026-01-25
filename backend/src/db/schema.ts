/**
 * Database Schema for AI Flow SaaS
 *
 * Using Drizzle ORM with SQLite for development and PostgreSQL for production.
 * This schema defines all tables for the SaaS platform.
 */

import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Enums (stored as text in SQLite)
// ============================================================================

export type UserRole = 'ADMIN' | 'MEMBER';
export type FlowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type FlowRunStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
export type StepExecutionStatus = 'PENDING' | 'WAITING_FOR_ASSIGNEE' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type ContactType = 'ADMIN' | 'ASSIGNEE';
export type ContactStatus = 'ACTIVE' | 'INACTIVE';

// ============================================================================
// Organizations
// ============================================================================

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// Users
// ============================================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  role: text('role').$type<UserRole>().default('MEMBER').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// Flows (Workflow Templates)
// ============================================================================

export const flows = sqliteTable('flows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').default('1.0').notNull(),
  status: text('status').$type<FlowStatus>().default('DRAFT').notNull(),
  definition: text('definition', { mode: 'json' }).$type<Record<string, unknown>>(), // Full workflow JSON
  createdById: text('created_by_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// Flow Runs (Workflow Instances)
// ============================================================================

export const flowRuns = sqliteTable('flow_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowId: text('flow_id').notNull().references(() => flows.id),
  name: text('name').notNull(), // e.g., "TechNova Solutions - SOC 2 Type II"
  status: text('status').$type<FlowRunStatus>().default('IN_PROGRESS').notNull(),
  currentStepIndex: integer('current_step_index').default(0).notNull(),
  startedById: text('started_by_id').notNull().references(() => users.id),
  startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// ============================================================================
// Contacts (External Assignees)
// ============================================================================

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  name: text('name').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type').$type<ContactType>().default('ASSIGNEE').notNull(),
  status: text('status').$type<ContactStatus>().default('ACTIVE').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// Step Executions (Individual Step Progress)
// ============================================================================

export const stepExecutions = sqliteTable('step_executions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  stepId: text('step_id').notNull(), // References step in flow definition
  stepIndex: integer('step_index').notNull(),
  status: text('status').$type<StepExecutionStatus>().default('PENDING').notNull(),
  assignedToUserId: text('assigned_to_user_id').references(() => users.id),
  assignedToContactId: text('assigned_to_contact_id').references(() => contacts.id),
  resultData: text('result_data', { mode: 'json' }).$type<Record<string, unknown>>(), // Form responses, approval decision, etc.
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  completedById: text('completed_by_id'),
});

// ============================================================================
// Magic Links (Token-based Access for Assignees)
// ============================================================================

export const magicLinks = sqliteTable('magic_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text('token').notNull().unique().$defaultFn(() => crypto.randomUUID()),
  stepExecutionId: text('step_execution_id').notNull().unique().references(() => stepExecutions.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// Audit Logs (Activity Tracking)
// ============================================================================

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  action: text('action').notNull(), // e.g., "STEP_COMPLETED", "RUN_STARTED"
  actorId: text('actor_id'),
  actorEmail: text('actor_email'),
  details: text('details', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// Relations (for Drizzle query builder)
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  flows: many(flows),
  contacts: many(contacts),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  flowsCreated: many(flows),
  flowRunsStarted: many(flowRuns),
  stepExecutions: many(stepExecutions),
}));

export const flowsRelations = relations(flows, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [flows.createdById],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [flows.organizationId],
    references: [organizations.id],
  }),
  runs: many(flowRuns),
}));

export const flowRunsRelations = relations(flowRuns, ({ one, many }) => ({
  flow: one(flows, {
    fields: [flowRuns.flowId],
    references: [flows.id],
  }),
  startedBy: one(users, {
    fields: [flowRuns.startedById],
    references: [users.id],
  }),
  stepExecutions: many(stepExecutions),
  auditLogs: many(auditLogs),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  stepExecutions: many(stepExecutions),
}));

export const stepExecutionsRelations = relations(stepExecutions, ({ one }) => ({
  flowRun: one(flowRuns, {
    fields: [stepExecutions.flowRunId],
    references: [flowRuns.id],
  }),
  assignedToUser: one(users, {
    fields: [stepExecutions.assignedToUserId],
    references: [users.id],
  }),
  assignedToContact: one(contacts, {
    fields: [stepExecutions.assignedToContactId],
    references: [contacts.id],
  }),
  magicLink: one(magicLinks, {
    fields: [stepExecutions.id],
    references: [magicLinks.stepExecutionId],
  }),
}));

export const magicLinksRelations = relations(magicLinks, ({ one }) => ({
  stepExecution: one(stepExecutions, {
    fields: [magicLinks.stepExecutionId],
    references: [stepExecutions.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  flowRun: one(flowRuns, {
    fields: [auditLogs.flowRunId],
    references: [flowRuns.id],
  }),
}));
