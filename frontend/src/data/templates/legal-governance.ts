import type { GalleryTemplate } from './types';

export const LEGAL_GOVERNANCE_TEMPLATES: GalleryTemplate[] = [
  // 55. Contract Review & Execution
  {
    id: 'contract-review-execution',
    name: 'Contract Review & Execution',
    category: 'legal-governance',
    description:
      'Manage the full contract lifecycle from intake through negotiation and execution. Ensures legal review, risk analysis, and proper approvals before any agreement is signed.',
    complexity: 'Complex',
    tags: ['Cross-industry'],
    trigger: 'Contract drafted or received',
    roles: ['Counterparty', 'Legal Reviewer', 'Executive'],
    steps: [
      {
        name: 'Contract intake',
        type: 'FORM',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Enter the key details of the contract being reviewed. Capture all relevant metadata to route the review properly.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Contract Type', type: 'DROPDOWN', required: true, options: [{ label: 'Master Service Agreement', value: 'msa' }, { label: 'Statement of Work', value: 'sow' }, { label: 'License Agreement', value: 'license' }, { label: 'Vendor Agreement', value: 'vendor' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f2', label: 'Counterparty Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Contract Value', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Contract Term (months)', type: 'NUMBER', required: true },
          { fieldId: 'f5', label: 'Auto-Renewal', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { fieldId: 'f6', label: 'Requesting Department', type: 'TEXT_SINGLE_LINE', required: true },
        ],
      },
      {
        name: 'Draft contract upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Upload the draft contract document for review. Include any related exhibits or schedules.',
      },
      {
        name: 'AI contract risk analysis',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'AI-powered: Analyze the contract for non-standard clauses, liability caps, IP provisions, data protection terms, and auto-renewal traps.',
      },
      {
        name: 'Legal & financial review',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Review the contract for indemnification clauses, IP ownership, termination provisions, pricing structures, and payment terms. Document any concerns or required changes.',
      },
      {
        name: 'Redline document upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Upload the redlined version of the contract with all proposed changes tracked.',
      },
      {
        name: 'Counterparty negotiation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Counterparty',
        sampleDescription:
          'Review the redlined contract and upload your response. Include accepted changes, counter-proposals, and any new redlines.',
      },
      {
        name: 'Negotiation resolution',
        type: 'DECISION',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Review the counterparty response and decide on next steps: accept the terms, continue negotiation, escalate to leadership, or terminate discussions.',
      },
      {
        name: 'Executive approval (if needed)',
        type: 'APPROVAL',
        assigneeRole: 'Executive',
        sampleDescription:
          'Review the final negotiated terms and approve the contract for execution. Consider the business impact and risk exposure.',
      },
      {
        name: 'Contract execution',
        type: 'ESIGN',
        assigneeRole: 'Counterparty',
        sampleDescription:
          'Review the final contract and apply your electronic signature to execute the agreement.',
        sampleDocumentRef: 'contract-agreement.pdf',
      },
      {
        name: 'Executed contract filing',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'File the fully executed contract in the contract management system. Update the contract register and notify relevant stakeholders.',
      },
    ],
    useCases: [
      'Reviewing and executing vendor service agreements before engagement begins',
      'Processing customer contracts with non-standard terms requiring legal review',
      'Managing software license agreements with complex IP provisions',
      'Executing partnership agreements that require executive-level approval',
    ],
    requirements: [
      'Upload your contract document for e-signature (replaces sample)',
    ],
  },

  // 56. Contract Exception Request
  {
    id: 'contract-exception-request',
    name: 'Contract Exception Request',
    category: 'legal-governance',
    description:
      'Handle requests for non-standard contract terms through a structured review and approval process. Ensures all exceptions receive proper legal, financial, and business evaluation before approval.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Non-standard terms requested / Customer redlines',
    roles: ['Requestor', 'Legal Reviewer', 'Business Approver', 'Finance Reviewer', 'Deal Desk'],
    steps: [
      {
        name: 'Exception request details',
        type: 'FORM',
        assigneeRole: 'Requestor',
        sampleDescription:
          'Provide the details of the contract exception you are requesting. Be specific about what non-standard terms are needed and why.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Contract / Deal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Exception Type', type: 'DROPDOWN', required: true, options: [{ label: 'Payment Terms', value: 'payment' }, { label: 'Liability Cap', value: 'liability' }, { label: 'Indemnification', value: 'indemnification' }, { label: 'SLA Modification', value: 'sla' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f3', label: 'Requested Exception Details', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Business Justification', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Deal Value', type: 'NUMBER', required: true },
        ],
      },
      {
        name: 'Proposed redlines',
        type: 'FILE_REQUEST',
        assigneeRole: 'Requestor',
        sampleDescription:
          'Upload the proposed contract redlines showing the specific language changes requested.',
      },
      {
        name: 'Business justification',
        type: 'FILE_REQUEST',
        assigneeRole: 'Requestor',
        sampleDescription:
          'Upload any supporting documentation for the business justification, such as competitive analysis or customer relationship history.',
      },
      {
        name: 'Legal analysis',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Analyze the requested exception for legal risk. Assess whether the proposed terms are acceptable, need modification, or should be rejected.',
      },
      {
        name: 'Finance impact assessment',
        type: 'TODO',
        assigneeRole: 'Finance Reviewer',
        sampleDescription:
          'Assess the financial impact of the requested exception. Consider revenue recognition, payment terms, and any precedent-setting implications.',
      },
      {
        name: 'Business approval',
        type: 'APPROVAL',
        assigneeRole: 'Business Approver',
        sampleDescription:
          'Review the exception request along with legal and finance assessments. Approve or reject based on overall business impact.',
      },
      {
        name: 'Deal desk approval',
        type: 'APPROVAL',
        assigneeRole: 'Deal Desk',
        sampleDescription:
          'Review the exception for deal structure compliance and confirm it aligns with pricing and commercial guidelines.',
      },
      {
        name: 'Decision acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Requestor',
        sampleDescription:
          'Review the decision on your exception request. Acknowledge that you understand the outcome and any conditions attached.',
      },
    ],
    useCases: [
      'Customer requesting extended payment terms beyond standard net-30',
      'Strategic deal requiring modified liability caps or indemnification terms',
      'Partner requesting non-standard SLA commitments for enterprise agreement',
      'Sales team seeking approval for pricing exceptions on a competitive deal',
    ],
  },

  // 57. NDA Execution
  {
    id: 'nda-execution',
    name: 'NDA Execution',
    category: 'legal-governance',
    description:
      'Streamline NDA processing from request through execution for confidential business discussions. Ensures proper legal review for non-standard terms and efficient execution for standard agreements.',
    complexity: 'Simple',
    tags: ['All Industries'],
    trigger: 'Confidential discussion / deal exploration',
    roles: ['External Party', 'Legal Owner'],
    steps: [
      {
        name: 'NDA request details',
        type: 'FORM',
        assigneeRole: 'External Party',
        sampleDescription:
          'Provide the details needed to prepare the NDA. This information will be used to generate the appropriate agreement.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Counterparty Organization', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'NDA Type', type: 'DROPDOWN', required: true, options: [{ label: 'Mutual', value: 'mutual' }, { label: 'One-Way (Disclosing)', value: 'one-way-disclosing' }, { label: 'One-Way (Receiving)', value: 'one-way-receiving' }] },
          { fieldId: 'f3', label: 'Purpose of Disclosure', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Confidentiality Period (years)', type: 'NUMBER', required: true },
        ],
      },
      {
        name: 'Legal review (if non-standard)',
        type: 'TODO',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Review the NDA request for any non-standard requirements. If the counterparty has requested custom terms, review and adjust the agreement accordingly.',
      },
      {
        name: 'NDA document upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Upload the finalized NDA document for counterparty review and execution.',
      },
      {
        name: 'Counterparty review',
        type: 'FILE_REQUEST',
        assigneeRole: 'External Party',
        sampleDescription:
          'Review the NDA document. If you have any requested changes, upload a redlined version.',
      },
      {
        name: 'NDA execution',
        type: 'ESIGN',
        assigneeRole: 'External Party',
        sampleDescription:
          'Review the final NDA and apply your electronic signature to execute the agreement.',
        sampleDocumentRef: 'nda-agreement.pdf',
      },
      {
        name: 'Executed copy distribution',
        type: 'TODO',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Distribute the fully executed NDA to all relevant parties and file it in the document management system.',
      },
    ],
    useCases: [
      'Executing mutual NDAs before exploring a potential partnership or acquisition',
      'Protecting confidential information before sharing product roadmaps with prospects',
      'Establishing confidentiality agreements with consultants or contractors',
      'Processing standard NDAs quickly for deal exploration conversations',
    ],
    requirements: [
      'Upload your NDA document for e-signature (replaces sample)',
    ],
  },

  // 58. Litigation Hold Acknowledgement
  {
    id: 'litigation-hold-acknowledgement',
    name: 'Litigation Hold Acknowledgement',
    category: 'legal-governance',
    description:
      'Issue and track litigation hold notices to ensure custodians preserve relevant data. Provides a clear audit trail of notification, acknowledgement, and data preservation confirmation.',
    complexity: 'Simple',
    tags: ['All Industries'],
    trigger: 'Litigation filed / Threat of litigation',
    roles: ['Custodian', 'Legal Owner'],
    steps: [
      {
        name: 'Litigation hold notice',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Custodian',
        sampleDescription:
          'Read the litigation hold notice carefully. You are required to preserve all documents, communications, and data related to this matter. Acknowledge that you have received and understand the hold.',
      },
      {
        name: 'Custodian questionnaire',
        type: 'FORM',
        assigneeRole: 'Custodian',
        sampleDescription:
          'Complete this questionnaire to help identify all relevant data sources you may have. Be thorough in identifying all locations where relevant information may exist.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Do you have relevant documents?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Unsure', value: 'unsure' }] },
          { fieldId: 'f2', label: 'Data locations (email, shared drives, local files, etc.)', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Relevant date range', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Other custodians who may have relevant data', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f5', label: 'Questions or concerns about the hold', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Data preservation confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Custodian',
        sampleDescription:
          'Confirm that you have taken steps to preserve all relevant data as described in the litigation hold notice. Do not delete, modify, or destroy any potentially relevant materials.',
      },
      {
        name: 'Completion confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Confirm that the custodian has been properly notified, has completed the questionnaire, and has acknowledged the data preservation obligations.',
      },
    ],
    useCases: [
      'Issuing company-wide litigation holds in response to filed lawsuits',
      'Preserving data for regulatory investigations or government inquiries',
      'Tracking acknowledgements across departments when a hold affects multiple custodians',
      'Documenting preservation compliance for discovery obligations',
    ],
  },

  // 59. Board Resolution & Consent Collection
  {
    id: 'board-resolution-consent-collection',
    name: 'Board Resolution & Consent Collection',
    category: 'legal-governance',
    description:
      'Coordinate board resolution review, approval, and execution through a structured workflow. Ensures all directors review materials, legal counsel validates the resolution, and proper signatures are collected.',
    complexity: 'Standard',
    tags: ['All Industries', 'Corporate Governance'],
    trigger: 'Board action required / Annual resolutions',
    roles: ['Corporate Secretary', 'Board Member', 'General Counsel', 'CEO'],
    steps: [
      {
        name: 'Resolution draft distribution',
        type: 'FILE_REQUEST',
        assigneeRole: 'Corporate Secretary',
        sampleDescription:
          'Upload the draft resolution document along with any supporting materials for board member review.',
      },
      {
        name: 'Director review acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Board Member',
        sampleDescription:
          'Acknowledge that you have received and reviewed the draft resolution and supporting materials.',
      },
      {
        name: 'Questions / comments',
        type: 'FORM',
        assigneeRole: 'Board Member',
        sampleDescription:
          'Submit any questions, comments, or concerns about the draft resolution. If you have no comments, indicate that you have no objections.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Do you have comments or questions?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No - No objections', value: 'no' }] },
          { fieldId: 'f2', label: 'Comments / Questions', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Legal review',
        type: 'TODO',
        assigneeRole: 'General Counsel',
        sampleDescription:
          'Review the draft resolution for legal compliance, proper form, and alignment with corporate governance requirements. Address any board member questions.',
      },
      {
        name: 'Final resolution distribution',
        type: 'FILE_REQUEST',
        assigneeRole: 'Corporate Secretary',
        sampleDescription:
          'Upload the final version of the resolution incorporating any feedback from the board review and legal counsel.',
      },
      {
        name: 'Resolution execution',
        type: 'ESIGN',
        assigneeRole: 'Board Member',
        sampleDescription:
          'Review the final resolution and apply your electronic signature to execute the board consent.',
        sampleDocumentRef: 'board-resolution.pdf',
      },
      {
        name: 'CEO attestation',
        type: 'ESIGN',
        assigneeRole: 'CEO',
        sampleDescription:
          'Attest to the board resolution by applying your electronic signature as required by corporate governance procedures.',
        sampleDocumentRef: 'board-resolution-ceo-attestation.pdf',
      },
      {
        name: 'Filing confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Corporate Secretary',
        sampleDescription:
          'Confirm that the executed resolution has been properly filed in the corporate records and all necessary regulatory filings have been submitted.',
      },
    ],
    useCases: [
      'Collecting board consent for annual officer appointments and compensation approvals',
      'Executing resolutions for major corporate transactions like acquisitions or financings',
      'Obtaining written consent in lieu of a meeting for time-sensitive matters',
      'Documenting board approval for stock option grants or equity issuances',
    ],
    requirements: [
      'Upload your board resolution document for e-signature (replaces sample)',
      'Upload your CEO attestation document for e-signature (replaces sample)',
    ],
  },

  // 60. M&A Due Diligence Document Request
  {
    id: 'ma-due-diligence-document-request',
    name: 'M&A Due Diligence Document Request',
    category: 'legal-governance',
    description:
      'Coordinate comprehensive due diligence document collection from target companies during M&A transactions. Covers corporate, financial, legal, tax, employment, and IP workstreams with structured follow-up and risk assessment.',
    complexity: 'Complex',
    tags: ['Investment Banking', 'Private Equity', 'Corporate Development'],
    trigger: 'LOI signed / DD phase begins',
    roles: ['Target Company Contact', 'Deal Team Lead', 'Buyer Counsel'],
    steps: [
      {
        name: 'NDA & data room access',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Acknowledge the NDA terms and confirm access to the virtual data room. You will use this data room to upload all requested due diligence documents.',
      },
      {
        name: 'DD request list distribution',
        type: 'FILE_REQUEST',
        assigneeRole: 'Deal Team Lead',
        sampleDescription:
          'Upload the comprehensive due diligence request list organized by workstream (corporate, financial, tax, legal, employment, IP).',
      },
      {
        name: 'Corporate & financial documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Upload all requested corporate and financial documents including organizational documents, financial statements, capitalization tables, and material agreements.',
      },
      {
        name: 'Tax & legal documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Upload all requested tax returns, legal filings, litigation records, and regulatory compliance documentation.',
      },
      {
        name: 'Employment, IP & contracts',
        type: 'FILE_REQUEST',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Upload employment agreements, benefit plans, IP registrations, license agreements, and all material contracts.',
      },
      {
        name: 'Management questionnaire',
        type: 'FORM',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Complete the management questionnaire covering areas that are not fully captured in document review. Be thorough and transparent in your responses.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Are there any off-balance-sheet liabilities?', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Pending or threatened litigation', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Top 10 customer concentration (% of revenue)', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Known material risks or contingencies', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Buyer counsel questions & follow-ups',
        type: 'FORM',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Respond to follow-up questions from the buyer legal team based on their review of the submitted documents.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Question responses', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional context or clarifications', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Follow-up documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Target Company Contact',
        sampleDescription:
          'Upload any additional documents requested as a result of the follow-up questions and ongoing review.',
      },
      {
        name: 'AI red flag summary',
        type: 'TODO',
        assigneeRole: 'Deal Team Lead',
        sampleDescription:
          'AI-powered: Synthesize findings across all due diligence workstreams to identify material risks, documentation gaps, potential deal-breakers, and representation/warranty requirements.',
      },
      {
        name: 'Go/No-Go decision',
        type: 'APPROVAL',
        assigneeRole: 'Deal Team Lead',
        sampleDescription:
          'Review the complete due diligence findings and red flag summary. Make the go/no-go decision on proceeding with the transaction.',
      },
    ],
    useCases: [
      'Collecting due diligence documents for a private equity acquisition of a mid-market company',
      'Coordinating cross-border M&A document requests with multiple jurisdictions',
      'Managing due diligence for a strategic corporate acquisition',
      'Running buy-side diligence for a venture-backed company acquisition',
    ],
  },

  // 61. DSAR / Privacy Rights Request
  {
    id: 'dsar-privacy-rights-request',
    name: 'DSAR / Privacy Rights Request',
    category: 'legal-governance',
    description:
      'Process data subject access requests and privacy rights requests in compliance with GDPR and CCPA. Ensures proper identity verification, data collection, legal review, and timely response delivery.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Privacy rights request received',
    roles: ['Data Subject', 'Privacy Operations', 'IT/Data Team', 'Legal Reviewer'],
    steps: [
      {
        name: 'Request intake & verification',
        type: 'FORM',
        assigneeRole: 'Data Subject',
        sampleDescription:
          'Submit your privacy rights request. Provide the details below so we can process your request in a timely manner.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Full Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Email Address', type: 'EMAIL', required: true },
          { fieldId: 'f3', label: 'Request Type', type: 'DROPDOWN', required: true, options: [{ label: 'Access (copy of my data)', value: 'access' }, { label: 'Deletion', value: 'deletion' }, { label: 'Correction', value: 'correction' }, { label: 'Portability', value: 'portability' }, { label: 'Opt-Out of Sale', value: 'opt-out' }] },
          { fieldId: 'f4', label: 'Details of Request', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Identity verification documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Data Subject',
        sampleDescription:
          'Upload identity verification documents so we can confirm your identity before processing the request. This is required to protect your data from unauthorized access.',
      },
      {
        name: 'Scope clarification',
        type: 'FORM',
        assigneeRole: 'Data Subject',
        sampleDescription:
          'Help us narrow the scope of your request so we can respond accurately and efficiently.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Specific systems or services', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f2', label: 'Date range of interest', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f3', label: 'Specific data categories', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Data collection across systems',
        type: 'TODO',
        assigneeRole: 'IT/Data Team',
        sampleDescription:
          'Collect all personal data associated with the data subject from all relevant systems. Document the data sources and compile a comprehensive data package.',
      },
      {
        name: 'Legal review / redaction',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Review the collected data for legal exemptions, third-party data that must be redacted, and any privileged information. Apply necessary redactions.',
      },
      {
        name: 'Privacy ops review',
        type: 'TODO',
        assigneeRole: 'Privacy Operations',
        sampleDescription:
          'Verify completeness of the response, ensure regulatory timelines are met, and prepare the final response package for delivery.',
      },
      {
        name: 'Response delivery',
        type: 'FILE_REQUEST',
        assigneeRole: 'Privacy Operations',
        sampleDescription:
          'Upload the final response package for the data subject. Include all collected data, any applicable explanations, and information about their rights.',
      },
      {
        name: 'Completion acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Data Subject',
        sampleDescription:
          'Acknowledge receipt of the response to your privacy rights request. If you have further questions or are not satisfied with the response, you may submit a follow-up request.',
      },
    ],
    useCases: [
      'Processing GDPR data subject access requests within the 30-day deadline',
      'Handling CCPA opt-out and deletion requests from California residents',
      'Managing employee privacy rights requests during offboarding',
      'Coordinating multi-system data collection for comprehensive DSAR responses',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
  },

  // 62. Subpoena Response Coordination
  {
    id: 'subpoena-response-coordination',
    name: 'Subpoena Response Coordination',
    category: 'legal-governance',
    description:
      'Coordinate the response to legal subpoenas through structured document identification, preservation, collection, and privilege review. Ensures compliance with legal obligations while protecting privileged information.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Subpoena received',
    roles: ['Legal Owner', 'Custodian', 'IT Administrator', 'Outside Counsel'],
    steps: [
      {
        name: 'Subpoena intake & analysis',
        type: 'FORM',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Log the subpoena details and analyze its scope, deadlines, and requirements. Identify the key issues and relevant custodians.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Issuing Party / Court', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Case Name / Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Response Deadline', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Scope Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Key Custodians Identified', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Custodian identification',
        type: 'TODO',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Identify all custodians who may have responsive documents. Map data sources and document types to each custodian.',
      },
      {
        name: 'Document preservation notice',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Custodian',
        sampleDescription:
          'Acknowledge receipt of the document preservation notice. You must preserve all documents, communications, and data that may be responsive to the subpoena.',
      },
      {
        name: 'IT data preservation',
        type: 'TODO',
        assigneeRole: 'IT Administrator',
        sampleDescription:
          'Implement technical preservation measures for relevant data sources. Suspend auto-deletion policies, preserve email archives, and secure backup tapes as needed.',
      },
      {
        name: 'Document collection',
        type: 'FILE_REQUEST',
        assigneeRole: 'Custodian',
        sampleDescription:
          'Collect and upload all documents, communications, and data responsive to the subpoena from your data sources.',
      },
      {
        name: 'Outside counsel review',
        type: 'TODO',
        assigneeRole: 'Outside Counsel',
        sampleDescription:
          'Review the collected documents for responsiveness, relevance, and potential objections. Identify any documents requiring privilege review.',
      },
      {
        name: 'Privilege review',
        type: 'TODO',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Conduct privilege review on flagged documents. Prepare the privilege log for any documents withheld on privilege grounds.',
      },
      {
        name: 'Response submission confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Legal Owner',
        sampleDescription:
          'Confirm that the subpoena response has been submitted to the requesting party along with any privilege log and objections.',
      },
    ],
    useCases: [
      'Responding to third-party subpoenas for business records in civil litigation',
      'Coordinating document production for regulatory investigations',
      'Managing custodian-level document collection for multi-party lawsuits',
      'Handling grand jury subpoenas requiring rapid document preservation and production',
    ],
  },

  // 63. New Business Formation
  {
    id: 'new-business-formation',
    name: 'New Business Formation',
    category: 'legal-governance',
    description:
      'Guide founders through the complete business formation process from entity selection through post-formation compliance. Coordinates legal, regulatory, and tax requirements across multiple professional advisors.',
    complexity: 'Standard',
    tags: ['Legal', 'Corporate Services', 'Startups'],
    trigger: 'New entity needed',
    roles: ['Founder', 'Legal Advisor', 'Registered Agent', 'Accountant'],
    steps: [
      {
        name: 'Formation intake',
        type: 'FORM',
        assigneeRole: 'Founder',
        sampleDescription:
          'Provide the basic details of the business entity you want to form. This information will guide the entity structure and formation filing.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Proposed Entity Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Entity Type', type: 'DROPDOWN', required: true, options: [{ label: 'LLC', value: 'llc' }, { label: 'C-Corporation', value: 'c-corp' }, { label: 'S-Corporation', value: 's-corp' }, { label: 'Partnership', value: 'partnership' }, { label: 'Sole Proprietorship', value: 'sole-prop' }] },
          { fieldId: 'f3', label: 'State of Formation', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Business Purpose', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Principal Office Address', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Ownership & structure details',
        type: 'FORM',
        assigneeRole: 'Founder',
        sampleDescription:
          'Provide ownership and governance structure details. Include all founders, ownership percentages, and initial officers/managers.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Founders / Members / Shareholders', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Ownership Percentages', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Initial Officers / Managers', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Authorized Share Count (if applicable)', type: 'NUMBER' },
        ],
      },
      {
        name: 'Founder identity documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Founder',
        sampleDescription:
          'Upload government-issued identification for all founders. This is required for the formation filing and EIN application.',
      },
      {
        name: 'Operating agreement / bylaws review',
        type: 'TODO',
        assigneeRole: 'Legal Advisor',
        sampleDescription:
          'Draft or review the operating agreement (LLC) or bylaws (corporation). Ensure governance provisions align with the founders\' intent and applicable state law.',
      },
      {
        name: 'Formation document execution',
        type: 'ESIGN',
        assigneeRole: 'Founder',
        sampleDescription:
          'Review and sign the formation documents including articles of organization/incorporation and the operating agreement or bylaws.',
        sampleDocumentRef: 'formation-documents.pdf',
      },
      {
        name: 'Registered agent acceptance',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Registered Agent',
        sampleDescription:
          'Acknowledge your acceptance of the registered agent appointment for the newly formed entity.',
      },
      {
        name: 'EIN application',
        type: 'TODO',
        assigneeRole: 'Accountant',
        sampleDescription:
          'Apply for the Employer Identification Number (EIN) with the IRS. Set up initial accounting records and advise on tax election deadlines.',
      },
      {
        name: 'Post-formation checklist',
        type: 'TODO',
        assigneeRole: 'Legal Advisor',
        sampleDescription:
          'Complete the post-formation checklist: open bank account, obtain business licenses, register for state taxes, and set up initial corporate records.',
      },
      {
        name: 'Formation complete',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Founder',
        sampleDescription:
          'Acknowledge that the business formation is complete. Review the summary of all filed documents, key dates, and ongoing compliance obligations.',
      },
    ],
    useCases: [
      'Forming a new LLC for a startup with multiple co-founders',
      'Incorporating a Delaware C-Corp for a venture-backed startup',
      'Setting up a subsidiary entity for a corporate expansion',
      'Establishing a professional services partnership or PLLC',
    ],
    requirements: [
      'Upload your formation documents for e-signature (replaces sample)',
    ],
  },

  // 64. Franchise Agreement Execution
  {
    id: 'franchise-agreement-execution',
    name: 'Franchise Agreement Execution',
    category: 'legal-governance',
    description:
      'Manage the franchise agreement process from application through execution and onboarding kickoff. Ensures FTC Franchise Rule compliance including the mandatory 14-day FDD review period.',
    complexity: 'Complex',
    tags: ['Franchising', 'Retail', 'Food Service'],
    trigger: 'Franchise application approved',
    roles: ['Franchisee', 'Franchise Development Manager', 'Legal Reviewer', 'Finance', 'Training Lead'],
    steps: [
      {
        name: 'Franchise application',
        type: 'FORM',
        assigneeRole: 'Franchisee',
        sampleDescription:
          'Complete the franchise application with your personal, financial, and business background information.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Full Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Business Entity Name (if applicable)', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f3', label: 'Desired Territory / Location', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Liquid Capital Available', type: 'NUMBER', required: true },
          { fieldId: 'f5', label: 'Net Worth', type: 'NUMBER', required: true },
          { fieldId: 'f6', label: 'Prior Franchise or Business Experience', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Financial qualification documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Franchisee',
        sampleDescription:
          'Upload financial qualification documents including personal financial statements, bank statements, and tax returns.',
      },
      {
        name: 'FDD acknowledgement (14-day waiting period)',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Franchisee',
        sampleDescription:
          'Acknowledge receipt of the Franchise Disclosure Document (FDD). Per FTC rules, you must have at least 14 days to review the FDD before signing the franchise agreement.',
      },
      {
        name: 'Franchisee questions',
        type: 'FORM',
        assigneeRole: 'Franchisee',
        sampleDescription:
          'Submit any questions about the FDD, franchise agreement, or franchise system. We encourage you to review the FDD with your own attorney.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Questions about the FDD', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f2', label: 'Questions about territory / operations', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Have you consulted with an attorney?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Planning to', value: 'planning' }] },
        ],
      },
      {
        name: 'Discovery day confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Franchisee',
        sampleDescription:
          'Confirm your attendance at Discovery Day. This is your opportunity to visit headquarters, meet the team, and learn about day-to-day franchise operations.',
      },
      {
        name: 'Franchise agreement review',
        type: 'TODO',
        assigneeRole: 'Legal Reviewer',
        sampleDescription:
          'Review the franchise agreement for compliance, territory accuracy, and any negotiated modifications. Ensure FTC timing requirements have been met.',
      },
      {
        name: 'Financial terms',
        type: 'TODO',
        assigneeRole: 'Finance',
        sampleDescription:
          'Verify the financial terms of the franchise agreement including initial franchise fee, royalty rates, advertising fund contributions, and payment schedules.',
      },
      {
        name: 'Franchise agreement execution',
        type: 'ESIGN',
        assigneeRole: 'Franchisee',
        sampleDescription:
          'Review the final franchise agreement and apply your electronic signature to execute the agreement. Ensure you have completed your 14-day FDD review period.',
        sampleDocumentRef: 'franchise-agreement.pdf',
      },
      {
        name: 'Training schedule',
        type: 'TODO',
        assigneeRole: 'Training Lead',
        sampleDescription:
          'Schedule the initial franchise training program for the new franchisee. Prepare training materials and confirm venue/virtual setup.',
      },
      {
        name: 'Onboarding kickoff',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Franchise Development Manager',
        sampleDescription:
          'Confirm that the franchise onboarding process has been initiated. Verify that all required systems access, training schedule, and opening timeline have been communicated to the franchisee.',
      },
    ],
    useCases: [
      'Executing franchise agreements for new restaurant franchise locations',
      'Processing multi-unit franchise development agreements',
      'Onboarding new franchisees for retail or service-based franchise systems',
      'Managing franchise resale transactions with new owner execution',
    ],
    requirements: [
      'Upload your franchise agreement document for e-signature (replaces sample)',
    ],
  },

  // 65. Trademark / IP Assignment
  {
    id: 'trademark-ip-assignment',
    name: 'Trademark / IP Assignment',
    category: 'legal-governance',
    description:
      'Coordinate the transfer of intellectual property rights from assignor to assignee with proper due diligence, documentation, and recording. Supports trademark, patent, copyright, and trade secret assignments.',
    complexity: 'Standard',
    tags: ['Legal', 'Corporate', 'IP'],
    trigger: 'IP transfer needed (acquisition, employee assignment, corporate restructuring)',
    roles: ['Assignor', 'IP Counsel', 'Assignee', 'IP Administrator'],
    steps: [
      {
        name: 'Assignment request intake',
        type: 'FORM',
        assigneeRole: 'IP Counsel',
        sampleDescription:
          'Provide the details of the intellectual property being assigned. Include all registration information and the reason for transfer.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'IP Type', type: 'DROPDOWN', required: true, options: [{ label: 'Trademark', value: 'trademark' }, { label: 'Patent', value: 'patent' }, { label: 'Copyright', value: 'copyright' }, { label: 'Trade Secret', value: 'trade-secret' }, { label: 'Domain Name', value: 'domain' }] },
          { fieldId: 'f2', label: 'Registration / Application Numbers', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Assignor Details', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Assignee Details', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Jurisdiction(s)', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Consideration / Value', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f7', label: 'Reason for Transfer', type: 'DROPDOWN', required: true, options: [{ label: 'Acquisition', value: 'acquisition' }, { label: 'Employee Assignment', value: 'employee' }, { label: 'Corporate Restructuring', value: 'restructuring' }, { label: 'Licensing to Assignment', value: 'license-conversion' }, { label: 'Other', value: 'other' }] },
        ],
      },
      {
        name: 'IP schedule & registration documents',
        type: 'FILE_REQUEST',
        assigneeRole: 'Assignor',
        sampleDescription:
          'Upload registration certificates, prior assignment records, existing license agreements, and documentation of any encumbrances on the IP.',
      },
      {
        name: 'Chain of title verification',
        type: 'TODO',
        assigneeRole: 'IP Counsel',
        sampleDescription:
          'Verify the chain of title for the IP being assigned. Confirm current ownership, check for liens or encumbrances, and verify registration status with the relevant IP office.',
      },
      {
        name: 'Assignment agreement review',
        type: 'FILE_REQUEST',
        assigneeRole: 'IP Counsel',
        sampleDescription:
          'Upload the draft IP assignment agreement for review. Include any schedules listing the specific IP assets being transferred.',
      },
      {
        name: 'Assignee review & comments',
        type: 'FORM',
        assigneeRole: 'Assignee',
        sampleDescription:
          'Review the assignment agreement and provide any comments or requested changes.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Agreement Acceptable?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes - Ready to sign', value: 'yes' }, { label: 'No - Changes requested', value: 'no' }] },
          { fieldId: 'f2', label: 'Comments or Requested Changes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Assignment execution',
        type: 'ESIGN',
        assigneeRole: 'Assignor',
        sampleDescription:
          'Review and sign the IP assignment agreement as the assignor, transferring your rights in the intellectual property.',
        sampleDocumentRef: 'ip-assignment-agreement.pdf',
      },
      {
        name: 'Assignee countersignature',
        type: 'ESIGN',
        assigneeRole: 'Assignee',
        sampleDescription:
          'Countersign the IP assignment agreement as the assignee, accepting the transfer of intellectual property rights.',
        sampleDocumentRef: 'ip-assignment-agreement.pdf',
      },
      {
        name: 'Recording with IP office (USPTO/WIPO/etc.)',
        type: 'TODO',
        assigneeRole: 'IP Administrator',
        sampleDescription:
          'Record the assignment with the appropriate intellectual property office (USPTO, WIPO, or other relevant authority). Track the filing and recordation confirmation.',
      },
      {
        name: 'Recordation confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'IP Counsel',
        sampleDescription:
          'Confirm that the IP assignment has been recorded with the relevant IP office and all records have been updated. Distribute the recorded assignment to all parties.',
      },
    ],
    useCases: [
      'Transferring patent and trademark portfolios during a corporate acquisition',
      'Recording employee invention assignments as part of employment onboarding',
      'Reassigning IP assets during corporate restructuring between subsidiaries',
      'Executing trademark assignments for brand acquisition deals',
    ],
    requirements: [
      'Upload your IP assignment agreement for e-signature (replaces sample)',
    ],
  },
];
