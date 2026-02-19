/**
 * Database Schema for AI Flow SaaS
 *
 * Using Drizzle ORM with PostgreSQL.
 * This schema defines all tables for the SaaS platform.
 */

import { pgTable, text, integer, timestamp, jsonb, uniqueIndex, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Enums (stored as text in PostgreSQL)
// ============================================================================

export type UserRole = 'ADMIN' | 'MEMBER';
export type FlowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type FlowRunStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
export type StepExecutionStatus = 'PENDING' | 'WAITING_FOR_ASSIGNEE' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type ContactType = 'ADMIN' | 'ASSIGNEE';
export type ContactStatus = 'ACTIVE' | 'INACTIVE';
export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'SLACK' | 'WEBHOOK';
export type NotificationStatus = 'SENT' | 'FAILED' | 'SKIPPED';
export type DigestFrequency = 'NONE' | 'DAILY' | 'WEEKLY';

// ============================================================================
// Organizations
// ============================================================================

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Users
// ============================================================================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  activeOrganizationId: text('active_organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// User-Organization Memberships (many-to-many with role)
// ============================================================================

export const userOrganizations = pgTable('user_organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  role: text('role').$type<UserRole>().default('MEMBER').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_org_unique').on(table.userId, table.organizationId),
]);

// ============================================================================
// Organization Invites
// ============================================================================

export const organizationInvites = pgTable('organization_invites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  email: text('email').notNull(),
  role: text('role').$type<UserRole>().default('MEMBER').notNull(),
  token: text('token').notNull().unique().$defaultFn(() => crypto.randomUUID()),
  invitedById: text('invited_by_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Flows (Workflow Templates)
// ============================================================================

export const flows = pgTable('flows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').default('1.0').notNull(),
  status: text('status').$type<FlowStatus>().default('DRAFT').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  definition: jsonb('definition').$type<Record<string, unknown>>(),
  createdById: text('created_by_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Flow Runs (Workflow Instances)
// ============================================================================

export const flowRuns = pgTable('flow_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowId: text('flow_id').notNull().references(() => flows.id),
  name: text('name').notNull(),
  status: text('status').$type<FlowRunStatus>().default('IN_PROGRESS').notNull(),
  isSample: boolean('is_sample').default(false).notNull(),
  currentStepIndex: integer('current_step_index').default(0).notNull(),
  startedById: text('started_by_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  dueAt: timestamp('due_at'),
  lastActivityAt: timestamp('last_activity_at'),
});

// ============================================================================
// Contacts (External Assignees)
// ============================================================================

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  name: text('name').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type').$type<ContactType>().default('ASSIGNEE').notNull(),
  status: text('status').$type<ContactStatus>().default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Step Executions (Individual Step Progress)
// ============================================================================

export const stepExecutions = pgTable('step_executions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  stepId: text('step_id').notNull(),
  stepIndex: integer('step_index').notNull(),
  status: text('status').$type<StepExecutionStatus>().default('PENDING').notNull(),
  assignedToUserId: text('assigned_to_user_id').references(() => users.id),
  assignedToContactId: text('assigned_to_contact_id').references(() => contacts.id),
  resultData: jsonb('result_data').$type<Record<string, unknown>>(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  completedById: text('completed_by_id'),
  dueAt: timestamp('due_at'),
  lastReminderSentAt: timestamp('last_reminder_sent_at'),
  reminderCount: integer('reminder_count').default(0).notNull(),
  escalatedAt: timestamp('escalated_at'),
});

// ============================================================================
// Magic Links (Token-based Access for Assignees)
// ============================================================================

export const magicLinks = pgTable('magic_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text('token').notNull().unique().$defaultFn(() => crypto.randomUUID()),
  stepExecutionId: text('step_execution_id').notNull().unique().references(() => stepExecutions.id),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Audit Logs (Activity Tracking)
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  action: text('action').notNull(),
  actorId: text('actor_id'),
  actorEmail: text('actor_email'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Notifications (In-App Notification Feed)
// ============================================================================

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  flowRunId: text('flow_run_id').references(() => flowRuns.id),
  stepExecutionId: text('step_execution_id').references(() => stepExecutions.id),
  readAt: timestamp('read_at'),
  dismissedAt: timestamp('dismissed_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Notification Log (Audit Trail of All Sent Notifications)
// ============================================================================

export const notificationLog = pgTable('notification_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  recipientEmail: text('recipient_email'),
  recipientUserId: text('recipient_user_id').references(() => users.id),
  channel: text('channel').$type<NotificationChannel>().notNull(),
  eventType: text('event_type').notNull(),
  flowRunId: text('flow_run_id').references(() => flowRuns.id),
  stepExecutionId: text('step_execution_id').references(() => stepExecutions.id),
  status: text('status').$type<NotificationStatus>().notNull(),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// ============================================================================
// User Notification Preferences
// ============================================================================

export const userNotificationPrefs = pgTable('user_notification_prefs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
  mutedEventTypes: jsonb('muted_event_types').$type<string[]>().default([]),
  digestFrequency: text('digest_frequency').$type<DigestFrequency>().default('NONE').notNull(),
}, (table) => [
  uniqueIndex('user_notif_prefs_unique').on(table.userId, table.organizationId),
]);

// ============================================================================
// Relations (for Drizzle query builder)
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  userOrganizations: many(userOrganizations),
  flows: many(flows),
  contacts: many(contacts),
  flowRuns: many(flowRuns),
  invites: many(organizationInvites),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  activeOrganization: one(organizations, {
    fields: [users.activeOrganizationId],
    references: [organizations.id],
  }),
  userOrganizations: many(userOrganizations),
  flowsCreated: many(flows),
  flowRunsStarted: many(flowRuns),
  stepExecutions: many(stepExecutions),
  notifications: many(notifications),
  notificationPrefs: many(userNotificationPrefs),
}));

export const userOrganizationsRelations = relations(userOrganizations, ({ one }) => ({
  user: one(users, {
    fields: [userOrganizations.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userOrganizations.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationInvitesRelations = relations(organizationInvites, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationInvites.organizationId],
    references: [organizations.id],
  }),
  invitedBy: one(users, {
    fields: [organizationInvites.invitedById],
    references: [users.id],
  }),
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
  organization: one(organizations, {
    fields: [flowRuns.organizationId],
    references: [organizations.id],
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  flowRun: one(flowRuns, {
    fields: [notifications.flowRunId],
    references: [flowRuns.id],
  }),
  stepExecution: one(stepExecutions, {
    fields: [notifications.stepExecutionId],
    references: [stepExecutions.id],
  }),
}));

export const notificationLogRelations = relations(notificationLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [notificationLog.organizationId],
    references: [organizations.id],
  }),
  recipientUser: one(users, {
    fields: [notificationLog.recipientUserId],
    references: [users.id],
  }),
  flowRun: one(flowRuns, {
    fields: [notificationLog.flowRunId],
    references: [flowRuns.id],
  }),
  stepExecution: one(stepExecutions, {
    fields: [notificationLog.stepExecutionId],
    references: [stepExecutions.id],
  }),
}));

export const userNotificationPrefsRelations = relations(userNotificationPrefs, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationPrefs.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userNotificationPrefs.organizationId],
    references: [organizations.id],
  }),
}));
