import type { GalleryTemplate } from './types';

export const AUDIT_COMPLIANCE_TEMPLATES: GalleryTemplate[] = [
  // 66. SOC 2 Evidence Collection (PBC)
  {
    id: 'soc2-evidence-collection',
    name: 'SOC 2 Evidence Collection (PBC)',
    category: 'audit-compliance',
    description:
      'Coordinate SOC 2 audit evidence collection from control owners through a structured PBC (Provided by Client) process. Manages the full cycle from scoping through auditor follow-up and closeout.',
    complexity: 'Complex',
    tags: ['All Industries'],
    trigger: 'Annual audit cycle begins',
    roles: ['Control Owner', 'Compliance Coordinator', 'External Auditor'],
    steps: [
      {
        name: 'Audit scope & period confirmation',
        type: 'FORM',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Define the audit scope, reporting period, and trust service criteria for this SOC 2 engagement.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Audit Type', type: 'DROPDOWN', required: true, options: [{ label: 'SOC 2 Type I', value: 'type-i' }, { label: 'SOC 2 Type II', value: 'type-ii' }] },
          { fieldId: 'f2', label: 'Reporting Period Start', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Reporting Period End', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Trust Service Criteria', type: 'CHECKBOX', required: true, options: [{ label: 'Security', value: 'security' }, { label: 'Availability', value: 'availability' }, { label: 'Processing Integrity', value: 'processing-integrity' }, { label: 'Confidentiality', value: 'confidentiality' }, { label: 'Privacy', value: 'privacy' }] },
          { fieldId: 'f5', label: 'Systems in Scope', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Evidence request list (PBC)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Review the PBC request list and upload all requested evidence for the controls you own. Ensure evidence covers the full audit period.',
      },
      {
        name: 'Clarification Q&A',
        type: 'FORM',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Answer any clarification questions about the evidence you have submitted. Provide additional context where needed.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Responses', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional Notes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Evidence review',
        type: 'TODO',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Review all submitted evidence for completeness, relevance, and proper coverage of the audit period. Identify any gaps or insufficient evidence.',
      },
      {
        name: 'Follow-up evidence request',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload additional evidence to address any gaps identified during the initial review. Ensure all follow-up items are fully addressed.',
      },
      {
        name: 'Evidence package approved',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Review the complete evidence package for all controls. Approve the package as ready for external auditor review.',
      },
      {
        name: 'Share with external auditor',
        type: 'FILE_REQUEST',
        assigneeRole: 'External Auditor',
        sampleDescription:
          'Access the evidence package prepared for your review. Upload any additional documentation you may need for the audit.',
      },
      {
        name: 'Auditor follow-up questions',
        type: 'FORM',
        assigneeRole: 'External Auditor',
        sampleDescription:
          'Submit any follow-up questions or additional evidence requests based on your review of the evidence package.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Follow-up Questions', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional Evidence Needed', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Final evidence uploads',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload any final evidence requested by the external auditor. Ensure all auditor follow-up items are fully resolved.',
      },
      {
        name: 'Audit closeout acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Confirm that the SOC 2 evidence collection process is complete. All evidence has been reviewed, follow-up items resolved, and the audit is ready for report issuance.',
      },
    ],
    useCases: [
      'Collecting SOC 2 Type II evidence across engineering, HR, and operations teams',
      'Coordinating first-time SOC 2 evidence collection for a SaaS company',
      'Managing annual SOC 2 recertification with minimal disruption to control owners',
      'Running parallel SOC 2 and SOC 3 evidence collection for multiple stakeholders',
    ],
    recommendations: [
      'Integrate with your GRC platform (Vanta, Drata, ServiceNow GRC) to auto-pull evidence from connected systems and map submissions to SOC 2 trust service criteria',
      'Connect to Jira or Asana to auto-assign evidence collection tasks to control owners with deadlines aligned to the audit timeline',
      'Set up Slack or Teams notifications for control owners when evidence requests are assigned, deadlines approach, or auditor follow-ups are posted',
      'Sync completed evidence packages to a shared drive (SharePoint, Google Drive) with automated folder structure by trust service criteria and control area',
    ],
  },

  // 67. ISO 27001 Evidence Collection
  {
    id: 'iso-27001-evidence-collection',
    name: 'ISO 27001 Evidence Collection',
    category: 'audit-compliance',
    description:
      'Coordinate ISO 27001 evidence collection for surveillance or certification audits. Ensures systematic collection by control area, gap remediation, and proper packaging for external auditors.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Surveillance audit / Certification audit',
    roles: ['Control Owner', 'ISO Program Owner', 'External Auditor'],
    steps: [
      {
        name: 'ISMS scope & sites confirmation',
        type: 'FORM',
        assigneeRole: 'ISO Program Owner',
        sampleDescription:
          'Confirm the Information Security Management System scope, sites included, and audit type for this evidence collection cycle.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Audit Type', type: 'DROPDOWN', required: true, options: [{ label: 'Initial Certification', value: 'initial' }, { label: 'Surveillance Audit', value: 'surveillance' }, { label: 'Recertification', value: 'recertification' }] },
          { fieldId: 'f2', label: 'ISMS Scope Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Sites in Scope', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Audit Date', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Statement of Applicability mapping',
        type: 'FILE_REQUEST',
        assigneeRole: 'ISO Program Owner',
        sampleDescription:
          'Upload the current Statement of Applicability (SoA) mapping all Annex A controls to their implementation status and evidence sources.',
      },
      {
        name: 'Evidence by control area',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload evidence for all controls assigned to you. Organize evidence by control area and ensure it demonstrates effective operation of each control.',
      },
      {
        name: 'Control owner clarifications',
        type: 'FORM',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Provide any additional context or clarifications about the evidence you submitted. Explain any changes to control implementation since the last audit.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarifications', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Changes Since Last Audit', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Evidence completeness review',
        type: 'TODO',
        assigneeRole: 'ISO Program Owner',
        sampleDescription:
          'Review all submitted evidence against the Statement of Applicability. Verify completeness for every applicable control and identify any gaps requiring remediation.',
      },
      {
        name: 'Gap remediation evidence',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload evidence to address any gaps identified during the completeness review. This may include new documentation, updated procedures, or corrective actions.',
      },
      {
        name: 'Evidence accepted',
        type: 'APPROVAL',
        assigneeRole: 'ISO Program Owner',
        sampleDescription:
          'Review the complete evidence package including any remediation items. Approve the package as ready for external auditor review.',
      },
      {
        name: 'External auditor package',
        type: 'FILE_REQUEST',
        assigneeRole: 'External Auditor',
        sampleDescription:
          'Access the complete evidence package prepared for your ISO 27001 audit. Upload any additional requests or clarifications.',
      },
      {
        name: 'Finding acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'ISO Program Owner',
        sampleDescription:
          'Acknowledge the audit findings and confirm understanding of any nonconformities, observations, or opportunities for improvement identified by the auditor.',
      },
    ],
    useCases: [
      'Preparing evidence for annual ISO 27001 surveillance audits',
      'Collecting comprehensive evidence for initial ISO 27001 certification',
      'Coordinating evidence across multiple office locations for recertification',
      'Managing control owner evidence submissions for integrated ISO 27001/27701 audits',
    ],
    recommendations: [
      'Integrate with your ISMS tool (OneTrust, Vanta, Tugboat Logic) to auto-map evidence submissions to Annex A controls and track Statement of Applicability coverage',
      'Connect to your ticketing system (Jira, ServiceNow) to auto-create remediation tickets for nonconformities identified during evidence review',
      'Set up automated email reminders for control owners as surveillance audit dates approach and evidence submission deadlines near',
    ],
  },

  // 68. External Financial Audit Coordination
  {
    id: 'external-financial-audit-coordination',
    name: 'External Financial Audit Coordination',
    category: 'audit-compliance',
    description:
      'Coordinate the external financial audit process from planning through report issuance. Manages PBC list distribution, department-level evidence collection, auditor clarifications, and management response to findings.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Fiscal year end / Auditor engagement confirmed',
    roles: ['External Auditor', 'Controller/CFO', 'Department Heads'],
    steps: [
      {
        name: 'Audit planning & timeline',
        type: 'FORM',
        assigneeRole: 'External Auditor',
        sampleDescription:
          'Provide the audit planning details including scope, timeline, and key dates for fieldwork and report issuance.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Fiscal Year End Date', type: 'DATE', required: true },
          { fieldId: 'f2', label: 'Fieldwork Start Date', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Fieldwork End Date', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Target Report Issuance Date', type: 'DATE', required: true },
          { fieldId: 'f5', label: 'Key Focus Areas', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'PBC list distribution',
        type: 'FILE_REQUEST',
        assigneeRole: 'Controller/CFO',
        sampleDescription:
          'Upload the Provided by Client (PBC) list to departments. Include all requested schedules, reconciliations, and supporting documentation.',
      },
      {
        name: 'Department evidence collection',
        type: 'FILE_REQUEST',
        assigneeRole: 'Department Heads',
        sampleDescription:
          'Upload all requested audit evidence for your department. Ensure schedules reconcile to the general ledger and supporting documentation is complete.',
      },
      {
        name: 'Auditor clarifications',
        type: 'FORM',
        assigneeRole: 'Controller/CFO',
        sampleDescription:
          'Respond to auditor clarification questions about the submitted evidence. Provide additional context or calculations as needed.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Responses', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional Notes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Follow-up documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Department Heads',
        sampleDescription:
          'Upload any additional documentation requested by the auditors during fieldwork. Address all open items promptly to avoid audit delays.',
      },
      {
        name: 'Draft findings review',
        type: 'TODO',
        assigneeRole: 'Controller/CFO',
        sampleDescription:
          'Review the draft audit findings and proposed adjustments. Assess the impact of any identified misstatements and evaluate proposed management letter comments.',
      },
      {
        name: 'Management response',
        type: 'FILE_REQUEST',
        assigneeRole: 'Controller/CFO',
        sampleDescription:
          'Upload the management response to audit findings, including corrective action plans and timelines for any identified control deficiencies.',
      },
      {
        name: 'Final report acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Controller/CFO',
        sampleDescription:
          'Acknowledge receipt of the final audit report. Confirm understanding of the audit opinion, significant findings, and management letter recommendations.',
      },
    ],
    useCases: [
      'Coordinating year-end financial audit evidence collection across departments',
      'Managing first-year audit transitions with a new audit firm',
      'Facilitating interim and year-end audit fieldwork for public companies',
      'Coordinating multi-entity consolidation audit evidence requests',
    ],
    recommendations: [
      'Integrate with your ERP (NetSuite, SAP, QuickBooks) to auto-export trial balances, reconciliations, and supporting schedules for the PBC list',
      'Connect to your audit management portal (Suralink, AuditBoard) to share evidence packages with external auditors and track their review status',
      'Set up Slack or Teams notifications for department heads when PBC items are assigned and when auditor clarification questions are posted',
    ],
  },

  // 69. PCI DSS SAQ + AOC Collection
  {
    id: 'pci-dss-saq-aoc-collection',
    name: 'PCI DSS SAQ + AOC Collection',
    category: 'audit-compliance',
    description:
      'Guide merchants through PCI DSS self-assessment questionnaire completion and attestation of compliance. Ensures proper SAQ type determination, evidence collection, security review, and executive sign-off.',
    complexity: 'Standard',
    tags: ['Retail', 'E-commerce', 'Financial Services'],
    trigger: 'Annual PCI cycle / New merchant onboarding',
    roles: ['Merchant Contact', 'Security Lead', 'Executive Signer'],
    steps: [
      {
        name: 'Determine SAQ type',
        type: 'FORM',
        assigneeRole: 'Merchant Contact',
        sampleDescription:
          'Answer the following questions to determine which Self-Assessment Questionnaire (SAQ) type applies to your payment processing environment.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'How do you accept card payments?', type: 'DROPDOWN', required: true, options: [{ label: 'Card-not-present (e-commerce only)', value: 'cnp' }, { label: 'Card-present (terminal)', value: 'cp' }, { label: 'Both', value: 'both' }] },
          { fieldId: 'f2', label: 'Do you store cardholder data?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { fieldId: 'f3', label: 'Payment processing method', type: 'DROPDOWN', required: true, options: [{ label: 'Fully outsourced (redirect/iframe)', value: 'outsourced' }, { label: 'Payment terminal (no electronic storage)', value: 'terminal' }, { label: 'Web-based virtual terminal', value: 'virtual-terminal' }, { label: 'Payment application connected to internet', value: 'payment-app' }] },
          { fieldId: 'f4', label: 'Annual transaction volume', type: 'NUMBER', required: true },
        ],
      },
      {
        name: 'Supporting evidence collection',
        type: 'FILE_REQUEST',
        assigneeRole: 'Merchant Contact',
        sampleDescription:
          'Upload supporting evidence for your PCI compliance including network diagrams, vulnerability scan reports, and penetration test results.',
      },
      {
        name: 'IT environment documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Merchant Contact',
        sampleDescription:
          'Upload documentation of your IT environment including cardholder data flow diagrams, system inventory, and third-party service provider list.',
      },
      {
        name: 'Complete SAQ questionnaire',
        type: 'FORM',
        assigneeRole: 'Merchant Contact',
        sampleDescription:
          'Complete the self-assessment questionnaire for your determined SAQ type. Answer each requirement honestly based on your current environment.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'SAQ Type', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Are all requirements met?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes - All requirements in place', value: 'yes' }, { label: 'No - Remediation needed', value: 'no' }, { label: 'Partial - Some requirements need work', value: 'partial' }] },
          { fieldId: 'f3', label: 'Compensating controls (if any)', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f4', label: 'Remediation plan for gaps', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Security review',
        type: 'TODO',
        assigneeRole: 'Security Lead',
        sampleDescription:
          'Review the completed SAQ responses and supporting evidence. Verify that all requirements are properly addressed and evidence is sufficient.',
      },
      {
        name: 'Remediation tasks (if required)',
        type: 'TODO',
        assigneeRole: 'Merchant Contact',
        sampleDescription:
          'Complete any remediation tasks identified during the security review. Address all gaps before the attestation can be finalized.',
      },
      {
        name: 'SAQ approval',
        type: 'APPROVAL',
        assigneeRole: 'Security Lead',
        sampleDescription:
          'Approve the completed SAQ and supporting evidence as meeting PCI DSS requirements for the applicable SAQ type.',
      },
      {
        name: 'Executive attestation of compliance',
        type: 'ESIGN',
        assigneeRole: 'Executive Signer',
        sampleDescription:
          'Review and sign the Attestation of Compliance (AOC), certifying that the organization meets all applicable PCI DSS requirements.',
        sampleDocumentRef: 'pci-attestation-of-compliance.pdf',
      },
    ],
    useCases: [
      'Completing annual PCI DSS self-assessment for e-commerce merchants',
      'Onboarding new retail merchants with PCI compliance documentation',
      'Managing PCI compliance across multiple merchant locations',
      'Coordinating PCI recertification after a payment environment change',
    ],
    requirements: [
      'Upload your Attestation of Compliance document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your ASV (Approved Scanning Vendor) to auto-import quarterly vulnerability scan results and attach them as evidence',
      'Connect to your payment gateway (Stripe, Braintree, Adyen) to auto-populate transaction volume and cardholder data environment details',
      'Set up automated calendar reminders for annual PCI recertification deadlines and quarterly scan schedules',
    ],
  },

  // 70. HIPAA Business Associate Attestation
  {
    id: 'hipaa-business-associate-attestation',
    name: 'HIPAA Business Associate Attestation',
    category: 'audit-compliance',
    description:
      'Collect and verify HIPAA business associate attestations for organizations handling protected health information. Ensures proper safeguard acknowledgement, sub-processor disclosure, and compliance review.',
    complexity: 'Simple',
    tags: ['Healthcare', 'Providers', 'Payers', 'Health Tech'],
    trigger: 'New BA relationship / Annual renewal',
    roles: ['Business Associate Contact', 'Compliance Lead'],
    steps: [
      {
        name: 'BA attestation questionnaire',
        type: 'FORM',
        assigneeRole: 'Business Associate Contact',
        sampleDescription:
          'Complete the business associate attestation questionnaire covering your HIPAA safeguards, policies, and practices.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Organization Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Primary Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Contact Email', type: 'EMAIL', required: true },
          { fieldId: 'f4', label: 'Do you have a HIPAA compliance program?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'In development', value: 'in-dev' }] },
          { fieldId: 'f5', label: 'Date of last HIPAA risk assessment', type: 'DATE', required: true },
          { fieldId: 'f6', label: 'Do you use sub-processors for PHI?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { fieldId: 'f7', label: 'Have you had a breach in the last 3 years?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
        ],
      },
      {
        name: 'Safeguard acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Business Associate Contact',
        sampleDescription:
          'Acknowledge that your organization has implemented the required administrative, physical, and technical safeguards for protecting PHI as required by the HIPAA Security Rule.',
      },
      {
        name: 'Sub-processor disclosure',
        type: 'FILE_REQUEST',
        assigneeRole: 'Business Associate Contact',
        sampleDescription:
          'Upload a list of all sub-processors or subcontractors who may access, process, or store PHI on your behalf. Include their role and data handling scope.',
      },
      {
        name: 'Security documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Business Associate Contact',
        sampleDescription:
          'Upload relevant security documentation such as your HIPAA policies, risk assessment summary, incident response plan, or SOC 2 report.',
      },
      {
        name: 'Compliance review',
        type: 'TODO',
        assigneeRole: 'Compliance Lead',
        sampleDescription:
          'Review the attestation responses, safeguard acknowledgement, and supporting documentation. Assess the business associate\'s HIPAA compliance posture.',
      },
      {
        name: 'Attestation accepted',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Lead',
        sampleDescription:
          'Approve or reject the business associate attestation based on the compliance review. Document any conditions or follow-up requirements.',
      },
      {
        name: 'Completion acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Business Associate Contact',
        sampleDescription:
          'Acknowledge the outcome of the attestation review. If approved, confirm your ongoing commitment to maintaining HIPAA compliance.',
      },
    ],
    useCases: [
      'Onboarding new SaaS vendors that will handle patient data',
      'Conducting annual HIPAA attestation renewals for existing business associates',
      'Verifying compliance of health IT subcontractors handling PHI',
      'Documenting BA compliance for health plan third-party administrators',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your vendor risk management platform (OneTrust Vendorpedia, ProcessUnity, Prevalent) to auto-track BA attestation status across all third-party relationships',
      'Connect to your HIPAA compliance platform (Compliancy Group, HIPAA One) to sync attestation results with your overall compliance posture dashboard',
      'Set up automated email reminders for annual BA attestation renewal deadlines and escalation alerts for non-responsive business associates',
    ],
  },

  // 71. Internal Audit Evidence Request
  {
    id: 'internal-audit-evidence-request',
    name: 'Internal Audit Evidence Request',
    category: 'audit-compliance',
    description:
      'Manage internal audit evidence collection from kickoff through closeout. Provides a structured process for requesting, reviewing, and following up on audit evidence with control owners and department managers.',
    complexity: 'Standard',
    tags: ['All Industries'],
    trigger: 'Internal audit plan / Risk-based trigger',
    roles: ['Audit Lead', 'Control Owner', 'Department Manager'],
    steps: [
      {
        name: 'Audit kickoff & scope',
        type: 'FORM',
        assigneeRole: 'Audit Lead',
        sampleDescription:
          'Define the internal audit scope, objectives, and timeline. Identify the control areas and departments under review.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Audit Title', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Audit Objective', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Scope / Control Areas', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Audit Period', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Evidence Submission Deadline', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Evidence request',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload all requested audit evidence for the controls you own. Ensure documentation covers the full audit period and demonstrates control effectiveness.',
      },
      {
        name: 'Clarification questions',
        type: 'FORM',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Respond to any clarification questions from the audit team about the evidence you submitted.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Responses', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional Context', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Evidence review',
        type: 'TODO',
        assigneeRole: 'Audit Lead',
        sampleDescription:
          'Review all submitted evidence against the audit program. Document findings, note any control deficiencies, and identify areas requiring follow-up.',
      },
      {
        name: 'Follow-up request',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload additional evidence to address gaps or findings identified during the audit review. Provide any requested supplementary documentation.',
      },
      {
        name: 'Department manager sign-off',
        type: 'APPROVAL',
        assigneeRole: 'Department Manager',
        sampleDescription:
          'Review the audit findings for your department. Approve the findings and confirm that the management responses and corrective action plans are accurate.',
      },
      {
        name: 'Finding response',
        type: 'FILE_REQUEST',
        assigneeRole: 'Department Manager',
        sampleDescription:
          'Upload the formal management response to audit findings including corrective action plans, responsible parties, and target completion dates.',
      },
      {
        name: 'Audit closeout',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Audit Lead',
        sampleDescription:
          'Confirm that the internal audit engagement is complete. All evidence has been reviewed, findings documented, and management responses received.',
      },
    ],
    useCases: [
      'Conducting scheduled internal audits per the annual audit plan',
      'Running risk-based audits triggered by control incidents or process changes',
      'Collecting evidence for compliance-focused internal audits (SOX, regulatory)',
      'Managing cross-departmental audit evidence requests for operational audits',
    ],
    recommendations: [
      'Integrate with your audit management platform (AuditBoard, TeamMate+, Galvanize) to auto-create audit engagements, track findings, and maintain the annual audit plan',
      'Connect to your GRC platform (ServiceNow GRC, Archer, LogicGate) to sync audit findings with the risk register and link to corrective action tracking',
      'Set up Slack or Teams notifications for control owners when evidence requests are assigned and for audit leads when follow-up items are overdue',
    ],
  },

  // 72. Periodic Compliance Certification
  {
    id: 'periodic-compliance-certification',
    name: 'Periodic Compliance Certification',
    category: 'audit-compliance',
    description:
      'Manage quarterly or annual compliance certification cycles from initiation through executive sign-off. Automates certification distribution, self-assessment collection, and exception flagging across business units.',
    complexity: 'Standard',
    tags: ['Financial Services', 'Regulated Industries'],
    trigger: 'Quarterly/annual compliance cycle',
    roles: ['Certifier', 'Compliance Officer', 'Executive'],
    steps: [
      {
        name: 'Certification cycle initiation',
        type: 'FORM',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Set up the compliance certification cycle. Define the period, certification type, and list of certifiers.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Certification Period', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Certification Type', type: 'DROPDOWN', required: true, options: [{ label: 'SOX Sub-Certification', value: 'sox' }, { label: 'Code of Conduct', value: 'code-of-conduct' }, { label: 'Conflict of Interest', value: 'conflict-of-interest' }, { label: 'Regulatory Compliance', value: 'regulatory' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f3', label: 'Submission Deadline', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Certifier List / Departments', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Pre-certification materials',
        type: 'FILE_REQUEST',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Upload reference materials, guidance documents, and prior period certifications for certifier review.',
      },
      {
        name: 'Certification notification',
        type: 'TODO',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Automated notification: Send certification notifications to all certifiers with instructions, reference materials, and the submission deadline.',
      },
      {
        name: 'Compliance self-assessment',
        type: 'FORM',
        assigneeRole: 'Certifier',
        sampleDescription:
          'Complete the compliance self-assessment for your area of responsibility. Answer each question based on the current state of your controls and processes.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Department / Business Unit', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Are all compliance requirements met?', type: 'DROPDOWN', required: true, options: [{ label: 'Yes - Full compliance', value: 'yes' }, { label: 'No - Exceptions noted', value: 'no' }] },
          { fieldId: 'f3', label: 'Exceptions or Deviations', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f4', label: 'Process Changes Since Last Certification', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f5', label: 'Remediation Plans (if applicable)', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Supporting evidence upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Certifier',
        sampleDescription:
          'Upload any supporting evidence for your certification responses. Include documentation for any exceptions or process changes noted.',
      },
      {
        name: 'AI certification aggregation',
        type: 'TODO',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'AI-powered: Aggregate all certification responses and flag "No" responses, exceptions, inconsistencies across business units, and patterns requiring investigation.',
      },
      {
        name: 'Exception investigation',
        type: 'TODO',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Investigate all flagged exceptions and inconsistencies from the certification responses. Document findings and required corrective actions.',
      },
      {
        name: 'Compliance officer review',
        type: 'APPROVAL',
        assigneeRole: 'Compliance Officer',
        sampleDescription:
          'Review the aggregated certification results, exception investigations, and overall compliance posture. Approve the certification package for executive sign-off.',
      },
      {
        name: 'Executive certification',
        type: 'ESIGN',
        assigneeRole: 'Executive',
        sampleDescription:
          'Review the compliance certification summary and sign the executive certification confirming organizational compliance for the reporting period.',
        sampleDocumentRef: 'compliance-certification.pdf',
      },
    ],
    useCases: [
      'Running quarterly SOX sub-certifications across business units',
      'Conducting annual code of conduct certifications for all employees',
      'Managing regulatory compliance attestations for financial services firms',
      'Coordinating conflict of interest disclosures across the organization',
    ],
    requirements: [
      'Upload your compliance certification document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your GRC platform (ServiceNow GRC, Archer, LogicGate) to auto-distribute certifications by business unit and aggregate results into compliance dashboards',
      'Connect to your HRIS (Workday, BambooHR) to auto-populate certifier lists by department and role, ensuring complete coverage',
      'Set up automated email and Slack reminders for certifiers approaching submission deadlines with escalation to managers for non-respondents',
      'Sync certification results to your SOX compliance tool (AuditBoard, Workiva) for sub-certification tracking and executive roll-up reporting',
    ],
  },

  // 73. Policy Acknowledgement Rollout
  {
    id: 'policy-acknowledgement-rollout',
    name: 'Policy Acknowledgement Rollout',
    category: 'audit-compliance',
    description:
      'Distribute new or updated policies to recipients and track acknowledgement completion. Provides a structured process for policy publication, distribution, knowledge verification, and follow-up on non-respondents.',
    complexity: 'Simple',
    tags: ['All Industries'],
    trigger: 'New/updated policy / Annual re-acknowledgement',
    roles: ['Policy Recipient', 'Compliance Admin'],
    steps: [
      {
        name: 'Policy publication details',
        type: 'FORM',
        assigneeRole: 'Compliance Admin',
        sampleDescription:
          'Enter the details of the policy being published or updated. This information will be used for distribution and tracking.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Policy Title', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Policy Category', type: 'DROPDOWN', required: true, options: [{ label: 'Information Security', value: 'info-security' }, { label: 'Data Privacy', value: 'data-privacy' }, { label: 'Code of Conduct', value: 'code-of-conduct' }, { label: 'Acceptable Use', value: 'acceptable-use' }, { label: 'Anti-Harassment', value: 'anti-harassment' }, { label: 'Other', value: 'other' }] },
          { fieldId: 'f3', label: 'Effective Date', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Target Audience', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Acknowledgement Deadline', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Policy document upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Compliance Admin',
        sampleDescription:
          'Upload the final policy document for distribution to recipients.',
      },
      {
        name: 'Distribution notification',
        type: 'TODO',
        assigneeRole: 'Compliance Admin',
        sampleDescription:
          'Automated notification: Send policy distribution notifications to all recipients with the policy document, summary of changes, and acknowledgement deadline.',
      },
      {
        name: 'Policy review & acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Policy Recipient',
        sampleDescription:
          'Read the policy document in full. Acknowledge that you have read, understood, and agree to comply with the policy.',
      },
      {
        name: 'Knowledge verification (if required)',
        type: 'FORM',
        assigneeRole: 'Policy Recipient',
        sampleDescription:
          'Complete this brief knowledge check to verify your understanding of the key policy provisions.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'What is the main purpose of this policy?', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Who should you contact with questions about this policy?', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Do you have any questions about the policy?', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Manager follow-up for non-respondents',
        type: 'TODO',
        assigneeRole: 'Compliance Admin',
        sampleDescription:
          'Follow up with recipients who have not acknowledged the policy by the deadline. Escalate to managers if necessary and document all outreach.',
      },
      {
        name: 'Rollout closure',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Compliance Admin',
        sampleDescription:
          'Confirm that the policy rollout is complete. Document the acknowledgement rate and any outstanding non-respondents for the compliance record.',
      },
    ],
    useCases: [
      'Rolling out updated information security policies to all employees',
      'Distributing annual code of conduct re-acknowledgements',
      'Publishing new data privacy policies in response to regulatory changes',
      'Tracking anti-harassment policy acknowledgements during onboarding',
    ],
    recommendations: [
      'Connect to your HRIS (Workday, BambooHR) to auto-distribute policies to new hires during onboarding and maintain up-to-date employee rosters for rollouts',
      'Integrate with your LMS (Cornerstone, Lessonly) to pair policy acknowledgements with required training modules and track completion together',
      'Set up Slack or email escalation alerts for managers when their direct reports have not acknowledged policies by the deadline',
    ],
  },

  // 74. Regulatory Inquiry Response Coordination
  {
    id: 'regulatory-inquiry-response-coordination',
    name: 'Regulatory Inquiry Response Coordination',
    category: 'audit-compliance',
    description:
      'Coordinate the response to regulatory inquiries through structured evidence collection, subject matter expert input, legal review, and executive approval. Ensures timely and accurate responses to regulatory agencies.',
    complexity: 'Simple',
    tags: ['Financial Services', 'Healthcare', 'Regulated Industries'],
    trigger: 'Regulatory inquiry received',
    roles: ['Compliance Owner', 'Subject Matter Expert', 'Legal Counsel', 'Executive Sponsor'],
    steps: [
      {
        name: 'Inquiry intake & scope',
        type: 'FORM',
        assigneeRole: 'Compliance Owner',
        sampleDescription:
          'Log the regulatory inquiry details including the issuing agency, scope, and response deadline.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Regulatory Agency', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Inquiry Reference Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Date Received', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Response Deadline', type: 'DATE', required: true },
          { fieldId: 'f5', label: 'Inquiry Scope / Questions', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Applicable Regulations', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Evidence collection from SMEs',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subject Matter Expert',
        sampleDescription:
          'Upload all relevant documentation and evidence to support the inquiry response. Include policies, procedures, logs, and any other materials requested.',
      },
      {
        name: 'SME clarifications',
        type: 'FORM',
        assigneeRole: 'Subject Matter Expert',
        sampleDescription:
          'Provide additional context and clarifications about the evidence and your area of expertise.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Responses', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Additional Context', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Draft response preparation',
        type: 'TODO',
        assigneeRole: 'Compliance Owner',
        sampleDescription:
          'Prepare the draft response to the regulatory inquiry. Compile all evidence, SME input, and supporting documentation into a cohesive response package.',
      },
      {
        name: 'Legal review',
        type: 'TODO',
        assigneeRole: 'Legal Counsel',
        sampleDescription:
          'Review the draft response for legal accuracy, completeness, and appropriate tone. Ensure the response does not inadvertently create additional liability or regulatory exposure.',
      },
      {
        name: 'Executive approval',
        type: 'APPROVAL',
        assigneeRole: 'Executive Sponsor',
        sampleDescription:
          'Review and approve the final regulatory inquiry response before submission to the agency.',
      },
      {
        name: 'Final submission confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Compliance Owner',
        sampleDescription:
          'Confirm that the regulatory inquiry response has been submitted to the agency. Document the submission method, date, and any follow-up commitments.',
      },
    ],
    useCases: [
      'Responding to SEC examination inquiries for financial services firms',
      'Coordinating responses to CMS audit inquiries for healthcare organizations',
      'Managing state regulatory inquiries about licensing or compliance',
      'Handling FINRA information requests for broker-dealer operations',
    ],
    recommendations: [
      'Integrate with your regulatory correspondence management system (RegTech, Compliance.ai) to auto-log inquiries, track deadlines, and maintain a complete response history',
      'Connect to your document management system (SharePoint, iManage) to centralize evidence collection and version-control draft responses before submission',
      'Set up Slack or Teams deadline alerts with escalation paths for response due dates, legal review turnaround, and executive approval windows',
    ],
  },

  // 75. Internal Control Self-Assessment
  {
    id: 'internal-control-self-assessment',
    name: 'Internal Control Self-Assessment',
    category: 'audit-compliance',
    description:
      'Conduct periodic self-assessments of internal controls across the organization. Control owners evaluate effectiveness, document deviations, and submit remediation plans for department manager attestation.',
    complexity: 'Standard',
    tags: ['All Industries', 'GRC'],
    trigger: 'Quarterly/annual assessment cycle / Risk event',
    roles: ['Control Owner', 'Compliance Coordinator', 'Department Manager'],
    steps: [
      {
        name: 'Assessment cycle initiation',
        type: 'FORM',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Set up the self-assessment cycle. Define the assessment period, scope, control areas, and assign control owners.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Assessment Period', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Scope / Control Areas', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Submission Deadline', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Control Owner Assignments', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Control inventory & prior findings',
        type: 'FILE_REQUEST',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Upload the control inventory with descriptions, expected evidence, and prior assessment results. This will guide control owners in their self-assessment.',
      },
      {
        name: 'Self-assessment questionnaire',
        type: 'FORM',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Complete the self-assessment for each control you own. Rate effectiveness, document any deviations, and report on remediation of prior findings.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Control Effectiveness Rating', type: 'DROPDOWN', required: true, options: [{ label: 'Effective', value: 'effective' }, { label: 'Partially Effective', value: 'partially-effective' }, { label: 'Ineffective', value: 'ineffective' }] },
          { fieldId: 'f2', label: 'Deviations Noted', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Process Changes Since Last Assessment', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f4', label: 'Remediation Status of Prior Findings', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Supporting evidence upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Upload evidence supporting your self-assessment responses. Include documentation demonstrating control operation and effectiveness.',
      },
      {
        name: 'Compliance coordinator review',
        type: 'TODO',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Review all self-assessment responses and supporting evidence. Identify trends, common gaps, and areas requiring further investigation or remediation.',
      },
      {
        name: 'Clarification questions',
        type: 'FORM',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'Respond to follow-up questions from the compliance team about your self-assessment responses.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Clarification Responses', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Remediation plan for gaps (if any)',
        type: 'FORM',
        assigneeRole: 'Control Owner',
        sampleDescription:
          'If any control gaps or deficiencies were identified, submit a remediation plan with specific actions, responsible parties, and target dates.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Gap Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Remediation Actions', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Responsible Party', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Target Completion Date', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Department manager attestation',
        type: 'APPROVAL',
        assigneeRole: 'Department Manager',
        sampleDescription:
          'Review the self-assessment results and remediation plans for your department. Attest that the assessment accurately reflects the state of internal controls.',
      },
      {
        name: 'Assessment closure',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Compliance Coordinator',
        sampleDescription:
          'Confirm that the self-assessment cycle is complete. All assessments have been reviewed, remediation plans accepted, and department attestations received.',
      },
    ],
    useCases: [
      'Running quarterly internal control self-assessments for SOX compliance',
      'Conducting annual risk-based control assessments across departments',
      'Managing targeted control assessments after a process change or incident',
      'Coordinating organization-wide IT general controls (ITGC) self-assessments',
    ],
    recommendations: [
      'Integrate with your GRC platform (ServiceNow GRC, Archer, LogicGate) to sync self-assessment results with the control inventory and risk register for real-time risk posture visibility',
      'Connect to your SOX compliance tool (AuditBoard, Workiva) to auto-feed self-assessment ratings into SOX testing plans and management attestation workflows',
      'Set up Slack or Teams notifications for control owners when assessment cycles open and for compliance coordinators when remediation plans are overdue',
      'Push completed assessments and remediation plans to SharePoint or Confluence for department manager review and historical trend analysis',
    ],
  },
];
