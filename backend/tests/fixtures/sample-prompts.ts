/**
 * Sample User Prompts for AI Workflow Builder Testing
 *
 * These prompts simulate real business user input for testing the AI workflow
 * builder across various business process use cases. Includes create, edit,
 * and intentionally vague prompts that should trigger clarification.
 */

export interface TestPrompt {
  category: string;
  name: string;
  prompt: string;
  expectedStepTypes?: string[];
  complexity: 'simple' | 'medium' | 'complex';
  expectedMode?: 'create' | 'edit' | 'clarify' | 'reject';
}

// =============================================================================
// CLIENT ONBOARDING PROMPTS
// =============================================================================

const clientOnboardingPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Client Onboarding',
    name: 'basic-intake-form',
    prompt: 'I need a basic client intake form',
    expectedStepTypes: ['FORM'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Client Onboarding',
    name: 'simple-onboarding',
    prompt: 'Create a simple new client onboarding workflow',
    expectedStepTypes: ['FORM', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Client Onboarding',
    name: 'kyc-verification-flow',
    prompt:
      'Create a workflow for new client onboarding with KYC verification, document collection, and final approval from the compliance team',
    expectedStepTypes: ['FORM', 'FILE_REQUEST', 'APPROVAL', 'DECISION'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Client Onboarding',
    name: 'wealth-management-onboarding',
    prompt:
      'I need a client onboarding process for our wealth management firm. Should collect personal info, risk tolerance questionnaire, upload ID documents, then route to advisor for review before compliance signs off.',
    expectedStepTypes: ['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'APPROVAL'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Client Onboarding',
    name: 'full-kyc-aml-flow',
    prompt:
      'Build a comprehensive client onboarding workflow for our financial services firm. Start with a kickoff form to capture basic client info. Then collect KYC documents including government ID and proof of address. Run AML screening using our webhook integration. If screening passes, send to relationship manager for review. If fails, escalate to compliance officer who can approve, reject, or request more documents. Once approved, send welcome email and create the client account.',
    expectedStepTypes: [
      'FORM',
      'FILE_REQUEST',
      'SYSTEM_WEBHOOK',
      'DECISION',
      'SINGLE_CHOICE_BRANCH',
      'APPROVAL',
      'SYSTEM_EMAIL',
      'TERMINATE',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Client Onboarding',
    name: 'multi-tier-client-onboarding',
    prompt:
      'We have three types of clients: individual, small business, and enterprise. I need an onboarding flow that asks the client type first, then branches to collect different information for each. Individual needs basic ID, small business needs EIN and operating agreement, enterprise needs all that plus board resolution. All paths should converge at a final compliance approval step.',
    expectedStepTypes: ['FORM', 'SINGLE_CHOICE_BRANCH', 'FILE_REQUEST', 'APPROVAL'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Client Onboarding',
    name: 'add-manager-approval',
    prompt: 'Add a step for manager approval before sending to compliance',
    expectedStepTypes: ['APPROVAL'],
    complexity: 'simple',
    expectedMode: 'edit',
  },
  {
    category: 'Client Onboarding',
    name: 'add-document-step',
    prompt: 'Insert a document upload step after the intake form where clients upload their passport',
    expectedStepTypes: ['FILE_REQUEST'],
    complexity: 'simple',
    expectedMode: 'edit',
  },

  // Clarification-worthy (vague) requests
  {
    category: 'Client Onboarding',
    name: 'vague-client-process',
    prompt: 'I need something for new clients',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Client Onboarding',
    name: 'vague-onboarding',
    prompt: 'Can you make an onboarding thing?',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// TAX AUDIT FLOW PROMPTS
// =============================================================================

const taxAuditPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Tax Audit Flow',
    name: 'basic-document-collection',
    prompt: 'Create a simple workflow to collect tax documents from clients',
    expectedStepTypes: ['FILE_REQUEST'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Tax Audit Flow',
    name: 'simple-audit-review',
    prompt: 'I need a workflow where we request documents, review them, and approve',
    expectedStepTypes: ['FILE_REQUEST', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Tax Audit Flow',
    name: 'audit-with-stages',
    prompt:
      'Create a tax audit workflow with document collection stage, preliminary review by junior staff, then senior partner approval before finalizing',
    expectedStepTypes: ['FILE_REQUEST', 'APPROVAL', 'DECISION'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Tax Audit Flow',
    name: 'irs-audit-response',
    prompt:
      'We need a workflow to handle IRS audit responses. Client uploads the IRS notice, we request supporting documents, tax associate reviews and prepares response, partner approves, then we send to client for e-signature before submission.',
    expectedStepTypes: ['FILE_REQUEST', 'FORM', 'APPROVAL', 'ESIGN'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Tax Audit Flow',
    name: 'full-audit-lifecycle',
    prompt:
      'Build a complete tax audit workflow. Start with engagement letter that client must sign. Then collect W2s, 1099s, and prior year returns. Junior associate reviews for completeness. If documents missing, loop back to client. If complete, senior associate does technical review and can request clarifications. Partner does final review and decides to approve, request changes, or escalate to tax director. Once approved, prepare final report, get client acknowledgement, and archive.',
    expectedStepTypes: [
      'ESIGN',
      'FILE_REQUEST',
      'DECISION',
      'GOTO',
      'APPROVAL',
      'FORM',
      'ACKNOWLEDGEMENT',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Tax Audit Flow',
    name: 'multi-year-audit',
    prompt:
      'Create an audit workflow that handles multiple tax years. After initial intake, branch into parallel paths for each year being audited (up to 3 years). Each path collects year-specific documents and has its own review. All paths must complete before final partner approval.',
    expectedStepTypes: ['FORM', 'PARALLEL_BRANCH', 'FILE_REQUEST', 'APPROVAL'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Tax Audit Flow',
    name: 'add-qc-check',
    prompt: 'Add a quality control checkpoint after the associate review',
    expectedStepTypes: ['APPROVAL'],
    complexity: 'simple',
    expectedMode: 'edit',
  },
  {
    category: 'Tax Audit Flow',
    name: 'add-client-portal-step',
    prompt:
      'Add a step where we notify the client via email that their documents have been received and are under review',
    expectedStepTypes: ['SYSTEM_EMAIL'],
    complexity: 'simple',
    expectedMode: 'edit',
  },

  // Clarification-worthy requests
  {
    category: 'Tax Audit Flow',
    name: 'vague-tax-workflow',
    prompt: 'We need a tax workflow',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Tax Audit Flow',
    name: 'vague-audit-process',
    prompt: 'Make something for audits',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// CROSS-DEPARTMENT APPROVAL PROMPTS
// =============================================================================

const crossDepartmentApprovalPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Cross-Department Approval',
    name: 'basic-two-approvers',
    prompt: 'Create an approval workflow that goes to my manager then to finance',
    expectedStepTypes: ['FORM', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Cross-Department Approval',
    name: 'simple-expense-approval',
    prompt: 'I need a simple expense approval that requires manager sign-off',
    expectedStepTypes: ['FORM', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Cross-Department Approval',
    name: 'procurement-approval',
    prompt:
      'Build a procurement request workflow. Requester fills out the form with item details and cost. Goes to department head for approval. If over $5000, also needs finance director approval. Then purchasing processes the order.',
    expectedStepTypes: ['FORM', 'APPROVAL', 'DECISION', 'SINGLE_CHOICE_BRANCH'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Cross-Department Approval',
    name: 'budget-approval-chain',
    prompt:
      'Create a budget request workflow that needs approval from department manager, then finance, then if over $50k goes to CFO, otherwise skips to completion.',
    expectedStepTypes: ['FORM', 'APPROVAL', 'SINGLE_CHOICE_BRANCH'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Cross-Department Approval',
    name: 'capital-expenditure-flow',
    prompt:
      'Design a capital expenditure approval workflow. Start with a detailed request form including business justification, ROI analysis upload, and vendor quotes. Department head approves first. Then parallel approval from both Legal (for contracts) and IT (for technical review) at the same time. After both approve, goes to Finance for budget verification. If amount exceeds $100k, escalates to executive committee. Any rejection at any stage should notify requester and allow revision or cancellation.',
    expectedStepTypes: [
      'FORM',
      'FILE_REQUEST',
      'APPROVAL',
      'PARALLEL_BRANCH',
      'DECISION',
      'SYSTEM_EMAIL',
      'SINGLE_CHOICE_BRANCH',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Cross-Department Approval',
    name: 'hiring-approval-matrix',
    prompt:
      'Build a new hire approval workflow. Hiring manager submits request with job description and salary range. HR reviews for policy compliance. If standard role, department VP approves. If new position or above-band salary, needs both VP and HR Director. Executive roles need CEO approval. Once approved, HR creates job posting and begins recruitment.',
    expectedStepTypes: ['FORM', 'APPROVAL', 'DECISION', 'SINGLE_CHOICE_BRANCH'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Cross-Department Approval',
    name: 'add-escalation-path',
    prompt: 'Add an escalation path to the VP if the request sits with a manager for more than 48 hours',
    expectedStepTypes: ['WAIT', 'APPROVAL'],
    complexity: 'medium',
    expectedMode: 'edit',
  },
  {
    category: 'Cross-Department Approval',
    name: 'add-legal-review',
    prompt: 'Insert a legal review step before the final finance approval for amounts over $25k',
    expectedStepTypes: ['APPROVAL', 'SINGLE_CHOICE_BRANCH'],
    complexity: 'medium',
    expectedMode: 'edit',
  },

  // Clarification-worthy requests
  {
    category: 'Cross-Department Approval',
    name: 'vague-approval-request',
    prompt: 'I need approvals from multiple people',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Cross-Department Approval',
    name: 'vague-sign-off',
    prompt: 'Create a workflow for getting sign-offs',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// CUSTOMER IMPLEMENTATION PROMPTS
// =============================================================================

const customerImplementationPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Customer Implementation',
    name: 'basic-kickoff',
    prompt: 'Create a simple project kickoff workflow for new customers',
    expectedStepTypes: ['FORM', 'TODO'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Customer Implementation',
    name: 'simple-implementation',
    prompt: 'I need a basic customer implementation checklist workflow',
    expectedStepTypes: ['TODO', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Customer Implementation',
    name: 'saas-onboarding',
    prompt:
      'Build a SaaS customer implementation workflow. Starts with kickoff meeting scheduling, then requirements gathering form, technical setup checklist, customer training acknowledgement, and go-live approval.',
    expectedStepTypes: ['FORM', 'TODO', 'ACKNOWLEDGEMENT', 'APPROVAL'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Customer Implementation',
    name: 'implementation-with-handoffs',
    prompt:
      'Create an implementation workflow where sales hands off to implementation team, who then completes setup and hands off to customer success for ongoing support. Each handoff needs acknowledgement from receiving team.',
    expectedStepTypes: ['FORM', 'ACKNOWLEDGEMENT', 'TODO'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Customer Implementation',
    name: 'enterprise-implementation',
    prompt:
      'Design a full enterprise customer implementation workflow. Start with signed SOW upload. Then kickoff phase: schedule meeting, gather requirements, document current state. Build phase: technical team completes configuration checklist, creates test environment, customer does UAT and provides sign-off. Launch phase: go-live readiness approval from both customer and internal team, production deployment checklist, post-launch review meeting. Close phase: lessons learned form, handoff to support team, close project.',
    expectedStepTypes: [
      'FILE_REQUEST',
      'FORM',
      'TODO',
      'APPROVAL',
      'ACKNOWLEDGEMENT',
      'PARALLEL_BRANCH',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Customer Implementation',
    name: 'phased-implementation',
    prompt:
      'We do phased implementations. Create a workflow with 4 milestones: Discovery, Configuration, Testing, Go-Live. Each phase should have its own deliverables, customer approval gate, and internal quality check before proceeding to next phase. Customer can request to pause or cancel at any phase gate.',
    expectedStepTypes: ['FORM', 'TODO', 'APPROVAL', 'DECISION', 'TERMINATE'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Customer Implementation',
    name: 'add-training-milestone',
    prompt: 'Add a training milestone between configuration and go-live',
    expectedStepTypes: ['TODO', 'ACKNOWLEDGEMENT'],
    complexity: 'simple',
    expectedMode: 'edit',
  },
  {
    category: 'Customer Implementation',
    name: 'add-weekly-status',
    prompt: 'Add a weekly status update step where the project manager sends progress to the customer',
    expectedStepTypes: ['FORM', 'SYSTEM_EMAIL'],
    complexity: 'simple',
    expectedMode: 'edit',
  },

  // Clarification-worthy requests
  {
    category: 'Customer Implementation',
    name: 'vague-project-workflow',
    prompt: 'I need a workflow for customer projects',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Customer Implementation',
    name: 'vague-implementation',
    prompt: 'Create an implementation process',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// LOAN PROCESSING PROMPTS
// =============================================================================

const loanProcessingPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Loan Processing',
    name: 'basic-loan-application',
    prompt: 'Create a simple loan application intake form',
    expectedStepTypes: ['FORM'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Loan Processing',
    name: 'simple-approval-flow',
    prompt: 'I need a basic loan request with underwriter approval',
    expectedStepTypes: ['FORM', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Loan Processing',
    name: 'mortgage-application',
    prompt:
      'Build a mortgage application workflow. Collect application info and income documents. Underwriter reviews and can approve, deny, or request more info. If approved, schedule closing and collect final signatures.',
    expectedStepTypes: ['FORM', 'FILE_REQUEST', 'DECISION', 'ESIGN'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Loan Processing',
    name: 'business-loan-process',
    prompt:
      'Create a business loan workflow. Application form with business details, upload financial statements and tax returns, credit check via our API, loan officer review, and senior underwriter approval for loans over $250k.',
    expectedStepTypes: ['FORM', 'FILE_REQUEST', 'SYSTEM_WEBHOOK', 'APPROVAL', 'DECISION'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Loan Processing',
    name: 'full-mortgage-lifecycle',
    prompt:
      'Design a complete mortgage processing workflow. Pre-qualification: basic info form and soft credit pull via API. Application: full application, income verification docs, asset statements, property info. Processing: automated document verification, manual review by processor, underwriter decision (approve/deny/conditions). If conditions, loop back for additional docs. Approved goes to closing: title search, appraisal scheduling, prepare closing docs, schedule closing, execute e-signatures, fund loan. Post-closing: record documents, welcome package, servicing transfer notification.',
    expectedStepTypes: [
      'FORM',
      'SYSTEM_WEBHOOK',
      'FILE_REQUEST',
      'DECISION',
      'GOTO',
      'APPROVAL',
      'TODO',
      'ESIGN',
      'SYSTEM_EMAIL',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Loan Processing',
    name: 'multi-product-lending',
    prompt:
      'Create a lending workflow that supports multiple products. After initial application, branch based on loan type: personal, auto, or home equity. Each has different document requirements and approval levels. Personal under $10k is auto-approved if credit score passes. Auto needs vehicle info and dealer verification. Home equity needs property valuation. All converge at final closing.',
    expectedStepTypes: ['FORM', 'SINGLE_CHOICE_BRANCH', 'FILE_REQUEST', 'SYSTEM_WEBHOOK', 'APPROVAL'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Loan Processing',
    name: 'add-fraud-check',
    prompt: 'Add a fraud verification step using our third-party API before underwriting',
    expectedStepTypes: ['SYSTEM_WEBHOOK'],
    complexity: 'simple',
    expectedMode: 'edit',
  },
  {
    category: 'Loan Processing',
    name: 'add-co-borrower',
    prompt:
      'Add a branch where if there is a co-borrower, we collect their information and documents too',
    expectedStepTypes: ['SINGLE_CHOICE_BRANCH', 'FORM', 'FILE_REQUEST'],
    complexity: 'medium',
    expectedMode: 'edit',
  },

  // Clarification-worthy requests
  {
    category: 'Loan Processing',
    name: 'vague-loan-workflow',
    prompt: 'We need a loan process',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Loan Processing',
    name: 'vague-lending-request',
    prompt: 'Create something for our lending team',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// EMPLOYEE ONBOARDING PROMPTS
// =============================================================================

const employeeOnboardingPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Employee Onboarding',
    name: 'basic-hr-paperwork',
    prompt: 'Create a new hire paperwork collection workflow',
    expectedStepTypes: ['FORM', 'FILE_REQUEST'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Employee Onboarding',
    name: 'simple-onboarding-checklist',
    prompt: 'I need a basic employee onboarding checklist',
    expectedStepTypes: ['TODO', 'ACKNOWLEDGEMENT'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Employee Onboarding',
    name: 'new-hire-process',
    prompt:
      'Build an employee onboarding workflow. Collect personal info and tax forms. IT sets up accounts and equipment. Manager schedules orientation. New hire acknowledges receipt of employee handbook.',
    expectedStepTypes: ['FORM', 'FILE_REQUEST', 'TODO', 'ACKNOWLEDGEMENT'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Employee Onboarding',
    name: 'hr-compliance-onboarding',
    prompt:
      'Create an HR onboarding workflow with I-9 verification, W-4 collection, direct deposit setup, benefits enrollment form, and emergency contact information. HR must verify each section.',
    expectedStepTypes: ['FORM', 'FILE_REQUEST', 'APPROVAL'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Employee Onboarding',
    name: 'full-employee-onboarding',
    prompt:
      'Design a comprehensive employee onboarding workflow. Pre-start: HR sends offer, candidate accepts via e-sign, background check via API, results reviewed. Day 1: personal info form, tax documents, policy acknowledgements, IT equipment checklist, security badge request. First week: manager assigns buddy, schedule training sessions, complete compliance training modules with quiz. First month: 30-day check-in form from manager, goal setting meeting, probation review at 90 days.',
    expectedStepTypes: [
      'SYSTEM_EMAIL',
      'ESIGN',
      'SYSTEM_WEBHOOK',
      'DECISION',
      'FORM',
      'FILE_REQUEST',
      'ACKNOWLEDGEMENT',
      'TODO',
      'QUESTIONNAIRE',
      'APPROVAL',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Employee Onboarding',
    name: 'department-specific-onboarding',
    prompt:
      'Create an onboarding workflow that starts with common HR steps for all employees, then branches based on department: Engineering gets dev environment setup and code access, Sales gets CRM training and territory assignment, Operations gets system access and SOP training. All paths end with manager sign-off on onboarding completion.',
    expectedStepTypes: ['FORM', 'SINGLE_CHOICE_BRANCH', 'TODO', 'ACKNOWLEDGEMENT', 'APPROVAL'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Employee Onboarding',
    name: 'add-security-training',
    prompt: 'Add a mandatory security awareness training step with a quiz',
    expectedStepTypes: ['QUESTIONNAIRE'],
    complexity: 'simple',
    expectedMode: 'edit',
  },
  {
    category: 'Employee Onboarding',
    name: 'add-remote-equipment',
    prompt:
      'Add a step for remote employees to confirm their home office equipment needs before IT ships gear',
    expectedStepTypes: ['FORM', 'TODO'],
    complexity: 'simple',
    expectedMode: 'edit',
  },

  // Clarification-worthy requests
  {
    category: 'Employee Onboarding',
    name: 'vague-hire-workflow',
    prompt: 'I need something for new hires',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Employee Onboarding',
    name: 'vague-hr-process',
    prompt: 'Create an HR workflow',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// VENDOR MANAGEMENT PROMPTS
// =============================================================================

const vendorManagementPrompts: TestPrompt[] = [
  // Simple create requests
  {
    category: 'Vendor Management',
    name: 'basic-vendor-registration',
    prompt: 'Create a vendor registration form workflow',
    expectedStepTypes: ['FORM'],
    complexity: 'simple',
    expectedMode: 'create',
  },
  {
    category: 'Vendor Management',
    name: 'simple-vendor-approval',
    prompt: 'I need a simple workflow to approve new vendors',
    expectedStepTypes: ['FORM', 'APPROVAL'],
    complexity: 'simple',
    expectedMode: 'create',
  },

  // Medium complexity create requests
  {
    category: 'Vendor Management',
    name: 'vendor-onboarding',
    prompt:
      'Build a vendor onboarding workflow. Vendor fills out company info and uploads W-9 and insurance certificate. Procurement reviews and approves. Finance adds to payment system. Send welcome email.',
    expectedStepTypes: ['FORM', 'FILE_REQUEST', 'APPROVAL', 'TODO', 'SYSTEM_EMAIL'],
    complexity: 'medium',
    expectedMode: 'create',
  },
  {
    category: 'Vendor Management',
    name: 'contract-renewal',
    prompt:
      'Create a contract renewal workflow. System notifies 90 days before expiry. Account manager reviews performance and recommends renewal, modification, or termination. If renewal, legal reviews terms, vendor signs updated contract.',
    expectedStepTypes: ['SYSTEM_EMAIL', 'DECISION', 'APPROVAL', 'ESIGN'],
    complexity: 'medium',
    expectedMode: 'create',
  },

  // Complex create requests
  {
    category: 'Vendor Management',
    name: 'full-vendor-lifecycle',
    prompt:
      'Design a complete vendor management workflow. Onboarding: request form, risk assessment questionnaire, document collection (W-9, insurance, certifications), security review for IT vendors, compliance review, procurement approval, contract negotiation, e-signature. Ongoing: annual performance review form, insurance renewal tracking, periodic risk reassessment. Offboarding: termination request, access revocation checklist, final payment verification, document retention.',
    expectedStepTypes: [
      'FORM',
      'QUESTIONNAIRE',
      'FILE_REQUEST',
      'DECISION',
      'APPROVAL',
      'ESIGN',
      'TODO',
      'SINGLE_CHOICE_BRANCH',
    ],
    complexity: 'complex',
    expectedMode: 'create',
  },
  {
    category: 'Vendor Management',
    name: 'tiered-vendor-onboarding',
    prompt:
      'Create a vendor onboarding workflow with different paths based on vendor type and risk. Low-value suppliers (under $10k/year) get fast-track: basic form and single approval. High-value vendors need full due diligence: financial review, reference checks, site visit scheduling. IT vendors additionally need security assessment and SOC2 verification. All vendors get contract and NDA for signature.',
    expectedStepTypes: ['FORM', 'SINGLE_CHOICE_BRANCH', 'FILE_REQUEST', 'APPROVAL', 'TODO', 'ESIGN'],
    complexity: 'complex',
    expectedMode: 'create',
  },

  // Edit requests
  {
    category: 'Vendor Management',
    name: 'add-diversity-tracking',
    prompt: 'Add a step to collect diversity certification documents for diverse suppliers',
    expectedStepTypes: ['FILE_REQUEST', 'FORM'],
    complexity: 'simple',
    expectedMode: 'edit',
  },
  {
    category: 'Vendor Management',
    name: 'add-annual-review',
    prompt: 'Add an annual performance review questionnaire that the account manager fills out',
    expectedStepTypes: ['QUESTIONNAIRE', 'FORM'],
    complexity: 'simple',
    expectedMode: 'edit',
  },

  // Clarification-worthy requests
  {
    category: 'Vendor Management',
    name: 'vague-vendor-workflow',
    prompt: 'I need a workflow for vendors',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
  {
    category: 'Vendor Management',
    name: 'vague-supplier-process',
    prompt: 'Create something to manage our suppliers',
    complexity: 'simple',
    expectedMode: 'clarify',
  },
];

// =============================================================================
// EXPORT ALL PROMPTS
// =============================================================================

export const samplePrompts: TestPrompt[] = [
  ...clientOnboardingPrompts,
  ...taxAuditPrompts,
  ...crossDepartmentApprovalPrompts,
  ...customerImplementationPrompts,
  ...loanProcessingPrompts,
  ...employeeOnboardingPrompts,
  ...vendorManagementPrompts,
];

// Utility functions for filtering prompts in tests

export const getPromptsByCategory = (category: string): TestPrompt[] =>
  samplePrompts.filter((p) => p.category === category);

export const getPromptsByComplexity = (complexity: TestPrompt['complexity']): TestPrompt[] =>
  samplePrompts.filter((p) => p.complexity === complexity);

export const getPromptsByMode = (mode: TestPrompt['expectedMode']): TestPrompt[] =>
  samplePrompts.filter((p) => p.expectedMode === mode);

export const getCreatePrompts = (): TestPrompt[] => getPromptsByMode('create');

export const getEditPrompts = (): TestPrompt[] => getPromptsByMode('edit');

export const getClarifyPrompts = (): TestPrompt[] => getPromptsByMode('clarify');

// Summary statistics
export const promptStats = {
  total: samplePrompts.length,
  byCategory: {
    'Client Onboarding': clientOnboardingPrompts.length,
    'Tax Audit Flow': taxAuditPrompts.length,
    'Cross-Department Approval': crossDepartmentApprovalPrompts.length,
    'Customer Implementation': customerImplementationPrompts.length,
    'Loan Processing': loanProcessingPrompts.length,
    'Employee Onboarding': employeeOnboardingPrompts.length,
    'Vendor Management': vendorManagementPrompts.length,
  },
  byComplexity: {
    simple: samplePrompts.filter((p) => p.complexity === 'simple').length,
    medium: samplePrompts.filter((p) => p.complexity === 'medium').length,
    complex: samplePrompts.filter((p) => p.complexity === 'complex').length,
  },
  byMode: {
    create: samplePrompts.filter((p) => p.expectedMode === 'create').length,
    edit: samplePrompts.filter((p) => p.expectedMode === 'edit').length,
    clarify: samplePrompts.filter((p) => p.expectedMode === 'clarify').length,
  },
};
