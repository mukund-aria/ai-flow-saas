import type { GalleryTemplate } from './types';

export const BANKING_FINANCIAL_TEMPLATES: GalleryTemplate[] = [
  // ── 20. Individual KYC Verification ──────────────────────────────────────
  {
    id: 'individual-kyc-verification',
    name: 'Individual KYC Verification',
    category: 'banking-financial',
    description:
      'Collect and verify individual identity documents from initial intake through risk scoring, EDD branching, and final compliance approval. Covers AML/KYC requirements end-to-end so new accounts are opened with full regulatory confidence.',
    complexity: 'Complex',
    tags: ['Financial Services', 'Banking', 'Wealth Management'],
    trigger: 'New account / periodic review',
    roles: ['Individual', 'Compliance Reviewer', 'Compliance Manager'],
    useCases: [
      'New retail banking customer opening a checking or savings account',
      'Wealth management client onboarding for investment advisory services',
      'Periodic re-verification triggered by regulatory refresh cycle',
      'Cross-border client requiring enhanced due diligence documentation',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to a third-party identity verification API (Jumio, Onfido) to automate document authentication and reduce manual review time',
      'Use AI to auto-score risk profiles by cross-referencing CDD responses, source-of-funds documentation, and sanctions screening results before compliance reviewer triage',
      'Auto-archive completed KYC files to your compliance document management system (e.g., Laserfiche, iManage) for audit readiness',
      'Schedule the Periodic KYC/KYB Refresh template to auto-launch on a 1-3 year cycle based on the risk rating assigned at account opening',
    ],
    steps: [
      {
        name: 'Personal information intake',
        type: 'FORM',
        assigneeRole: 'Individual',
        sampleDescription:
          'Provide your personal details so we can begin the KYC verification process. All information is kept confidential and used solely for regulatory compliance.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Full Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Nationality', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Tax Identification Number (TIN)', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Residential Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Occupation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f7', label: 'Source of Funds', type: 'DROPDOWN', required: true, options: [
            { label: 'Employment Income', value: 'employment' },
            { label: 'Business Income', value: 'business' },
            { label: 'Investments', value: 'investments' },
            { label: 'Inheritance', value: 'inheritance' },
            { label: 'Other', value: 'other' },
          ] },
        ],
      },
      {
        name: 'Government ID upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Individual',
        sampleDescription:
          'Upload a clear copy of your government-issued photo ID (passport, driver\'s license, or national ID card). Both sides if applicable.',
      },
      {
        name: 'Proof of address',
        type: 'FILE_REQUEST',
        assigneeRole: 'Individual',
        sampleDescription:
          'Upload a recent proof of address document such as a utility bill, bank statement, or government letter dated within the last 90 days.',
      },
      {
        name: 'Source of funds documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Individual',
        sampleDescription:
          'Upload documentation supporting your declared source of funds, such as pay stubs, business financials, or investment statements.',
      },
      {
        name: 'CDD questionnaire',
        type: 'FORM',
        assigneeRole: 'Individual',
        sampleDescription:
          'Answer these customer due diligence questions to help us assess your account profile and ensure regulatory compliance.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Do you expect to send or receive international wire transfers?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f2', label: 'Are you a Politically Exposed Person (PEP)?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f3', label: 'Do you hold accounts at other financial institutions?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f4', label: 'Do you hold or transact in cryptocurrency?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
        ],
      },
      {
        name: 'AI risk scoring & sanctions screening',
        type: 'TODO',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'AI-powered: Screen the individual against OFAC, PEP databases, and adverse media sources. Generate a risk score (Low / Medium / High) based on the screening results and CDD responses.',
      },
      {
        name: 'EDD required?',
        type: 'DECISION',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Review the risk score and determine whether Enhanced Due Diligence is required. High-risk individuals proceed to EDD; standard-risk individuals advance directly to compliance review.',
      },
      {
        name: 'EDD additional documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Individual',
        sampleDescription:
          'Additional documentation is required for enhanced due diligence. Upload any requested materials such as detailed financial statements, source of wealth evidence, or reference letters.',
      },
      {
        name: 'Compliance review',
        type: 'TODO',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Review all collected documents, screening results, and risk assessment. Prepare your recommendation for the compliance manager.',
      },
      {
        name: 'KYC decision',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Manager',
        sampleDescription:
          'Review the complete KYC file and compliance reviewer recommendation. Approve to activate the account or reject with documented reasons.',
      },
    ],
  },

  // ── 21. Business KYB Document Collection ─────────────────────────────────
  {
    id: 'business-kyb-document-collection',
    name: 'Business KYB Document Collection',
    category: 'banking-financial',
    description:
      'Gather and validate business formation documents, ownership structures, and beneficial owner identities for new business account applications. Ensures AML/KYB compliance with a structured review-and-approval workflow.',
    complexity: 'Standard',
    tags: ['Financial Services', 'Banking', 'FinTech'],
    trigger: 'New business account application',
    roles: ['Business Admin', 'Beneficial Owner', 'Compliance Reviewer', 'Compliance Manager'],
    useCases: [
      'New LLC opening a commercial deposit account',
      'FinTech partner onboarding requiring full KYB verification',
      'Subsidiary of an existing client adding a new entity account',
      'Non-profit organization applying for a business banking relationship',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with a Secretary of State API to auto-verify business formation documents and good standing status',
      'Use AI to extract and cross-reference entity data from uploaded formation documents, ownership agreements, and beneficial owner IDs to flag discrepancies before compliance review',
      'Push verified beneficial ownership data to your CDD/AML case management system (e.g., Actimize, Verafin) for ongoing monitoring',
      'Chain with the Beneficial Ownership (FinCEN BOI) Collection template when the entity is subject to Corporate Transparency Act reporting requirements',
    ],
    steps: [
      {
        name: 'Business information intake',
        type: 'FORM',
        assigneeRole: 'Business Admin',
        sampleDescription:
          'Provide your company\'s basic business details including legal name, entity type, EIN, state of incorporation, and primary business activities.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Business Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'DBA / Trade Name', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f3', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [
            { label: 'LLC', value: 'llc' },
            { label: 'Corporation', value: 'corporation' },
            { label: 'Partnership', value: 'partnership' },
            { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
            { label: 'Non-Profit', value: 'non_profit' },
          ] },
          { fieldId: 'f4', label: 'EIN / Tax ID', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'State of Incorporation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Date of Incorporation', type: 'DATE', required: true },
          { fieldId: 'f7', label: 'Primary Business Activity', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f8', label: 'Business Address', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Formation documents (Articles, Cert of Good Standing)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Business Admin',
        sampleDescription:
          'Upload your business formation documents including Articles of Incorporation/Organization and a current Certificate of Good Standing from your state of formation.',
      },
      {
        name: 'Ownership structure documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Business Admin',
        sampleDescription:
          'Upload your ownership structure documentation such as an operating agreement, shareholder registry, or organizational chart showing all owners with their ownership percentages.',
      },
      {
        name: 'Beneficial owner identification',
        type: 'FORM',
        assigneeRole: 'Beneficial Owner',
        sampleDescription:
          'Provide your personal details as a beneficial owner of the business. This information is required for regulatory compliance.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Full Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Ownership Percentage', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Residential Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Title / Role', type: 'TEXT_SINGLE_LINE', required: true },
        ],
      },
      {
        name: 'Beneficial owner ID verification',
        type: 'FILE_REQUEST',
        assigneeRole: 'Beneficial Owner',
        sampleDescription:
          'Upload a clear copy of your government-issued photo ID (passport, driver\'s license, or national ID) for identity verification.',
      },
      {
        name: 'KYB review',
        type: 'TODO',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Review all submitted business documents and beneficial owner information for completeness and accuracy. Flag any discrepancies or missing items.',
      },
      {
        name: 'Clarification questions',
        type: 'FORM',
        assigneeRole: 'Business Admin',
        sampleDescription:
          'The compliance team has follow-up questions about your submission. Please provide the requested clarifications.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Details', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'KYB decision',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Manager',
        sampleDescription:
          'Review the complete KYB file including business documents, beneficial ownership verification, and compliance reviewer notes. Approve or reject the business account application.',
      },
    ],
  },

  // ── 22. Beneficial Ownership (FinCEN BOI) Collection ─────────────────────
  {
    id: 'beneficial-ownership-fincen-boi-collection',
    name: 'Beneficial Ownership (FinCEN BOI) Collection',
    category: 'banking-financial',
    description:
      'Collect and file Beneficial Ownership Information reports required by the Corporate Transparency Act. Guides reporting companies through exemption analysis, owner identification, and FinCEN submission with full audit trail.',
    complexity: 'Standard',
    tags: ['All Industries', 'Corporate Services', 'Legal'],
    trigger: 'New company formation / BOI deadline',
    roles: ['Company Contact', 'Beneficial Owner', 'Filing Agent'],
    useCases: [
      'Newly formed LLC filing its initial BOI report with FinCEN',
      'Law firm collecting BOI information on behalf of multiple entity clients',
      'Accounting firm managing BOI filings for small business clients',
      'Corporate services provider handling annual CTA compliance for portfolio companies',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to the FinCEN BOIR e-filing API to submit reports directly from the completed flow without manual re-entry',
      'Integrate with your entity management system (e.g., Diligent Entities, CSC) to auto-populate company and ownership data',
      'Use AI to analyze uploaded operating agreements and shareholder registries to auto-identify all individuals meeting the 25% ownership or substantial control thresholds',
      'Set up automated 30-day change-detection reminders so updates or corrections are filed within the CTA deadline',
    ],
    steps: [
      {
        name: 'Exemption & reporting determination',
        type: 'FORM',
        assigneeRole: 'Filing Agent',
        sampleDescription:
          'Analyze the entity type, formation jurisdiction, and applicable exemption categories to determine if a BOI report is required. The CTA provides 23 exemption categories.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Entity Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [
            { label: 'LLC', value: 'llc' },
            { label: 'Corporation', value: 'corporation' },
            { label: 'Limited Partnership', value: 'lp' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f3', label: 'Jurisdiction of Formation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Exemption Category (if applicable)', type: 'DROPDOWN', options: [
            { label: 'Not Exempt', value: 'not_exempt' },
            { label: 'Large Operating Company', value: 'large_operating' },
            { label: 'Regulated Entity', value: 'regulated' },
            { label: 'Tax-Exempt Organization', value: 'tax_exempt' },
            { label: 'Other Exemption', value: 'other' },
          ] },
          { fieldId: 'f5', label: 'Exemption Analysis Notes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Reporting company information',
        type: 'FORM',
        assigneeRole: 'Company Contact',
        sampleDescription:
          'Provide the reporting company details required for the FinCEN BOI report, including all legal names, tax ID, and registered address.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'DBA / Trade Names', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f3', label: 'EIN', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Jurisdiction of Formation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Current U.S. Address', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Beneficial owner identification',
        type: 'FORM',
        assigneeRole: 'Company Contact',
        sampleDescription:
          'Identify all individuals with 25% or greater ownership or who exercise substantial control over the company, including senior officers, those with appointment authority, and key decision-makers.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Beneficial Owner Full Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Ownership Percentage', type: 'NUMBER' },
          { fieldId: 'f3', label: 'Basis of Beneficial Ownership', type: 'DROPDOWN', required: true, options: [
            { label: '25%+ Ownership', value: 'ownership' },
            { label: 'Substantial Control', value: 'control' },
            { label: 'Both', value: 'both' },
          ] },
          { fieldId: 'f4', label: 'Role / Title', type: 'TEXT_SINGLE_LINE', required: true },
        ],
      },
      {
        name: 'Beneficial owner details & ID upload',
        type: 'FORM',
        assigneeRole: 'Beneficial Owner',
        sampleDescription:
          'Provide your personal details and upload your identifying document for the BOI report. Accepted IDs include passport, driver\'s license, or state-issued ID.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Full Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Residential Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'ID Document Type', type: 'DROPDOWN', required: true, options: [
            { label: 'Passport', value: 'passport' },
            { label: 'Driver\'s License', value: 'drivers_license' },
            { label: 'State ID', value: 'state_id' },
          ] },
          { fieldId: 'f5', label: 'ID Number', type: 'TEXT_SINGLE_LINE', required: true },
        ],
      },
      {
        name: 'Company applicant information (if post-2024 entity)',
        type: 'FORM',
        assigneeRole: 'Filing Agent',
        sampleDescription:
          'For entities formed after January 1, 2024, provide information on up to two company applicants: the direct filer and the person who directed the filing.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Applicant Full Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Business Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'ID Document Type', type: 'DROPDOWN', required: true, options: [
            { label: 'Passport', value: 'passport' },
            { label: 'Driver\'s License', value: 'drivers_license' },
            { label: 'State ID', value: 'state_id' },
          ] },
          { fieldId: 'f5', label: 'ID Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Role', type: 'DROPDOWN', required: true, options: [
            { label: 'Direct Filer', value: 'direct_filer' },
            { label: 'Person Directing Filing', value: 'directing_filing' },
          ] },
        ],
      },
      {
        name: 'Filing agent review & validation',
        type: 'TODO',
        assigneeRole: 'Filing Agent',
        sampleDescription:
          'Verify completeness of all submitted information, cross-reference ownership percentages, and validate ID documents before filing with FinCEN.',
      },
      {
        name: 'BOI report filing confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Filing Agent',
        sampleDescription:
          'Confirm that the BOI report has been filed with FinCEN. Note the 30-day obligation to file updates or corrections if any reported information changes.',
      },
    ],
  },

  // ── 23. Periodic KYC/KYB Refresh ─────────────────────────────────────────
  {
    id: 'periodic-kyc-kyb-refresh',
    name: 'Periodic KYC/KYB Refresh',
    category: 'banking-financial',
    description:
      'Run a streamlined refresh of existing KYC or KYB records when the review cycle triggers. Collects updated documentation from clients and beneficial owners, then routes through compliance review and approval.',
    complexity: 'Simple',
    tags: ['Financial Services', 'Banking'],
    trigger: 'KYC refresh date (1-3 year cycle) / Risk trigger',
    roles: ['Client Contact', 'Beneficial Owner', 'Compliance Reviewer'],
    useCases: [
      'Annual KYC refresh for high-risk retail banking clients',
      'Triennial review cycle for standard-risk business accounts',
      'Risk-triggered refresh after adverse media screening alert',
      'Regulatory exam preparation requiring updated client documentation',
    ],
    recommendations: [
      'Connect to sanctions screening services (World-Check, Dow Jones) to run automated re-screening against updated watchlists during each refresh',
      'Push refresh completion status back to your AML case management platform to keep client risk profiles current',
      'Use AI to compare newly submitted documents against the existing KYC/KYB file and highlight material changes that require compliance reviewer attention',
      'Schedule auto-launch on a 1-3 year cycle tied to each client\'s risk rating, with high-risk accounts refreshed annually and standard-risk every three years',
    ],
    steps: [
      {
        name: 'Refresh notification',
        type: 'FORM',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Your account is due for a periodic KYC/KYB refresh. Please confirm your current details and indicate any changes to your personal or business information.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Have your personal/business details changed?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f2', label: 'Description of Changes (if any)', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Updated documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Upload any updated documents such as a current government ID, proof of address, or updated financial statements as applicable to your account type.',
      },
      {
        name: 'UBO changes (if any)',
        type: 'FORM',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'If there have been any changes to beneficial ownership, provide updated details here including new owners, ownership percentage changes, or departures.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Have there been changes to beneficial ownership?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f2', label: 'Details of UBO Changes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Updated UBO documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Beneficial Owner',
        sampleDescription:
          'If beneficial ownership has changed, upload updated identification documents and any supporting ownership structure documentation.',
      },
      {
        name: 'Refresh review',
        type: 'TODO',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Review all updated documentation and compare against existing records. Verify that all changes are properly documented and the client profile is current.',
      },
      {
        name: 'Refresh approved',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Approve the KYC/KYB refresh to confirm the client\'s records are current and compliant. Reject if additional documentation or clarification is needed.',
      },
    ],
  },

  // ── 24. Commercial Loan Application & Underwriting ───────────────────────
  {
    id: 'commercial-loan-application-underwriting',
    name: 'Commercial Loan Application & Underwriting',
    category: 'banking-financial',
    description:
      'Guide commercial borrowers from initial application through underwriting, credit committee approval, and closing document execution. Captures financials, collateral, and disclosures in a structured pipeline that keeps every stakeholder aligned.',
    complexity: 'Complex',
    tags: ['Banking', 'Credit Unions', 'Commercial Lending'],
    trigger: 'Loan application submitted',
    roles: ['Borrower', 'Loan Officer', 'Underwriter', 'Credit Committee'],
    useCases: [
      'Small business applying for a commercial real estate loan',
      'Existing deposit customer requesting a working capital line of credit',
      'SBA loan application requiring federal documentation standards',
      'Agricultural borrower seeking seasonal operating line financing',
    ],
    requirements: [
      'Upload your closing document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your loan origination system (LOS) to auto-create loan records and sync application data as the flow progresses',
      'Connect to a credit bureau API (Equifax, Experian, TransUnion) to auto-pull credit reports during the underwriting step',
      'Use AI to auto-score credit applications by analyzing uploaded financial statements, tax returns, and collateral documentation before underwriter review',
      'Chain with the Credit Line Renewal template to auto-launch renewal flows as facilities approach maturity',
    ],
    steps: [
      {
        name: 'Loan application intake',
        type: 'FORM',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Complete the loan application with your personal and business details, the purpose of the loan, and the amount requested.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Social Security Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Employment / Business Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Loan Purpose', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Requested Loan Amount', type: 'NUMBER', required: true },
          { fieldId: 'f6', label: 'Property Type (if applicable)', type: 'DROPDOWN', options: [
            { label: 'Commercial Real Estate', value: 'cre' },
            { label: 'Equipment', value: 'equipment' },
            { label: 'Working Capital', value: 'working_capital' },
            { label: 'Other', value: 'other' },
          ] },
        ],
      },
      {
        name: 'Personal financial statement',
        type: 'FILE_REQUEST',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Upload your personal financial statement showing assets, liabilities, and net worth.',
      },
      {
        name: 'Business tax returns & financial statements',
        type: 'FILE_REQUEST',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Upload your business tax returns and financial statements for the past 3 years, including income statements, balance sheets, and cash flow statements.',
      },
      {
        name: 'Collateral documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Upload documentation for any collateral being offered, such as property appraisals, equipment valuations, or inventory reports.',
      },
      {
        name: 'Underwriter questions',
        type: 'FORM',
        assigneeRole: 'Borrower',
        sampleDescription:
          'The underwriting team has follow-up questions about your application. Please provide thorough answers to expedite the review process.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Underwriter Questions & Responses', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Conditional approval',
        type: 'APPROVAL',
        assigneeRole: 'Underwriter',
        sampleDescription:
          'Review the borrower\'s application, financial statements, and collateral documentation. Issue a conditional approval with any outstanding conditions, or decline with documented reasons.',
      },
      {
        name: 'Additional conditions',
        type: 'FILE_REQUEST',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Upload any additional documents required to satisfy the conditions of your conditional approval.',
      },
      {
        name: 'Credit committee approval',
        type: 'APPROVAL',
        assigneeRole: 'Credit Committee',
        sampleDescription:
          'Review the complete loan package including underwriter recommendation and conditional approval. Grant final approval or return for additional information.',
      },
      {
        name: 'Borrower disclosures',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Review and acknowledge the required loan disclosures, terms, and conditions before proceeding to closing.',
      },
      {
        name: 'Closing document execution',
        type: 'ESIGN',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Review and electronically sign the closing documents to finalize your commercial loan.',
      },
    ],
  },

  // ── 25. Wire Transfer Authorization ──────────────────────────────────────
  {
    id: 'wire-transfer-authorization',
    name: 'Wire Transfer Authorization',
    category: 'banking-financial',
    description:
      'Process wire transfer requests through dual authorization with OFAC screening, beneficiary verification, and post-transfer reconciliation. Enforces separation of duties and creates a complete audit trail for every outbound wire.',
    complexity: 'Standard',
    tags: ['Financial Services', 'Treasury', 'Corporate'],
    trigger: 'Wire transfer request submitted',
    roles: ['Requestor', 'Approver 1', 'Approver 2', 'Treasury Operations'],
    useCases: [
      'Vendor payment for a large capital equipment purchase',
      'International wire to a foreign subsidiary for payroll funding',
      'Client disbursement from a trust or escrow account',
      'Real estate closing funds transfer requiring same-day settlement',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your treasury management system (TMS) to auto-populate beneficiary details from the approved payee list and reduce manual entry errors',
      'Connect to an OFAC/sanctions screening API (Dow Jones, Refinitiv) to automate real-time beneficiary screening within the flow',
      'Use AI to detect anomalous wire patterns by comparing each request against historical transaction data, flagging unusual amounts, new beneficiaries, or atypical destinations for enhanced review',
      'Sync completed wire records to your ERP general ledger (NetSuite, SAP) for automatic reconciliation and month-end close',
    ],
    steps: [
      {
        name: 'Wire transfer request',
        type: 'FORM',
        assigneeRole: 'Requestor',
        sampleDescription:
          'Submit your wire transfer request with all beneficiary and payment details. Ensure bank routing information is accurate to avoid delays.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Beneficiary Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Bank Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'SWIFT / BIC Code', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f4', label: 'ABA Routing Number', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f5', label: 'Account Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Amount', type: 'NUMBER', required: true },
          { fieldId: 'f7', label: 'Currency', type: 'DROPDOWN', required: true, options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f8', label: 'Purpose / Reference', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Supporting documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Requestor',
        sampleDescription:
          'Upload the supporting documentation for this wire transfer, such as an invoice, contract, or approval memo that justifies the payment.',
      },
      {
        name: 'OFAC/sanctions screening',
        type: 'TODO',
        assigneeRole: 'Treasury Operations',
        sampleDescription:
          'Screen the beneficiary and beneficiary bank against the OFAC SDN list and other applicable sanctions lists. Escalate any potential hits to compliance immediately.',
      },
      {
        name: 'Beneficiary verification & callback',
        type: 'TODO',
        assigneeRole: 'Treasury Operations',
        sampleDescription:
          'Match the beneficiary to the approved payee list, verify bank details against prior payments, and perform a callback to a known phone number to confirm wire instructions.',
      },
      {
        name: 'First authorization',
        type: 'APPROVAL',
        assigneeRole: 'Approver 1',
        sampleDescription:
          'Review the wire transfer request, supporting documentation, and screening results. Authorize the wire or reject with documented reasons.',
      },
      {
        name: 'Second authorization',
        type: 'APPROVAL',
        assigneeRole: 'Approver 2',
        sampleDescription:
          'Provide independent second authorization for this wire transfer. Required for amounts above the single-approval threshold. Verify the request independently from the first approver.',
      },
      {
        name: 'Wire execution confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Treasury Operations',
        sampleDescription:
          'Confirm that the wire has been submitted for execution. Record the confirmation number and Fed reference number for audit purposes.',
      },
      {
        name: 'Post-transfer reconciliation',
        type: 'TODO',
        assigneeRole: 'Treasury Operations',
        sampleDescription:
          'Verify the wire posted to the bank statement, reconcile against the general ledger, and close out the transaction record.',
      },
    ],
  },

  // ── 26. Investment Account Opening ───────────────────────────────────────
  {
    id: 'investment-account-opening',
    name: 'Investment Account Opening',
    category: 'banking-financial',
    description:
      'Open new investment accounts with identity verification, suitability assessment, risk disclosures, and account agreement execution. Meets SEC, FINRA, and Reg BI requirements while providing a smooth client experience.',
    complexity: 'Standard',
    tags: ['Wealth Management', 'Brokerage', 'RIA'],
    trigger: 'New client engagement',
    roles: ['Investor', 'Account Manager', 'Compliance Officer', 'Operations'],
    useCases: [
      'High-net-worth individual opening a managed brokerage account',
      'New RIA client establishing a discretionary advisory relationship',
      'Existing bank customer adding an investment account through wealth management',
      'Trust or estate opening an investment account for beneficiaries',
    ],
    requirements: [
      'Upload your account agreement document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your portfolio management or custodial platform (Schwab, Pershing, Fidelity) to auto-create accounts upon approval and generate funding instructions',
      'Connect to a KYC/AML identity verification service to automate investor ID authentication and reduce compliance review time',
      'Use AI to analyze suitability questionnaire responses and generate a personalized investment policy statement draft for the account manager to review before the client meeting',
      'Follow up with the Quarterly Business Review (QBR) template to establish an ongoing review cadence once the account is funded and active',
    ],
    steps: [
      {
        name: 'Account application',
        type: 'FORM',
        assigneeRole: 'Investor',
        sampleDescription:
          'Complete your investment account application with personal details, employment information, and account preferences.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Full Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Date of Birth', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Social Security Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Email Address', type: 'EMAIL', required: true },
          { fieldId: 'f5', label: 'Employer Name', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f6', label: 'Account Type', type: 'DROPDOWN', required: true, options: [
            { label: 'Individual', value: 'individual' },
            { label: 'Joint', value: 'joint' },
            { label: 'IRA', value: 'ira' },
            { label: 'Trust', value: 'trust' },
          ] },
        ],
      },
      {
        name: 'Identity verification documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Investor',
        sampleDescription:
          'Upload a government-issued photo ID and a secondary verification document such as a utility bill or bank statement.',
      },
      {
        name: 'Accreditation documentation (if applicable)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Investor',
        sampleDescription:
          'If applicable, upload documentation supporting your accredited investor status such as recent tax returns, brokerage statements, or a CPA/attorney verification letter.',
      },
      {
        name: 'Suitability questionnaire',
        type: 'FORM',
        assigneeRole: 'Investor',
        sampleDescription:
          'Complete the suitability questionnaire to help us understand your investment objectives, risk tolerance, and financial situation.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Investment Objective', type: 'DROPDOWN', required: true, options: [
            { label: 'Capital Preservation', value: 'preservation' },
            { label: 'Income', value: 'income' },
            { label: 'Growth', value: 'growth' },
            { label: 'Aggressive Growth', value: 'aggressive_growth' },
            { label: 'Speculation', value: 'speculation' },
          ] },
          { fieldId: 'f2', label: 'Risk Tolerance', type: 'DROPDOWN', required: true, options: [
            { label: 'Conservative', value: 'conservative' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Aggressive', value: 'aggressive' },
          ] },
          { fieldId: 'f3', label: 'Investment Time Horizon', type: 'DROPDOWN', required: true, options: [
            { label: 'Less than 3 years', value: 'short' },
            { label: '3-10 years', value: 'medium' },
            { label: 'More than 10 years', value: 'long' },
          ] },
          { fieldId: 'f4', label: 'Annual Income', type: 'DROPDOWN', required: true, options: [
            { label: 'Under $50,000', value: 'under_50k' },
            { label: '$50,000 - $100,000', value: '50k_100k' },
            { label: '$100,000 - $250,000', value: '100k_250k' },
            { label: 'Over $250,000', value: 'over_250k' },
          ] },
          { fieldId: 'f5', label: 'Liquid Net Worth', type: 'DROPDOWN', required: true, options: [
            { label: 'Under $100,000', value: 'under_100k' },
            { label: '$100,000 - $500,000', value: '100k_500k' },
            { label: '$500,000 - $1,000,000', value: '500k_1m' },
            { label: 'Over $1,000,000', value: 'over_1m' },
          ] },
          { fieldId: 'f6', label: 'Investment Experience', type: 'DROPDOWN', required: true, options: [
            { label: 'None', value: 'none' },
            { label: 'Limited', value: 'limited' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Extensive', value: 'extensive' },
          ] },
        ],
      },
      {
        name: 'Risk disclosure acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Investor',
        sampleDescription:
          'Review and acknowledge the investment risk disclosures, including the potential for loss of principal, market volatility, and liquidity risks.',
      },
      {
        name: 'Account agreement',
        type: 'ESIGN',
        assigneeRole: 'Investor',
        sampleDescription:
          'Review and electronically sign the account agreement, including terms of service, fee schedule, and advisory or brokerage agreement.',
      },
      {
        name: 'Compliance review',
        type: 'TODO',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Review the account application, identity verification, suitability questionnaire, and signed agreements for regulatory compliance. Flag any issues or discrepancies.',
      },
      {
        name: 'Operations setup',
        type: 'TODO',
        assigneeRole: 'Operations',
        sampleDescription:
          'Set up the account in the trading and custodial systems, configure permissions, and prepare for funding instructions.',
      },
      {
        name: 'Account activation',
        type: 'APPROVAL',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Confirm that compliance review and operations setup are complete. Activate the account and notify the investor that the account is ready for funding.',
      },
    ],
  },

  // ── 27. Credit Line Renewal / Increase Request ───────────────────────────
  {
    id: 'credit-line-renewal-increase-request',
    name: 'Credit Line Renewal / Increase Request',
    category: 'banking-financial',
    description:
      'Manage credit facility renewals and limit increase requests from borrower intake through credit analysis, dual approval, and document execution. Keeps relationship managers, analysts, and credit committees coordinated throughout the process.',
    complexity: 'Standard',
    tags: ['Banking', 'Commercial Lending', 'Credit Unions'],
    trigger: 'Credit facility approaching maturity / Borrower requests increase',
    roles: ['Borrower', 'Relationship Manager', 'Credit Analyst', 'Credit Committee'],
    useCases: [
      'Annual renewal of a revolving line of credit for a commercial borrower',
      'Borrower requesting a limit increase to fund business expansion',
      'Seasonal credit line adjustment for agricultural or retail businesses',
      'Credit facility restructuring to accommodate changed business conditions',
    ],
    requirements: [
      'Upload your renewal/modification document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to a financial spreading tool (Moody\'s, Sageworks) to auto-import borrower financial data and accelerate credit analysis',
      'Use AI to extract key financial ratios from uploaded borrower statements and auto-generate the credit analysis summary with covenant compliance assessment',
      'Schedule auto-launch 90 days before facility maturity to start the renewal process and ensure no credit lines lapse',
      'Sync updated facility terms and limits back to your core banking system upon document execution to keep records current',
    ],
    steps: [
      {
        name: 'Renewal/increase request',
        type: 'FORM',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Submit your credit line renewal or increase request. Provide details about the current facility, requested changes, and the business reasons for the request.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Facility Type', type: 'DROPDOWN', required: true, options: [
            { label: 'Revolving Line of Credit', value: 'revolving' },
            { label: 'Term Loan', value: 'term' },
            { label: 'Letter of Credit', value: 'loc' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f2', label: 'Current Limit', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Requested Limit / Term', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Purpose of Request', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Business Changes Since Origination', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Updated financial statements',
        type: 'FILE_REQUEST',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Upload your current year profit & loss statement, balance sheet, interim financials, and most recent tax returns.',
      },
      {
        name: 'Borrower update questionnaire',
        type: 'FORM',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Provide updates on your business since the original facility was established. This helps the credit team assess any material changes.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Any material changes to business operations?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f2', label: 'Any new debt or obligations?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f3', label: 'Any pending or active litigation?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f4', label: 'Any ownership changes?', type: 'DROPDOWN', required: true, options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ] },
          { fieldId: 'f5', label: 'Collateral status update', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Credit analysis & financial spreading',
        type: 'TODO',
        assigneeRole: 'Credit Analyst',
        sampleDescription:
          'Perform financial spreading and credit analysis including covenant compliance, collateral coverage, cash flow adequacy, and industry trend assessment.',
      },
      {
        name: 'Credit analyst recommendation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Credit Analyst',
        sampleDescription:
          'Upload your credit analysis report with recommendation, including financial spreading results, risk assessment, and proposed terms.',
      },
      {
        name: 'Relationship manager endorsement',
        type: 'APPROVAL',
        assigneeRole: 'Relationship Manager',
        sampleDescription:
          'Review the credit analyst recommendation and endorse the renewal or increase request. Add any relationship context relevant to the credit decision.',
      },
      {
        name: 'Credit committee approval',
        type: 'APPROVAL',
        assigneeRole: 'Credit Committee',
        sampleDescription:
          'Review the complete credit package and provide final approval for the credit line renewal or increase. Note any conditions or modifications to the proposed terms.',
      },
      {
        name: 'Renewal/modification documents',
        type: 'ESIGN',
        assigneeRole: 'Borrower',
        sampleDescription:
          'Review and electronically sign the renewal or modification documents to finalize the updated credit facility terms.',
      },
      {
        name: 'Facility activation confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Relationship Manager',
        sampleDescription:
          'Confirm that the renewed or modified credit facility is active and available for use. Notify the borrower of the effective date and updated terms.',
      },
    ],
  },
];
