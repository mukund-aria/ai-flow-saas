import type { GalleryTemplate } from './types';

export const ACCOUNT_MANAGEMENT_TEMPLATES: GalleryTemplate[] = [
  // ── 33. Quarterly Business Review (QBR) ──────────────────────────────────
  {
    id: 'quarterly-business-review-qbr',
    name: 'Quarterly Business Review (QBR)',
    category: 'account-management',
    description:
      'Prepare and execute quarterly business reviews with structured data collection from both internal teams and client stakeholders. Ensures every QBR is backed by real metrics and ends with documented action items.',
    complexity: 'Simple',
    tags: ['SaaS', 'Professional Services', 'B2B'],
    trigger: 'Quarterly cadence',
    roles: ['Client Stakeholder', 'Account Manager'],
    useCases: [
      'SaaS account manager preparing a QBR for a key enterprise customer',
      'Professional services firm reviewing project portfolio with a retainer client',
      'Managed services provider presenting quarterly SLA and performance metrics',
      'Agency presenting campaign results and recommending next-quarter strategy',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to your CRM (Salesforce, HubSpot) to pull ARR, renewal date, and support ticket counts directly into the QBR preparation step',
      'Use AI to analyze usage patterns and client survey responses to auto-generate the QBR presentation deck with trend analysis, ROI highlights, and recommended next-quarter priorities',
      'Set up quarterly auto-launch tied to your fiscal calendar so QBR preparation begins automatically without manual kickoff',
      'Chain with the Annual Renewal template as accounts approach contract expiration to transition seamlessly from review to retention',
    ],
    steps: [
      {
        name: 'QBR Preparation',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Pre-QBR data collection',
        type: 'FORM',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Compile the key account metrics and context needed for the QBR presentation, including renewal timeline, revenue, support history, and relationship highlights.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Renewal Date', type: 'DATE', required: true },
          { fieldId: 'f2', label: 'Annual Recurring Revenue (ARR)', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Support Tickets (This Quarter)', type: 'NUMBER' },
          { fieldId: 'f4', label: 'NPS Score', type: 'NUMBER' },
          { fieldId: 'f5', label: 'Key Wins This Quarter', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'QBR presentation upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Upload your QBR presentation deck with account performance data, usage trends, ROI analysis, and proposed recommendations for the upcoming quarter.',
      },
      {
        name: 'Client pre-QBR survey',
        type: 'FORM',
        assigneeRole: 'Client Stakeholder',
        skipSequentialOrder: true,
        sampleDescription:
          'Share your perspective before the QBR meeting. Your input on satisfaction, priorities, and feature needs helps us make the session as productive as possible.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Overall Satisfaction', type: 'DROPDOWN', required: true, options: [
            { label: 'Very Satisfied', value: 'very_satisfied' },
            { label: 'Satisfied', value: 'satisfied' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Dissatisfied', value: 'dissatisfied' },
          ] },
          { fieldId: 'f2', label: 'Top Priorities for Next Quarter', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Feature Requests or Improvements', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Meeting & Follow-up',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'QBR meeting completion',
        type: 'TODO',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Conduct the QBR meeting, present findings and recommendations, capture client feedback, and document agreed-upon action items with owners and due dates.',
      },
      {
        name: 'Action items acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Client Stakeholder',
        sampleDescription:
          'Review and acknowledge the action items agreed upon during the QBR meeting. This confirms mutual understanding of next steps and responsibilities.',
      },
      {
        name: 'Internal debrief',
        type: 'TODO',
        assigneeRole: 'Account Manager',
        sampleDescription:
          'Complete the internal debrief by updating the CRM, logging action items, flagging any risks or expansion opportunities, and sharing notes with the extended account team.',
      },
    ],
  },

  // ── 34. Annual Renewal ───────────────────────────────────────────────────
  {
    id: 'annual-renewal',
    name: 'Annual Renewal',
    category: 'account-management',
    description:
      'Drive contract renewals from 90-day-out kickoff through client survey, internal pricing approval, proposal delivery, and e-signature. Reduces churn risk by starting early and tracking every client touchpoint.',
    complexity: 'Standard',
    tags: ['SaaS', 'Professional Services', 'Subscription'],
    trigger: '90 days before contract expiration',
    roles: ['Client Contact', 'CSM', 'Finance'],
    useCases: [
      'SaaS subscription renewal with potential upsell to a higher tier',
      'Professional services retainer renewal with scope adjustments',
      'Annual software license renewal with volume discount negotiation',
      'Managed services contract renewal requiring updated SLA terms',
    ],
    requirements: [
      'Upload your renewal contract document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to DocuSign or Adobe Sign for the e-signature step to provide a seamless, legally binding signing experience',
      'Use AI to analyze the client renewal survey responses and usage report to auto-generate a churn risk score and recommended retention strategy before the CSM prepares the renewal offer',
      'Schedule auto-launch 90 days before contract expiration to start the renewal process and ensure no accounts lapse without outreach',
      'Push updated contract details (new ARR, term dates, seat count) to your billing system (Stripe, Chargebee, Zuora) upon signature to eliminate manual data entry',
      'Follow up with the Quarterly Business Review (QBR) template to establish an ongoing cadence after renewal is complete',
    ],
    steps: [
      {
        name: 'Discovery & Assessment',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Renewal kickoff details',
        type: 'FORM',
        assigneeRole: 'CSM',
        sampleDescription:
          'Capture the renewal context including current contract details, account health indicators, and any upsell or risk factors to guide the renewal strategy.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Account Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Contract End Date', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Current ARR', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Number of Licenses / Seats', type: 'NUMBER' },
          { fieldId: 'f5', label: 'Renewal Risk Factors', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f6', label: 'Upsell Opportunities', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Usage & value report upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'CSM',
        sampleDescription:
          'Upload a usage and value report showing the client\'s product adoption, ROI metrics, and key achievements during the current contract period.',
      },
      {
        name: 'Client renewal survey',
        type: 'FORM',
        assigneeRole: 'Client Contact',
        skipSequentialOrder: true,
        sampleDescription:
          'Help us understand your renewal priorities. Your feedback on satisfaction, usage, and budget directly shapes the renewal offer we prepare for you.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Overall Satisfaction', type: 'DROPDOWN', required: true, options: [
            { label: 'Very Satisfied', value: 'very_satisfied' },
            { label: 'Satisfied', value: 'satisfied' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Dissatisfied', value: 'dissatisfied' },
          ] },
          { fieldId: 'f2', label: 'Current Usage Level', type: 'DROPDOWN', required: true, options: [
            { label: 'Heavy - daily use', value: 'heavy' },
            { label: 'Moderate - weekly use', value: 'moderate' },
            { label: 'Light - occasional use', value: 'light' },
          ] },
          { fieldId: 'f3', label: 'Any budget changes expected?', type: 'DROPDOWN', required: true, options: [
            { label: 'Budget increasing', value: 'increasing' },
            { label: 'Budget flat', value: 'flat' },
            { label: 'Budget decreasing', value: 'decreasing' },
          ] },
          { fieldId: 'f4', label: 'Other vendors being evaluated?', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Proposal & Negotiation',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Internal pricing approval',
        type: 'APPROVAL',
        assigneeRole: 'Finance',
        sampleDescription:
          'Review the proposed renewal pricing, discount levels, and terms. Approve the pricing before the renewal proposal is sent to the client.',
      },
      {
        name: 'Renewal proposal delivery',
        type: 'FILE_REQUEST',
        assigneeRole: 'CSM',
        sampleDescription:
          'Upload the renewal proposal with updated pricing, terms, and any scope changes for delivery to the client.',
      },
      {
        name: 'Client proposal review',
        type: 'DECISION',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Review the renewal proposal and indicate your decision. You can accept the proposal as-is, request negotiations on pricing or terms, downgrade your plan, or indicate you will not be renewing.',
      },
      {
        name: 'Contract Execution',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Renewal contract e-signature',
        type: 'ESIGN',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Review and electronically sign the renewal contract to continue your subscription or service agreement.',
      },
      {
        name: 'Post-renewal CRM update',
        type: 'TODO',
        assigneeRole: 'CSM',
        sampleDescription:
          'Update the CRM with the new contract details, renewal date, updated ARR, and any commitments made during the renewal process. Set the next renewal reminder.',
      },
    ],
  },

  // ── 35. Client Health Check ──────────────────────────────────────────────
  {
    id: 'client-health-check',
    name: 'Client Health Check',
    category: 'account-management',
    description:
      'Proactively assess at-risk accounts when health scores drop or key contacts change. Captures client sentiment, documents risk factors, and drives a structured action plan to get the relationship back on track.',
    complexity: 'Simple',
    tags: ['SaaS', 'Professional Services'],
    trigger: 'Health score drop / key contact change / scheduled pulse',
    roles: ['Client Contact', 'CSM'],
    useCases: [
      'Account health score dropped below threshold after a support escalation',
      'Key executive sponsor left the client organization',
      'Usage metrics declined significantly over the past 30 days',
      'Scheduled quarterly pulse check for strategic accounts',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your customer success platform (Gainsight, Totango, ChurnZero) to auto-trigger health check flows when account health scores drop below threshold',
      'Connect to your product analytics to include real-time usage trend data (logins, feature adoption, API calls) in the internal risk assessment step',
      'Enable AI-powered sentiment analysis on client satisfaction survey responses to auto-classify risk level and recommend specific intervention strategies before the CSM review',
      'Chain with the Annual Renewal template when health checks reveal at-risk accounts approaching contract expiration within 90 days',
    ],
    steps: [
      {
        name: 'Assessment',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Health check trigger details',
        type: 'FORM',
        assigneeRole: 'CSM',
        sampleDescription:
          'Document what triggered this health check, the current account status, and how close the account is to renewal.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Trigger Reason', type: 'DROPDOWN', required: true, options: [
            { label: 'Health Score Drop', value: 'health_score' },
            { label: 'Key Contact Change', value: 'contact_change' },
            { label: 'Usage Decline', value: 'usage_decline' },
            { label: 'Support Escalation', value: 'support_escalation' },
            { label: 'Scheduled Pulse', value: 'scheduled' },
          ] },
          { fieldId: 'f2', label: 'Current Health (R/Y/G)', type: 'DROPDOWN', required: true, options: [
            { label: 'Red', value: 'red' },
            { label: 'Yellow', value: 'yellow' },
            { label: 'Green', value: 'green' },
          ] },
          { fieldId: 'f3', label: 'Days to Renewal', type: 'NUMBER' },
        ],
      },
      {
        name: 'Client satisfaction survey',
        type: 'FORM',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'We value your feedback and want to ensure you\'re getting the most from our partnership. Please share your honest assessment of how things are going.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Overall Satisfaction', type: 'DROPDOWN', required: true, options: [
            { label: 'Very Satisfied', value: 'very_satisfied' },
            { label: 'Satisfied', value: 'satisfied' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Dissatisfied', value: 'dissatisfied' },
            { label: 'Very Dissatisfied', value: 'very_dissatisfied' },
          ] },
          { fieldId: 'f2', label: 'What is working well?', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'What could be improved?', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Anything we should know?', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Internal risk assessment',
        type: 'FORM',
        assigneeRole: 'CSM',
        sampleDescription:
          'Assess the account risk based on the client survey response and your relationship knowledge. Identify the primary risk factors and recommend an intervention strategy.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Risk Level', type: 'DROPDOWN', required: true, options: [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
          ] },
          { fieldId: 'f2', label: 'Primary Risk Factors', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Recommended Intervention', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Intervention & Resolution',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Health check meeting',
        type: 'TODO',
        assigneeRole: 'CSM',
        sampleDescription:
          'Conduct the health check meeting with the client. Listen actively, address concerns, and collaboratively develop an action plan with clear owners and timelines.',
      },
      {
        name: 'Action plan acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Client Contact',
        sampleDescription:
          'Review and acknowledge the action plan developed during the health check meeting. This confirms our shared commitment to resolving the identified issues.',
      },
      {
        name: 'Follow-up completion',
        type: 'TODO',
        assigneeRole: 'CSM',
        sampleDescription:
          'Complete all follow-up actions from the health check. Update the account health score, log outcomes in the CRM, and schedule the next check-in if needed.',
      },
    ],
  },

  // ── 36. Billing Dispute Resolution ───────────────────────────────────────
  {
    id: 'billing-dispute-resolution',
    name: 'Billing Dispute Resolution',
    category: 'account-management',
    description:
      'Resolve billing disputes from initial intake through investigation, approval, and client acknowledgement. Provides a transparent, documented process that maintains client trust while protecting revenue integrity.',
    complexity: 'Standard',
    tags: ['Cross-industry'],
    trigger: 'Client raises billing dispute',
    roles: ['Client', 'Finance Lead'],
    useCases: [
      'Client disputing charges for unused licenses after a mid-term downgrade',
      'Invoice amount mismatch due to a pricing error or miscommunication',
      'Duplicate charge identified by the client during reconciliation',
      'Client requesting a credit for a service outage or SLA breach',
    ],
    recommendations: [
      'Integrate with your billing system (Stripe, NetSuite, Zuora) to auto-pull invoice details and charge history when a dispute is submitted, reducing manual lookup',
      'Connect to your CRM to log the dispute on the account record and flag the account health score during the investigation period',
      'Use AI to compare the disputed invoice against contract terms and billing records to auto-generate an investigation summary with a recommended resolution before the finance lead review',
      'Chain with the Client Health Check template when repeated disputes signal a deteriorating account relationship that needs proactive attention',
    ],
    steps: [
      {
        name: 'Dispute Intake',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Dispute intake form',
        type: 'FORM',
        assigneeRole: 'Client',
        sampleDescription:
          'Submit the details of your billing dispute so our finance team can investigate promptly. Include the invoice reference and a clear description of the issue.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Invoice Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Disputed Amount', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Dispute Category', type: 'DROPDOWN', required: true, options: [
            { label: 'Overcharge', value: 'overcharge' },
            { label: 'Duplicate Charge', value: 'duplicate' },
            { label: 'Incorrect Pricing', value: 'pricing' },
            { label: 'Service Not Received', value: 'service_not_received' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f4', label: 'Description of Dispute', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Expected Resolution', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Supporting documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Client',
        sampleDescription:
          'Upload any supporting documentation for your dispute, such as the original invoice, contract excerpts, correspondence, or screenshots showing the discrepancy.',
      },
      {
        name: 'Investigation & Decision',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Internal investigation',
        type: 'TODO',
        assigneeRole: 'Finance Lead',
        sampleDescription:
          'Investigate the billing dispute by reviewing billing records, verifying charges against the contract terms, and determining the appropriate resolution.',
      },
      {
        name: 'Resolution approval',
        type: 'APPROVAL',
        assigneeRole: 'Finance Lead',
        sampleDescription:
          'Approve the proposed resolution for the billing dispute. Document the resolution type (credit, refund, adjustment, or denial) and the rationale.',
      },
      {
        name: 'Resolution notification',
        type: 'TODO',
        assigneeRole: 'Finance Lead',
        sampleDescription:
          'Automated notification: Notify the client of the dispute resolution decision, including a clear explanation of the findings and the action being taken.',
      },
      {
        name: 'Resolution acceptance',
        type: 'DECISION',
        assigneeRole: 'Client',
        sampleDescription:
          'Review the resolution proposed by our finance team. You may accept the resolution, escalate if you disagree, or provide additional information to support your case.',
      },
      {
        name: 'Resolution & Close-out',
        type: 'MILESTONE' as const,
        assigneeRole: 'System',
      },
      {
        name: 'Resolution processing',
        type: 'TODO',
        assigneeRole: 'Finance Lead',
        sampleDescription:
          'Process the approved resolution including issuing credit memos, processing refunds, or making billing adjustments in the system.',
      },
      {
        name: 'Resolution acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Client',
        sampleDescription:
          'Acknowledge that the billing dispute has been resolved to your satisfaction. This closes the dispute record in our system.',
      },
    ],
  },
];
