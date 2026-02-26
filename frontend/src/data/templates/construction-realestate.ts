import type { GalleryTemplate } from './types';

export const CONSTRUCTION_REALESTATE_TEMPLATES: GalleryTemplate[] = [
  // 76. Subcontractor Qualification
  {
    id: 'subcontractor-qualification',
    name: 'Subcontractor Qualification',
    category: 'construction-realestate',
    description:
      'Qualify new subcontractors by collecting company profiles, insurance certificates, safety documentation, and references in a structured review process. Ensure every sub meets your project requirements before they set foot on site.',
    complexity: 'Standard',
    tags: ['Construction', 'General Contractors'],
    trigger: 'New subcontractor needed / Bid received',
    roles: ['Subcontractor', 'Project Manager', 'Safety Lead', 'Insurance Coordinator'],
    useCases: [
      'Qualify a new electrical subcontractor before awarding a bid',
      'Re-qualify an existing sub whose insurance or safety certs have expired',
      'Evaluate specialty trade contractors for a new commercial project',
      'Build a pre-qualified vendor list ahead of bidding season',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with a certificate management platform (myCOI, PINS) to auto-verify insurance coverage limits and flag expirations',
      'Connect to Procore or PlanGrid to auto-pull subcontractor profiles and sync qualification status to your project directory',
      'Use AI to cross-check uploaded insurance certificates, EMR letters, and OSHA logs against project-specific safety thresholds and flag gaps before the Safety Lead reviews',
      'Follow Subcontractor Qualification with the Lien Waiver Progress Payment template once the sub is awarded work and billing begins',
    ],
    steps: [
      {
        name: 'Company profile & capabilities',
        type: 'FORM',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Provide your company details, trade specialties, bonding capacity, and relevant project experience.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Primary Trade / Specialty', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Years in Business', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Bonding Capacity ($)', type: 'NUMBER' },
          { fieldId: 'f5', label: 'Number of Employees', type: 'NUMBER' },
          { fieldId: 'f6', label: 'Union / Non-Union', type: 'DROPDOWN', options: [{ label: 'Union', value: 'union' }, { label: 'Non-Union', value: 'non-union' }] },
          { fieldId: 'f7', label: 'Brief Description of Capabilities', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Insurance certificates (GL, WC, Auto)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload current certificates of insurance for General Liability, Workers Compensation, and Commercial Auto. All policies must meet the minimum coverage limits specified in the subcontract.',
      },
      {
        name: 'Safety program documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload your company safety program, EMR letter, OSHA logs (300/300A), and any relevant safety certifications.',
      },
      {
        name: 'License & bonding verification',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload copies of your state contractor license, any specialty licenses, and current bonding documentation.',
      },
      {
        name: 'References',
        type: 'FORM',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Provide at least three project references from the past two years, including contact information for each.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Reference 1 - Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Reference 1 - Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Reference 1 - Phone / Email', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Reference 1 - Project Description', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f5', label: 'Reference 2 - Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f6', label: 'Reference 2 - Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f7', label: 'Reference 2 - Phone / Email', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f8', label: 'Reference 2 - Project Description', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f9', label: 'Reference 3 - Company Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f10', label: 'Reference 3 - Contact Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f11', label: 'Reference 3 - Phone / Email', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f12', label: 'Reference 3 - Project Description', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Insurance review',
        type: 'TODO',
        assigneeRole: 'Insurance Coordinator',
        sampleDescription:
          'Review the uploaded insurance certificates against project requirements. Verify coverage limits, additional insured endorsements, and policy expiration dates.',
      },
      {
        name: 'Safety review',
        type: 'TODO',
        assigneeRole: 'Safety Lead',
        sampleDescription:
          'Review the safety program documentation, EMR history, and OSHA logs. Confirm the subcontractor meets minimum safety standards for the project.',
      },
      {
        name: 'Qualification decision',
        type: 'APPROVAL',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Review all collected materials, insurance review results, and safety review findings to make a final qualification decision for this subcontractor.',
      },
      {
        name: 'Qualification acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Acknowledge receipt of the qualification decision and any conditions or next steps communicated by the project team.',
      },
    ],
  },

  // 77. Lien Waiver Collection - Progress Payment
  {
    id: 'lien-waiver-progress-payment',
    name: 'Lien Waiver Collection \u2014 Progress Payment',
    category: 'construction-realestate',
    description:
      'Collect conditional and unconditional lien waivers alongside progress payment applications. Protect your project from mechanic\u2019s lien exposure while keeping subcontractors paid on schedule.',
    complexity: 'Simple',
    tags: ['Construction', 'Real Estate Development'],
    trigger: 'Payment application submitted',
    roles: ['Subcontractor', 'Project Manager', 'Accounts Payable', 'Owner Representative'],
    useCases: [
      'Process a monthly draw request from a framing subcontractor',
      'Collect conditional waivers before releasing a scheduled progress payment',
      'Obtain unconditional waivers confirming receipt of the previous billing period\u2019s payment',
      'Streamline pay-app review across multiple trades on a single project',
    ],
    requirements: [
      'Upload your conditional lien waiver document for e-signature (replaces sample)',
      'Upload your unconditional lien waiver document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your accounting system (Sage 300, QuickBooks, Viewpoint) to auto-trigger lien waiver requests when progress payments are scheduled',
      'Connect to DocuSign or your e-signature platform to streamline conditional and unconditional waiver execution with audit trails',
      'Schedule monthly auto-launch to coincide with each billing cycle so lien waiver collection starts automatically when progress payments are due',
      'Use AI to extract pay-app line items and compare claimed work-completed amounts against the approved schedule of values, flagging overbilling before PM review',
    ],
    steps: [
      {
        name: 'Payment application',
        type: 'FORM',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Submit your payment application for the current billing period, including work completed, materials stored, and the amount due.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Billing Period', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Work Completed ($)', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Materials Stored ($)', type: 'NUMBER' },
          { fieldId: 'f4', label: 'Retainage ($)', type: 'NUMBER' },
          { fieldId: 'f5', label: 'Change Orders Included', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f6', label: 'Current Amount Due ($)', type: 'NUMBER', required: true },
        ],
      },
      {
        name: 'Schedule of values & compliance docs',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload your updated schedule of values, certified payroll (if required), current insurance certificates, and any sub-tier lien waivers if applicable.',
      },
      {
        name: 'Conditional lien waiver',
        type: 'ESIGN',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Sign the conditional lien waiver for the current billing period. This waiver is effective only upon receipt of payment.',
        sampleDocumentRef: 'conditional-lien-waiver-progress',
      },
      {
        name: 'Field verification & pay app review',
        type: 'TODO',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Verify that work quantities match the payment application, review the schedule of values, and confirm stored materials on site.',
      },
      {
        name: 'Payment application approval',
        type: 'APPROVAL',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Approve the payment application after completing field verification and pay-app review.',
      },
      {
        name: 'Payment processing',
        type: 'TODO',
        assigneeRole: 'Accounts Payable',
        sampleDescription:
          'Process the approved payment application. Issue payment to the subcontractor per the approved amount.',
      },
      {
        name: 'Unconditional lien waiver (prior period)',
        type: 'ESIGN',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Sign the unconditional lien waiver confirming receipt of the previous period\u2019s payment. This immediately waives lien rights for that prior billing period.',
        sampleDocumentRef: 'unconditional-lien-waiver-progress',
      },
    ],
  },

  // 78. Lien Waiver Collection - Final Payment
  {
    id: 'lien-waiver-final-payment',
    name: 'Lien Waiver Collection \u2014 Final Payment',
    category: 'construction-realestate',
    description:
      'Manage the final payment process including punch list completion, closeout documents, and final conditional and unconditional lien waivers. Close out subcontractor accounts with full lien protection and proper documentation.',
    complexity: 'Standard',
    tags: ['Construction', 'Real Estate Development'],
    trigger: 'Substantial completion / Final pay application',
    roles: ['Subcontractor', 'Project Manager', 'Accounts Payable', 'Owner Representative'],
    useCases: [
      'Process the final payment for a mechanical subcontractor after punch list completion',
      'Release retainage to a finished trade with all closeout documents submitted',
      'Collect final unconditional waivers before recording the notice of completion',
      'Close out a subcontract after substantial completion on a commercial build',
    ],
    requirements: [
      'Upload your final conditional lien waiver document for e-signature (replaces sample)',
      'Upload your final unconditional lien waiver document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your construction accounting system (Sage 300, Viewpoint) to auto-reconcile retainage balances and trigger final payment processing upon waiver receipt',
      'Connect to DocuSign to execute final conditional and unconditional lien waivers with tamper-proof audit trails for project closeout files',
      'Push completed waiver packages to your document management system (Procore, Box) for automatic archival alongside closeout documentation',
      'Chain with the Construction Project Closeout template once final waivers are collected to kick off punch list resolution and turnover documentation',
    ],
    steps: [
      {
        name: 'Final payment application',
        type: 'FORM',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Submit your final payment application including the final contract amount, total work completed, retainage held, and final amount due.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Final Contract Amount ($)', type: 'NUMBER', required: true },
          { fieldId: 'f2', label: 'Total Completed to Date ($)', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Total Retainage Held ($)', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Final Amount Due Including Retention ($)', type: 'NUMBER', required: true },
        ],
      },
      {
        name: 'Punch list completion',
        type: 'TODO',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Complete all remaining punch list items from the substantial completion walkthrough. Document completion of each item.',
      },
      {
        name: 'Punch list verification',
        type: 'TODO',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Verify that all punch list items have been satisfactorily completed. Document verification with photos.',
      },
      {
        name: 'Closeout documents & sub-tier waivers',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload as-built drawings, warranty documents, O&M manuals, and final sub-tier lien waivers from all lower-tier vendors and suppliers.',
      },
      {
        name: 'Final conditional lien waiver',
        type: 'ESIGN',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Sign the final conditional lien waiver that waives all remaining lien rights including retention. This is effective only upon receipt of final payment.',
        sampleDocumentRef: 'final-conditional-lien-waiver',
      },
      {
        name: 'Owner final approval',
        type: 'APPROVAL',
        assigneeRole: 'Owner Representative',
        sampleDescription:
          'Approve the final payment including retention release after reviewing all closeout documentation and lien waivers.',
      },
      {
        name: 'Final payment processing',
        type: 'TODO',
        assigneeRole: 'Accounts Payable',
        sampleDescription:
          'Process the final payment including all retained funds to the subcontractor.',
      },
      {
        name: 'Final unconditional lien waiver',
        type: 'ESIGN',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Sign the final unconditional lien waiver confirming receipt of all payments including retention. This immediately waives all lien rights. Sign only after funds have cleared.',
        sampleDocumentRef: 'final-unconditional-lien-waiver',
      },
      {
        name: 'Retention release confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Acknowledge receipt of all contract funds and confirm the account is fully settled.',
      },
    ],
  },

  // 79. Submittals & Shop Drawing Approval
  {
    id: 'submittals-shop-drawing-approval',
    name: 'Submittals & Shop Drawing Approval',
    category: 'construction-realestate',
    description:
      'Route submittals and shop drawings through a structured multi-party review with the project manager, architect, engineer, and owner. Keep fabrication on schedule by tracking review status and capturing approval stamps in one place.',
    complexity: 'Standard',
    tags: ['Construction'],
    trigger: 'Subcontractor ready to order/fabricate',
    roles: ['Subcontractor', 'Project Manager', 'Architect/Engineer', 'Owner Representative'],
    useCases: [
      'Review structural steel shop drawings before fabrication begins',
      'Route mechanical equipment submittals through architect and engineer review',
      'Process finish material submittals for owner color and pattern approval',
      'Track resubmissions when initial submittals are returned with comments',
    ],
    recommendations: [
      'Connect to Procore or PlanGrid to auto-log submittal status, sync review comments, and maintain a centralized submittal register',
      'Integrate with Bluebeam Revu or Autodesk Build to enable markup and annotation directly on shop drawings during the review cycle',
      'Use AI to auto-review submitted shop drawings against spec requirements and flag deviations before the architect/engineer review cycle begins',
      'Chain with the Change Order Approval template when submittals reveal scope or cost impacts that require formal owner authorization',
    ],
    steps: [
      {
        name: 'Submittal package upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload the complete submittal package including shop drawings, product data sheets, material samples (photos), and any required calculations.',
      },
      {
        name: 'PM preliminary review',
        type: 'TODO',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Perform a preliminary review of the submittal package for completeness, correct specification references, and contract compliance before forwarding to the design team.',
      },
      {
        name: 'Architect/Engineer review',
        type: 'TODO',
        assigneeRole: 'Architect/Engineer',
        sampleDescription:
          'Review the submittal for conformance with the design intent, specification requirements, and applicable codes. Note any deviations or required revisions.',
      },
      {
        name: 'Review comments',
        type: 'FORM',
        assigneeRole: 'Architect/Engineer',
        sampleDescription:
          'Document your review findings including the review status and any comments or required revisions.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Review Status', type: 'DROPDOWN', required: true, options: [
            { label: 'Approved', value: 'approved' },
            { label: 'Approved as Noted', value: 'approved-as-noted' },
            { label: 'Revise and Resubmit', value: 'revise-resubmit' },
            { label: 'Rejected', value: 'rejected' },
          ] },
          { fieldId: 'f2', label: 'Review Comments', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Specification Section Reference', type: 'TEXT_SINGLE_LINE' },
        ],
      },
      {
        name: 'Owner review (if required)',
        type: 'TODO',
        assigneeRole: 'Owner Representative',
        sampleDescription:
          'Review the submittal if owner input is required (e.g., finish selections, color choices). Mark as complete if owner review is not needed for this submittal.',
      },
      {
        name: 'Revised submittal (if required)',
        type: 'FILE_REQUEST',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Upload the revised submittal addressing all review comments. If no revisions were required, upload a confirmation noting the original submittal stands.',
      },
      {
        name: 'Final approval',
        type: 'APPROVAL',
        assigneeRole: 'Architect/Engineer',
        sampleDescription:
          'Grant final approval for the submittal, authorizing the subcontractor to proceed with ordering or fabrication.',
      },
      {
        name: 'Approval acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Subcontractor',
        sampleDescription:
          'Acknowledge receipt of the submittal approval and any noted conditions before proceeding with fabrication or procurement.',
      },
    ],
  },

  // 80. RFI (Request for Information) Coordination
  {
    id: 'rfi-coordination',
    name: 'RFI (Request for Information) Coordination',
    category: 'construction-realestate',
    description:
      'Submit and track Requests for Information from the field through architect and engineer review. Eliminate RFI bottlenecks by keeping all parties aligned with clear timelines and documented responses.',
    complexity: 'Simple',
    tags: ['Construction'],
    trigger: 'Field question / Design clarification needed',
    roles: ['Contractor', 'Architect', 'Engineer'],
    useCases: [
      'Clarify a structural detail conflict between architectural and structural drawings',
      'Request confirmation on an acceptable material substitution',
      'Document a field condition that differs from the design documents',
      'Get design direction on an unforeseen site condition',
    ],
    recommendations: [
      'Connect to Procore or PlanGrid to auto-sync RFI numbers, responses, and status into your project RFI log for a single source of truth',
      'Integrate with your project scheduling tool (Primavera P6, Microsoft Project) to flag schedule impacts when RFI responses are delayed beyond the needed-by date',
      'Use AI to search past RFI responses and spec documents for similar questions and auto-draft a preliminary answer for architect review, reducing turnaround time',
      'Chain with the Change Order Approval template when an RFI response results in a scope or cost change that requires owner authorization',
    ],
    steps: [
      {
        name: 'RFI submission',
        type: 'FORM',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Submit your RFI with a clear description of the question, the affected drawing or specification sections, and the urgency level.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'RFI Subject', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Affected Drawing / Spec Section', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Detailed Question', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Suggested Resolution (if any)', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f5', label: 'Response Needed By', type: 'DATE', required: true },
          { fieldId: 'f6', label: 'Impact if Delayed', type: 'DROPDOWN', options: [
            { label: 'Critical - Work stopped', value: 'critical' },
            { label: 'High - Schedule impact', value: 'high' },
            { label: 'Medium - Upcoming work affected', value: 'medium' },
            { label: 'Low - Informational', value: 'low' },
          ] },
        ],
      },
      {
        name: 'Supporting documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Upload any supporting photos, sketches, or marked-up drawings that help illustrate the question or field condition.',
      },
      {
        name: 'Architect review',
        type: 'TODO',
        assigneeRole: 'Architect',
        sampleDescription:
          'Review the RFI and supporting documentation. Prepare a response or coordinate with the engineer if the question involves their discipline.',
      },
      {
        name: 'Engineer input (if needed)',
        type: 'TODO',
        assigneeRole: 'Engineer',
        sampleDescription:
          'Provide engineering input if the RFI involves structural, mechanical, or other engineering disciplines. Mark as complete if not applicable.',
      },
      {
        name: 'RFI response',
        type: 'FILE_REQUEST',
        assigneeRole: 'Architect',
        sampleDescription:
          'Upload the formal RFI response including any revised sketches, details, or supplemental instructions for the contractor.',
      },
      {
        name: 'Response acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Acknowledge receipt and understanding of the RFI response. Note any follow-up questions or cost/schedule impacts.',
      },
    ],
  },

  // 81. Change Order Approval
  {
    id: 'change-order-approval',
    name: 'Change Order Approval',
    category: 'construction-realestate',
    description:
      'Process change orders from initial request through cost review, architect evaluation, and owner approval to signed execution. Maintain budget control and a clear audit trail for every scope modification on your project.',
    complexity: 'Standard',
    tags: ['Construction'],
    trigger: 'Scope change / Design modification / Unforeseen condition',
    roles: ['Contractor', 'Project Manager', 'Architect', 'Owner Representative'],
    useCases: [
      'Process a change order for unforeseen soil conditions requiring additional foundation work',
      'Route an owner-requested design modification through pricing and approval',
      'Document and approve a code-required scope addition identified during inspection',
      'Handle a material substitution change order due to supply chain delays',
    ],
    requirements: [
      'Upload your change order execution document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Connect to Procore or Autodesk Build to auto-sync approved change orders into the project change log and update the committed cost report',
      'Integrate with your construction accounting system (Sage 300, Viewpoint Vista) to automatically adjust the contract value and budget when change orders are executed',
      'Use AI to compare contractor cost breakdowns against historical unit pricing for similar scope changes and flag line items that exceed benchmark ranges before PM review',
      'Chain with the Lien Waiver Progress Payment template to ensure updated contract values are reflected in the next pay application cycle',
    ],
    steps: [
      {
        name: 'Change order request',
        type: 'FORM',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Submit the change order request with a description of the scope change, affected specifications, and reason for the modification.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'CO Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Category', type: 'DROPDOWN', required: true, options: [
            { label: 'Owner Requested', value: 'owner-requested' },
            { label: 'Design Modification', value: 'design-modification' },
            { label: 'Unforeseen Condition', value: 'unforeseen-condition' },
            { label: 'Code Requirement', value: 'code-requirement' },
            { label: 'Value Engineering', value: 'value-engineering' },
          ] },
          { fieldId: 'f3', label: 'Description of Change', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Affected Specifications / Drawings', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Cost breakdown & backup',
        type: 'FILE_REQUEST',
        assigneeRole: 'Contractor',
        sampleDescription:
          'Upload the detailed cost breakdown including sub-quotes, material takeoffs, labor estimates, and site photos documenting the condition.',
      },
      {
        name: 'PM review',
        type: 'TODO',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Review the change order request and cost breakdown for completeness, accuracy, and schedule impact. Prepare a recommendation for the owner.',
      },
      {
        name: 'Architect review',
        type: 'TODO',
        assigneeRole: 'Architect',
        sampleDescription:
          'Review the change order for design impact, code compliance, and alignment with the project design intent.',
      },
      {
        name: 'Owner negotiation / questions',
        type: 'FORM',
        assigneeRole: 'Owner Representative',
        sampleDescription:
          'Review the change order details and submit any questions, counter-proposals, or negotiation points.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Questions or Comments', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f2', label: 'Counter-Proposal Amount ($)', type: 'NUMBER' },
          { fieldId: 'f3', label: 'Additional Conditions', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Owner approval',
        type: 'APPROVAL',
        assigneeRole: 'Owner Representative',
        sampleDescription:
          'Approve the change order after reviewing the cost breakdown, PM recommendation, and architect assessment.',
      },
      {
        name: 'Change order execution',
        type: 'ESIGN',
        assigneeRole: 'Owner Representative',
        sampleDescription:
          'Sign the change order document to formally authorize the scope change, adjusted contract amount, and any schedule modifications.',
        sampleDocumentRef: 'change-order-execution',
      },
      {
        name: 'Change log update',
        type: 'TODO',
        assigneeRole: 'Project Manager',
        sampleDescription:
          'Update the project change log with the approved change order details, revised contract value, and any schedule adjustments.',
      },
    ],
  },

  // 82. Construction Project Closeout
  {
    id: 'construction-project-closeout',
    name: 'Construction Project Closeout',
    category: 'construction-realestate',
    description:
      'Guide a construction project from substantial completion through punch list resolution, closeout documentation, owner training, and final payment. Ensure nothing falls through the cracks during the critical final phase of your project.',
    complexity: 'Complex',
    tags: ['Construction'],
    trigger: 'Substantial completion claimed',
    roles: ['GC/Contractor', 'Architect', 'Owner'],
    useCases: [
      'Close out a commercial tenant improvement project with multiple trades',
      'Manage the punch list and turnover process for a new office building',
      'Coordinate final inspections, documentation, and training for a school construction project',
      'Process retainage release and final payment after all closeout requirements are met',
    ],
    recommendations: [
      'Connect to Procore to auto-track punch list items, sync completion status, and generate the closeout documentation checklist from the project setup',
      'Integrate with your construction accounting system (Sage 300, Viewpoint) to auto-trigger retainage release and final payment processing when closeout approvals are complete',
      'Use AI to analyze punch list inspection photos and auto-generate a categorized deficiency list with severity ratings and trade assignments',
      'Chain with the Lien Waiver Final Payment template once punch list is approved to collect final waivers and release retainage',
    ],
    steps: [
      {
        name: 'Substantial completion notification',
        type: 'FORM',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Notify the project team that substantial completion has been reached. Provide the completion date and any known outstanding items.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Project Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Substantial Completion Date', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Known Outstanding Items', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f4', label: 'Certificate of Occupancy Status', type: 'DROPDOWN', options: [
            { label: 'Obtained', value: 'obtained' },
            { label: 'Pending', value: 'pending' },
            { label: 'Not Required', value: 'not-required' },
          ] },
        ],
      },
      {
        name: 'Architect inspection & punch list',
        type: 'FORM',
        assigneeRole: 'Architect',
        sampleDescription:
          'Conduct a substantial completion inspection and document all punch list items that need to be addressed before final acceptance.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Inspection Date', type: 'DATE', required: true },
          { fieldId: 'f2', label: 'Punch List Items', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Total Punch List Items', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Critical Items Requiring Immediate Attention', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Punch list acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Acknowledge receipt of the punch list and commit to completing all items within the agreed timeframe.',
      },
      {
        name: 'Certificate of Occupancy & permits',
        type: 'FILE_REQUEST',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Upload the Certificate of Occupancy, final inspection sign-offs, and all required permit close-out documentation.',
      },
      {
        name: 'Punch list completion report',
        type: 'FORM',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Report on the status of all punch list items, documenting completion with dates and descriptions.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Items Completed', type: 'NUMBER', required: true },
          { fieldId: 'f2', label: 'Items Remaining (if any)', type: 'NUMBER' },
          { fieldId: 'f3', label: 'Completion Notes', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Completion Date', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Punch list final approval',
        type: 'APPROVAL',
        assigneeRole: 'Owner',
        sampleDescription:
          'Review the punch list completion report and approve that all items have been satisfactorily resolved.',
      },
      {
        name: 'Closeout documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Upload all closeout documents including O&M manuals, warranty information, final lien waivers, and as-built drawings.',
      },
      {
        name: 'Owner training & orientation',
        type: 'TODO',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Conduct owner training on building systems, equipment operation, and maintenance procedures. Document the training session and attendees.',
      },
      {
        name: 'Final payment & retainage release',
        type: 'APPROVAL',
        assigneeRole: 'Owner',
        sampleDescription:
          'Approve the final payment and retainage release after all closeout requirements have been met.',
      },
      {
        name: 'Project closure notification',
        type: 'TODO',
        assigneeRole: 'GC/Contractor',
        sampleDescription:
          'Automated notification: Send project closure notifications to all stakeholders confirming the project is officially closed out.',
      },
    ],
  },

  // 83. Residential Purchase Transaction
  {
    id: 'residential-purchase-transaction',
    name: 'Residential Purchase Transaction',
    category: 'construction-realestate',
    description:
      'Coordinate a residential real estate purchase from executed agreement through escrow, inspections, loan processing, and closing. Keep buyers, sellers, and agents aligned on contingency deadlines and closing milestones.',
    complexity: 'Complex',
    tags: ['Real Estate', 'Mortgage', 'Title'],
    trigger: 'Purchase agreement executed',
    roles: ['Buyer', 'Seller', 'Escrow/Title Agent', 'Buyer Agent'],
    useCases: [
      'Manage a first-time home buyer purchase with FHA financing',
      'Coordinate a cash purchase with accelerated closing timeline',
      'Track contingency removal deadlines for a competitive market purchase',
      'Facilitate a relocation purchase with remote closing requirements',
    ],
    requirements: [
      'Upload your closing/settlement document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your MLS system (Zillow, MLS Grid) to auto-populate property details and purchase terms from the listing data',
      'Connect to DocuSign or Dotloop to streamline e-signature workflows for disclosures, contingency removals, and closing documents',
      'Integrate with your title company or escrow platform (Qualia, SoftPro) to sync transaction status, document uploads, and funding confirmation in real time',
      'Use AI to review uploaded inspection reports and auto-generate a summary of material defects, estimated repair costs, and recommended negotiation points for the buyer agent',
    ],
    steps: [
      {
        name: 'Purchase agreement intake',
        type: 'FORM',
        assigneeRole: 'Buyer Agent',
        sampleDescription:
          'Enter the key terms from the executed purchase agreement to initiate the transaction workflow.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Property Address', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Purchase Price ($)', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Earnest Money Deposit ($)', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Loan Type', type: 'DROPDOWN', required: true, options: [
            { label: 'Conventional', value: 'conventional' },
            { label: 'FHA', value: 'fha' },
            { label: 'VA', value: 'va' },
            { label: 'Cash', value: 'cash' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f5', label: 'Contingency Periods (days)', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f6', label: 'Close of Escrow Date', type: 'DATE', required: true },
        ],
      },
      {
        name: 'Escrow opening & EMD',
        type: 'TODO',
        assigneeRole: 'Escrow/Title Agent',
        sampleDescription:
          'Open escrow and confirm receipt of the earnest money deposit. Distribute escrow instructions to all parties.',
      },
      {
        name: 'Title report & seller disclosures',
        type: 'FILE_REQUEST',
        assigneeRole: 'Seller',
        sampleDescription:
          'Upload the preliminary title report, Transfer Disclosure Statement (TDS), Seller Property Questionnaire (SPQ), Natural Hazard Disclosure (NHD), and lead-based paint disclosure if applicable.',
      },
      {
        name: 'Inspection reports',
        type: 'FILE_REQUEST',
        assigneeRole: 'Buyer',
        sampleDescription:
          'Upload all inspection reports including general home inspection, pest inspection, and any specialty inspections (roof, sewer, foundation, etc.).',
      },
      {
        name: 'Buyer repair request / contingency removal',
        type: 'FORM',
        assigneeRole: 'Buyer',
        sampleDescription:
          'Submit your response to inspection findings including items accepted as-is, repair requests, and your decision to proceed or cancel.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Items Accepted As-Is', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f2', label: 'Repair Requests', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Decision', type: 'DROPDOWN', required: true, options: [
            { label: 'Proceed with purchase', value: 'proceed' },
            { label: 'Proceed contingent on repairs', value: 'proceed-with-repairs' },
            { label: 'Cancel transaction', value: 'cancel' },
          ] },
        ],
      },
      {
        name: 'Appraisal & loan processing',
        type: 'FORM',
        assigneeRole: 'Buyer Agent',
        sampleDescription:
          'Provide an update on the appraisal results and loan processing status.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Appraisal Value ($)', type: 'NUMBER', required: true },
          { fieldId: 'f2', label: 'Appraisal Conditions', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Loan Approval Status', type: 'DROPDOWN', required: true, options: [
            { label: 'Fully Approved', value: 'approved' },
            { label: 'Conditionally Approved', value: 'conditional' },
            { label: 'Pending', value: 'pending' },
            { label: 'Denied', value: 'denied' },
            { label: 'N/A - Cash Purchase', value: 'cash' },
          ] },
        ],
      },
      {
        name: 'Contingency removal \u2014 appraisal & loan',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Buyer',
        sampleDescription:
          'Acknowledge removal of appraisal and loan contingencies. Note that your earnest money deposit is now at risk if you fail to close.',
      },
      {
        name: 'Title clearance & closing prep',
        type: 'TODO',
        assigneeRole: 'Escrow/Title Agent',
        sampleDescription:
          'Clear all title exceptions, prepare closing documents, and coordinate the signing appointment with all parties.',
      },
      {
        name: 'Final walkthrough',
        type: 'TODO',
        assigneeRole: 'Buyer',
        sampleDescription:
          'Conduct the final walkthrough of the property to confirm condition matches expectations and any agreed repairs have been completed.',
      },
      {
        name: 'Closing signing & funding',
        type: 'ESIGN',
        assigneeRole: 'Buyer',
        sampleDescription:
          'Sign all closing and settlement documents. Funds will be disbursed upon recording.',
        sampleDocumentRef: 'residential-closing-documents',
      },
      {
        name: 'Recording & key transfer',
        type: 'TODO',
        assigneeRole: 'Escrow/Title Agent',
        sampleDescription:
          'Record the deed with the county, confirm funding, and coordinate key transfer to the buyer.',
      },
    ],
  },

  // 84. Commercial Lease Execution
  {
    id: 'commercial-lease-execution',
    name: 'Commercial Lease Execution',
    category: 'construction-realestate',
    description:
      'Move a commercial lease from application through credit checks, negotiation, and dual-party execution. Streamline the leasing process so tenants can move in faster with all documentation properly executed.',
    complexity: 'Standard',
    tags: ['Commercial Real Estate', 'Property Management'],
    trigger: 'Lease terms agreed / LOI signed',
    roles: ['Tenant', 'Landlord Representative', 'Property Manager'],
    useCases: [
      'Execute a new retail lease in a shopping center',
      'Process an office lease for a growing startup expanding to a new floor',
      'Onboard a medical tenant with specialized build-out requirements',
      'Renew and re-execute a commercial lease with updated terms',
    ],
    requirements: [
      'Upload your credit/background check authorization document for e-signature (replaces sample)',
      'Upload your lease agreement document for e-signature (replaces sample)',
    ],
    recommendations: [
      'Integrate with your property management system (Yardi, AppFolio, MRI) to auto-create tenant records and lease abstracts when the lease is fully executed',
      'Connect to a credit screening service (Experian, TransUnion) to auto-run tenant credit and background checks upon authorization signature',
      'Use AI to extract key lease terms (rent, escalations, CAM caps, renewal options) from uploaded lease drafts and auto-populate the lease abstract for the property manager',
      'Chain with the Tenant Move-Out & Security Deposit template when the lease expiration date approaches to automate the turnover process',
    ],
    steps: [
      {
        name: 'Lease application',
        type: 'FORM',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Complete the lease application with your business information, requested space details, and intended use.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Business Legal Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Business Type / Industry', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Years in Business', type: 'NUMBER' },
          { fieldId: 'f4', label: 'Requested Space / Suite', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f5', label: 'Intended Use', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Desired Lease Start Date', type: 'DATE', required: true },
          { fieldId: 'f7', label: 'Lease Term (months)', type: 'NUMBER', required: true },
          { fieldId: 'f8', label: 'Primary Contact Email', type: 'EMAIL', required: true },
        ],
      },
      {
        name: 'Financial documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Upload financial documentation including business tax returns, bank statements, profit & loss statements, and any personal guarantor financials if applicable.',
      },
      {
        name: 'Credit / background check authorization',
        type: 'ESIGN',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Sign the authorization for the landlord to run credit and background checks on the business and any personal guarantors.',
        sampleDocumentRef: 'credit-check-authorization',
      },
      {
        name: 'Landlord review',
        type: 'TODO',
        assigneeRole: 'Landlord Representative',
        sampleDescription:
          'Review the tenant application, financial documentation, and credit check results. Determine whether to proceed with the lease.',
      },
      {
        name: 'Lease negotiation',
        type: 'FORM',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Review the proposed lease terms and submit any requested modifications or questions.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Proposed Modifications', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f2', label: 'Questions for Landlord', type: 'TEXT_MULTI_LINE' },
          { fieldId: 'f3', label: 'Tenant Improvement Requests', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Lease execution',
        type: 'ESIGN',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Sign the finalized lease agreement including all exhibits and addenda.',
        sampleDocumentRef: 'commercial-lease-agreement',
      },
      {
        name: 'Landlord execution',
        type: 'ESIGN',
        assigneeRole: 'Landlord Representative',
        sampleDescription:
          'Counter-sign the lease agreement to complete the dual-party execution.',
        sampleDocumentRef: 'commercial-lease-agreement',
      },
      {
        name: 'Move-in acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Property Manager',
        sampleDescription:
          'Acknowledge the executed lease and initiate move-in coordination including key issuance, parking assignments, and building orientation scheduling.',
      },
    ],
  },

  // 85. Tenant Move-Out & Security Deposit
  {
    id: 'tenant-move-out-security-deposit',
    name: 'Tenant Move-Out & Security Deposit',
    category: 'construction-realestate',
    description:
      'Manage the tenant move-out process from notice through final inspection, key return, and security deposit accounting. Protect your property and ensure transparent, timely deposit dispositions that comply with local regulations.',
    complexity: 'Standard',
    tags: ['Property Management', 'Residential', 'Commercial'],
    trigger: 'Move-out notice / Lease end date approaching',
    roles: ['Tenant', 'Property Manager', 'Maintenance', 'Accounting'],
    useCases: [
      'Process a residential tenant move-out at lease expiration',
      'Handle an early lease termination with required notice period',
      'Manage a commercial tenant move-out with restoration requirements',
      'Document property condition and calculate deposit deductions transparently',
    ],
    recommendations: [
      'Integrate with your property management system (Yardi, AppFolio, Buildium) to auto-update unit availability, close out the tenant ledger, and trigger deposit disposition processing',
      'Connect to your accounting software (QuickBooks, Sage) to auto-generate the security deposit accounting statement and issue refund checks or ACH transfers',
      'Schedule auto-launch 60 days before each lease expiration date so the move-out process begins without manual tracking',
      'Use AI to compare move-in and move-out inspection photos side-by-side and auto-flag damage beyond normal wear and tear with estimated repair costs',
    ],
    steps: [
      {
        name: 'Move-out notice',
        type: 'FORM',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Submit your formal move-out notice with the intended move-out date and forwarding address for deposit return.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Unit / Suite Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Intended Move-Out Date', type: 'DATE', required: true },
          { fieldId: 'f3', label: 'Reason for Move-Out', type: 'DROPDOWN', options: [
            { label: 'Lease expiration', value: 'lease-expiration' },
            { label: 'Early termination', value: 'early-termination' },
            { label: 'Relocation', value: 'relocation' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f4', label: 'Forwarding Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Forwarding Email', type: 'EMAIL', required: true },
        ],
      },
      {
        name: 'Pre-move-out inspection',
        type: 'TODO',
        assigneeRole: 'Property Manager',
        sampleDescription:
          'Schedule and conduct a pre-move-out inspection with the tenant. Document the current condition and identify any items requiring attention before move-out.',
      },
      {
        name: 'Move-out checklist',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Acknowledge receipt of the move-out checklist including cleaning requirements, key return instructions, and utility transfer deadlines.',
      },
      {
        name: 'Key return acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Confirm that all keys, access cards, and remote controls have been returned to the property management office.',
      },
      {
        name: 'Final inspection',
        type: 'TODO',
        assigneeRole: 'Maintenance',
        sampleDescription:
          'Conduct the final move-out inspection. Document the condition of each room, note any damage beyond normal wear and tear, and estimate repair costs.',
      },
      {
        name: 'Final inspection report',
        type: 'FILE_REQUEST',
        assigneeRole: 'Property Manager',
        sampleDescription:
          'Upload the completed final inspection report including photos, condition notes, and any estimated repair or cleaning costs.',
      },
      {
        name: 'Deposit accounting',
        type: 'TODO',
        assigneeRole: 'Accounting',
        sampleDescription:
          'Prepare the security deposit accounting statement itemizing any deductions for damages, unpaid rent, or cleaning charges. Calculate the refund amount.',
      },
      {
        name: 'Deposit disposition acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Tenant',
        sampleDescription:
          'Acknowledge receipt of the security deposit disposition statement and any refund issued.',
      },
    ],
  },
];
