import type { GalleryTemplate } from './types';

export const VENDOR_PARTNER_TEMPLATES: GalleryTemplate[] = [
  // ── 8. Vendor Onboarding ─────────────────────────────────────────────
  {
    id: 'vendor-onboarding',
    name: 'Vendor Onboarding',
    category: 'vendor-partner',
    description:
      'Bring new vendors from registration through compliance screening, contract execution, and payment setup. Captures tax and insurance documentation, runs risk assessment, and ensures procurement approval before activation.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'New vendor/supplier engagement',
    roles: ['Vendor Contact', 'Procurement Owner', 'Finance Reviewer'],
    useCases: [
      'Procurement team qualifies a new technology vendor for an enterprise license',
      'Facilities department onboards a new janitorial services provider',
      'Marketing team engages a new agency partner requiring full vetting',
      'Operations adds a critical raw materials supplier to the approved vendor list',
    ],
    requirements: [
      'Upload your NDA / MSA document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your ERP (NetSuite, SAP) or procurement platform (Coupa, Ariba) to auto-create vendor master records upon approval',
      'Use AI to auto-screen uploaded insurance certificates and flag coverage gaps, expired policies, or limits below your minimum thresholds',
      'Connect to Dun & Bradstreet or Creditsafe to auto-pull financial stability scores during the AI vendor risk assessment step',
      'Pair with the Vendor Security Assessment template for vendors that will have access to your systems or sensitive data',
    ],
    steps: [
      {
        name: 'Vendor registration form',
        type: 'FORM',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Register your organization by providing legal name, entity type, DUNS number, products or services offered, and NAICS code.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Legal Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [{ label: 'Corporation', value: 'corporation' }, { label: 'LLC', value: 'llc' }, { label: 'Partnership', value: 'partnership' }, { label: 'Sole Proprietor', value: 'sole-proprietor' }, { label: 'Non-Profit', value: 'non-profit' }] },
          { fieldId: 'f3', label: 'DUNS Number', type: 'TEXT_SINGLE_LINE', required: false },
          { fieldId: 'f4', label: 'Products / Services Offered', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'NAICS Code', type: 'TEXT_SINGLE_LINE', required: false },
        ],
      },
      {
        name: 'Tax & insurance documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Upload your W-9 (or W-8BEN for international vendors), certificate of general liability insurance, professional liability insurance, and workers compensation documentation.',
      },
      {
        name: 'Compliance questionnaire',
        type: 'FORM',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Complete the compliance questionnaire covering OFAC sanctions, anti-bribery policies, data privacy practices, diversity certifications, and references.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'OFAC / Sanctions Compliance Confirmation', type: 'CHECKBOX', required: true },
          { fieldId: 'f2', label: 'Anti-Bribery / FCPA Policy in Place', type: 'CHECKBOX', required: true },
          { fieldId: 'f3', label: 'Data Privacy Practices Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Diversity Certifications (if any)', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f5', label: 'References (Company, Contact, Phone)', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'AI vendor risk assessment',
        type: 'TODO',
        assigneeRole: 'Procurement Owner',
        sampleDescription:
          'AI-powered: Assess the vendor across financial stability, industry risk, insurance adequacy, and sanctions screening. Generate a risk profile with recommendations.',
      },
      {
        name: 'NDA / MSA execution',
        type: 'ESIGN',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Review and sign the Non-Disclosure Agreement and Master Service Agreement to formalize the vendor relationship.',
        sampleDocumentRef: 'vendor-nda-msa.pdf',
      },
      {
        name: 'Banking & payment setup',
        type: 'FORM',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Provide your banking and payment details so we can set up your account in our payables system.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Bank Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Routing Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Account Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Payment Terms', type: 'DROPDOWN', required: true, options: [{ label: 'Net 15', value: 'net-15' }, { label: 'Net 30', value: 'net-30' }, { label: 'Net 45', value: 'net-45' }, { label: 'Net 60', value: 'net-60' }] },
          { fieldId: 'f5', label: 'Invoice Submission Instructions', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Procurement approval',
        type: 'APPROVAL',
        assigneeRole: 'Procurement Owner',
        sampleDescription:
          'Review all submitted vendor information, risk assessment results, and executed agreements. Approve to activate the vendor in the procurement system.',
      },
      {
        name: 'Vendor activation notification',
        type: 'TODO',
        assigneeRole: 'Procurement Owner',
        sampleDescription:
          'Automated notification: Send the vendor activation confirmation with purchase order procedures, portal access, and key contact information.',
      },
    ],
  },

  // ── 9. Vendor Security Assessment ────────────────────────────────────
  {
    id: 'vendor-security-assessment',
    name: 'Vendor Security Assessment',
    category: 'vendor-partner',
    description:
      'Evaluate a vendor\'s security posture before granting system or data access. Collects security questionnaires, certifications, architecture docs, and penetration test results for thorough risk analysis and acceptance.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'New vendor with system/data access / Annual refresh',
    roles: ['Vendor Contact', 'Security Reviewer', 'IT Risk Manager'],
    useCases: [
      'New SaaS vendor needs access to company data for integration',
      'Annual security reassessment of existing cloud infrastructure provider',
      'Vendor requesting elevated API access triggers security review',
      'M&A due diligence requires security assessment of target company vendors',
    ],
    recommendations: [
      'Integrate with SecurityScorecard or BitSight to auto-pull external security ratings as supplemental data for the risk assessment',
      'Use AI to compare vendor questionnaire responses against your security baseline and auto-flag controls that fall below minimum standards',
      'Set up a recurring schedule to auto-launch this flow annually for each vendor with system or data access',
      'Connect to a GRC platform (ServiceNow, OneTrust, Vanta) to auto-import vendor security questionnaire responses and track assessment status',
    ],
    steps: [
      {
        name: 'Security questionnaire (SIG/CAIQ)',
        type: 'FORM',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Complete the standardized security questionnaire covering your organization\'s information security controls, policies, and practices.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Data Encryption at Rest', type: 'DROPDOWN', required: true, options: [{ label: 'Yes - AES-256', value: 'aes-256' }, { label: 'Yes - Other', value: 'other' }, { label: 'No', value: 'no' }] },
          { fieldId: 'f2', label: 'Data Encryption in Transit', type: 'DROPDOWN', required: true, options: [{ label: 'TLS 1.2+', value: 'tls-12' }, { label: 'TLS 1.3', value: 'tls-13' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f3', label: 'Multi-Factor Authentication Enforced', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Optional', value: 'optional' }] },
          { fieldId: 'f4', label: 'Incident Response Plan', type: 'DROPDOWN', required: true, options: [{ label: 'Yes - Tested Annually', value: 'yes-tested' }, { label: 'Yes - Not Tested', value: 'yes-untested' }, { label: 'No', value: 'no' }] },
          { fieldId: 'f5', label: 'Data Hosting Locations', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Subprocessors with Data Access', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Certification uploads (SOC 2, ISO, etc.)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Upload current security certifications such as SOC 2 Type II report, ISO 27001 certificate, or other relevant compliance documentation.',
      },
      {
        name: 'Architecture documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Upload your system architecture documentation showing data flows, network topology, and security boundaries relevant to our integration.',
      },
      {
        name: 'Penetration test results',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Upload your most recent penetration test report and any remediation evidence for identified findings.',
      },
      {
        name: 'Security review',
        type: 'TODO',
        assigneeRole: 'Security Reviewer',
        sampleDescription:
          'Review all submitted security documentation, questionnaire responses, and certifications. Document findings and identify any gaps or concerns.',
      },
      {
        name: 'Follow-up questions',
        type: 'FORM',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Answer follow-up questions from our security team regarding any gaps or clarifications needed from the initial review.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Responses', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional Supporting Information', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Risk assessment',
        type: 'TODO',
        assigneeRole: 'IT Risk Manager',
        sampleDescription:
          'Complete the formal risk assessment based on security review findings. Assign a risk rating and document any required compensating controls or conditions.',
      },
      {
        name: 'Risk acceptance',
        type: 'APPROVAL',
        assigneeRole: 'IT Risk Manager',
        sampleDescription:
          'Approve or reject the vendor based on the completed risk assessment. If approved with conditions, document the conditions and timeline for remediation.',
      },
    ],
  },

  // ── 10. Vendor Compliance Certification (Annual) ─────────────────────
  {
    id: 'vendor-compliance-certification-annual',
    name: 'Vendor Compliance Certification (Annual)',
    category: 'vendor-partner',
    description:
      'Run the annual vendor compliance refresh to ensure continued adherence to your organization\'s standards. Collects updated certifications, insurance certificates, and a compliance attestation before review and approval.',
    complexity: 'Simple',
    tags: ['All Industries'],
    trigger: 'Vendor anniversary / Annual compliance calendar',
    roles: ['Vendor Contact', 'Compliance Reviewer'],
    useCases: [
      'Annual calendar triggers compliance renewal for all active vendors',
      'Vendor anniversary date prompts scheduled recertification',
      'Regulatory audit requires up-to-date vendor compliance documentation',
      'Contract renewal contingent on passing annual compliance review',
    ],
    recommendations: [
      'Set up a recurring schedule to auto-launch this flow annually on each vendor anniversary date',
      'Use AI to compare uploaded certifications against prior-year submissions and auto-flag any lapsed, downgraded, or missing documentation',
      'Connect to your insurance verification service to auto-validate certificate of insurance coverage amounts and expiration dates',
      'Pair with the Third-Party Remediation Tracking template when a vendor fails certification to formally track corrective actions',
    ],
    steps: [
      {
        name: 'Annual refresh notification',
        type: 'FORM',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Confirm your organization details are still current and indicate any material changes since the last compliance certification.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Any Material Changes Since Last Certification?', type: 'DROPDOWN', required: true, options: [{ label: 'No changes', value: 'no-changes' }, { label: 'Yes - see details', value: 'yes' }] },
          { fieldId: 'f2', label: 'Change Details (if applicable)', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f3', label: 'Current Primary Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Current Primary Contact Email', type: 'EMAIL', required: true },
        ],
      },
      {
        name: 'Updated certifications & policies',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Upload your current certifications, updated policies, and any new compliance documentation for the annual review.',
      },
      {
        name: 'Insurance certificates',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Upload current certificates of insurance showing active coverage that meets our minimum requirements.',
      },
      {
        name: 'Compliance attestation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Vendor Contact',
        sampleDescription:
          'Attest that your organization continues to comply with all contractual obligations, regulatory requirements, and our vendor code of conduct.',
      },
      {
        name: 'Documentation review',
        type: 'TODO',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Review all submitted certifications, insurance documents, and the compliance attestation. Verify currency and adequacy of all documentation.',
      },
      {
        name: 'Compliance approved',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Reviewer',
        sampleDescription:
          'Approve or reject the vendor\'s annual compliance certification based on the documentation review.',
      },
    ],
  },

  // ── 11. Third-Party Due Diligence ────────────────────────────────────
  {
    id: 'third-party-due-diligence',
    name: 'Third-Party Due Diligence',
    category: 'vendor-partner',
    description:
      'Conduct thorough due diligence on high-risk third-party relationships. Collects questionnaires, ownership disclosures, and supporting documentation for legal, compliance, and risk review before rendering a formal decision.',
    complexity: 'Standard',
    tags: ['Financial Services', 'Professional Services'],
    trigger: 'New third-party relationship / High-risk vendor',
    roles: ['Third Party Contact', 'Risk Reviewer', 'Legal Counsel', 'Compliance Officer'],
    useCases: [
      'New financial technology partner requires enhanced due diligence',
      'Offshore service provider engagement triggers third-party review',
      'Regulatory requirement mandates due diligence for data subprocessors',
      'High-value sole-source vendor needs comprehensive risk evaluation',
    ],
    recommendations: [
      'Integrate with LexisNexis or Refinitiv World-Check to auto-screen third parties against sanctions, PEP, and adverse media databases',
      'Use AI to analyze uploaded ownership and financial documents and auto-generate a risk summary highlighting red flags for the review team',
      'Run legal review and compliance review in parallel to cut due diligence turnaround by 50%',
      'Connect to your GRC platform (ServiceNow, Archer, OneTrust) to centralize due diligence records and link findings to your enterprise risk register',
    ],
    steps: [
      {
        name: 'Due diligence questionnaire',
        type: 'FORM',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Complete the due diligence questionnaire covering your organization\'s background, operations, financial stability, and regulatory standing.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Organization Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Jurisdiction of Incorporation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Years in Business', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Description of Services', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Any Pending Litigation or Regulatory Actions?', type: 'DROPDOWN', required: true, options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
          { fieldId: 'f6', label: 'Litigation / Regulatory Details (if applicable)', type: 'TEXT_MULTI_LINE', required: false },
        ],
      },
      {
        name: 'Supporting documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Upload supporting documentation such as financial statements, regulatory filings, and compliance certifications.',
      },
      {
        name: 'Ownership & structure disclosure',
        type: 'FILE_REQUEST',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Upload documents disclosing your organizational structure, beneficial ownership (25%+ owners), and any parent/subsidiary relationships.',
      },
      {
        name: 'Clarification questions',
        type: 'FORM',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Answer any clarification questions that arose during the initial review of your due diligence submission.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Responses to Clarification Questions', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Legal review',
        type: 'TODO',
        assigneeRole: 'Legal Counsel',
        sampleDescription:
          'Review submitted documentation for legal risks, contractual concerns, regulatory exposure, and litigation history.',
      },
      {
        name: 'Compliance review',
        type: 'TODO',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Review the third party against AML/KYC requirements, sanctions lists, and anti-corruption standards. Document compliance findings.',
      },
      {
        name: 'Risk assessment',
        type: 'TODO',
        assigneeRole: 'Risk Reviewer',
        sampleDescription:
          'Consolidate legal and compliance findings into a comprehensive risk assessment with an overall risk rating and recommendations.',
      },
      {
        name: 'Due diligence decision',
        type: 'APPROVAL',
        assigneeRole: 'Risk Reviewer',
        sampleDescription:
          'Render the final due diligence decision: approve the relationship, approve with conditions, or decline.',
      },
    ],
  },

  // ── 12. Third-Party Remediation Tracking ─────────────────────────────
  {
    id: 'third-party-remediation-tracking',
    name: 'Third-Party Remediation Tracking',
    category: 'vendor-partner',
    description:
      'Track and verify remediation of audit findings or risk gaps identified in a third-party assessment. Manages the submission of remediation plans, evidence collection, and internal verification through to final acceptance.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Audit finding / Risk assessment gap identified',
    roles: ['Third Party Contact', 'Risk Reviewer', 'Control Owner'],
    useCases: [
      'Vendor security assessment reveals critical control gaps requiring remediation',
      'Regulatory exam identifies third-party compliance deficiencies',
      'Annual audit finds vendor has lapsed certifications needing renewal',
      'Penetration test uncovers vulnerabilities in a vendor integration',
    ],
    recommendations: [
      'Connect to your GRC platform (ServiceNow, Archer) to auto-create remediation tracking tickets linked to the original audit findings',
      'Use AI to compare remediation evidence against the original findings and auto-assess whether each corrective action fully addresses the identified gap',
      'Integrate with Jira or Azure DevOps to track technical remediation items alongside your engineering team backlog for coordinated resolution',
      'Pair with the Vendor Security Assessment template to run a follow-up assessment after all remediation items are closed',
    ],
    steps: [
      {
        name: 'Remediation plan submission',
        type: 'FORM',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Submit your remediation plan detailing each finding, the corrective action to be taken, responsible parties, and target completion dates.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Finding Reference Number(s)', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Root Cause Analysis', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Corrective Actions', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Responsible Party', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Target Completion Date', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Timeline acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Acknowledge and commit to the agreed remediation timeline and milestones.',
      },
      {
        name: 'Evidence of remediation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'Upload evidence demonstrating that the corrective actions have been implemented (screenshots, configuration exports, updated policies, test results).',
      },
      {
        name: 'Internal control owner verification',
        type: 'TODO',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Verify the remediation evidence against the original findings. Confirm that the corrective actions adequately address each identified gap.',
      },
      {
        name: 'Remediation review',
        type: 'TODO',
        assigneeRole: 'Risk Reviewer',
        sampleDescription:
          'Review the control owner verification and remediation evidence. Determine if all findings have been satisfactorily addressed or if follow-up is needed.',
      },
      {
        name: 'Follow-up evidence (if needed)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Third Party Contact',
        sampleDescription:
          'If additional evidence was requested during the review, upload the supplemental documentation here.',
      },
      {
        name: 'Remediation accepted',
        type: 'APPROVAL',
        assigneeRole: 'Risk Reviewer',
        sampleDescription:
          'Approve or reject the remediation based on the evidence review. If rejected, document the remaining gaps and required next steps.',
      },
      {
        name: 'Completion notification',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Risk Reviewer',
        sampleDescription:
          'Acknowledge that the remediation process is complete and all findings have been satisfactorily resolved.',
      },
    ],
  },

  // ── 13. Partner / Channel Onboarding ─────────────────────────────────
  {
    id: 'partner-channel-onboarding',
    name: 'Partner / Channel Onboarding',
    category: 'vendor-partner',
    description:
      'Onboard new channel or technology partners from application through agreement execution, enablement, and launch readiness. Covers qualification, certification, portal setup, and go-to-market planning.',
    complexity: 'Standard',
    tags: ['Technology', 'SaaS', 'Professional Services'],
    trigger: 'New partner agreement signed',
    roles: ['Partner Contact', 'Partner Manager'],
    useCases: [
      'Technology company signs a new reseller partner in a target geography',
      'Consulting firm joins the partner program for implementation services',
      'ISV partner integrates and needs sales enablement before launch',
      'Existing customer transitions to a referral partner relationship',
    ],
    requirements: [
      'Upload your partnership agreement document for e-signature (replaces sample)',
      'Upload your NDA document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to your PRM (Partner Relationship Management) system like Impartner or PartnerStack to auto-create partner records and track pipeline from day one',
      'Use AI to evaluate partner qualification responses and auto-recommend the appropriate partner tier based on experience, certifications, and revenue commitment',
      'Integrate with your LMS (Lessonly, Docebo) to auto-enroll new partners in certification courses and track completion status',
      'Chain with the Quarterly Business Review template to establish a regular performance review cadence once the partner is active',
    ],
    steps: [
      {
        name: 'Partner application form',
        type: 'FORM',
        assigneeRole: 'Partner Contact',
        sampleDescription:
          'Submit your partner application with company details, partner type, target market, geography, and sales capacity.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Partner Type', type: 'DROPDOWN', required: true, options: [{ label: 'Reseller', value: 'reseller' }, { label: 'Referral', value: 'referral' }, { label: 'Technology / ISV', value: 'technology' }, { label: 'Implementation / SI', value: 'implementation' }] },
          { fieldId: 'f3', label: 'Target Market', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Geography / Region', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Sales Capacity (Reps)', type: 'NUMBER', required: false },
        ],
      },
      {
        name: 'Partner qualification questionnaire',
        type: 'FORM',
        assigneeRole: 'Partner Contact',
        sampleDescription:
          'Provide details on your team\'s certifications, relevant experience, and revenue commitment to help us determine the right partner tier.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Relevant Certifications', type: 'TEXT_MULTI_LINE', required: false },
          { fieldId: 'f2', label: 'Years of Relevant Experience', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Annual Revenue Commitment', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Existing Customer Base Size', type: 'NUMBER', required: false },
        ],
      },
      {
        name: 'Partnership agreement',
        type: 'ESIGN',
        assigneeRole: 'Partner Contact',
        sampleDescription:
          'Review and sign the partnership agreement that defines terms, commissions, territories, and obligations.',
        sampleDocumentRef: 'partnership-agreement.pdf',
      },
      {
        name: 'NDA execution',
        type: 'ESIGN',
        assigneeRole: 'Partner Contact',
        sampleDescription:
          'Review and sign the mutual Non-Disclosure Agreement to protect confidential information shared during the partnership.',
        sampleDocumentRef: 'partner-nda.pdf',
      },
      {
        name: 'Portal & demo environment setup',
        type: 'TODO',
        assigneeRole: 'Partner Manager',
        sampleDescription:
          'Provision the partner portal account, set up the demo/sandbox environment, and configure deal registration access.',
      },
      {
        name: 'Sales & technical certification',
        type: 'TODO',
        assigneeRole: 'Partner Contact',
        sampleDescription:
          'Complete the required sales and technical certification courses to become an authorized partner. Access training materials through the partner portal.',
      },
      {
        name: 'Go-to-market plan review',
        type: 'APPROVAL',
        assigneeRole: 'Partner Manager',
        sampleDescription:
          'Review and approve the partner\'s go-to-market plan including target accounts, marketing activities, and pipeline commitments.',
      },
      {
        name: 'Launch readiness confirmation',
        type: 'TODO',
        assigneeRole: 'Partner Manager',
        sampleDescription:
          'Verify that all enablement is complete, certifications are earned, and the partner is ready for launch. Confirm marketing materials and co-branded assets are prepared.',
      },
      {
        name: 'Partner launch announcement',
        type: 'TODO',
        assigneeRole: 'Partner Manager',
        sampleDescription:
          'Automated notification: Send the partner launch announcement internally and to the partner with welcome resources, key contacts, and first 90-day playbook.',
      },
    ],
  },

  // ── 14. Reseller / Distributor Onboarding ────────────────────────────
  {
    id: 'reseller-distributor-onboarding',
    name: 'Reseller / Distributor Onboarding',
    category: 'vendor-partner',
    description:
      'Onboard new resellers or distributors through application, credential verification, agreement execution, and product training. Covers legal review, credit setup, and channel activation to get partners selling quickly.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Technology', 'Consumer Products'],
    trigger: 'Reseller agreement approved',
    roles: ['Reseller Contact', 'Channel Manager', 'Legal Reviewer', 'Finance'],
    useCases: [
      'Manufacturer adds a new regional distributor for product expansion',
      'Software company onboards a value-added reseller in a new market',
      'Consumer brand authorizes a new retail distributor',
      'International expansion requires onboarding in-country reseller partners',
    ],
    requirements: [
      'Upload your reseller agreement document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your ERP (NetSuite, SAP) or distribution management system to auto-create reseller accounts and configure pricing tiers upon activation',
      'Connect to a credit scoring service (Dun & Bradstreet, Experian Business) to auto-assess financial health before establishing credit terms',
      'Use AI to analyze uploaded business credentials and financial statements and auto-generate a reseller viability score with risk factors for the channel manager',
      'Schedule an Annual Renewal flow to auto-launch on each reseller agreement anniversary to review performance and renew terms',
    ],
    steps: [
      {
        name: 'Reseller application',
        type: 'FORM',
        assigneeRole: 'Reseller Contact',
        sampleDescription:
          'Submit your reseller application with company details, territory of interest, target customers, and sales team size.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Business Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Territory / Region', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Target Customer Segments', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Sales Team Size', type: 'NUMBER', required: false },
          { fieldId: 'f6', label: 'Years in Distribution / Resale', type: 'NUMBER', required: true },
        ],
      },
      {
        name: 'Business credentials & financials',
        type: 'FILE_REQUEST',
        assigneeRole: 'Reseller Contact',
        sampleDescription:
          'Upload your business credentials including incorporation documents, financial statements, and trade references.',
      },
      {
        name: 'Territory / pricing acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Reseller Contact',
        sampleDescription:
          'Review and acknowledge the assigned territory boundaries, pricing schedules, discount structures, and minimum order requirements.',
      },
      {
        name: 'Reseller agreement',
        type: 'ESIGN',
        assigneeRole: 'Reseller Contact',
        sampleDescription:
          'Review and sign the reseller agreement covering terms, territory rights, pricing, and performance obligations.',
        sampleDocumentRef: 'reseller-agreement.pdf',
      },
      {
        name: 'Legal review',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Review the executed reseller agreement and supporting credentials for legal sufficiency and any risk flags.',
      },
      {
        name: 'Credit terms setup',
        type: 'TODO',
        assigneeRole: 'Finance',
        sampleDescription:
          'Establish credit terms based on the reseller\'s financial profile, set credit limits, and configure the account in the billing system.',
      },
      {
        name: 'Product training',
        type: 'TODO',
        assigneeRole: 'Reseller Contact',
        sampleDescription:
          'Complete the required product training modules covering product features, positioning, competitive differentiation, and support escalation procedures.',
      },
      {
        name: 'Partner activation',
        type: 'APPROVAL',
        assigneeRole: 'Channel Manager',
        sampleDescription:
          'Review all onboarding steps and approve the reseller for activation. Confirm training completion, legal clearance, and credit setup.',
      },
      {
        name: 'Onboarding complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Reseller Contact',
        sampleDescription:
          'Acknowledge that onboarding is complete and you are ready to begin selling. Welcome to the partner network!',
      },
    ],
  },
];
