# Order & Supply Chain (8 Templates)

> Workflow templates for order fulfillment, purchase order processing, returns management, customer complaint resolution, import customs clearance, supplier corrective actions, first article inspection, and product recall coordination.

---

## 1. Order Fulfillment

**Tags**: Manufacturing, Distribution | **Complexity**: Standard | **Trigger**: Purchase order received from customer

**Description**: Manage the complete order-to-delivery lifecycle from purchase order submission through pick-pack-ship, delivery confirmation, and payment reconciliation. Keep customers informed at every milestone while maintaining warehouse accountability.

**Use Cases**:
- Fulfill a wholesale distribution order with multi-line items
- Process a custom manufacturing order with special shipping requirements
- Handle a large retail replenishment order with scheduled delivery windows
- Manage a drop-ship order requiring third-party coordination

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Customer, Warehouse Lead, Shipping Coordinator

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Purchase order submission | Form | Customer | Submit your purchase order with all required details including line items, quantities, shipping address, and delivery requirements. |
| 2 | PO acknowledgement & validation | To-Do | Warehouse Lead | Validate the purchase order by verifying pricing accuracy, confirming inventory availability, and checking credit status. Flag any discrepancies before confirming. |
| 3 | Order confirmation | Acknowledgement | Customer | Acknowledge the order confirmation including confirmed quantities, pricing, and estimated delivery date. |
| 4 | Pick, pack & quality check | To-Do | Warehouse Lead | Pick the order items from inventory, pack per customer requirements, and perform a quality check before release to shipping. |
| 5 | Shipping & BOL upload | File Request | Shipping Coordinator | Upload shipping documents including carrier assignment, tracking number, Bill of Lading (BOL), and packing slip. |
| 6 | Shipment notification | To-Do | Shipping Coordinator | Automated notification: Send the shipment notification to the customer with carrier details, tracking number, and estimated delivery date. |
| 7 | Delivery confirmation | Acknowledgement | Customer | Confirm receipt of the shipment and note any discrepancies, damages, or shortages upon delivery. |
| 8 | Invoice & supporting docs | File Request | Shipping Coordinator | Upload the invoice and any supporting documentation including proof of delivery, signed BOL, and weight tickets. |
| 9 | Payment confirmation | Acknowledgement | Warehouse Lead | Acknowledge receipt of payment and confirm the order is closed. Note any outstanding balance or credit issues. |

#### Step 1: Purchase order submission — Form Fields

| Field | Type | Required |
|-------|------|----------|
| PO Number | Text (Single Line) | Yes |
| Ship-To Address | Text (Multi Line) | Yes |
| Requested Delivery Date | Date | Yes |
| Line Items (product, quantity, unit price) | Text (Multi Line) | Yes |
| Special Instructions | Text (Multi Line) | No |

---

## 2. Purchase Order Processing

**Tags**: Manufacturing, Cross-industry | **Complexity**: Standard | **Trigger**: Purchase requisition submitted

**Description**: Process internal purchase requisitions from submission through approval, vendor dispatch, goods receipt, and three-way match verification. Maintain procurement discipline with proper authorization at every stage.

**Use Cases**:
- Process a capital equipment purchase requiring multi-level approval
- Handle a routine materials replenishment order for production
- Manage an office supplies requisition from department to delivery
- Process a services purchase order for an external contractor

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Requisitioner, Procurement Lead, Vendor

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Purchase requisition | Form | Requisitioner | Submit your purchase requisition with justification, budget details, and vendor preference. |
| 2 | Manager approval | Approval | Procurement Lead | Review the purchase requisition for budget availability, business justification, and compliance with procurement policies. |
| 3 | Vendor selection & PO creation | To-Do | Procurement Lead | Select the vendor (or confirm the requested vendor), negotiate terms if needed, and create the official purchase order. |
| 4 | Purchase order dispatch | File Request | Procurement Lead | Upload the finalized purchase order document for dispatch to the selected vendor. |
| 5 | Vendor order acknowledgement | Acknowledgement | Vendor | Acknowledge receipt of the purchase order, confirm the order details, and provide an estimated delivery date. |
| 6 | Goods receipt & inspection | Form | Procurement Lead | Record the receipt of goods and document the inspection results including any quantity or quality discrepancies. |
| 7 | Vendor invoice submission | File Request | Vendor | Upload your invoice for the delivered goods. Ensure the invoice references the correct PO number and matches the delivered quantities. |
| 8 | 3-way match & discrepancy resolution | To-Do | Procurement Lead | Perform the three-way match comparing the purchase order, receiving report, and vendor invoice. Resolve any discrepancies before authorizing payment. |
| 9 | Payment authorization | Approval | Procurement Lead | Authorize payment to the vendor after successful three-way match verification. |

#### Step 1: Purchase requisition — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Department | Text (Single Line) | Yes |
| GL Account / Cost Center | Text (Single Line) | Yes |
| Item Description | Text (Multi Line) | Yes |
| Estimated Cost ($) | Number | Yes |
| Quantity | Number | Yes |
| Business Justification | Text (Multi Line) | Yes |
| Preferred Vendor | Text (Single Line) | No |

#### Step 6: Goods receipt & inspection — Form Fields

| Field | Type | Required |
|-------|------|----------|
| PO Number | Text (Single Line) | Yes |
| Quantity Received | Number | Yes |
| Condition | Dropdown | Yes |
| Discrepancies / Notes | Text (Multi Line) | No |

---

## 3. RMA / Return Processing

**Tags**: Manufacturing, Retail, SaaS | **Complexity**: Standard | **Trigger**: Customer requests return or reports defect

**Description**: Handle product returns from initial request through inspection, disposition, and resolution. Deliver a professional returns experience that resolves customer issues quickly while maintaining inventory accuracy.

**Use Cases**:
- Process a defective product return with replacement fulfillment
- Handle a customer return within the standard return window
- Manage a warranty claim requiring inspection and repair
- Process a bulk return from a distributor with multiple line items

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Customer, Returns Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Return request submission | Form | Customer | Submit your return request with the order details, reason for return, and your preferred resolution. |
| 2 | Supporting evidence | File Request | Customer | Upload photos of the defect or damage, the packing slip, and any error codes or diagnostic information that supports your return request. |
| 3 | RMA approval | Approval | Returns Lead | Review the return request and supporting evidence. Approve or deny the RMA based on return policy and product condition. |
| 4 | Return shipping instructions | Acknowledgement | Customer | Acknowledge receipt of the RMA number, return shipping address, and packaging instructions. Ship the item back using the provided details. |
| 5 | Return receipt & inspection | Form | Returns Lead | Inspect the returned item upon receipt and document its condition, verify the defect, and record serial or lot numbers. |
| 6 | Disposition decision | Decision | Returns Lead | Determine the disposition of the returned item: restock into inventory, send for repair, scrap, or return to vendor. |
| 7 | Credit memo / refund processing | To-Do | Returns Lead | Process the credit memo, refund, or replacement order based on the approved disposition and the customer's preferred resolution. |
| 8 | Resolution confirmation | Acknowledgement | Customer | Confirm that you have received the refund, replacement, or other agreed resolution for your return. |

#### Step 1: Return request submission — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Order Number | Text (Single Line) | Yes |
| Product Name / SKU | Text (Single Line) | Yes |
| Quantity to Return | Number | Yes |
| Reason for Return | Dropdown | Yes |
| Desired Resolution | Dropdown | Yes |

#### Step 5: Return receipt & inspection — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Item Condition Upon Receipt | Dropdown | Yes |
| Defect Verified? | Checkbox | No |
| Serial / Lot Number | Text (Single Line) | No |
| Inspection Notes | Text (Multi Line) | No |

---

## 4. Customer Complaint Resolution

**Tags**: Manufacturing, Cross-industry | **Complexity**: Standard | **Trigger**: Customer complaint received

**Description**: Capture, triage, investigate, and resolve customer complaints with a structured corrective action process. Turn customer issues into improvement opportunities with documented root cause analysis and verified resolutions.

**Use Cases**:
- Investigate a recurring product quality complaint from a key account
- Resolve a service delivery complaint with documented corrective actions
- Handle a safety-related complaint requiring immediate escalation
- Process a complaint about order accuracy from a distribution customer

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Customer, Quality Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Complaint registration | Form | Customer | Register your complaint with details about the product or service, severity, and your desired resolution. |
| 2 | Supporting documentation | File Request | Customer | Upload any supporting documents such as photos, invoices, correspondence, or test results related to the complaint. |
| 3 | AI complaint triage | To-Do | Quality Lead | AI-powered: Classify the complaint severity, check for patterns with similar past complaints, route to the appropriate department, and set the SLA timer based on priority. |
| 4 | Complaint acknowledgement | To-Do | Quality Lead | Automated notification: Send the complaint acknowledgement to the customer with the reference number, assigned representative, and expected resolution timeline. |
| 5 | Investigation & root cause analysis | To-Do | Quality Lead | Investigate the complaint, identify the root cause using appropriate analysis methods (5 Whys, fishbone diagram, etc.), and document findings. |
| 6 | Corrective action plan | File Request | Quality Lead | Upload the corrective action plan documenting the root cause, immediate containment actions, and long-term corrective measures to prevent recurrence. |
| 7 | Corrective action verification | Approval | Quality Lead | Verify that the corrective actions have been effectively implemented and the root cause has been addressed. |
| 8 | Customer resolution offer | Form | Quality Lead | Present the resolution offer to the customer including the investigation findings and corrective actions taken. |
| 9 | Customer acceptance | Approval | Customer | Review the resolution offer and investigation findings. Accept the proposed resolution or request additional action. |

#### Step 1: Complaint registration — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Product / Service Affected | Text (Single Line) | Yes |
| Complaint Category | Dropdown | Yes |
| Severity | Dropdown | Yes |
| Description of Issue | Text (Multi Line) | Yes |
| Desired Resolution | Text (Multi Line) | Yes |

#### Step 8: Customer resolution offer — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Root Cause Summary | Text (Multi Line) | Yes |
| Corrective Actions Taken | Text (Multi Line) | Yes |
| Resolution Offered | Text (Multi Line) | Yes |
| Preventive Measures | Text (Multi Line) | No |

---

## 5. Import Customs Clearance

**Tags**: Import/Export, Manufacturing, Retail | **Complexity**: Standard | **Trigger**: Shipment in transit / Pre-arrival

**Description**: Coordinate import customs clearance from pre-arrival document collection through ISF filing, tariff classification, duty payment, and cargo release. Avoid costly delays and penalties by keeping every filing deadline on track.

**Use Cases**:
- Clear a container shipment of consumer electronics through U.S. customs
- Process a food product import requiring FDA prior notice and inspection
- Handle a multi-modal shipment with air and ocean legs requiring separate entries
- Coordinate customs clearance for raw materials needed for production deadlines

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Importer, Customs Broker, Regulatory Liaison

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Shipment details & bond confirmation | Form | Importer | Provide shipment details and confirm that a valid customs bond is on file for the import. |
| 2 | Commercial documents upload | File Request | Importer | Upload all required commercial documents: commercial invoice, packing list, bill of lading or airway bill, certificate of origin (if applicable), and any PGA permits or licenses. |
| 3 | ISF (10+2) filing | To-Do | Customs Broker | File the Importer Security Filing (ISF/10+2) via ACE at least 24 hours before vessel loading at origin. Late or inaccurate filings can result in $5,000 per violation penalties. |
| 4 | Tariff classification & entry preparation | To-Do | Customs Broker | Classify the goods under the correct HTS code, determine the applicable duty rate, and prepare CBP Form 3461 for entry. |
| 5 | Duty & fee estimate approval | Approval | Importer | Review the estimated duties, taxes, Merchandise Processing Fee (MPF), and Harbor Maintenance Fee (HMF). Authorize payment to proceed with entry. |
| 6 | Government agency review (if applicable) | Decision | Regulatory Liaison | Determine if the shipment is subject to holds from FDA, USDA, EPA, CPSC, or other government agencies. Coordinate clearance if holds apply, or mark as not applicable. |
| 7 | Customs release confirmation | Acknowledgement | Customs Broker | Confirm that CBP has authorized release and the cargo is cleared for pickup from the port or terminal. |
| 8 | Entry summary filing & delivery | To-Do | Customs Broker | File CBP Form 7501 (entry summary) within 10 working days of release. Coordinate final delivery of the cleared cargo to the importer's facility. |

#### Step 1: Shipment details & bond confirmation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Country of Origin | Text (Single Line) | Yes |
| Destination Port | Text (Single Line) | Yes |
| Commodity Description | Text (Multi Line) | Yes |
| Declared Value ($) | Number | Yes |
| Incoterms | Dropdown | Yes |
| Valid Customs Bond on File? | Checkbox | Yes |

---

## 6. Supplier Corrective Action Request (SCAR)

**Tags**: Manufacturing, Quality, Supply Chain | **Complexity**: Standard | **Trigger**: Quality defect / Non-conformance

**Description**: Drive supplier accountability for quality defects through a structured corrective action process from non-conformance report through root cause analysis, corrective action implementation, and formal closure. Strengthen your supply chain quality one issue at a time.

**Use Cases**:
- Issue a SCAR for a recurring dimensional defect on machined components
- Address a material certification failure on incoming raw materials
- Correct a labeling or packaging non-conformance from a contract manufacturer
- Drive improvement after a supplier delivery of contaminated or mixed parts

**Roles**: Supplier Contact, Quality Engineer, Procurement Lead, Quality Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Non-conformance report | Form | Quality Engineer | Document the non-conformance including the affected part, defect description, quantity impacted, and immediate containment actions taken. |
| 2 | Supplier acknowledgement | Acknowledgement | Supplier Contact | Acknowledge receipt of the SCAR and confirm your commitment to respond within the required timeframe. |
| 3 | Root cause analysis | File Request | Supplier Contact | Upload your root cause analysis documenting the investigation methodology (8D, 5 Whys, fishbone, etc.), findings, and identified root cause(s). |
| 4 | Corrective action plan | File Request | Supplier Contact | Upload your corrective action plan detailing the specific actions to eliminate the root cause, responsible parties, implementation timeline, and effectiveness metrics. |
| 5 | Quality review | To-Do | Quality Engineer | Review the supplier's root cause analysis and corrective action plan. Assess whether the proposed actions adequately address the root cause and will prevent recurrence. |
| 6 | Evidence of implementation | File Request | Supplier Contact | Upload evidence that the corrective actions have been implemented, such as updated procedures, process changes, training records, or inspection results. |
| 7 | Verification | To-Do | Quality Engineer | Verify the effectiveness of the implemented corrective actions through incoming inspection data, audit results, or re-testing of parts from the corrected process. |
| 8 | Procurement acknowledgement | Acknowledgement | Procurement Lead | Acknowledge the SCAR status and update the supplier scorecard accordingly. Note any impact on future sourcing decisions. |
| 9 | SCAR closure | Approval | Quality Manager | Formally close the SCAR after verifying that corrective actions are effective and the issue has been resolved. |

#### Step 1: Non-conformance report — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Part Number / Description | Text (Single Line) | Yes |
| Supplier Name | Text (Single Line) | Yes |
| PO / Lot Number | Text (Single Line) | Yes |
| Defect Description | Text (Multi Line) | Yes |
| Quantity Affected | Number | Yes |
| Severity | Dropdown | Yes |
| Containment Actions Taken | Text (Multi Line) | Yes |

---

## 7. First Article Inspection (FAI)

**Tags**: Manufacturing, Aerospace, Automotive | **Complexity**: Standard | **Trigger**: First production run / New part approval

**Description**: Verify that a supplier can consistently produce parts meeting design requirements through a structured first article inspection aligned with AS9102 standards. Prevent production problems by validating quality before full production begins.

**Use Cases**:
- Qualify a new aerospace machined component supplier per AS9102
- Validate first production parts after a design revision or engineering change
- Approve a new manufacturing process or tooling change for an existing part
- Conduct FAI for an automotive stamping transferred to a new production line

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Supplier, Quality Engineer, Engineering Reviewer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | FAI request & part identification | Form | Quality Engineer | Initiate the FAI request with complete part identification, applicable specifications, and customer requirements. |
| 2 | FAI requirements acknowledgement | Acknowledgement | Supplier | Confirm your understanding of the AS9102 deliverables including Forms 1-3 and sample parts that must be submitted. |
| 3 | First article sample submission | File Request | Supplier | Ship the sample parts and upload shipping confirmation, lot/serial numbers, and production run details for the first article samples. |
| 4 | AS9102 FAI package | File Request | Supplier | Upload the complete AS9102 FAI package: Form 1 (Part Number Accountability -- part ID, materials, sub-components), Form 2 (Product Accountability -- raw material certs, special process approvals, functional test results), and Form 3 (Characteristic Accountability -- dimensional inspection results for every drawing characteristic). |
| 5 | Quality engineer review | To-Do | Quality Engineer | Verify Form 1 traceability, Form 2 material and process certifications, and Form 3 dimensional data against the drawing. Perform independent verification measurements if required. |
| 6 | Engineering design review | To-Do | Engineering Reviewer | Verify Form 3 data against design intent, key characteristics, and GD&T callouts. Confirm Form 2 special process results meet engineering requirements. |
| 7 | FAI disposition | Decision | Quality Engineer | Determine the FAI disposition: Approve for production, Conditionally approve with resubmission of affected forms, or Reject with root cause analysis required. |
| 8 | FAI completion notification | To-Do | Quality Engineer | Automated notification: Send the FAI completion notification to all stakeholders with the disposition status, any conditions or corrective actions required, and the approved FAI reference number. |

#### Step 1: FAI request & part identification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Part Number | Text (Single Line) | Yes |
| Revision Level | Text (Single Line) | Yes |
| Drawing Number | Text (Single Line) | Yes |
| FAI Reason | Dropdown | Yes |
| Applicable Specifications | Text (Multi Line) | Yes |
| Customer Requirements | Text (Multi Line) | No |

---

## 8. Product Recall Coordination

**Tags**: Manufacturing, Consumer Products, Food & Beverage | **Complexity**: Standard | **Trigger**: Safety issue identified / Regulatory recall order

**Description**: Coordinate a product recall across the supply chain from manufacturer through distributors and retailers. Protect consumers and your brand by executing a structured recall with full inventory traceability and regulatory compliance.

**Use Cases**:
- Execute a voluntary recall of a consumer product with a safety defect
- Coordinate an FDA-mandated food recall across the distribution network
- Manage a component recall requiring identification of affected finished products
- Handle a lot-specific recall with targeted inventory reconciliation

**Roles**: Manufacturer, Distributor, Retailer, Regulatory Liaison

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Recall notification | Form | Manufacturer | Issue the recall notification with product identification, reason for recall, and scope of affected items. |
| 2 | Product identification documentation | File Request | Manufacturer | Upload product photos, UPC/SKU information, lot code examples, and any other materials to help identify affected products in the supply chain. |
| 3 | Distributor acknowledgement | Acknowledgement | Distributor | Acknowledge receipt of the recall notification and confirm that you are initiating inventory quarantine and customer notification procedures. |
| 4 | Retailer acknowledgement | Acknowledgement | Retailer | Acknowledge receipt of the recall notification and confirm that affected products are being removed from shelves and quarantined. |
| 5 | Inventory reconciliation | Form | Distributor | Report your inventory count of affected products including quantities on hand, in transit, and already shipped to retailers. |
| 6 | Retail inventory count | Form | Retailer | Report your inventory count of affected products including quantities removed from shelves and in back stock. |
| 7 | Return instructions | File Request | Manufacturer | Upload the detailed return instructions for distributors and retailers including shipping labels, destruction authorization (if applicable), and credit/refund procedures. |
| 8 | Regulatory notification | To-Do | Regulatory Liaison | File the required regulatory notifications with CPSC, FDA, or other applicable agencies. Document the filing confirmation and any agency follow-up requirements. |
| 9 | Recall completion report | File Request | Manufacturer | Upload the recall completion report documenting total units recovered, recovery rate, disposal method, and effectiveness check results for regulatory submission. |

#### Step 1: Recall notification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Product Name / Description | Text (Single Line) | Yes |
| Affected Lot / Batch Numbers | Text (Multi Line) | Yes |
| Reason for Recall | Text (Multi Line) | Yes |
| Recall Classification | Dropdown | Yes |
| Estimated Quantity in Distribution | Number | No |
| Consumer Instructions | Text (Multi Line) | Yes |

#### Step 5: Inventory reconciliation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Quantity On Hand (quarantined) | Number | Yes |
| Quantity In Transit | Number | No |
| Quantity Already Shipped to Retailers | Number | No |
| Retailers Notified | Text (Multi Line) | No |

#### Step 6: Retail inventory count — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Quantity Removed from Shelves | Number | Yes |
| Quantity in Back Stock | Number | No |
| Customer Returns Received | Number | No |
| Store Locations Affected | Text (Multi Line) | No |
