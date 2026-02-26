import type { GalleryTemplate } from './types';

export const HR_EMPLOYEE_TEMPLATES: GalleryTemplate[] = [
  // ── 15. Employee Onboarding ──────────────────────────────────────────
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding',
    category: 'hr-employee',
    description:
      'Onboard new hires from offer acceptance through paperwork, I-9 verification, benefits enrollment, and first-day orientation. Coordinates HR, IT provisioning, and the hiring manager so every new employee starts productively on day one.',
    complexity: 'Complex',
    tags: ['All Industries'],
    trigger: 'Offer accepted',
    roles: ['New Hire', 'HR Coordinator', 'Hiring Manager'],
    useCases: [
      'Full-time employee starts after accepting an offer letter',
      'Intern converts to permanent hire and needs full onboarding',
      'Acquired company employees transfer into new organization',
      'Remote employee in a different state requires compliant onboarding',
    ],
    requirements: [
      'Upload your offer letter and employment agreements for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to your HRIS (BambooHR, Workday, Rippling) to auto-trigger this flow when a candidate status changes to Offer Accepted',
      'Use AI to auto-review uploaded I-9 documents and flag expired IDs, mismatched names, or missing List B/C combinations before the HR coordinator verification step',
      'Integrate with your IT asset management system (Jamf, Mosyle) to auto-order and ship equipment based on the new hire start date and role',
      'Pair with the Background Check template to run pre-employment screening in parallel with onboarding paperwork',
    ],
    steps: [
      {
        name: 'Personal information form',
        type: 'FORM',
        assigneeRole: 'New Hire',
        sampleDescription:
          'Provide your personal details so we can set up your employee record. Include your legal name, date of birth, contact information, and emergency contacts.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Full Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Personal Email', type: 'EMAIL', required: true },
          { fieldId: 'f4', label: 'Phone Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Home Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Emergency Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f7', label: 'Emergency Contact Phone', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f8', label: 'Emergency Contact Relationship', type: 'TEXT_SINGLE_LINE', required: true },
        ],
      },
      {
        name: 'Offer letter & employment agreements',
        type: 'ESIGN',
        assigneeRole: 'New Hire',
        sampleDescription:
          'Review and sign your offer letter, non-disclosure agreement, IP assignment agreement, and employee handbook acknowledgement.',
        sampleDocumentRef: 'offer-letter-package.pdf',
      },
      {
        name: 'Tax forms (W-4, state)',
        type: 'FILE_REQUEST',
        assigneeRole: 'New Hire',
        sampleDescription:
          'Upload your completed federal W-4 and applicable state withholding forms for payroll setup.',
      },
      {
        name: 'I-9 verification documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'New Hire',
        sampleDescription:
          'Upload identity and employment authorization documents per I-9 requirements: either one List A document, or one List B plus one List C document.',
      },
      {
        name: 'I-9 employer verification',
        type: 'TODO',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Examine the new hire\'s I-9 documents, complete Section 2 of Form I-9, and ensure verification is completed within 3 business days of start date.',
      },
      {
        name: 'Direct deposit & benefits enrollment',
        type: 'FORM',
        assigneeRole: 'New Hire',
        sampleDescription:
          'Set up your direct deposit and enroll in benefits. Provide your banking information and select your medical, dental, vision, and 401(k) options.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Bank Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Routing Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Account Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Account Type', type: 'DROPDOWN', required: true, options: [{ label: 'Checking', value: 'checking' }, { label: 'Savings', value: 'savings' }] },
          { fieldId: 'f5', label: 'Medical Plan', type: 'DROPDOWN', required: false, options: [{ label: 'PPO', value: 'ppo' }, { label: 'HMO', value: 'hmo' }, { label: 'HDHP', value: 'hdhp' }, { label: 'Waive', value: 'waive' }] },
          { fieldId: 'f6', label: 'Dental Plan', type: 'DROPDOWN', required: false, options: [{ label: 'Standard', value: 'standard' }, { label: 'Premium', value: 'premium' }, { label: 'Waive', value: 'waive' }] },
          { fieldId: 'f7', label: 'Vision Plan', type: 'DROPDOWN', required: false, options: [{ label: 'Standard', value: 'standard' }, { label: 'Waive', value: 'waive' }] },
          { fieldId: 'f8', label: '401(k) Contribution %', type: 'NUMBER', required: false },
        ],
      },
      {
        name: 'Equipment provisioning',
        type: 'TODO',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Order and provision the new hire\'s equipment (laptop, monitors, peripherals) and ensure delivery before or on the start date.',
      },
      {
        name: 'System access & accounts',
        type: 'TODO',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Create the new hire\'s email account, SSO credentials, and access to role-specific applications. Verify all accounts are functional before day one.',
      },
      {
        name: 'First-day orientation',
        type: 'TODO',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Conduct the first-day orientation covering company overview, policies, facilities tour (or virtual equivalent), and introductions to key team members.',
      },
      {
        name: 'Manager welcome & 30-day plan',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Hiring Manager',
        sampleDescription:
          'Welcome the new hire to the team and share the 30-day plan including initial goals, key meetings, and ramp-up milestones.',
      },
    ],
  },

  // ── 16. Contractor / Freelancer Onboarding ───────────────────────────
  {
    id: 'contractor-freelancer-onboarding',
    name: 'Contractor / Freelancer Onboarding',
    category: 'hr-employee',
    description:
      'Onboard independent contractors and freelancers with proper classification checks, agreement execution, and payment setup. Ensures compliance with IRS guidelines while getting contractors productive quickly.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Contractor engagement approved',
    roles: ['Contractor', 'Hiring Manager', 'Finance'],
    useCases: [
      'Marketing team engages a freelance designer for a campaign project',
      'Engineering hires a contract developer for a 6-month sprint',
      'Consulting firm brings on a subject matter expert for a client engagement',
      'Company engages an interim executive while searching for a permanent hire',
    ],
    requirements: [
      'Upload your SOW / contractor agreement for e-signature (replaces sample)',
      'Upload your NDA document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to your vendor management system (SAP Fieldglass, Beeline) to auto-trigger this flow when a contractor requisition is approved',
      'Integrate with your AP system to auto-configure payment schedules and invoice routing based on the engagement details and rate',
      'Schedule an auto-reminder to launch 30 days before each contract end date so hiring managers can decide on renewal or extension',
      'Pair with the Background Check template for contractor engagements that require pre-engagement screening',
    ],
    steps: [
      {
        name: 'Contractor information form',
        type: 'FORM',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Provide your business details including legal or business name, entity type, and work authorization status.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal / Business Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [{ label: 'Individual / Sole Proprietor', value: 'individual' }, { label: 'LLC', value: 'llc' }, { label: 'Corporation', value: 'corporation' }, { label: 'Partnership', value: 'partnership' }] },
          { fieldId: 'f3', label: 'Work Authorization Status', type: 'DROPDOWN', required: true, options: [{ label: 'US Citizen', value: 'us-citizen' }, { label: 'Permanent Resident', value: 'permanent-resident' }, { label: 'Work Visa', value: 'work-visa' }, { label: 'International (non-US)', value: 'international' }] },
          { fieldId: 'f4', label: 'Contact Email', type: 'EMAIL', required: true },
          { fieldId: 'f5', label: 'Phone Number', type: 'TEXT_SINGLE_LINE', required: false },
        ],
      },
      {
        name: 'Engagement details',
        type: 'FORM',
        assigneeRole: 'Hiring Manager',
        sampleDescription:
          'Define the engagement parameters including project scope, start and end dates, rate, budget, and business justification.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Project / Engagement Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Start Date', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'End Date', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Hourly Rate / Fixed Fee', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Total Budget', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Business Justification', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'AI classification risk check',
        type: 'TODO',
        assigneeRole: 'Hiring Manager',
        sampleDescription:
          'AI-powered: Evaluate the engagement against the IRS 20-factor test for worker classification. Generate a misclassification risk score (Low/Medium/High) with recommendations.',
      },
      {
        name: 'SOW / contractor agreement',
        type: 'ESIGN',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Review and sign the Statement of Work and independent contractor agreement defining scope, deliverables, and terms.',
        sampleDocumentRef: 'contractor-sow.pdf',
      },
      {
        name: 'NDA execution',
        type: 'ESIGN',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Review and sign the Non-Disclosure Agreement to protect confidential information accessed during the engagement.',
        sampleDocumentRef: 'contractor-nda.pdf',
      },
      {
        name: 'W-9 & insurance documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Upload your completed W-9 form and certificates of insurance (general liability and professional liability, if applicable).',
      },
      {
        name: 'Payment setup form',
        type: 'FORM',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Provide your payment details so we can process invoices promptly.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Bank Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Routing Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Account Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Payment Method Preference', type: 'DROPDOWN', required: true, options: [{ label: 'ACH / Direct Deposit', value: 'ach' }, { label: 'Check', value: 'check' }, { label: 'Wire Transfer', value: 'wire' }] },
          { fieldId: 'f5', label: 'Invoice Submission Instructions', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'System access provisioning',
        type: 'TODO',
        assigneeRole: 'Hiring Manager',
        sampleDescription:
          'Provision necessary system access for the contractor, including project tools, communication platforms, and any role-specific applications with appropriate permissions.',
      },
      {
        name: 'Onboarding complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Hiring Manager',
        sampleDescription:
          'Acknowledge that the contractor onboarding is complete and the engagement is ready to begin.',
      },
    ],
  },

  // ── 17. Background Check & Employment Verification ───────────────────
  {
    id: 'background-check-employment-verification',
    name: 'Background Check & Employment Verification',
    category: 'hr-employee',
    description:
      'Manage pre-employment screening from authorization through background checks, employment history verification, and education verification. Ensures thorough vetting while keeping the candidate informed throughout the process.',
    complexity: 'Standard',
    tags: ['HR', 'Recruiting'],
    trigger: 'Offer extended / Pre-employment screening',
    roles: ['Candidate', 'HR Coordinator', 'Background Vendor', 'Previous Employer'],
    useCases: [
      'Standard pre-employment background check for a new hire',
      'Promotion to a sensitive role requires additional screening',
      'Contractor engagement mandates background verification',
      'Periodic re-screening for employees in regulated positions',
    ],
    requirements: [
      'Upload your background check authorization document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your ATS (Greenhouse, Lever, iCIMS) to auto-trigger this flow when a candidate reaches the Background Check stage in your hiring pipeline',
      'Connect to a background screening provider API (Checkr, Sterling, GoodHire) to auto-submit verification requests and pull results back into the flow',
      'Use AI to cross-reference candidate-submitted employment history against verification results and auto-flag discrepancies for HR coordinator review',
      'Set up a recurring schedule to auto-launch periodic re-screening for employees in regulated or sensitive positions',
    ],
    steps: [
      {
        name: 'Background check authorization',
        type: 'ESIGN',
        assigneeRole: 'Candidate',
        sampleDescription:
          'Review and sign the background check authorization form consenting to criminal, employment, and education verification.',
        sampleDocumentRef: 'background-check-authorization.pdf',
      },
      {
        name: 'Candidate information',
        type: 'FORM',
        assigneeRole: 'Candidate',
        sampleDescription:
          'Provide your personal information needed for the background screening process.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Full Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Other Names Used', type: 'TEXT_SINGLE_LINE', required: false },
          { fieldId: 'f3', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Social Security Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Current Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Addresses for Past 7 Years', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Employment history',
        type: 'FORM',
        assigneeRole: 'Candidate',
        sampleDescription:
          'List your employment history for the past 7 years, including employer name, title, dates, and supervisor contact information.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Employer Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Job Title', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Start Date', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'End Date', type: 'DATE', required: false },
          { fieldId: 'f5', label: 'Supervisor Name & Contact', type: 'TEXT_SINGLE_LINE', required: false },
          { fieldId: 'f6', label: 'Reason for Leaving', type: 'TEXT_SINGLE_LINE', required: false },
        ],
      },
      {
        name: 'Verification request',
        type: 'TODO',
        assigneeRole: 'Background Vendor',
        sampleDescription:
          'Initiate the background check with the screening vendor. Submit candidate information and monitor progress across all verification categories.',
      },
      {
        name: 'Previous employer verification',
        type: 'FORM',
        assigneeRole: 'Previous Employer',
        sampleDescription:
          'Verify the candidate\'s employment with your organization by confirming dates of employment, title, and eligibility for rehire.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Candidate Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Dates of Employment', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Job Title', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Eligible for Rehire?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'N/A - Policy', value: 'na' }] },
          { fieldId: 'f5', label: 'Additional Comments', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Education verification',
        type: 'TODO',
        assigneeRole: 'Background Vendor',
        sampleDescription:
          'Verify the candidate\'s educational credentials with the listed institutions. Confirm degrees, dates of attendance, and any honors.',
      },
      {
        name: 'Results review',
        type: 'TODO',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Review the completed background check results, employment verifications, and education verifications. Flag any discrepancies or adverse findings for further evaluation.',
      },
      {
        name: 'Candidate acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Candidate',
        sampleDescription:
          'Acknowledge that the background check process is complete. You will be notified of the outcome by the hiring team.',
      },
    ],
  },

  // ── 18. Employee Termination / Offboarding ───────────────────────────
  {
    id: 'employee-termination-offboarding',
    name: 'Employee Termination / Offboarding',
    category: 'hr-employee',
    description:
      'Manage the complete employee separation process from notification through exit interview, benefits transition, equipment return, access revocation, and final pay. Ensures compliance and a respectful offboarding experience.',
    complexity: 'Standard',
    tags: ['All Industries', 'HR'],
    trigger: 'Termination decision / Resignation',
    roles: ['Departing Employee', 'HR Coordinator', 'IT Administrator', 'Finance', 'Manager'],
    useCases: [
      'Employee submits voluntary resignation with standard notice period',
      'Involuntary termination requires structured offboarding process',
      'Retiring employee needs comprehensive benefits transition guidance',
      'Remote employee separation requires coordinated equipment return',
    ],
    requirements: [
      'Upload your separation agreement document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to your HRIS (Workday, BambooHR) to auto-trigger this flow when an employee status changes to Terminating or Resigned',
      'Integrate with your identity provider (Okta, Azure AD) to auto-revoke SSO access and deactivate accounts on the employee last day',
      'Use AI to analyze exit interview responses and auto-generate a trend report highlighting recurring reasons for departure across the organization',
      'Run equipment return, access revocation, and final paycheck processing in parallel to complete offboarding within 48 hours of last day',
    ],
    steps: [
      {
        name: 'Separation notice',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Departing Employee',
        sampleDescription:
          'Acknowledge receipt of the separation notice and confirm your understanding of the offboarding timeline and process.',
      },
      {
        name: 'Exit interview',
        type: 'FORM',
        assigneeRole: 'Departing Employee',
        sampleDescription:
          'Complete the confidential exit interview to share your feedback about your experience, management, and suggestions for improvement.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Primary Reason for Leaving', type: 'DROPDOWN', required: true, options: [{ label: 'New opportunity', value: 'new-opportunity' }, { label: 'Compensation', value: 'compensation' }, { label: 'Career growth', value: 'career-growth' }, { label: 'Work-life balance', value: 'work-life' }, { label: 'Management', value: 'management' }, { label: 'Relocation', value: 'relocation' }, { label: 'Retirement', value: 'retirement' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f2', label: 'Overall Experience Rating (1-10)', type: 'NUMBER', required: false },
          { fieldId: 'f3', label: 'What did we do well?', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f4', label: 'What could we improve?', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f5', label: 'Would you recommend this company to others?', type: 'DROPDOWN', required: false, options: [{ label: 'Yes', value: 'yes' }, { label: 'Maybe', value: 'maybe' }, { label: 'No', value: 'no' }] },
        ],
      },
      {
        name: 'Benefits / COBRA information',
        type: 'FILE_REQUEST',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Prepare and deliver COBRA continuation coverage information, benefits termination details, and any applicable retirement plan distribution options.',
      },
      {
        name: 'Final expense submission',
        type: 'FILE_REQUEST',
        assigneeRole: 'Departing Employee',
        sampleDescription:
          'Upload any outstanding expense reports and receipts for reimbursement processing before your last day.',
      },
      {
        name: 'Equipment return',
        type: 'TODO',
        assigneeRole: 'Departing Employee',
        sampleDescription:
          'Return all company-issued equipment including laptop, monitors, badges, keys, and any other company property. Ship to the provided address if working remotely.',
      },
      {
        name: 'Access revocation',
        type: 'TODO',
        assigneeRole: 'IT Administrator',
        sampleDescription:
          'Revoke all system access including email, SSO, VPN, cloud services, and building access. Archive the user account per retention policy.',
      },
      {
        name: 'Final paycheck',
        type: 'TODO',
        assigneeRole: 'Finance',
        sampleDescription:
          'Process the final paycheck including any accrued PTO payout, expense reimbursements, and prorated compensation per state requirements.',
      },
      {
        name: 'Separation agreement (if applicable)',
        type: 'ESIGN',
        assigneeRole: 'Departing Employee',
        sampleDescription:
          'Review and sign the separation agreement, if applicable, covering release terms, severance, and any post-employment obligations.',
        sampleDocumentRef: 'separation-agreement.pdf',
      },
      {
        name: 'Offboarding complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Manager',
        sampleDescription:
          'Acknowledge that all offboarding steps are complete, access has been revoked, equipment returned, and final pay processed.',
      },
    ],
  },

  // ── 19. Employee Relocation ──────────────────────────────────────────
  {
    id: 'employee-relocation',
    name: 'Employee Relocation',
    category: 'hr-employee',
    description:
      'Coordinate employee relocations from authorization through preference gathering, home sale or lease assistance, destination services, and expense documentation. Keeps HR, the employee, and relocation partners aligned throughout the move.',
    complexity: 'Standard',
    tags: ['HR', 'Enterprise', 'Global Companies'],
    trigger: 'Relocation approved / Employee transfer',
    roles: ['Employee', 'HR Coordinator', 'Relocation Company', 'Destination Services'],
    useCases: [
      'Employee accepts a promotion requiring relocation to headquarters',
      'International transfer moves an employee to a new country office',
      'Office consolidation requires several employees to relocate',
      'New hire negotiates relocation assistance as part of offer package',
    ],
    recommendations: [
      'Connect to your HRIS (Workday, SuccessFactors) to auto-trigger this flow when a transfer or relocation is approved in the system',
      'Integrate with your relocation management company (SIRVA, Cartus) API to auto-submit relocation requests and receive status updates on move logistics',
      'Use AI to analyze employee preferences and destination market data to auto-generate a shortlist of neighborhoods matching commute, school, and budget criteria',
      'Sync relocation expense data to your expense management system (Concur, Expensify) to streamline reimbursement and ensure policy compliance on spending limits',
    ],
    steps: [
      {
        name: 'Relocation authorization',
        type: 'FORM',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Complete the relocation authorization form with employee details, origin and destination locations, approved relocation tier, and budget.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Employee Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Current Location', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Destination Location', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Relocation Tier', type: 'DROPDOWN', required: true, options: [{ label: 'Tier 1 - Full Relocation', value: 'tier-1' }, { label: 'Tier 2 - Standard', value: 'tier-2' }, { label: 'Tier 3 - Lump Sum', value: 'tier-3' }] },
          { fieldId: 'f5', label: 'Approved Budget', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Target Start Date at New Location', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Employee preferences',
        type: 'FORM',
        assigneeRole: 'Employee',
        sampleDescription:
          'Share your preferences for the relocation including housing type, school requirements, commute preferences, and any special considerations.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Housing Preference', type: 'DROPDOWN', required: true, options: [{ label: 'Buy', value: 'buy' }, { label: 'Rent', value: 'rent' }, { label: 'Undecided', value: 'undecided' }] },
          { fieldId: 'f2', label: 'Number of Bedrooms Needed', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'School-Age Children?', type: 'DROPDOWN', required: false, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { fieldId: 'f4', label: 'Preferred Neighborhoods / Areas', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f5', label: 'Maximum Commute Time (minutes)', type: 'NUMBER', required: false },
          { fieldId: 'f6', label: 'Special Considerations', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Policy acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Employee',
        sampleDescription:
          'Review and acknowledge the relocation policy, including covered expenses, reimbursement procedures, tax implications, and clawback provisions.',
      },
      {
        name: 'Home sale / lease break assistance',
        type: 'TODO',
        assigneeRole: 'Relocation Company',
        sampleDescription:
          'Assist the employee with selling their current home or breaking their lease. Coordinate with real estate agents, manage listings, or negotiate lease termination as applicable.',
      },
      {
        name: 'Destination home search',
        type: 'TODO',
        assigneeRole: 'Destination Services',
        sampleDescription:
          'Help the employee find housing in the destination city based on their stated preferences. Arrange area tours, property viewings, and school visits.',
      },
      {
        name: 'Moving estimate',
        type: 'FILE_REQUEST',
        assigneeRole: 'Relocation Company',
        sampleDescription:
          'Provide the detailed moving estimate including household goods shipment, packing services, insurance, and any storage needs.',
      },
      {
        name: 'Move date confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Employee',
        sampleDescription:
          'Confirm the final move date and logistics. Acknowledge the packing, pickup, and delivery schedule.',
      },
      {
        name: 'Expense documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Employee',
        sampleDescription:
          'Upload all relocation expense receipts and documentation for reimbursement, including travel, temporary housing, and miscellaneous moving costs.',
      },
      {
        name: 'Relocation complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'HR Coordinator',
        sampleDescription:
          'Acknowledge that the relocation is complete. Confirm the employee has started at the new location and all expense claims have been submitted.',
      },
    ],
  },
];
