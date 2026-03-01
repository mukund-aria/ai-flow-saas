/**
 * Database Schema for ServiceFlow
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
export type ContactType = 'ADMIN' | 'MEMBER' | 'ASSIGNEE';
export type ContactStatus = 'ACTIVE' | 'INACTIVE';
export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'SLACK' | 'WEBHOOK';
export type NotificationStatus = 'SENT' | 'FAILED' | 'SKIPPED';
export type DigestFrequency = 'NONE' | 'DAILY' | 'WEEKLY';
export type WebhookEndpointType = 'INCOMING' | 'OUTGOING';
export type IntegrationType = 'SLACK_WEBHOOK' | 'TEAMS_WEBHOOK' | 'CUSTOM_WEBHOOK';
export type EmailTemplateType = 'TASK_ASSIGNED' | 'TASK_REMINDER' | 'FLOW_COMPLETED';
export type FlowRunAccountSource = 'AUTO' | 'MANUAL';
export type CompletionMode = 'ANY_ONE' | 'ALL' | 'MAJORITY';
export type RoleCompletionMode = 'ALL_ROLES' | 'SEQUENTIAL';
export type StepExecutionAssigneeStatus = 'PENDING' | 'COMPLETED';

// ============================================================================
// Organizations
// ============================================================================

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  brandingConfig: jsonb('branding_config').$type<{
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    companyName?: string;
    faviconUrl?: string;
    emailFooter?: string;
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Accounts (Companies, Clients, Vendors)
// ============================================================================

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  domain: text('domain'),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Portals (Named entry points for assignee groups)
// ============================================================================

export const portals = pgTable('portals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  settings: jsonb('settings').$type<{
    flowExperience?: { headerImage?: string; viewMode?: string; welcomeMessage?: string };
    startLink?: { initTitle?: string; initSubtitle?: string; startButtonLabel?: string; completedImage?: string; completedTitle?: string; completedSubtitle?: string };
    allowSelfServiceFlowStart?: boolean;
    showWorkspaceSummary?: boolean;
  }>(),
  brandingOverrides: jsonb('branding_overrides').$type<{
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    companyName?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('portal_org_slug_unique').on(table.organizationId, table.slug),
]);

// ============================================================================
// Portal Flows (Junction: which flows are in a portal's self-service catalog)
// ============================================================================

export const portalFlows = pgTable('portal_flows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  portalId: text('portal_id').notNull().references(() => portals.id),
  flowId: text('flow_id').notNull().references(() => flows.id),
  displayTitle: text('display_title'),
  displayDescription: text('display_description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
}, (table) => [
  uniqueIndex('portal_flow_unique').on(table.portalId, table.flowId),
]);

// ============================================================================
// Email Templates (Custom email copy per org, optionally per portal)
// ============================================================================

export const emailTemplates = pgTable('email_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  portalId: text('portal_id').references(() => portals.id),
  templateType: text('template_type').$type<EmailTemplateType>().notNull(),
  subject: text('subject').notNull(),
  heading: text('heading').notNull(),
  body: text('body').notNull(),
  buttonLabel: text('button_label'),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('email_template_unique').on(table.organizationId, table.portalId, table.templateType),
]);

// ============================================================================
// Assignee Sessions (Portal-authenticated assignee sessions)
// ============================================================================

export const assigneeSessions = pgTable('assignee_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  portalId: text('portal_id').notNull().references(() => portals.id),
  token: text('token').notNull().unique().$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp('expires_at').notNull(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
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
// Template Folders
// ============================================================================

export const templateFolders = pgTable('template_folders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  folderId: text('folder_id').references(() => templateFolders.id),
  templateCoordinatorIds: jsonb('template_coordinator_ids').$type<string[]>().default([]),
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
  roleAssignments: jsonb('role_assignments').$type<Record<string, string>>(),
  kickoffData: jsonb('kickoff_data').$type<Record<string, unknown>>(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  dueAt: timestamp('due_at'),
  lastActivityAt: timestamp('last_activity_at'),
  parentRunId: text('parent_run_id'),
  parentStepExecutionId: text('parent_step_execution_id'),
  portalId: text('portal_id').references(() => portals.id),
  startedByContactId: text('started_by_contact_id').references(() => contacts.id),
});

// ============================================================================
// Contacts (External Assignees)
// ============================================================================

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  name: text('name').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  portalId: text('portal_id').references(() => portals.id),
  accountId: text('account_id').references(() => accounts.id),
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
  isGroupAssignment: boolean('is_group_assignment').default(false).notNull(),
  completionMode: text('completion_mode').$type<CompletionMode>().default('ANY_ONE'),
  roleCompletionMode: text('role_completion_mode').$type<RoleCompletionMode>().default('ALL_ROLES'),
  resultData: jsonb('result_data').$type<Record<string, unknown>>(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  completedById: text('completed_by_id'),
  dueAt: timestamp('due_at'),
  lastReminderSentAt: timestamp('last_reminder_sent_at'),
  reminderCount: integer('reminder_count').default(0).notNull(),
  escalatedAt: timestamp('escalated_at'),
  branchPath: text('branch_path'),
  parallelGroupId: text('parallel_group_id'),
  dynamicIndex: integer('dynamic_index'),
  slaBreachedAt: timestamp('sla_breached_at'),
  timeToComplete: integer('time_to_complete'),
});

// ============================================================================
// Magic Links (Token-based Access for Assignees)
// ============================================================================

export const magicLinks = pgTable('magic_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text('token').notNull().unique().$defaultFn(() => crypto.randomUUID()),
  stepExecutionId: text('step_execution_id').notNull().references(() => stepExecutions.id),
  stepExecutionAssigneeId: text('step_execution_assignee_id'),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Flow Run Accounts (Many-to-many: Flow Runs ↔ Accounts)
// ============================================================================

export const flowRunAccounts = pgTable('flow_run_accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  source: text('source').$type<FlowRunAccountSource>().default('MANUAL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Contact Groups (Reusable assignment lists)
// ============================================================================

export const contactGroups = pgTable('contact_groups', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  defaultCompletionMode: text('default_completion_mode').$type<CompletionMode>().default('ANY_ONE').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Contact Group Members (Junction: contacts/users in a group)
// ============================================================================

export const contactGroupMembers = pgTable('contact_group_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text('group_id').notNull().references(() => contactGroups.id),
  contactId: text('contact_id').references(() => contacts.id),
  userId: text('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Step Execution Assignees (Individual assignees for group-assigned steps)
// ============================================================================

export const stepExecutionAssignees = pgTable('step_execution_assignees', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  stepExecutionId: text('step_execution_id').notNull().references(() => stepExecutions.id),
  contactId: text('contact_id').references(() => contacts.id),
  userId: text('user_id').references(() => users.id),
  status: text('status').$type<StepExecutionAssigneeStatus>().default('PENDING').notNull(),
  resultData: jsonb('result_data').$type<Record<string, unknown>>(),
  completedAt: timestamp('completed_at'),
  notifiedAt: timestamp('notified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Login OTPs (Email-based Authentication)
// ============================================================================

export const loginOtps = pgTable('login_otps', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  attempts: integer('attempts').default(0).notNull(),
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
// Flow Run Conversations (In-Flow Chat)
// ============================================================================

export const flowRunConversations = pgTable('flow_run_conversations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  resolvedAt: timestamp('resolved_at'),
  resolvedByUserId: text('resolved_by_user_id').references(() => users.id),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Flow Run Messages (In-Flow Chat)
// ============================================================================

export type MessageSenderType = 'user' | 'contact';

export const flowRunMessages = pgTable('flow_run_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id').notNull().references(() => flowRunConversations.id),
  flowRunId: text('flow_run_id').notNull().references(() => flowRuns.id),
  senderUserId: text('sender_user_id').references(() => users.id),
  senderContactId: text('sender_contact_id').references(() => contacts.id),
  senderType: text('sender_type').$type<MessageSenderType>().notNull(),
  senderName: text('sender_name').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Flow Run Message Attachments
// ============================================================================

export const flowRunMessageAttachments = pgTable('flow_run_message_attachments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  messageId: text('message_id').notNull().references(() => flowRunMessages.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
// Files (Cloud Storage Metadata)
// ============================================================================

export const files = pgTable('files', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  flowRunId: text('flow_run_id').references(() => flowRuns.id),
  stepExecutionId: text('step_execution_id').references(() => stepExecutions.id),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  storageKey: text('storage_key').notNull(),
  uploadedByContactId: text('uploaded_by_contact_id').references(() => contacts.id),
  uploadedByUserId: text('uploaded_by_user_id').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Schedules (Persistent Cron Schedules)
// ============================================================================

export const schedules = pgTable('schedules', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  flowId: text('flow_id').notNull().references(() => flows.id),
  scheduleName: text('schedule_name').notNull(),
  cronPattern: text('cron_pattern').notNull(),
  timezone: text('timezone').default('UTC').notNull(),
  roleAssignments: jsonb('role_assignments').$type<Record<string, unknown>>(),
  kickoffData: jsonb('kickoff_data').$type<Record<string, unknown>>(),
  enabled: boolean('enabled').default(true).notNull(),
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  createdByUserId: text('created_by_user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Webhook Endpoints (Incoming/Outgoing)
// ============================================================================

export const webhookEndpoints = pgTable('webhook_endpoints', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowId: text('flow_id').notNull().references(() => flows.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type').$type<WebhookEndpointType>().notNull(),
  url: text('url'),
  secret: text('secret').notNull().$defaultFn(() => crypto.randomUUID()),
  events: jsonb('events').$type<string[]>(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Integrations (Slack/Teams/Custom Webhooks)
// ============================================================================

export const integrations = pgTable('integrations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type').$type<IntegrationType>().notNull(),
  name: text('name').notNull(),
  config: jsonb('config').$type<{
    webhookUrl?: string;
    channel?: string;
    events?: string[];
    [key: string]: unknown;
  }>().notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  lastDeliveryAt: timestamp('last_delivery_at'),
  lastDeliveryStatus: text('last_delivery_status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Sandbox Flows (Ephemeral public flows for viral onboarding)
// ============================================================================

export const sandboxFlows = pgTable('sandbox_flows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  definition: jsonb('definition').$type<Record<string, unknown>>(),
  prompt: text('prompt').notNull(),
  sessionId: text('session_id'),
  expiresAt: timestamp('expires_at').notNull(),
  claimedByUserId: text('claimed_by_user_id'),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// System Config (Platform-level settings managed by sysadmins)
// ============================================================================

export const systemConfig = pgTable('system_config', {
  id: text('id').primaryKey().default('global'),
  allowedEmails: text('allowed_emails'),
  globalFlags: jsonb('global_flags').$type<Record<string, unknown>>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: text('updated_by'),
});

// ============================================================================
// Relations (for Drizzle query builder)
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  userOrganizations: many(userOrganizations),
  flows: many(flows),
  contacts: many(contacts),
  flowRuns: many(flowRuns),
  invites: many(organizationInvites),
  templateFolders: many(templateFolders),
  portals: many(portals),
  emailTemplates: many(emailTemplates),
  assigneeSessions: many(assigneeSessions),
  accounts: many(accounts),
  contactGroups: many(contactGroups),
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

export const templateFoldersRelations = relations(templateFolders, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [templateFolders.organizationId],
    references: [organizations.id],
  }),
  templates: many(flows),
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
  folder: one(templateFolders, {
    fields: [flows.folderId],
    references: [templateFolders.id],
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
  portal: one(portals, {
    fields: [flowRuns.portalId],
    references: [portals.id],
  }),
  startedByContact: one(contacts, {
    fields: [flowRuns.startedByContactId],
    references: [contacts.id],
  }),
  stepExecutions: many(stepExecutions),
  auditLogs: many(auditLogs),
  flowRunAccounts: many(flowRunAccounts),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  portal: one(portals, {
    fields: [contacts.portalId],
    references: [portals.id],
  }),
  account: one(accounts, {
    fields: [contacts.accountId],
    references: [accounts.id],
  }),
  stepExecutions: many(stepExecutions),
  assigneeSessions: many(assigneeSessions),
}));

export const stepExecutionsRelations = relations(stepExecutions, ({ one, many }) => ({
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
  assignees: many(stepExecutionAssignees),
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

// ============================================================================
// Chat Relations
// ============================================================================

export const flowRunConversationsRelations = relations(flowRunConversations, ({ one, many }) => ({
  flowRun: one(flowRuns, {
    fields: [flowRunConversations.flowRunId],
    references: [flowRuns.id],
  }),
  contact: one(contacts, {
    fields: [flowRunConversations.contactId],
    references: [contacts.id],
  }),
  resolvedBy: one(users, {
    fields: [flowRunConversations.resolvedByUserId],
    references: [users.id],
  }),
  messages: many(flowRunMessages),
}));

export const flowRunMessagesRelations = relations(flowRunMessages, ({ one, many }) => ({
  conversation: one(flowRunConversations, {
    fields: [flowRunMessages.conversationId],
    references: [flowRunConversations.id],
  }),
  flowRun: one(flowRuns, {
    fields: [flowRunMessages.flowRunId],
    references: [flowRuns.id],
  }),
  senderUser: one(users, {
    fields: [flowRunMessages.senderUserId],
    references: [users.id],
  }),
  senderContact: one(contacts, {
    fields: [flowRunMessages.senderContactId],
    references: [contacts.id],
  }),
  attachments: many(flowRunMessageAttachments),
}));

export const flowRunMessageAttachmentsRelations = relations(flowRunMessageAttachments, ({ one }) => ({
  message: one(flowRunMessages, {
    fields: [flowRunMessageAttachments.messageId],
    references: [flowRunMessages.id],
  }),
}));

// ============================================================================
// New Table Relations
// ============================================================================

export const filesRelations = relations(files, ({ one }) => ({
  organization: one(organizations, {
    fields: [files.organizationId],
    references: [organizations.id],
  }),
  flowRun: one(flowRuns, {
    fields: [files.flowRunId],
    references: [flowRuns.id],
  }),
  stepExecution: one(stepExecutions, {
    fields: [files.stepExecutionId],
    references: [stepExecutions.id],
  }),
  uploadedByContact: one(contacts, {
    fields: [files.uploadedByContactId],
    references: [contacts.id],
  }),
  uploadedByUser: one(users, {
    fields: [files.uploadedByUserId],
    references: [users.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  organization: one(organizations, {
    fields: [schedules.organizationId],
    references: [organizations.id],
  }),
  flow: one(flows, {
    fields: [schedules.flowId],
    references: [flows.id],
  }),
  createdBy: one(users, {
    fields: [schedules.createdByUserId],
    references: [users.id],
  }),
}));

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one }) => ({
  flow: one(flows, {
    fields: [webhookEndpoints.flowId],
    references: [flows.id],
  }),
  organization: one(organizations, {
    fields: [webhookEndpoints.organizationId],
    references: [organizations.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  organization: one(organizations, {
    fields: [integrations.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// Portal Relations
// ============================================================================

export const portalsRelations = relations(portals, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [portals.organizationId],
    references: [organizations.id],
  }),
  portalFlows: many(portalFlows),
  contacts: many(contacts),
  emailTemplates: many(emailTemplates),
  assigneeSessions: many(assigneeSessions),
}));

export const portalFlowsRelations = relations(portalFlows, ({ one }) => ({
  portal: one(portals, {
    fields: [portalFlows.portalId],
    references: [portals.id],
  }),
  flow: one(flows, {
    fields: [portalFlows.flowId],
    references: [flows.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [emailTemplates.organizationId],
    references: [organizations.id],
  }),
  portal: one(portals, {
    fields: [emailTemplates.portalId],
    references: [portals.id],
  }),
}));

export const assigneeSessionsRelations = relations(assigneeSessions, ({ one }) => ({
  contact: one(contacts, {
    fields: [assigneeSessions.contactId],
    references: [contacts.id],
  }),
  organization: one(organizations, {
    fields: [assigneeSessions.organizationId],
    references: [organizations.id],
  }),
  portal: one(portals, {
    fields: [assigneeSessions.portalId],
    references: [portals.id],
  }),
}));

// ============================================================================
// Account Relations
// ============================================================================

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.id],
  }),
  contacts: many(contacts),
  flowRunAccounts: many(flowRunAccounts),
}));

export const flowRunAccountsRelations = relations(flowRunAccounts, ({ one }) => ({
  flowRun: one(flowRuns, {
    fields: [flowRunAccounts.flowRunId],
    references: [flowRuns.id],
  }),
  account: one(accounts, {
    fields: [flowRunAccounts.accountId],
    references: [accounts.id],
  }),
}));

// ============================================================================
// Contact Group Relations
// ============================================================================

export const contactGroupsRelations = relations(contactGroups, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contactGroups.organizationId],
    references: [organizations.id],
  }),
  members: many(contactGroupMembers),
}));

export const contactGroupMembersRelations = relations(contactGroupMembers, ({ one }) => ({
  group: one(contactGroups, {
    fields: [contactGroupMembers.groupId],
    references: [contactGroups.id],
  }),
  contact: one(contacts, {
    fields: [contactGroupMembers.contactId],
    references: [contacts.id],
  }),
  user: one(users, {
    fields: [contactGroupMembers.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Step Execution Assignee Relations
// ============================================================================

export const stepExecutionAssigneesRelations = relations(stepExecutionAssignees, ({ one }) => ({
  stepExecution: one(stepExecutions, {
    fields: [stepExecutionAssignees.stepExecutionId],
    references: [stepExecutions.id],
  }),
  contact: one(contacts, {
    fields: [stepExecutionAssignees.contactId],
    references: [contacts.id],
  }),
  user: one(users, {
    fields: [stepExecutionAssignees.userId],
    references: [users.id],
  }),
}));

export const magicLinksRelations = relations(magicLinks, ({ one }) => ({
  stepExecution: one(stepExecutions, {
    fields: [magicLinks.stepExecutionId],
    references: [stepExecutions.id],
  }),
  stepExecutionAssignee: one(stepExecutionAssignees, {
    fields: [magicLinks.stepExecutionAssigneeId],
    references: [stepExecutionAssignees.id],
  }),
}));
