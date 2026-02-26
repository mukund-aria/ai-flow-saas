import type { GalleryTemplate } from './types';

export const ORDER_SUPPLY_CHAIN_TEMPLATES: GalleryTemplate[] = [
  // 86. Order Fulfillment
  {
    id: 'order-fulfillment',
    name: 'Order Fulfillment',
    category: 'order-supply-chain',
    description:
      'Manage the complete order-to-delivery lifecycle from purchase order submission through pick-pack-ship, delivery confirmation, and payment reconciliation. Keep customers informed at every milestone while maintaining warehouse accountability.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Distribution'],
    trigger: 'Purchase order received from customer',
    roles: ['Customer', 'Warehouse Lead', 'Shipping Coordinator'],
    useCases: [
      'Fulfill a wholesale distribution order with multi-line items',
      'Process a custom manufacturing order with special shipping requirements',
      'Handle a large retail replenishment order with scheduled delivery windows',
      'Manage a drop-ship order requiring third-party coordination',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your ERP (NetSuite, SAP) to auto-create sales orders from submitted POs and sync shipment tracking and invoice status back to the customer record',
      'Connect to your WMS (Manhattan, Oracle WMS) to auto-trigger pick-pack workflows when orders are confirmed and update inventory levels in real time',
      'Use AI to extract line items from uploaded PO documents and auto-match against catalog SKUs, flagging pricing discrepancies or discontinued items before warehouse confirmation',
      'Chain with the RMA / Return Processing template when the customer reports discrepancies or damages at delivery confirmation',
    ],
    steps: [
      {
        name: 'Purchase order submission',
        type: 'FORM',
        assigneeRole: 'Customer',
        sampleDescription:
          'Submit your purchase order with all required details including line items, quantities, shipping address, and delivery requirements.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'PO Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Ship-To Address', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Requested Delivery Date', type: 'DATE', required: true },
          { fieldId: 'f4', label: 'Line Items (product, quantity, unit price)', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Special Instructions', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'PO acknowledgement & validation',
        type: 'TODO',
        assigneeRole: 'Warehouse Lead',
        sampleDescription:
          'Validate the purchase order by verifying pricing accuracy, confirming inventory availability, and checking credit status. Flag any discrepancies before confirming.',
      },
      {
        name: 'Order confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Customer',
        sampleDescription:
          'Acknowledge the order confirmation including confirmed quantities, pricing, and estimated delivery date.',
      },
      {
        name: 'Pick, pack & quality check',
        type: 'TODO',
        assigneeRole: 'Warehouse Lead',
        sampleDescription:
          'Pick the order items from inventory, pack per customer requirements, and perform a quality check before release to shipping.',
      },
      {
        name: 'Shipping & BOL upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Shipping Coordinator',
        sampleDescription:
          'Upload shipping documents including carrier assignment, tracking number, Bill of Lading (BOL), and packing slip.',
      },
      {
        name: 'Shipment notification',
        type: 'TODO',
        assigneeRole: 'Shipping Coordinator',
        sampleDescription:
          'Automated notification: Send the shipment notification to the customer with carrier details, tracking number, and estimated delivery date.',
      },
      {
        name: 'Delivery confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Customer',
        sampleDescription:
          'Confirm receipt of the shipment and note any discrepancies, damages, or shortages upon delivery.',
      },
      {
        name: 'Invoice & supporting docs',
        type: 'FILE_REQUEST',
        assigneeRole: 'Shipping Coordinator',
        sampleDescription:
          'Upload the invoice and any supporting documentation including proof of delivery, signed BOL, and weight tickets.',
      },
      {
        name: 'Payment confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Warehouse Lead',
        sampleDescription:
          'Acknowledge receipt of payment and confirm the order is closed. Note any outstanding balance or credit issues.',
      },
    ],
  },

  // 87. Purchase Order Processing
  {
    id: 'purchase-order-processing',
    name: 'Purchase Order Processing',
    category: 'order-supply-chain',
    description:
      'Process internal purchase requisitions from submission through approval, vendor dispatch, goods receipt, and three-way match verification. Maintain procurement discipline with proper authorization at every stage.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Cross-industry'],
    trigger: 'Purchase requisition submitted',
    roles: ['Requisitioner', 'Procurement Lead', 'Vendor'],
    useCases: [
      'Process a capital equipment purchase requiring multi-level approval',
      'Handle a routine materials replenishment order for production',
      'Manage an office supplies requisition from department to delivery',
      'Process a services purchase order for an external contractor',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Connect to your ERP (SAP, Oracle, NetSuite) to auto-generate purchase orders from approved requisitions and sync goods receipt data for three-way match verification',
      'Integrate with your procurement platform (Coupa, Ariba) to leverage negotiated contract pricing, preferred vendor catalogs, and automated budget checks',
      'Use AI to auto-perform the three-way match by comparing PO line items, goods receipt quantities, and vendor invoice amounts, flagging mismatches for procurement review',
      'Set up auto-launch when inventory levels drop below reorder points to generate purchase requisitions without manual intervention',
    ],
    steps: [
      {
        name: 'Purchase requisition',
        type: 'FORM',
        assigneeRole: 'Requisitioner',
        sampleDescription:
          'Submit your purchase requisition with justification, budget details, and vendor preference.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Department', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'GL Account / Cost Center', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Item Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Estimated Cost ($)', type: 'NUMBER', required: true },
          { fieldId: 'f5', label: 'Quantity', type: 'NUMBER', required: true },
          { fieldId: 'f6', label: 'Business Justification', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f7', label: 'Preferred Vendor', type: 'TEXT_SINGLE_LINE' },
        ],
      },
      {
        name: 'Manager approval',
        type: 'APPROVAL',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Review the purchase requisition for budget availability, business justification, and compliance with procurement policies.',
      },
      {
        name: 'Vendor selection & PO creation',
        type: 'TODO',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Select the vendor (or confirm the requested vendor), negotiate terms if needed, and create the official purchase order.',
      },
      {
        name: 'Purchase order dispatch',
        type: 'FILE_REQUEST',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Upload the finalized purchase order document for dispatch to the selected vendor.',
      },
      {
        name: 'Vendor order acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Vendor',
        sampleDescription:
          'Acknowledge receipt of the purchase order, confirm the order details, and provide an estimated delivery date.',
      },
      {
        name: 'Goods receipt & inspection',
        type: 'FORM',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Record the receipt of goods and document the inspection results including any quantity or quality discrepancies.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'PO Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Quantity Received', type: 'NUMBER', required: true },
          { fieldId: 'f3', label: 'Condition', type: 'DROPDOWN', required: true, options: [
            { label: 'Good - No issues', value: 'good' },
            { label: 'Partial - Short shipment', value: 'partial' },
            { label: 'Damaged', value: 'damaged' },
            { label: 'Wrong items', value: 'wrong-items' },
          ] },
          { fieldId: 'f4', label: 'Discrepancies / Notes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Vendor invoice submission',
        type: 'FILE_REQUEST',
        assigneeRole: 'Vendor',
        sampleDescription:
          'Upload your invoice for the delivered goods. Ensure the invoice references the correct PO number and matches the delivered quantities.',
      },
      {
        name: '3-way match & discrepancy resolution',
        type: 'TODO',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Perform the three-way match comparing the purchase order, receiving report, and vendor invoice. Resolve any discrepancies before authorizing payment.',
      },
      {
        name: 'Payment authorization',
        type: 'APPROVAL',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Authorize payment to the vendor after successful three-way match verification.',
      },
    ],
  },

  // 88. RMA / Return Processing
  {
    id: 'rma-return-processing',
    name: 'RMA / Return Processing',
    category: 'order-supply-chain',
    description:
      'Handle product returns from initial request through inspection, disposition, and resolution. Deliver a professional returns experience that resolves customer issues quickly while maintaining inventory accuracy.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Retail', 'SaaS'],
    trigger: 'Customer requests return or reports defect',
    roles: ['Customer', 'Returns Lead'],
    useCases: [
      'Process a defective product return with replacement fulfillment',
      'Handle a customer return within the standard return window',
      'Manage a warranty claim requiring inspection and repair',
      'Process a bulk return from a distributor with multiple line items',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your ERP (NetSuite, SAP) to auto-create RMA records, update inventory upon receipt, and trigger credit memo or replacement order processing',
      'Connect to your shipping platform (ShipStation, EasyPost) to auto-generate prepaid return shipping labels and track inbound return shipments',
      'Enable AI to classify returned product defects from uploaded photos and inspection notes, then auto-route to the appropriate disposition path (restock, repair, scrap, or return to vendor)',
      'Chain with the Supplier Corrective Action Request (SCAR) template when inspection reveals a recurring supplier-caused defect requiring formal root cause analysis',
    ],
    steps: [
      {
        name: 'Return request submission',
        type: 'FORM',
        assigneeRole: 'Customer',
        sampleDescription:
          'Submit your return request with the order details, reason for return, and your preferred resolution.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Order Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Product Name / SKU', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Quantity to Return', type: 'NUMBER', required: true },
          { fieldId: 'f4', label: 'Reason for Return', type: 'DROPDOWN', required: true, options: [
            { label: 'Defective / Not working', value: 'defective' },
            { label: 'Wrong item received', value: 'wrong-item' },
            { label: 'Damaged in shipping', value: 'damaged' },
            { label: 'Not as described', value: 'not-as-described' },
            { label: 'No longer needed', value: 'no-longer-needed' },
          ] },
          { fieldId: 'f5', label: 'Desired Resolution', type: 'DROPDOWN', required: true, options: [
            { label: 'Replacement', value: 'replacement' },
            { label: 'Refund', value: 'refund' },
            { label: 'Repair', value: 'repair' },
            { label: 'Store credit', value: 'store-credit' },
          ] },
        ],
      },
      {
        name: 'Supporting evidence',
        type: 'FILE_REQUEST',
        assigneeRole: 'Customer',
        sampleDescription:
          'Upload photos of the defect or damage, the packing slip, and any error codes or diagnostic information that supports your return request.',
      },
      {
        name: 'RMA approval',
        type: 'APPROVAL',
        assigneeRole: 'Returns Lead',
        sampleDescription:
          'Review the return request and supporting evidence. Approve or deny the RMA based on return policy and product condition.',
      },
      {
        name: 'Return shipping instructions',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Customer',
        sampleDescription:
          'Acknowledge receipt of the RMA number, return shipping address, and packaging instructions. Ship the item back using the provided details.',
      },
      {
        name: 'Return receipt & inspection',
        type: 'FORM',
        assigneeRole: 'Returns Lead',
        sampleDescription:
          'Inspect the returned item upon receipt and document its condition, verify the defect, and record serial or lot numbers.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Item Condition Upon Receipt', type: 'DROPDOWN', required: true, options: [
            { label: 'As described by customer', value: 'as-described' },
            { label: 'Better than described', value: 'better' },
            { label: 'Worse than described', value: 'worse' },
            { label: 'No defect found', value: 'no-defect' },
          ] },
          { fieldId: 'f2', label: 'Defect Verified?', type: 'CHECKBOX' },
          { fieldId: 'f3', label: 'Serial / Lot Number', type: 'TEXT_SINGLE_LINE' },
          { fieldId: 'f4', label: 'Inspection Notes', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Disposition decision',
        type: 'DECISION',
        assigneeRole: 'Returns Lead',
        sampleDescription:
          'Determine the disposition of the returned item: restock into inventory, send for repair, scrap, or return to vendor.',
      },
      {
        name: 'Credit memo / refund processing',
        type: 'TODO',
        assigneeRole: 'Returns Lead',
        sampleDescription:
          'Process the credit memo, refund, or replacement order based on the approved disposition and the customer\u2019s preferred resolution.',
      },
      {
        name: 'Resolution confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Customer',
        sampleDescription:
          'Confirm that you have received the refund, replacement, or other agreed resolution for your return.',
      },
    ],
  },

  // 89. Customer Complaint Resolution
  {
    id: 'customer-complaint-resolution',
    name: 'Customer Complaint Resolution',
    category: 'order-supply-chain',
    description:
      'Capture, triage, investigate, and resolve customer complaints with a structured corrective action process. Turn customer issues into improvement opportunities with documented root cause analysis and verified resolutions.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Cross-industry'],
    trigger: 'Customer complaint received',
    roles: ['Customer', 'Quality Lead'],
    useCases: [
      'Investigate a recurring product quality complaint from a key account',
      'Resolve a service delivery complaint with documented corrective actions',
      'Handle a safety-related complaint requiring immediate escalation',
      'Process a complaint about order accuracy from a distribution customer',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your CRM (Salesforce, HubSpot) to auto-log complaints against customer accounts, track resolution history, and flag at-risk accounts for your sales team',
      'Connect to your quality management system (QMS) to auto-create corrective action records and link complaint data to root cause analysis and CAPA workflows',
      'Use AI to analyze incoming complaint text and photos against historical complaint data, auto-classify severity, identify pattern matches with prior issues, and suggest root cause hypotheses for the Quality Lead',
      'Chain with the Supplier Corrective Action Request (SCAR) template when root cause analysis traces the defect to a specific supplier',
    ],
    steps: [
      {
        name: 'Complaint registration',
        type: 'FORM',
        assigneeRole: 'Customer',
        sampleDescription:
          'Register your complaint with details about the product or service, severity, and your desired resolution.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Product / Service Affected', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Complaint Category', type: 'DROPDOWN', required: true, options: [
            { label: 'Product Quality', value: 'product-quality' },
            { label: 'Delivery / Shipping', value: 'delivery' },
            { label: 'Customer Service', value: 'customer-service' },
            { label: 'Billing / Pricing', value: 'billing' },
            { label: 'Safety Concern', value: 'safety' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f3', label: 'Severity', type: 'DROPDOWN', required: true, options: [
            { label: 'Critical - Safety or regulatory', value: 'critical' },
            { label: 'High - Major impact', value: 'high' },
            { label: 'Medium - Moderate impact', value: 'medium' },
            { label: 'Low - Minor inconvenience', value: 'low' },
          ] },
          { fieldId: 'f4', label: 'Description of Issue', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Desired Resolution', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Supporting documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Customer',
        sampleDescription:
          'Upload any supporting documents such as photos, invoices, correspondence, or test results related to the complaint.',
      },
      {
        name: 'AI complaint triage',
        type: 'TODO',
        assigneeRole: 'Quality Lead',
        sampleDescription:
          'AI-powered: Classify the complaint severity, check for patterns with similar past complaints, route to the appropriate department, and set the SLA timer based on priority.',
      },
      {
        name: 'Complaint acknowledgement',
        type: 'TODO',
        assigneeRole: 'Quality Lead',
        sampleDescription:
          'Automated notification: Send the complaint acknowledgement to the customer with the reference number, assigned representative, and expected resolution timeline.',
      },
      {
        name: 'Investigation & root cause analysis',
        type: 'TODO',
        assigneeRole: 'Quality Lead',
        sampleDescription:
          'Investigate the complaint, identify the root cause using appropriate analysis methods (5 Whys, fishbone diagram, etc.), and document findings.',
      },
      {
        name: 'Corrective action plan',
        type: 'FILE_REQUEST',
        assigneeRole: 'Quality Lead',
        sampleDescription:
          'Upload the corrective action plan documenting the root cause, immediate containment actions, and long-term corrective measures to prevent recurrence.',
      },
      {
        name: 'Corrective action verification',
        type: 'APPROVAL',
        assigneeRole: 'Quality Lead',
        sampleDescription:
          'Verify that the corrective actions have been effectively implemented and the root cause has been addressed.',
      },
      {
        name: 'Customer resolution offer',
        type: 'FORM',
        assigneeRole: 'Quality Lead',
        sampleDescription:
          'Present the resolution offer to the customer including the investigation findings and corrective actions taken.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Root Cause Summary', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f2', label: 'Corrective Actions Taken', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Resolution Offered', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Preventive Measures', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Customer acceptance',
        type: 'APPROVAL',
        assigneeRole: 'Customer',
        sampleDescription:
          'Review the resolution offer and investigation findings. Accept the proposed resolution or request additional action.',
      },
    ],
  },

  // 90. Import Customs Clearance
  {
    id: 'import-customs-clearance',
    name: 'Import Customs Clearance',
    category: 'order-supply-chain',
    description:
      'Coordinate import customs clearance from pre-arrival document collection through ISF filing, tariff classification, duty payment, and cargo release. Avoid costly delays and penalties by keeping every filing deadline on track.',
    complexity: 'Standard',
    tags: ['Import/Export', 'Manufacturing', 'Retail'],
    trigger: 'Shipment in transit / Pre-arrival',
    roles: ['Importer', 'Customs Broker', 'Regulatory Liaison'],
    useCases: [
      'Clear a container shipment of consumer electronics through U.S. customs',
      'Process a food product import requiring FDA prior notice and inspection',
      'Handle a multi-modal shipment with air and ocean legs requiring separate entries',
      'Coordinate customs clearance for raw materials needed for production deadlines',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your freight forwarder or TMS (Flexport, Descartes, CargoWise) to auto-populate shipment details, pull commercial documents, and track vessel arrival status',
      'Connect to your customs brokerage platform (ACE, Descartes CustomsInfo) to auto-file ISF and entry documents and sync tariff classifications with your product catalog',
      'Push landed cost data (duties, fees, freight) to your ERP (SAP, NetSuite) for accurate inventory costing and accounts payable processing',
      'Use AI to auto-classify commodities to the correct HTS tariff code by analyzing product descriptions and commercial invoice details, reducing misclassification penalties',
    ],
    steps: [
      {
        name: 'Shipment details & bond confirmation',
        type: 'FORM',
        assigneeRole: 'Importer',
        sampleDescription:
          'Provide shipment details and confirm that a valid customs bond is on file for the import.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Country of Origin', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Destination Port', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Commodity Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Declared Value ($)', type: 'NUMBER', required: true },
          { fieldId: 'f5', label: 'Incoterms', type: 'DROPDOWN', required: true, options: [
            { label: 'FOB', value: 'fob' },
            { label: 'CIF', value: 'cif' },
            { label: 'EXW', value: 'exw' },
            { label: 'DDP', value: 'ddp' },
            { label: 'DAP', value: 'dap' },
            { label: 'Other', value: 'other' },
          ] },
          { fieldId: 'f6', label: 'Valid Customs Bond on File?', type: 'CHECKBOX', required: true },
        ],
      },
      {
        name: 'Commercial documents upload',
        type: 'FILE_REQUEST',
        assigneeRole: 'Importer',
        sampleDescription:
          'Upload all required commercial documents: commercial invoice, packing list, bill of lading or airway bill, certificate of origin (if applicable), and any PGA permits or licenses.',
      },
      {
        name: 'ISF (10+2) filing',
        type: 'TODO',
        assigneeRole: 'Customs Broker',
        sampleDescription:
          'File the Importer Security Filing (ISF/10+2) via ACE at least 24 hours before vessel loading at origin. Late or inaccurate filings can result in $5,000 per violation penalties.',
      },
      {
        name: 'Tariff classification & entry preparation',
        type: 'TODO',
        assigneeRole: 'Customs Broker',
        sampleDescription:
          'Classify the goods under the correct HTS code, determine the applicable duty rate, and prepare CBP Form 3461 for entry.',
      },
      {
        name: 'Duty & fee estimate approval',
        type: 'APPROVAL',
        assigneeRole: 'Importer',
        sampleDescription:
          'Review the estimated duties, taxes, Merchandise Processing Fee (MPF), and Harbor Maintenance Fee (HMF). Authorize payment to proceed with entry.',
      },
      {
        name: 'Government agency review (if applicable)',
        type: 'DECISION',
        assigneeRole: 'Regulatory Liaison',
        sampleDescription:
          'Determine if the shipment is subject to holds from FDA, USDA, EPA, CPSC, or other government agencies. Coordinate clearance if holds apply, or mark as not applicable.',
      },
      {
        name: 'Customs release confirmation',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Customs Broker',
        sampleDescription:
          'Confirm that CBP has authorized release and the cargo is cleared for pickup from the port or terminal.',
      },
      {
        name: 'Entry summary filing & delivery',
        type: 'TODO',
        assigneeRole: 'Customs Broker',
        sampleDescription:
          'File CBP Form 7501 (entry summary) within 10 working days of release. Coordinate final delivery of the cleared cargo to the importer\u2019s facility.',
      },
    ],
  },

  // 91. Supplier Corrective Action Request (SCAR)
  {
    id: 'supplier-corrective-action-request',
    name: 'Supplier Corrective Action Request (SCAR)',
    category: 'order-supply-chain',
    description:
      'Drive supplier accountability for quality defects through a structured corrective action process from non-conformance report through root cause analysis, corrective action implementation, and formal closure. Strengthen your supply chain quality one issue at a time.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Quality', 'Supply Chain'],
    trigger: 'Quality defect / Non-conformance',
    roles: ['Supplier Contact', 'Quality Engineer', 'Procurement Lead', 'Quality Manager'],
    useCases: [
      'Issue a SCAR for a recurring dimensional defect on machined components',
      'Address a material certification failure on incoming raw materials',
      'Correct a labeling or packaging non-conformance from a contract manufacturer',
      'Drive improvement after a supplier delivery of contaminated or mixed parts',
    ],
    recommendations: [
      'Integrate with your quality management system (SAP QM, ETQ, MasterControl) to auto-create non-conformance records and link SCARs to incoming inspection data and supplier scorecards',
      'Connect to your supplier portal or SRM platform (Coupa, SAP Ariba) to auto-notify suppliers of new SCARs and track response deadlines against contractual SLAs',
      'Use AI to evaluate the supplier\u2019s uploaded root cause analysis for completeness, checking that the methodology (8D, 5 Whys) is properly applied and all contributing factors are addressed before the Quality Engineer review',
      'Chain with the First Article Inspection (FAI) template when corrective actions involve a process or tooling change that requires re-validation of the affected part',
    ],
    steps: [
      {
        name: 'Non-conformance report',
        type: 'FORM',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Document the non-conformance including the affected part, defect description, quantity impacted, and immediate containment actions taken.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Part Number / Description', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Supplier Name', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'PO / Lot Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'Defect Description', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f5', label: 'Quantity Affected', type: 'NUMBER', required: true },
          { fieldId: 'f6', label: 'Severity', type: 'DROPDOWN', required: true, options: [
            { label: 'Critical', value: 'critical' },
            { label: 'Major', value: 'major' },
            { label: 'Minor', value: 'minor' },
          ] },
          { fieldId: 'f7', label: 'Containment Actions Taken', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Supplier acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Supplier Contact',
        sampleDescription:
          'Acknowledge receipt of the SCAR and confirm your commitment to respond within the required timeframe.',
      },
      {
        name: 'Root cause analysis',
        type: 'FILE_REQUEST',
        assigneeRole: 'Supplier Contact',
        sampleDescription:
          'Upload your root cause analysis documenting the investigation methodology (8D, 5 Whys, fishbone, etc.), findings, and identified root cause(s).',
      },
      {
        name: 'Corrective action plan',
        type: 'FILE_REQUEST',
        assigneeRole: 'Supplier Contact',
        sampleDescription:
          'Upload your corrective action plan detailing the specific actions to eliminate the root cause, responsible parties, implementation timeline, and effectiveness metrics.',
      },
      {
        name: 'Quality review',
        type: 'TODO',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Review the supplier\u2019s root cause analysis and corrective action plan. Assess whether the proposed actions adequately address the root cause and will prevent recurrence.',
      },
      {
        name: 'Evidence of implementation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Supplier Contact',
        sampleDescription:
          'Upload evidence that the corrective actions have been implemented, such as updated procedures, process changes, training records, or inspection results.',
      },
      {
        name: 'Verification',
        type: 'TODO',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Verify the effectiveness of the implemented corrective actions through incoming inspection data, audit results, or re-testing of parts from the corrected process.',
      },
      {
        name: 'Procurement acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Procurement Lead',
        sampleDescription:
          'Acknowledge the SCAR status and update the supplier scorecard accordingly. Note any impact on future sourcing decisions.',
      },
      {
        name: 'SCAR closure',
        type: 'APPROVAL',
        assigneeRole: 'Quality Manager',
        sampleDescription:
          'Formally close the SCAR after verifying that corrective actions are effective and the issue has been resolved.',
      },
    ],
  },

  // 92. First Article Inspection (FAI)
  {
    id: 'first-article-inspection',
    name: 'First Article Inspection (FAI)',
    category: 'order-supply-chain',
    description:
      'Verify that a supplier can consistently produce parts meeting design requirements through a structured first article inspection aligned with AS9102 standards. Prevent production problems by validating quality before full production begins.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Aerospace', 'Automotive'],
    trigger: 'First production run / New part approval',
    roles: ['Supplier', 'Quality Engineer', 'Engineering Reviewer'],
    useCases: [
      'Qualify a new aerospace machined component supplier per AS9102',
      'Validate first production parts after a design revision or engineering change',
      'Approve a new manufacturing process or tooling change for an existing part',
      'Conduct FAI for an automotive stamping transferred to a new production line',
    ],
    requirements: [
      'Customize form fields to match your organization',
    ],
    recommendations: [
      'Integrate with your PLM system (Teamcenter, Windchill, Arena) to auto-pull part numbers, revision levels, drawing files, and specification requirements into the FAI request',
      'Connect to your CMM or metrology software (PC-DMIS, Zeiss Calypso) to auto-import dimensional inspection data into the AS9102 Form 3 characteristic accountability report',
      'Use AI to compare Form 3 dimensional measurements against drawing tolerances and auto-flag out-of-spec characteristics with deviation severity before the Quality Engineer review',
      'Chain with the Supplier Corrective Action Request (SCAR) template when FAI disposition is rejected, to initiate formal root cause analysis and corrective action from the supplier',
    ],
    steps: [
      {
        name: 'FAI request & part identification',
        type: 'FORM',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Initiate the FAI request with complete part identification, applicable specifications, and customer requirements.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Part Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Revision Level', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f3', label: 'Drawing Number', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f4', label: 'FAI Reason', type: 'DROPDOWN', required: true, options: [
            { label: 'New part', value: 'new-part' },
            { label: 'Design change', value: 'design-change' },
            { label: 'Process change', value: 'process-change' },
            { label: 'Tooling change', value: 'tooling-change' },
            { label: 'New supplier', value: 'new-supplier' },
            { label: 'Production lapse (>2 years)', value: 'production-lapse' },
          ] },
          { fieldId: 'f5', label: 'Applicable Specifications', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f6', label: 'Customer Requirements', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'FAI requirements acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Supplier',
        sampleDescription:
          'Confirm your understanding of the AS9102 deliverables including Forms 1\u20133 and sample parts that must be submitted.',
      },
      {
        name: 'First article sample submission',
        type: 'FILE_REQUEST',
        assigneeRole: 'Supplier',
        sampleDescription:
          'Ship the sample parts and upload shipping confirmation, lot/serial numbers, and production run details for the first article samples.',
      },
      {
        name: 'AS9102 FAI package',
        type: 'FILE_REQUEST',
        assigneeRole: 'Supplier',
        sampleDescription:
          'Upload the complete AS9102 FAI package: Form 1 (Part Number Accountability \u2014 part ID, materials, sub-components), Form 2 (Product Accountability \u2014 raw material certs, special process approvals, functional test results), and Form 3 (Characteristic Accountability \u2014 dimensional inspection results for every drawing characteristic).',
      },
      {
        name: 'Quality engineer review',
        type: 'TODO',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Verify Form 1 traceability, Form 2 material and process certifications, and Form 3 dimensional data against the drawing. Perform independent verification measurements if required.',
      },
      {
        name: 'Engineering design review',
        type: 'TODO',
        assigneeRole: 'Engineering Reviewer',
        sampleDescription:
          'Verify Form 3 data against design intent, key characteristics, and GD&T callouts. Confirm Form 2 special process results meet engineering requirements.',
      },
      {
        name: 'FAI disposition',
        type: 'DECISION',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Determine the FAI disposition: Approve for production, Conditionally approve with resubmission of affected forms, or Reject with root cause analysis required.',
      },
      {
        name: 'FAI completion notification',
        type: 'TODO',
        assigneeRole: 'Quality Engineer',
        sampleDescription:
          'Automated notification: Send the FAI completion notification to all stakeholders with the disposition status, any conditions or corrective actions required, and the approved FAI reference number.',
      },
    ],
  },

  // 93. Product Recall Coordination
  {
    id: 'product-recall-coordination',
    name: 'Product Recall Coordination',
    category: 'order-supply-chain',
    description:
      'Coordinate a product recall across the supply chain from manufacturer through distributors and retailers. Protect consumers and your brand by executing a structured recall with full inventory traceability and regulatory compliance.',
    complexity: 'Standard',
    tags: ['Manufacturing', 'Consumer Products', 'Food & Beverage'],
    trigger: 'Safety issue identified / Regulatory recall order',
    roles: ['Manufacturer', 'Distributor', 'Retailer', 'Regulatory Liaison'],
    useCases: [
      'Execute a voluntary recall of a consumer product with a safety defect',
      'Coordinate an FDA-mandated food recall across the distribution network',
      'Manage a component recall requiring identification of affected finished products',
      'Handle a lot-specific recall with targeted inventory reconciliation',
    ],
    recommendations: [
      'Integrate with your ERP (SAP, Oracle, NetSuite) to auto-identify affected lot/batch numbers across the distribution chain and generate inventory quarantine orders at each location',
      'Connect to your EDI or supply chain network (SPS Commerce, TrueCommerce) to broadcast recall notifications to all distributors and retailers simultaneously with acknowledgement tracking',
      'Push recall completion data and recovery metrics to your regulatory filing platform (CPSC SaferProducts, FDA RES) for streamlined agency reporting and compliance documentation',
      'Use AI to aggregate distributor and retailer inventory reconciliation data in real time, calculate recovery rates by channel, and auto-flag locations with low response rates for targeted follow-up',
      'Chain with the Supplier Corrective Action Request (SCAR) template to drive formal root cause analysis and corrective action with the supplier responsible for the defect',
    ],
    steps: [
      {
        name: 'Recall notification',
        type: 'FORM',
        assigneeRole: 'Manufacturer',
        sampleDescription:
          'Issue the recall notification with product identification, reason for recall, and scope of affected items.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Product Name / Description', type: 'TEXT_SINGLE_LINE', required: true },
          { fieldId: 'f2', label: 'Affected Lot / Batch Numbers', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f3', label: 'Reason for Recall', type: 'TEXT_MULTI_LINE', required: true },
          { fieldId: 'f4', label: 'Recall Classification', type: 'DROPDOWN', required: true, options: [
            { label: 'Class I - Serious health hazard', value: 'class-i' },
            { label: 'Class II - Temporary health issue', value: 'class-ii' },
            { label: 'Class III - Not likely to cause harm', value: 'class-iii' },
            { label: 'Voluntary - Precautionary', value: 'voluntary' },
          ] },
          { fieldId: 'f5', label: 'Estimated Quantity in Distribution', type: 'NUMBER' },
          { fieldId: 'f6', label: 'Consumer Instructions', type: 'TEXT_MULTI_LINE', required: true },
        ],
      },
      {
        name: 'Product identification documentation',
        type: 'FILE_REQUEST',
        assigneeRole: 'Manufacturer',
        sampleDescription:
          'Upload product photos, UPC/SKU information, lot code examples, and any other materials to help identify affected products in the supply chain.',
      },
      {
        name: 'Distributor acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Distributor',
        sampleDescription:
          'Acknowledge receipt of the recall notification and confirm that you are initiating inventory quarantine and customer notification procedures.',
      },
      {
        name: 'Retailer acknowledgement',
        type: 'ACKNOWLEDGEMENT',
        assigneeRole: 'Retailer',
        sampleDescription:
          'Acknowledge receipt of the recall notification and confirm that affected products are being removed from shelves and quarantined.',
      },
      {
        name: 'Inventory reconciliation',
        type: 'FORM',
        assigneeRole: 'Distributor',
        sampleDescription:
          'Report your inventory count of affected products including quantities on hand, in transit, and already shipped to retailers.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Quantity On Hand (quarantined)', type: 'NUMBER', required: true },
          { fieldId: 'f2', label: 'Quantity In Transit', type: 'NUMBER' },
          { fieldId: 'f3', label: 'Quantity Already Shipped to Retailers', type: 'NUMBER' },
          { fieldId: 'f4', label: 'Retailers Notified', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Retail inventory count',
        type: 'FORM',
        assigneeRole: 'Retailer',
        sampleDescription:
          'Report your inventory count of affected products including quantities removed from shelves and in back stock.',
        sampleFormFields: [
          { fieldId: 'f1', label: 'Quantity Removed from Shelves', type: 'NUMBER', required: true },
          { fieldId: 'f2', label: 'Quantity in Back Stock', type: 'NUMBER' },
          { fieldId: 'f3', label: 'Customer Returns Received', type: 'NUMBER' },
          { fieldId: 'f4', label: 'Store Locations Affected', type: 'TEXT_MULTI_LINE' },
        ],
      },
      {
        name: 'Return instructions',
        type: 'FILE_REQUEST',
        assigneeRole: 'Manufacturer',
        sampleDescription:
          'Upload the detailed return instructions for distributors and retailers including shipping labels, destruction authorization (if applicable), and credit/refund procedures.',
      },
      {
        name: 'Regulatory notification',
        type: 'TODO',
        assigneeRole: 'Regulatory Liaison',
        sampleDescription:
          'File the required regulatory notifications with CPSC, FDA, or other applicable agencies. Document the filing confirmation and any agency follow-up requirements.',
      },
      {
        name: 'Recall completion report',
        type: 'FILE_REQUEST',
        assigneeRole: 'Manufacturer',
        sampleDescription:
          'Upload the recall completion report documenting total units recovered, recovery rate, disposal method, and effectiveness check results for regulatory submission.',
      },
    ],
  },
];
