import type { GalleryTemplate } from './types';

export const SALES_EVALUATION_TEMPLATES: GalleryTemplate[] = [
  // ── 28. Guided Product Trial ─────────────────────────────────────────────
  {
    id: 'guided-product-trial',
    name: 'Guided Product Trial',
    category: 'sales-evaluation',
    description:
      'Run structured product trials from registration through mid-trial check-in and conversion decision. Keeps prospects engaged with guided milestones while giving sales reps clear signals on trial health and buying intent.',
    complexity: 'Standard',
    tags: ['SaaS', 'Technology'],
    trigger: 'Prospect requests structured trial',
    roles: ['Prospect', 'Sales Rep'],
    useCases: [
      'SaaS prospect evaluating project management software for their team',
      'Mid-market company trialing a new CRM before annual contract commitment',
      'IT department testing a security tool with a limited pilot group',
      'Startup evaluating analytics platform with free-trial-to-paid conversion path',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to your CRM (HubSpot, Salesforce) to auto-create a trial opportunity and sync engagement data as the prospect progresses through milestones',
      'Integrate with your product analytics platform (Mixpanel, Amplitude, Pendo) to pull real-time usage metrics into the mid-trial check-in step',
      'Set up Slack notifications for the sales rep when mid-trial survey responses indicate low satisfaction or blockers, enabling faster intervention',
    ],
    steps: [
      {
        name: 'Trial registration form',
        type: 'FORM',
        assigneeRole: 'Prospect',
        sampleDescription:
          'Complete your trial registration so we can tailor the experience to your needs. Tell us about your company, team, and what you hope to achieve during the trial.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Industry', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Team Size', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Primary Use Case', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Current Tools', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f6', label: 'Goals for This Trial', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Trial environment setup',
        type: 'TODO',
        assigneeRole: 'Sales Rep',
        sampleDescription:
          'Provision the trial environment, configure it for the prospect\'s use case, and prepare onboarding materials. Send access credentials and getting-started guide.',
      },
      {
        name: 'Trial plan acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Prospect',
        sampleDescription:
          'Review and acknowledge the trial plan including timeline, key milestones, and support resources available during your evaluation period.',
      },
      {
        name: 'Mid-trial check-in survey',
        type: 'FORM',
        assigneeRole: 'Prospect',
        sampleDescription:
          'Share your trial experience so far. This helps us understand what\'s working, identify any blockers, and tailor the remaining trial period to your needs.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Which features have you explored?', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Any blockers or challenges?', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Overall Satisfaction', type: 'DROPDOWN', required: true, options: [
            { label: 'Very Satisfied', value: 'very_satisfied' },
            { label: 'Satisfied', value: 'satisfied' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Dissatisfied', value: 'dissatisfied' },
          ] },
          { fieldId: 'f4', label: 'Integration needs?', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Guided demo of advanced features',
        type: 'TODO',
        assigneeRole: 'Sales Rep',
        sampleDescription:
          'Conduct a personalized demo of advanced features based on the prospect\'s mid-trial feedback. Address blockers and showcase capabilities aligned with their goals.',
      },
      {
        name: 'Trial outcome decision',
        type: 'DECISION',
        assigneeRole: 'Sales Rep',
        sampleDescription:
          'Evaluate the prospect\'s engagement and trial outcomes. Decide whether to convert to a paid plan, extend the trial for further evaluation, or close the opportunity.',
      },
      {
        name: 'Proposal delivery',
        type: 'FILE_REQUEST',
        assigneeRole: 'Sales Rep',
        sampleDescription:
          'Upload the customized proposal based on the prospect\'s trial usage and requirements. Include pricing, implementation timeline, and support terms.',
      },
      {
        name: 'Proposal sign-off',
        type: 'APPROVAL',
        assigneeRole: 'Prospect',
        sampleDescription:
          'Review the proposal and confirm you\'d like to proceed. If you have questions or need adjustments, use this step to request changes before signing.',
      },
    ],
  },

  // ── 29. Pilot Program Evaluation ─────────────────────────────────────────
  {
    id: 'pilot-program-evaluation',
    name: 'Pilot Program Evaluation',
    category: 'sales-evaluation',
    description:
      'Manage enterprise pilot programs from scoping success criteria through mid-pilot reviews, data-driven evaluation, and final contract execution. Provides structured governance so both vendor and prospect stay aligned on outcomes.',
    complexity: 'Complex',
    tags: ['Technology', 'Enterprise SaaS'],
    trigger: 'Enterprise prospect requests pilot',
    roles: ['Prospect Sponsor', 'Pilot Lead'],
    useCases: [
      'Enterprise evaluating a new collaboration platform across multiple business units',
      'Healthcare system piloting an EHR integration with a department-level rollout',
      'Financial institution testing a compliance automation tool before enterprise deployment',
      'Manufacturing company piloting IoT analytics with a single facility',
    ],
    requirements: [
      'Upload your contract document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to Salesforce to auto-update the opportunity stage as the pilot moves through scoping, mid-review, and go/no-go decision milestones',
      'Integrate with your product analytics dashboard to auto-populate mid-pilot status review forms with actual adoption and usage metrics',
      'Push signed contracts to DocuSign or Adobe Sign for tamper-evident e-signature execution and automatic archival',
      'Set up Teams or Slack notifications for the steering committee when mid-pilot reviews are due or when the go/no-go decision is pending',
    ],
    steps: [
      {
        name: 'Pilot scope & objectives form',
        type: 'FORM',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Define the pilot scope including which business unit will participate, the evaluation timeline, user count, and the specific success metrics and KPIs you\'ll measure.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Business Unit', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Pilot Duration', type: 'DROPDOWN', required: true, options: [
            { label: '30 days', value: '30' },
            { label: '60 days', value: '60' },
            { label: '90 days', value: '90' },
          ] },
          { fieldId: 'f3', label: 'Number of Pilot Users', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Success Metrics / KPIs', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Key Business Outcomes Expected', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Success criteria sign-off',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Review and confirm the agreed-upon success criteria, evaluation methodology, and pilot timeline before the pilot begins.',
      },
      {
        name: 'Technical environment setup',
        type: 'TODO',
        assigneeRole: 'Pilot Lead',
        sampleDescription:
          'Set up the pilot environment including infrastructure provisioning, user accounts, SSO integration, data migration (if applicable), and monitoring dashboards.',
      },
      {
        name: 'Pilot kickoff acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Acknowledge the pilot kickoff, confirm that pilot users have access, and note the support escalation path and scheduled check-in cadence.',
      },
      {
        name: 'Mid-pilot status review',
        type: 'FORM',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Provide a mid-pilot status update on adoption, user feedback, and any issues encountered. This helps the team adjust course if needed.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Active Users', type: 'NUMBER', required: true },
          { fieldId: 'f2', label: 'Issues Encountered', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Overall Sentiment', type: 'DROPDOWN', required: true, options: [
            { label: 'Very Positive', value: 'very_positive' },
            { label: 'Positive', value: 'positive' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Negative', value: 'negative' },
          ] },
          { fieldId: 'f4', label: 'Risks or Concerns', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Steering committee decision',
        type: 'APPROVAL',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Based on mid-pilot results, decide whether to continue the pilot as planned, adjust scope or timeline, or terminate the pilot early.',
      },
      {
        name: 'Final pilot data collection',
        type: 'FILE_REQUEST',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Upload final pilot data including usage reports, user survey results, performance metrics, and any internal evaluation documents.',
      },
      {
        name: 'AI evaluation report',
        type: 'TODO',
        assigneeRole: 'Pilot Lead',
        sampleDescription:
          'AI-powered: Generate a comprehensive evaluation report comparing actual results against success criteria, quantifying business impact, and providing a data-driven recommendation for the go/no-go decision.',
      },
      {
        name: 'Go/No-Go decision',
        type: 'DECISION',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Make the final go/no-go decision on enterprise rollout based on the pilot evaluation report, business impact analysis, and organizational readiness.',
      },
      {
        name: 'Final contract sign-off',
        type: 'ESIGN',
        assigneeRole: 'Prospect Sponsor',
        sampleDescription:
          'Review and electronically sign the enterprise contract to proceed from pilot to full deployment.',
      },
    ],
  },

  // ── 30. AI Pilot Evaluation ──────────────────────────────────────────────
  {
    id: 'ai-pilot-evaluation',
    name: 'AI Pilot Evaluation',
    category: 'sales-evaluation',
    description:
      'Evaluate AI tools and platforms with built-in security review, data privacy sign-off, and structured user feedback collection. Ensures responsible AI adoption with quantified results and risk assessment before enterprise rollout.',
    complexity: 'Standard',
    tags: ['Technology', 'Enterprise', 'Cross-industry'],
    trigger: 'AI tool/platform selected for evaluation',
    roles: ['Business Sponsor', 'AI Lead', 'IT Security', 'Data Privacy Officer', 'Pilot Users'],
    useCases: [
      'Marketing team evaluating a generative AI content creation platform',
      'Customer support department piloting an AI chatbot for tier-1 tickets',
      'Legal department testing AI contract review and analysis software',
      'Engineering team evaluating AI code assistant tools for developer productivity',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your IT asset management or vendor risk management platform (ServiceNow, OneTrust) to auto-register the AI tool and track its risk classification',
      'Connect to your data governance catalog (Collibra, Alation) to auto-flag which data types require DPA or DPIA review before the pilot starts',
      'Set up automated Slack alerts for IT Security and the Data Privacy Officer when new AI pilot requests are submitted for expedited triage',
      'Push final evaluation reports and approval records to your GRC platform for enterprise AI governance audit trail',
    ],
    steps: [
      {
        name: 'AI pilot request',
        type: 'FORM',
        assigneeRole: 'Business Sponsor',
        sampleDescription:
          'Submit the AI pilot request with details about the tool, intended use case, data requirements, and success metrics for evaluation.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'AI Tool / Vendor Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Use Case Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Data Types Involved', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Number of Pilot Users', type: 'NUMBER', required: true },
          { fieldId: 'f5', label: 'Success Metrics', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Estimated Budget', type: 'NUMBER' },
        ],
      },
      {
        name: 'IT security & data privacy review',
        type: 'TODO',
        assigneeRole: 'IT Security',
        sampleDescription:
          'Review the AI tool\'s data handling practices, model hosting infrastructure, access controls, and PII/PHI exposure risk. Document findings and any required mitigations.',
      },
      {
        name: 'Data privacy sign-off',
        type: 'APPROVAL',
        assigneeRole: 'Data Privacy Officer',
        sampleDescription:
          'Review the IT security assessment and approve the AI pilot from a data privacy perspective. Ensure compliance with applicable privacy regulations (GDPR, CCPA, etc.).',
      },
      {
        name: 'Pilot environment setup',
        type: 'TODO',
        assigneeRole: 'AI Lead',
        sampleDescription:
          'Set up the pilot environment including sandbox configuration, test data preparation, user provisioning, and guardrails for responsible AI use.',
      },
      {
        name: 'Pilot kickoff acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Pilot Users',
        sampleDescription:
          'Acknowledge the pilot kickoff, review the acceptable use guidelines, and confirm you understand the evaluation timeline and feedback expectations.',
      },
      {
        name: 'Mid-pilot feedback survey',
        type: 'FORM',
        assigneeRole: 'Pilot Users',
        sampleDescription:
          'Share your experience using the AI tool so far. Your feedback on accuracy, usability, and time savings is critical for the evaluation.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Accuracy of AI Outputs', type: 'DROPDOWN', required: true, options: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
          ] },
          { fieldId: 'f2', label: 'Ease of Use', type: 'DROPDOWN', required: true, options: [
            { label: 'Very Easy', value: 'very_easy' },
            { label: 'Easy', value: 'easy' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Difficult', value: 'difficult' },
          ] },
          { fieldId: 'f3', label: 'Estimated Time Saved per Week', type: 'NUMBER' },
          { fieldId: 'f4', label: 'Concerns or Edge Cases', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Final results & risk assessment',
        type: 'FILE_REQUEST',
        assigneeRole: 'AI Lead',
        sampleDescription:
          'Upload the final evaluation report including quantified results vs. success metrics, hallucination rate analysis, bias findings, cost analysis, and risk assessment.',
      },
      {
        name: 'Go/No-Go decision',
        type: 'DECISION',
        assigneeRole: 'Business Sponsor',
        sampleDescription:
          'Based on the evaluation report, decide whether to scale the AI tool to the enterprise, extend the pilot for additional evaluation, or terminate the engagement.',
      },
      {
        name: 'Enterprise rollout approval',
        type: 'APPROVAL',
        assigneeRole: 'Business Sponsor',
        sampleDescription:
          'Provide final approval to proceed with enterprise-wide rollout of the AI tool, including budget authorization and implementation timeline sign-off.',
      },
    ],
  },

  // ── 31. Proposal & SOW Delivery ──────────────────────────────────────────
  {
    id: 'proposal-sow-delivery',
    name: 'Proposal & SOW Delivery',
    category: 'sales-evaluation',
    description:
      'Deliver proposals and statements of work from internal drafting through client review, Q&A, and e-signature. Creates a professional, trackable process that shortens sales cycles and ensures nothing falls through the cracks.',
    complexity: 'Standard',
    tags: ['Cross-industry B2B'],
    trigger: 'Post-discovery / qualification',
    roles: ['Client Prospect', 'Sales Lead'],
    useCases: [
      'SaaS vendor sending a multi-year enterprise proposal after discovery calls',
      'Consulting firm delivering a SOW for a digital transformation engagement',
      'Marketing agency proposing a retainer-based services agreement',
      'IT services company submitting a managed services proposal to a mid-market client',
    ],
    requirements: [
      'Upload your SOW document for e-signature (replaces sample)',
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to your CRM (Salesforce, HubSpot) to auto-update the deal stage and log proposal delivery, Q&A, and sign-off events on the opportunity timeline',
      'Integrate with DocuSign or Adobe Sign for the SOW e-signature step to provide a legally binding, tamper-evident signing experience',
      'Set up Slack or email notifications for the delivery team when the SOW is signed so they can begin implementation planning immediately',
      'Push signed SOW documents and client requirements to your project management tool (Asana, Monday, Jira) to auto-create the implementation project',
    ],
    steps: [
      {
        name: 'Proposal request details',
        type: 'FORM',
        assigneeRole: 'Sales Lead',
        sampleDescription:
          'Capture the key details needed to draft the proposal including client information, opportunity value, product scope, and specific requirements.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Client / Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Opportunity Value', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Products / Services', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Contract Term', type: 'DROPDOWN', required: true, options: [
            { label: '1 Year', value: '1_year' },
            { label: '2 Years', value: '2_years' },
            { label: '3 Years', value: '3_years' },
            { label: 'Custom', value: 'custom' },
          ] },
          { fieldId: 'f5', label: 'Specific Requirements or Notes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Draft proposal & SOW upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Sales Lead',
        sampleDescription:
          'Upload the draft proposal and statement of work for internal review before sending to the client.',
      },
      {
        name: 'Internal review & approval',
        type: 'APPROVAL',
        assigneeRole: 'Sales Lead',
        sampleDescription:
          'Review the proposal and SOW for accuracy, pricing alignment, and compliance with company policies. Approve to release to the client.',
      },
      {
        name: 'Proposal delivery',
        type: 'TODO',
        assigneeRole: 'Sales Lead',
        sampleDescription:
          'Automated notification: Send the approved proposal and SOW to the client prospect with a personalized cover message highlighting key value points.',
      },
      {
        name: 'Client Q&A submission',
        type: 'FORM',
        assigneeRole: 'Client Prospect',
        sampleDescription:
          'Review the proposal and submit any questions, concerns, or requested modifications. We want to make sure every detail meets your expectations.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Questions or Feedback', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Requested Changes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Revised terms / Q&A response',
        type: 'FILE_REQUEST',
        assigneeRole: 'Sales Lead',
        sampleDescription:
          'Upload the revised proposal addressing the client\'s questions and requested changes, or a written Q&A response document.',
      },
      {
        name: 'Client final review',
        type: 'APPROVAL',
        assigneeRole: 'Client Prospect',
        sampleDescription:
          'Review the final proposal and confirm you are satisfied with the terms, pricing, and scope. Approve to proceed to contract signing.',
      },
      {
        name: 'SOW e-signature',
        type: 'ESIGN',
        assigneeRole: 'Client Prospect',
        sampleDescription:
          'Review and electronically sign the statement of work to formally engage and kick off the project.',
      },
      {
        name: 'Handoff to delivery team',
        type: 'TODO',
        assigneeRole: 'Sales Lead',
        sampleDescription:
          'Complete the internal handoff to the delivery team including signed SOW, client requirements, key contacts, and any special agreements or commitments made during the sales process.',
      },
    ],
  },

  // ── 32. RFP Response Coordination ────────────────────────────────────────
  {
    id: 'rfp-response-coordination',
    name: 'RFP Response Coordination',
    category: 'sales-evaluation',
    description:
      'Coordinate multi-stakeholder RFP responses from intake and go/no-go evaluation through SME contributions, quality review, and executive sign-off. Keeps complex proposal efforts on track with clear ownership and deadlines.',
    complexity: 'Complex',
    tags: ['Cross-industry', 'Government', 'Enterprise'],
    trigger: 'RFP received from prospect',
    roles: ['Proposal Lead', 'SMEs', 'Executive Sponsor'],
    useCases: [
      'Government agency RFP requiring cross-departmental technical and pricing inputs',
      'Enterprise software RFP with security, compliance, and integration requirements',
      'Healthcare system RFP for a multi-year services and technology contract',
      'Financial institution RFP for managed IT services with strict SLA requirements',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your CRM to auto-log the RFP opportunity, track go/no-go decisions, and update deal stage as the response progresses through review and submission',
      'Connect to a content library or proposal management tool (Loopio, Responsive, Qvidian) to help SMEs pull pre-approved answers for common RFP requirements',
      'Set up calendar integrations to auto-schedule internal review meetings and deadline reminders aligned with the RFP submission timeline',
      'Push the final submitted response and supporting documents to SharePoint or Google Drive for centralized archival and win/loss analysis',
    ],
    steps: [
      {
        name: 'RFP intake & details',
        type: 'FORM',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Log the RFP details including the issuing organization, submission deadline, estimated deal value, and evaluation criteria.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Issuing Organization', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Submission Deadline', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Estimated Deal Value', type: 'NUMBER' },
          { fieldId: 'f4', label: 'Evaluation Criteria', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'RFP document upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Upload the complete RFP document and any attachments, addenda, or Q&A responses from the issuing organization.',
      },
      {
        name: 'Go/No-Go evaluation',
        type: 'DECISION',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Evaluate whether to pursue this RFP based on solution fit, estimated win probability, required resources, and strategic value. Document the rationale for the decision.',
      },
      {
        name: 'AI RFP requirements analysis',
        type: 'TODO',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'AI-powered: Parse the RFP requirements, categorize them by department or functional area, and create an assignment matrix mapping each requirement to the appropriate SME.',
      },
      {
        name: 'Response kickoff & assignments',
        type: 'FORM',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Assign RFP sections to subject matter experts and set internal deadlines for each section submission.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Section Assignments Summary', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Internal Deadline for SME Inputs', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Special Instructions', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'SME section inputs',
        type: 'FILE_REQUEST',
        assigneeRole: 'SMEs',
        sampleDescription:
          'Upload your completed section(s) of the RFP response. Ensure all requirements in your assigned sections are addressed with specific, evidence-backed answers.',
      },
      {
        name: 'Pricing & commercial terms',
        type: 'FILE_REQUEST',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Upload the pricing model and commercial terms for the RFP response, including cost breakdown, payment terms, and any volume or term discounts.',
      },
      {
        name: 'Internal review & quality check',
        type: 'APPROVAL',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Review the assembled RFP response for completeness, consistency, compliance with RFP requirements, and quality of writing. Approve to send for executive review.',
      },
      {
        name: 'Executive sign-off',
        type: 'APPROVAL',
        assigneeRole: 'Executive Sponsor',
        sampleDescription:
          'Review the final RFP response and authorize submission. Confirm pricing, strategic commitments, and any exceptions or assumptions noted in the response.',
      },
      {
        name: 'Submission confirmation',
        type: 'TODO',
        assigneeRole: 'Proposal Lead',
        sampleDescription:
          'Submit the RFP response through the required channel (portal, email, physical delivery) and confirm receipt. Archive the final submitted version for records.',
      },
    ],
  },
];
