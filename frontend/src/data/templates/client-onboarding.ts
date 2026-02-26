import type { GalleryTemplate } from './types';

export const CLIENT_ONBOARDING_TEMPLATES: GalleryTemplate[] = [
  // ── 1. SaaS Customer Onboarding ──────────────────────────────────────
  {
    id: 'saas-customer-onboarding',
    name: 'SaaS Customer Onboarding',
    category: 'client-onboarding',
    description:
      'Guide new SaaS customers from signed contract through environment configuration, data migration, and go-live. Covers kickoff, technical requirements, provisioning, training, and UAT sign-off so every deployment starts right.',
    complexity: 'Complex',
    tags: ['Technology', 'SaaS'],
    trigger: 'New customer contract signed',
    roles: ['Customer Contact', 'Implementation Lead', 'CSM'],
    useCases: [
      'New enterprise customer signs annual contract',
      'SMB customer upgrades to paid tier requiring implementation',
      'Existing customer purchases an add-on product needing configuration',
      'Partner refers a new client for white-glove onboarding',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to Salesforce or HubSpot to auto-trigger this flow when a deal moves to Closed Won',
      'Use AI to analyze the technical requirements questionnaire and auto-generate a tailored implementation plan with estimated timelines per integration',
      'Integrate with your SSO provider (Okta, Azure AD) to auto-provision user accounts after UAT sign-off',
      'Chain with the Quarterly Business Review template after onboarding completes to establish an ongoing check-in cadence',
    ],
    steps: [
      {
        name: 'Discovery & Requirements',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Customer kickoff form',
        type: 'FORM',
        assigneeRole: 'Customer Contact',
        sampleDescription:
          'Complete this kickoff form so we can tailor your implementation. Provide your company details, expected user count, subscription tier, target go-live date, integration needs, and key objectives.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Expected Number of Users', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Subscription Tier', type: 'DROPDOWN', required: true, options: [{ label: 'Starter', value: 'starter' }, { label: 'Professional', value: 'professional' }, { label: 'Enterprise', value: 'enterprise' }] },
          { fieldId: 'f4', label: 'Target Go-Live Date', type: 'DATE', required: true },
          { fieldId: 'f5', label: 'Integration Requirements', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f6', label: 'Key Objectives', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Technical requirements questionnaire',
        type: 'FORM',
        assigneeRole: 'Customer Contact',
        sampleDescription:
          'Fill out your technical requirements so we can prepare your environment. Include details on SSO, user provisioning, API integrations, data migration scope, and compliance needs.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'SSO Provider', type: 'DROPDOWN', required: false, options: [{ label: 'Okta', value: 'okta' }, { label: 'Azure AD', value: 'azure-ad' }, { label: 'Google Workspace', value: 'google' }, { label: 'None', value: 'none' }] },
          { fieldId: 'f2', label: 'User Provisioning Method', type: 'DROPDOWN', required: false, options: [{ label: 'SCIM', value: 'scim' }, { label: 'Manual', value: 'manual' }, { label: 'CSV Import', value: 'csv' }] },
          { fieldId: 'f3', label: 'API Integration Needs', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f4', label: 'Data Migration Scope', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f5', label: 'Compliance Requirements', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Data migration upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Customer Contact',
        sampleDescription:
          'Upload your data migration files (CSV exports, database dumps, or structured data) so our team can begin the import process.',
      },
      {
        name: 'Environment Setup',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Environment configuration',
        type: 'TODO',
        assigneeRole: 'Implementation Lead',
        sampleDescription:
          'Set up the customer tenant: configure SSO/SCIM if needed, apply branding, set permissions, and verify the environment is ready for provisioning.',
      },
      {
        name: 'User provisioning form',
        type: 'FORM',
        assigneeRole: 'Customer Contact',
        sampleDescription:
          'Provide admin user details, team structure, and role assignments so we can provision accounts in your new environment.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Primary Admin Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Primary Admin Email', type: 'EMAIL', required: true },
          { fieldId: 'f3', label: 'Team Structure / Departments', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f4', label: 'Role Assignments', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Training & UAT',
        type: 'TODO',
        assigneeRole: 'Implementation Lead',
        sampleDescription:
          'Conduct admin training, end-user training sessions, and facilitate user acceptance testing. Document any issues found during UAT.',
      },
      {
        name: 'Go-Live',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'UAT sign-off',
        type: 'APPROVAL',
        assigneeRole: 'Customer Contact',
        sampleDescription:
          'Review the configured environment and confirm that acceptance testing is complete. Approve to proceed to go-live.',
      },
      {
        name: 'Go-live notification',
        type: 'TODO',
        assigneeRole: 'CSM',
        sampleDescription:
          'Automated notification: Send the go-live announcement to the customer team with access details and support resources.',
      },
      {
        name: 'Onboarding complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'CSM',
        sampleDescription:
          'Acknowledge that onboarding is complete and the account is being handed off to ongoing success management.',
      },
    ],
  },

  // ── 2. Financial Services Client Onboarding (KYC) ───────────────────
  {
    id: 'financial-services-client-onboarding-kyc',
    name: 'Financial Services Client Onboarding (KYC)',
    category: 'client-onboarding',
    description:
      'Streamline new client intake from initial application through KYC verification and account activation. Collects identity documents, runs compliance screening, and obtains required signatures before opening the account.',
    complexity: 'Complex',
    tags: ['Banking', 'Wealth Management'],
    trigger: 'New account application',
    roles: ['Client', 'KYC Analyst', 'Compliance Officer'],
    useCases: [
      'High-net-worth individual opens a new investment account',
      'Business entity applies for a commercial banking relationship',
      'Existing client adds a trust or beneficiary account',
      'Periodic re-verification of a high-risk client triggers full KYC refresh',
    ],
    requirements: [
      'Upload your account agreement document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to a KYC/AML screening service (LexisNexis, Refinitiv World-Check) to automate sanctions and PEP screening',
      'Use AI to auto-review uploaded identity documents and flag missing pages, expired IDs, or mismatched addresses before the analyst step',
      'Integrate with DocuSign or Adobe Sign for the account agreement e-signature step to capture a legally binding audit trail',
      'Schedule a Periodic KYC/KYB Refresh flow to auto-launch annually for high-risk clients or every three years for standard-risk clients',
    ],
    steps: [
      {
        name: 'Client Information Collection',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Client information form',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'Provide your personal and financial information to begin the account opening process. All fields are required for regulatory compliance.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Full Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'SSN / TIN', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Residential Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Citizenship', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Occupation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f7', label: 'Annual Income', type: 'DROPDOWN', required: true, options: [{ label: 'Under $50,000', value: 'under-50k' }, { label: '$50,000 - $100,000', value: '50k-100k' }, { label: '$100,000 - $250,000', value: '100k-250k' }, { label: 'Over $250,000', value: 'over-250k' }] },
          { fieldId: 'f8', label: 'Estimated Net Worth', type: 'DROPDOWN', required: true, options: [{ label: 'Under $100,000', value: 'under-100k' }, { label: '$100,000 - $500,000', value: '100k-500k' }, { label: '$500,000 - $1M', value: '500k-1m' }, { label: 'Over $1M', value: 'over-1m' }] },
          { fieldId: 'f9', label: 'Source of Wealth', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Identity document upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client',
        sampleDescription:
          'Upload a government-issued photo ID and proof of address dated within the last 90 days (e.g., utility bill or bank statement).',
      },
      {
        name: 'Customer Due Diligence questionnaire',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'Answer due diligence questions about the intended use of your account, expected transaction patterns, and any political or foreign account exposure.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Purpose of Account', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Expected Monthly Transaction Volume', type: 'DROPDOWN', required: true, options: [{ label: 'Under $10,000', value: 'under-10k' }, { label: '$10,000 - $50,000', value: '10k-50k' }, { label: '$50,000 - $250,000', value: '50k-250k' }, { label: 'Over $250,000', value: 'over-250k' }] },
          { fieldId: 'f3', label: 'Are you a Politically Exposed Person (PEP)?', type: 'DROPDOWN', required: true, options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
          { fieldId: 'f4', label: 'Do you hold foreign financial accounts?', type: 'DROPDOWN', required: true, options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
          { fieldId: 'f5', label: 'Foreign Account Details (if applicable)', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Due Diligence & Screening',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'AI risk scoring & sanctions screening',
        type: 'TODO',
        assigneeRole: 'KYC Analyst',
        sampleDescription:
          'AI-powered: Screen the applicant against OFAC sanctions lists, PEP databases, and adverse media sources. Generate a risk score (Low/Medium/High) with supporting rationale.',
      },
      {
        name: 'High-risk client?',
        type: 'DECISION',
        assigneeRole: 'KYC Analyst',
        sampleDescription:
          'Evaluate the risk scoring results. Route High-risk or PEP-flagged applicants to the Enhanced Due Diligence path; route Standard-risk applicants directly to review.',
      },
      {
        name: 'Enhanced Due Diligence documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client',
        sampleDescription:
          'Upload additional documentation to support your application: source-of-wealth evidence, recent tax returns, and bank statements.',
      },
      {
        name: 'KYC analyst review',
        type: 'TODO',
        assigneeRole: 'KYC Analyst',
        sampleDescription:
          'Verify all submitted documents, cross-reference information across sources, and complete the Customer Identification Program (CIP) checklist.',
      },
      {
        name: 'Account Opening',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Compliance officer approval',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Review the KYC analyst findings and approve or reject the client application based on compliance standards and risk assessment.',
      },
      {
        name: 'Account agreement',
        type: 'ESIGN',
        assigneeRole: 'Client',
        sampleDescription:
          'Review and electronically sign the account agreement to finalize your new account.',
        sampleDocumentRef: 'account-agreement.pdf',
      },
      {
        name: 'Welcome notification',
        type: 'TODO',
        assigneeRole: 'KYC Analyst',
        sampleDescription:
          'Automated notification: Send the welcome email to the new client with account details, online access instructions, and next steps.',
      },
    ],
  },

  // ── 3. Accounting Firm Client Onboarding ─────────────────────────────
  {
    id: 'accounting-firm-client-onboarding',
    name: 'Accounting Firm Client Onboarding',
    category: 'client-onboarding',
    description:
      'Onboard new accounting clients from initial intake through engagement letter execution and system setup. Captures entity details, service scope, tax authorizations, and prior-year financials so your team can hit the ground running.',
    complexity: 'Standard',
    tags: ['Accounting', 'Tax'],
    trigger: 'New client engagement',
    roles: ['Client', 'Engagement Manager'],
    useCases: [
      'New small business engages the firm for tax preparation and bookkeeping',
      'Individual client signs up for personal tax advisory services',
      'Existing client adds a new entity requiring separate engagement',
      'Referral from partner firm needs full intake and authorization',
    ],
    requirements: [
      'Upload your engagement letter document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to your practice management system (Canopy, Karbon, or CCH Axcess) to auto-create client records upon onboarding completion',
      'Use AI to scan uploaded prior-year returns and auto-extract entity type, filing jurisdictions, and revenue figures to pre-populate the client profile',
      'Integrate with QuickBooks Online or Xero to auto-link the client accounting file once bookkeeping access is provided',
      'Pair with the Tax Return Preparation template to kick off the first-year engagement immediately after onboarding completes',
    ],
    steps: [
      {
        name: 'Engagement Setup',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Client information form',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'Provide your basic information so we can set up your account. Include your legal name, entity type, Tax ID, fiscal year end, and states of filing.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [{ label: 'Individual', value: 'individual' }, { label: 'Sole Proprietor', value: 'sole-proprietor' }, { label: 'LLC', value: 'llc' }, { label: 'S-Corp', value: 's-corp' }, { label: 'C-Corp', value: 'c-corp' }, { label: 'Partnership', value: 'partnership' }, { label: 'Trust', value: 'trust' }] },
          { fieldId: 'f3', label: 'Tax ID (EIN or SSN)', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Fiscal Year End', type: 'DATE', required: true },
          { fieldId: 'f5', label: 'States of Filing', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Service scope selection',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'Select the services you need and share relevant details about your business operations, revenue, and current accounting software.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Tax Preparation', type: 'CHECKBOX', required: false },
          { fieldId: 'f2', label: 'Bookkeeping', type: 'CHECKBOX', required: false },
          { fieldId: 'f3', label: 'Payroll', type: 'CHECKBOX', required: false },
          { fieldId: 'f4', label: 'Audit', type: 'CHECKBOX', required: false },
          { fieldId: 'f5', label: 'Advisory', type: 'CHECKBOX', required: false },
          { fieldId: 'f6', label: 'Approximate Annual Revenue', type: 'TEXT_SINGLE_LINE', required: false },
          { fieldId: 'f7', label: 'Current Accounting Software', type: 'DROPDOWN', required: false, options: [{ label: 'QuickBooks', value: 'quickbooks' }, { label: 'Xero', value: 'xero' }, { label: 'FreshBooks', value: 'freshbooks' }, { label: 'Other', value: 'other' }, { label: 'None', value: 'none' }] },
        ],
      },
      {
        name: 'Engagement letter',
        type: 'ESIGN',
        assigneeRole: 'Client',
        sampleDescription:
          'Review and sign the engagement letter that outlines the scope of services, fees, and responsibilities.',
        sampleDocumentRef: 'engagement-letter.pdf',
      },
      {
        name: 'Document Collection',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Tax authorization forms',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client',
        sampleDescription:
          'Upload signed IRS Form 8821 or 2848, plus any required state authorization forms, so we can access your tax records.',
      },
      {
        name: 'Prior year returns & financials',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client',
        sampleDescription:
          'Upload your prior year tax returns and financial statements so we have a baseline for your engagement.',
      },
      {
        name: 'Accounting system access (if bookkeeping/payroll)',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'If you selected bookkeeping or payroll services, provide access credentials for your accounting system and bank feed details.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Accounting Platform', type: 'DROPDOWN', required: false, options: [{ label: 'QuickBooks Online', value: 'qbo' }, { label: 'Xero', value: 'xero' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f2', label: 'Login Email', type: 'EMAIL', required: false },
          { fieldId: 'f3', label: 'Bank Feed Setup Instructions', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Firm Setup',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Initial document review',
        type: 'TODO',
        assigneeRole: 'Engagement Manager',
        sampleDescription:
          'Review all submitted documents, verify completeness, and flag any missing or inconsistent information before proceeding.',
      },
      {
        name: 'Client portal setup',
        type: 'TODO',
        assigneeRole: 'Engagement Manager',
        sampleDescription:
          'Create the client profile in the firm management system, set up the document portal, and configure recurring task schedules.',
      },
      {
        name: 'Onboarding complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Client',
        sampleDescription:
          'Acknowledge that your onboarding is complete. Your engagement manager will reach out with next steps and timelines.',
      },
    ],
  },

  // ── 4. Legal Client Intake & Matter Opening ──────────────────────────
  {
    id: 'legal-client-intake-matter-opening',
    name: 'Legal Client Intake & Matter Opening',
    category: 'client-onboarding',
    description:
      'Process new legal client inquiries from intake through conflict checks, engagement execution, and matter setup. Ensures proper vetting, fee arrangements, and case organization before the first billable hour.',
    complexity: 'Standard',
    tags: ['Legal'],
    trigger: 'New client inquiry / matter request',
    roles: ['Client', 'Intake Attorney', 'Paralegal'],
    useCases: [
      'Prospective client contacts the firm about a commercial litigation matter',
      'Existing client opens a new matter in a different practice area',
      'Referral from another attorney requires full intake and conflict check',
      'Corporate client engages the firm for M&A advisory',
    ],
    requirements: [
      'Upload your engagement letter document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to your case management system (Clio, MyCase, or PracticePanther) to auto-create matters and populate client records upon intake completion',
      'Integrate with your conflicts database to auto-run conflict checks when new party names are submitted in the intake form',
      'Use AI to analyze uploaded supporting documents and auto-generate a matter summary with key dates, parties, and potential issues for the intake attorney',
      'Pair with the Contract Review template for corporate matters or NDA template for engagements requiring immediate confidentiality agreements',
    ],
    steps: [
      {
        name: 'Intake & Conflicts',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Client intake form',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'Complete the intake form with your contact information, the practice area involved, a description of the matter, any opposing parties, and the urgency level.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Practice Area', type: 'DROPDOWN', required: true, options: [{ label: 'Corporate / M&A', value: 'corporate' }, { label: 'Litigation', value: 'litigation' }, { label: 'Employment', value: 'employment' }, { label: 'Real Estate', value: 'real-estate' }, { label: 'Intellectual Property', value: 'ip' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f3', label: 'Matter Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Opposing Parties', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f5', label: 'Urgency', type: 'DROPDOWN', required: true, options: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }] },
        ],
      },
      {
        name: 'Conflict of interest check',
        type: 'TODO',
        assigneeRole: 'Paralegal',
        sampleDescription:
          'Run a conflict check against the firm database using all party names. Document any potential conflicts and flag them for attorney review.',
      },
      {
        name: 'Matter evaluation & staffing',
        type: 'TODO',
        assigneeRole: 'Intake Attorney',
        sampleDescription:
          'Evaluate the matter for viability, determine the appropriate fee arrangement (hourly, contingency, flat fee), and assign staffing.',
      },
      {
        name: 'Accept the matter?',
        type: 'DECISION',
        assigneeRole: 'Intake Attorney',
        sampleDescription:
          'Decide whether to accept or decline the matter based on conflict check results, viability assessment, and staffing availability. Route accepted matters to engagement; route declined matters to client notification.',
      },
      {
        name: 'Engagement',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Engagement letter execution',
        type: 'ESIGN',
        assigneeRole: 'Client',
        sampleDescription:
          'Review and sign the engagement letter that defines the scope of representation, fee structure, and terms of the attorney-client relationship.',
        sampleDocumentRef: 'engagement-letter.pdf',
      },
      {
        name: 'Retainer payment processing',
        type: 'TODO',
        assigneeRole: 'Paralegal',
        sampleDescription:
          'Process the retainer payment, confirm receipt, and record it in the trust accounting system.',
      },
      {
        name: 'Supporting document upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client',
        sampleDescription:
          'Upload any documents related to your matter, such as contracts, correspondence, court filings, or other relevant records.',
      },
      {
        name: 'Matter Setup',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Client portal & matter setup',
        type: 'TODO',
        assigneeRole: 'Paralegal',
        sampleDescription:
          'Create the matter in the case management system, set up the client portal, organize document folders, and configure billing codes.',
      },
      {
        name: 'Kickoff meeting',
        type: 'TODO',
        assigneeRole: 'Intake Attorney',
        sampleDescription:
          'Schedule and conduct the kickoff meeting with the client to discuss strategy, timeline, and immediate next steps.',
      },
      {
        name: 'Welcome & next steps',
        type: 'TODO',
        assigneeRole: 'Paralegal',
        sampleDescription:
          'Automated notification: Send the welcome email to the client with portal access details, team contacts, and an outline of next steps.',
      },
    ],
  },

  // ── 5. Insurance New Business Submission ─────────────────────────────
  {
    id: 'insurance-new-business-submission',
    name: 'Insurance New Business Submission',
    category: 'client-onboarding',
    description:
      'Manage the full lifecycle of a new insurance policy application from broker submission through underwriting analysis, quoting, and policy issuance. Validates completeness, triages risk, and tracks subjectivity clearance.',
    complexity: 'Complex',
    tags: ['Insurance', 'Brokerage'],
    trigger: 'New policy application from broker',
    roles: ['Broker/Applicant', 'Underwriter'],
    useCases: [
      'Commercial broker submits a new general liability application',
      'Large account renewal triggers a full re-underwriting process',
      'Specialty risk submission requires multi-line quoting',
      'New broker relationship submits first piece of business',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to your agency management system (Applied Epic, Vertafore AMS360) to auto-trigger this flow when a new submission is logged',
      'Use AI to extract key data from uploaded ACORD applications and loss runs, auto-populating the underwriting workbench and flagging loss trends',
      'Integrate with ACORD data exchange to pre-populate insured information from standard ACORD forms and reduce manual data entry',
      'Schedule a Policy Renewal flow to auto-launch 90 days before policy expiration to begin the renewal process',
    ],
    steps: [
      {
        name: 'Submission',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Insured information form',
        type: 'FORM',
        assigneeRole: 'Broker/Applicant',
        sampleDescription:
          'Provide the insured entity details including legal name, entity type, FEIN, SIC/NAICS code, revenue, employee count, and lines of coverage requested.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Named Insured', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [{ label: 'Corporation', value: 'corporation' }, { label: 'LLC', value: 'llc' }, { label: 'Partnership', value: 'partnership' }, { label: 'Sole Proprietor', value: 'sole-proprietor' }, { label: 'Non-Profit', value: 'non-profit' }] },
          { fieldId: 'f3', label: 'FEIN', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'SIC/NAICS Code', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Annual Revenue', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Number of Employees', type: 'NUMBER', required: true },
          { fieldId: 'f7', label: 'Lines of Coverage Requested', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'ACORD application & loss runs',
        type: 'FILE_REQUEST',
        assigneeRole: 'Broker/Applicant',
        sampleDescription:
          'Upload the completed ACORD 125 application with any line-specific supplements, plus the most recent 5-year loss run history.',
      },
      {
        name: 'Supplemental documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Broker/Applicant',
        sampleDescription:
          'Upload supplemental materials such as financial statements, fleet or property schedules, and safety programs as applicable.',
      },
      {
        name: 'Underwriting',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'AI submission triage',
        type: 'TODO',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'AI-powered: Validate submission completeness, check appetite-fit by class code, and flag any missing information or coverage gaps.',
      },
      {
        name: 'Complete and within appetite?',
        type: 'DECISION',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'Determine whether the submission is complete and fits within underwriting appetite. Route complete submissions to underwriting analysis; incomplete or out-of-appetite submissions back to the broker for additional information.',
      },
      {
        name: 'Underwriting analysis',
        type: 'TODO',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'Perform full underwriting analysis: risk classification, premium development, loss projection, and industry benchmarking.',
      },
      {
        name: 'Underwriting decision',
        type: 'DECISION',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'Make the underwriting decision: issue a quote, decline the risk, or refer to senior underwriting for further review.',
      },
      {
        name: 'Quote proposal delivery',
        type: 'FILE_REQUEST',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'Upload and deliver the quote proposal document to the broker for review and presentation to the insured.',
      },
      {
        name: 'Binding & Issuance',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Bind request & subjectivity clearance',
        type: 'FILE_REQUEST',
        assigneeRole: 'Broker/Applicant',
        sampleDescription:
          'Upload the signed bind order, executed applications, and any required loss control or subjectivity clearance documents.',
      },
      {
        name: 'Policy issuance & delivery',
        type: 'TODO',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'Generate policy documents and certificates of insurance, set up the policy in the management system, and deliver final documents to the broker.',
      },
    ],
  },

  // ── 6. Client Onboarding — General (Post-Sale) ──────────────────────
  {
    id: 'client-onboarding-general-post-sale',
    name: 'Client Onboarding — General (Post-Sale)',
    category: 'client-onboarding',
    description:
      'Execute a straightforward post-sale onboarding for new clients across any industry. Collects client information, required documents, and contract signatures, then hands off to operations for setup and go-live.',
    complexity: 'Simple',
    tags: ['All Industries'],
    trigger: 'Deal closed in CRM',
    roles: ['Client Admin', 'Account Manager', 'Operations Lead'],
    useCases: [
      'Sales team closes a new mid-market deal and initiates handoff',
      'Self-serve customer upgrades and needs guided onboarding',
      'Channel partner signs a new client requiring standard setup',
      'Renewal with scope change triggers a mini re-onboarding',
    ],
    requirements: [
      'Upload your contract document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to Salesforce, HubSpot, or Pipedrive to auto-trigger this flow when a deal moves to Closed Won',
      'Use AI to auto-review uploaded compliance documents (W-9, insurance certificates) and flag missing fields or expired coverage before the verification step',
      'Integrate with DocuSign or Adobe Sign for the contract execution step to streamline e-signature collection',
      'Chain with the Quarterly Business Review template after onboarding completes to establish a recurring client check-in cadence',
    ],
    steps: [
      {
        name: 'Information Collection',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Client information intake',
        type: 'FORM',
        assigneeRole: 'Client Admin',
        sampleDescription:
          'Provide your organization details so we can get your account set up. Include company name, address, and billing information.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Company Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Billing Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Billing Contact Email', type: 'EMAIL', required: true },
        ],
      },
      {
        name: 'Primary contacts & roles',
        type: 'FORM',
        assigneeRole: 'Client Admin',
        sampleDescription:
          'Identify your primary contacts and their roles so we know who to reach for different matters.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Primary Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Primary Contact Email', type: 'EMAIL', required: true },
          { fieldId: 'f3', label: 'Primary Contact Role', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Secondary Contact Name', type: 'TEXT_SINGLE_LINE', required: false },
          { fieldId: 'f5', label: 'Secondary Contact Email', type: 'EMAIL', required: false },
        ],
      },
      {
        name: 'Required documents (W-9, insurance, etc.)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client Admin',
        sampleDescription:
          'Upload required compliance documents such as W-9, certificate of insurance, and any other documents specified in your agreement.',
      },
      {
        name: 'Contract execution',
        type: 'ESIGN',
        assigneeRole: 'Client Admin',
        sampleDescription:
          'Review and sign the contract to formalize our engagement.',
        sampleDocumentRef: 'client-contract.pdf',
      },
      {
        name: 'Setup & Activation',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Internal setup checklist',
        type: 'TODO',
        assigneeRole: 'Operations Lead',
        sampleDescription:
          'Complete the internal setup checklist: create the client in billing, provision access, configure integrations, and verify all systems are ready.',
      },
      {
        name: 'Compliance verification',
        type: 'APPROVAL',
        assigneeRole: 'Operations Lead',
        sampleDescription:
          'Verify that all required documents have been received, compliance checks are clear, and the account is ready for activation.',
      },
      {
        name: 'Go-live acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Acknowledge that the client is live and the account has been successfully handed off from onboarding to ongoing account management.',
      },
    ],
  },

  // ── 7. Customer Offboarding & Account Closure ────────────────────────
  {
    id: 'customer-offboarding-account-closure',
    name: 'Customer Offboarding & Account Closure',
    category: 'client-onboarding',
    description:
      'Manage the complete customer offboarding process from closure request through data export, billing reconciliation, access revocation, and final feedback. Ensures a clean, professional exit that preserves the relationship.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Client requests closure / contract termination',
    roles: ['Client Contact', 'Account Manager', 'IT/Security', 'Finance'],
    useCases: [
      'Customer decides not to renew at end of contract term',
      'Client merges with another organization and consolidates vendors',
      'Customer downgrades and needs to close a secondary account',
      'Mutual agreement to terminate a pilot engagement',
    ],
    recommendations: [
      'Connect to your CRM (Salesforce, HubSpot) to auto-trigger this flow when a contract status changes to Churned or Non-Renewal',
      'Use AI to analyze exit survey responses across all offboardings and surface recurring themes for product and service improvements',
      'Integrate with your billing system (Stripe, Chargebee) to auto-generate the final invoice and process any remaining credits or refunds',
      'Run data export delivery and access revocation in parallel to cut offboarding turnaround time by 40%',
    ],
    steps: [
      {
        name: 'Closure Processing',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Offboarding request confirmation',
        type: 'FORM',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Confirm your offboarding request by providing the reason for closure and your preferred timeline.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Reason for Closure', type: 'DROPDOWN', required: true, options: [{ label: 'End of contract', value: 'end-of-contract' }, { label: 'Switching providers', value: 'switching' }, { label: 'Business closure', value: 'closure' }, { label: 'Budget constraints', value: 'budget' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f2', label: 'Additional Details', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f3', label: 'Preferred Closure Date', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Data export delivery',
        type: 'FILE_REQUEST',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Prepare and deliver the client data export package including all stored records, reports, and configuration data.',
      },
      {
        name: 'Final billing acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Review and acknowledge the final billing summary, including any remaining charges, credits, or refunds.',
      },
      {
        name: 'Account Wrap-Up',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Access revocation',
        type: 'TODO',
        assigneeRole: 'IT/Security',
        sampleDescription:
          'Revoke all user access, disable API keys, remove SSO integrations, and archive the client tenant per data retention policy.',
      },
      {
        name: 'Final invoice',
        type: 'TODO',
        assigneeRole: 'Finance',
        sampleDescription:
          'Generate and send the final invoice reflecting any prorated charges, credits, or refunds owed.',
      },
      {
        name: 'Exit & Feedback',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Exit survey',
        type: 'FORM',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Share your feedback to help us improve. Your candid responses are valued and will remain confidential.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Overall Satisfaction (1-10)', type: 'NUMBER', required: false },
          { fieldId: 'f2', label: 'What did we do well?', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f3', label: 'What could we have done better?', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f4', label: 'Would you consider returning in the future?', type: 'DROPDOWN', required: false, options: [{ label: 'Yes', value: 'yes' }, { label: 'Maybe', value: 'maybe' }, { label: 'No', value: 'no' }] },
        ],
      },
      {
        name: 'Closure acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Acknowledge that your account has been closed. We appreciate your business and wish you well.',
      },
    ],
  },
];
