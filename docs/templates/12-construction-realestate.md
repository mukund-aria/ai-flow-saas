# Construction & Real Estate (10 Templates)

> Workflow templates for construction project management, lien waiver collection, submittals, RFIs, change orders, project closeout, and real estate transactions including residential purchases, commercial leasing, and tenant move-out processes.

---

## 1. Subcontractor Qualification

**Tags**: Construction, General Contractors | **Complexity**: Standard | **Trigger**: New subcontractor needed / Bid received

**Description**: Qualify new subcontractors by collecting company profiles, insurance certificates, safety documentation, and references in a structured review process. Ensure every sub meets your project requirements before they set foot on site.

**Use Cases**:
- Qualify a new electrical subcontractor before awarding a bid
- Re-qualify an existing sub whose insurance or safety certs have expired
- Evaluate specialty trade contractors for a new commercial project
- Build a pre-qualified vendor list ahead of bidding season

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to Procore or PlanGrid to auto-pull subcontractor profiles and sync qualification status to your project directory
- Integrate with a certificate management platform (myCOI, PINS) to auto-verify insurance coverage limits and flag expirations
- Push qualification results to your ERP (Sage 300, Viewpoint Vista) to update vendor master records and approved bidder lists
- Set up Slack or Teams notifications to alert the project manager when a subcontractor submits documents or when reviews are overdue

**Roles**: Subcontractor, Project Manager, Safety Lead, Insurance Coordinator

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Company profile & capabilities | Form | Subcontractor | Provide your company details, trade specialties, bonding capacity, and relevant project experience. |
| 2 | Insurance certificates (GL, WC, Auto) | File Request | Subcontractor | Upload current certificates of insurance for General Liability, Workers Compensation, and Commercial Auto. All policies must meet the minimum coverage limits specified in the subcontract. |
| 3 | Safety program documentation | File Request | Subcontractor | Upload your company safety program, EMR letter, OSHA logs (300/300A), and any relevant safety certifications. |
| 4 | License & bonding verification | File Request | Subcontractor | Upload copies of your state contractor license, any specialty licenses, and current bonding documentation. |
| 5 | References | Form | Subcontractor | Provide at least three project references from the past two years, including contact information for each. |
| 6 | Insurance review | To-Do | Insurance Coordinator | Review the uploaded insurance certificates against project requirements. Verify coverage limits, additional insured endorsements, and policy expiration dates. |
| 7 | Safety review | To-Do | Safety Lead | Review the safety program documentation, EMR history, and OSHA logs. Confirm the subcontractor meets minimum safety standards for the project. |
| 8 | Qualification decision | Approval | Project Manager | Review all collected materials, insurance review results, and safety review findings to make a final qualification decision for this subcontractor. |
| 9 | Qualification acknowledgement | Acknowledgement | Subcontractor | Acknowledge receipt of the qualification decision and any conditions or next steps communicated by the project team. |

#### Step 1: Company profile & capabilities — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text (Single Line) | Yes |
| Primary Trade / Specialty | Text (Single Line) | Yes |
| Years in Business | Number | Yes |
| Bonding Capacity ($) | Number | No |
| Number of Employees | Number | No |
| Union / Non-Union | Dropdown | No |
| Brief Description of Capabilities | Text (Multi Line) | Yes |

#### Step 5: References — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Reference 1 - Company Name | Text (Single Line) | Yes |
| Reference 1 - Contact Name | Text (Single Line) | Yes |
| Reference 1 - Phone / Email | Text (Single Line) | Yes |
| Reference 1 - Project Description | Text (Multi Line) | No |
| Reference 2 - Company Name | Text (Single Line) | Yes |
| Reference 2 - Contact Name | Text (Single Line) | Yes |
| Reference 2 - Phone / Email | Text (Single Line) | Yes |
| Reference 2 - Project Description | Text (Multi Line) | No |
| Reference 3 - Company Name | Text (Single Line) | Yes |
| Reference 3 - Contact Name | Text (Single Line) | Yes |
| Reference 3 - Phone / Email | Text (Single Line) | Yes |
| Reference 3 - Project Description | Text (Multi Line) | No |

---

## 2. Lien Waiver Collection — Progress Payment

**Tags**: Construction, Real Estate Development | **Complexity**: Simple | **Trigger**: Payment application submitted

**Description**: Collect conditional and unconditional lien waivers alongside progress payment applications. Protect your project from mechanic's lien exposure while keeping subcontractors paid on schedule.

**Use Cases**:
- Process a monthly draw request from a framing subcontractor
- Collect conditional waivers before releasing a scheduled progress payment
- Obtain unconditional waivers confirming receipt of the previous billing period's payment
- Streamline pay-app review across multiple trades on a single project

**Requirements**:
- [ ] Upload your conditional lien waiver document for e-signature (replaces sample)
- [ ] Upload your unconditional lien waiver document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your accounting system (Sage 300, QuickBooks, Viewpoint) to auto-trigger lien waiver requests when progress payments are scheduled
- Connect to DocuSign or your e-signature platform to streamline conditional and unconditional waiver execution with audit trails
- Set up automated email reminders to subcontractors when lien waivers are outstanding, with escalation to the project manager after 48 hours

**Roles**: Subcontractor, Project Manager, Accounts Payable, Owner Representative

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Payment application | Form | Subcontractor | Submit your payment application for the current billing period, including work completed, materials stored, and the amount due. |
| 2 | Schedule of values & compliance docs | File Request | Subcontractor | Upload your updated schedule of values, certified payroll (if required), current insurance certificates, and any sub-tier lien waivers if applicable. |
| 3 | Conditional lien waiver | E-Sign | Subcontractor | Sign the conditional lien waiver for the current billing period. This waiver is effective only upon receipt of payment. |
| 4 | Field verification & pay app review | To-Do | Project Manager | Verify that work quantities match the payment application, review the schedule of values, and confirm stored materials on site. |
| 5 | Payment application approval | Approval | Project Manager | Approve the payment application after completing field verification and pay-app review. |
| 6 | Payment processing | To-Do | Accounts Payable | Process the approved payment application. Issue payment to the subcontractor per the approved amount. |
| 7 | Unconditional lien waiver (prior period) | E-Sign | Subcontractor | Sign the unconditional lien waiver confirming receipt of the previous period's payment. This immediately waives lien rights for that prior billing period. |

#### Step 1: Payment application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Billing Period | Text (Single Line) | Yes |
| Work Completed ($) | Number | Yes |
| Materials Stored ($) | Number | No |
| Retainage ($) | Number | No |
| Change Orders Included | Text (Multi Line) | No |
| Current Amount Due ($) | Number | Yes |

---

## 3. Lien Waiver Collection — Final Payment

**Tags**: Construction, Real Estate Development | **Complexity**: Standard | **Trigger**: Substantial completion / Final pay application

**Description**: Manage the final payment process including punch list completion, closeout documents, and final conditional and unconditional lien waivers. Close out subcontractor accounts with full lien protection and proper documentation.

**Use Cases**:
- Process the final payment for a mechanical subcontractor after punch list completion
- Release retainage to a finished trade with all closeout documents submitted
- Collect final unconditional waivers before recording the notice of completion
- Close out a subcontract after substantial completion on a commercial build

**Requirements**:
- [ ] Upload your final conditional lien waiver document for e-signature (replaces sample)
- [ ] Upload your final unconditional lien waiver document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your construction accounting system (Sage 300, Viewpoint) to auto-reconcile retainage balances and trigger final payment processing upon waiver receipt
- Connect to DocuSign to execute final conditional and unconditional lien waivers with tamper-proof audit trails for project closeout files
- Push completed waiver packages to your document management system (Procore, Box) for automatic archival alongside closeout documentation
- Set up Slack or email notifications to the owner representative when all sub-tier waivers are collected and the final payment package is ready for approval

**Roles**: Subcontractor, Project Manager, Accounts Payable, Owner Representative

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Final payment application | Form | Subcontractor | Submit your final payment application including the final contract amount, total work completed, retainage held, and final amount due. |
| 2 | Punch list completion | To-Do | Subcontractor | Complete all remaining punch list items from the substantial completion walkthrough. Document completion of each item. |
| 3 | Punch list verification | To-Do | Project Manager | Verify that all punch list items have been satisfactorily completed. Document verification with photos. |
| 4 | Closeout documents & sub-tier waivers | File Request | Subcontractor | Upload as-built drawings, warranty documents, O&M manuals, and final sub-tier lien waivers from all lower-tier vendors and suppliers. |
| 5 | Final conditional lien waiver | E-Sign | Subcontractor | Sign the final conditional lien waiver that waives all remaining lien rights including retention. This is effective only upon receipt of final payment. |
| 6 | Owner final approval | Approval | Owner Representative | Approve the final payment including retention release after reviewing all closeout documentation and lien waivers. |
| 7 | Final payment processing | To-Do | Accounts Payable | Process the final payment including all retained funds to the subcontractor. |
| 8 | Final unconditional lien waiver | E-Sign | Subcontractor | Sign the final unconditional lien waiver confirming receipt of all payments including retention. This immediately waives all lien rights. Sign only after funds have cleared. |
| 9 | Retention release confirmation | Acknowledgement | Subcontractor | Acknowledge receipt of all contract funds and confirm the account is fully settled. |

#### Step 1: Final payment application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Final Contract Amount ($) | Number | Yes |
| Total Completed to Date ($) | Number | Yes |
| Total Retainage Held ($) | Number | Yes |
| Final Amount Due Including Retention ($) | Number | Yes |

---

## 4. Submittals & Shop Drawing Approval

**Tags**: Construction | **Complexity**: Standard | **Trigger**: Subcontractor ready to order/fabricate

**Description**: Route submittals and shop drawings through a structured multi-party review with the project manager, architect, engineer, and owner. Keep fabrication on schedule by tracking review status and capturing approval stamps in one place.

**Use Cases**:
- Review structural steel shop drawings before fabrication begins
- Route mechanical equipment submittals through architect and engineer review
- Process finish material submittals for owner color and pattern approval
- Track resubmissions when initial submittals are returned with comments

**Recommendations**:
- Connect to Procore or PlanGrid to auto-log submittal status, sync review comments, and maintain a centralized submittal register
- Integrate with Bluebeam Revu or Autodesk Build to enable markup and annotation directly on shop drawings during the review cycle
- Set up Slack or Teams notifications to alert the architect/engineer when new submittals are uploaded, and notify subcontractors when reviews are complete

**Roles**: Subcontractor, Project Manager, Architect/Engineer, Owner Representative

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Submittal package upload | File Request | Subcontractor | Upload the complete submittal package including shop drawings, product data sheets, material samples (photos), and any required calculations. |
| 2 | PM preliminary review | To-Do | Project Manager | Perform a preliminary review of the submittal package for completeness, correct specification references, and contract compliance before forwarding to the design team. |
| 3 | Architect/Engineer review | To-Do | Architect/Engineer | Review the submittal for conformance with the design intent, specification requirements, and applicable codes. Note any deviations or required revisions. |
| 4 | Review comments | Form | Architect/Engineer | Document your review findings including the review status and any comments or required revisions. |
| 5 | Owner review (if required) | To-Do | Owner Representative | Review the submittal if owner input is required (e.g., finish selections, color choices). Mark as complete if owner review is not needed for this submittal. |
| 6 | Revised submittal (if required) | File Request | Subcontractor | Upload the revised submittal addressing all review comments. If no revisions were required, upload a confirmation noting the original submittal stands. |
| 7 | Final approval | Approval | Architect/Engineer | Grant final approval for the submittal, authorizing the subcontractor to proceed with ordering or fabrication. |
| 8 | Approval acknowledgement | Acknowledgement | Subcontractor | Acknowledge receipt of the submittal approval and any noted conditions before proceeding with fabrication or procurement. |

#### Step 4: Review comments — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Review Status | Dropdown | Yes |
| Review Comments | Text (Multi Line) | Yes |
| Specification Section Reference | Text (Single Line) | No |

---

## 5. RFI (Request for Information) Coordination

**Tags**: Construction | **Complexity**: Simple | **Trigger**: Field question / Design clarification needed

**Description**: Submit and track Requests for Information from the field through architect and engineer review. Eliminate RFI bottlenecks by keeping all parties aligned with clear timelines and documented responses.

**Use Cases**:
- Clarify a structural detail conflict between architectural and structural drawings
- Request confirmation on an acceptable material substitution
- Document a field condition that differs from the design documents
- Get design direction on an unforeseen site condition

**Recommendations**:
- Connect to Procore or PlanGrid to auto-sync RFI numbers, responses, and status into your project RFI log for a single source of truth
- Integrate with your project scheduling tool (Primavera P6, Microsoft Project) to flag schedule impacts when RFI responses are delayed beyond the needed-by date
- Set up Slack or Teams notifications to alert the architect when a new RFI is submitted, and escalate to the project manager if responses exceed the SLA deadline

**Roles**: Contractor, Architect, Engineer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | RFI submission | Form | Contractor | Submit your RFI with a clear description of the question, the affected drawing or specification sections, and the urgency level. |
| 2 | Supporting documentation | File Request | Contractor | Upload any supporting photos, sketches, or marked-up drawings that help illustrate the question or field condition. |
| 3 | Architect review | To-Do | Architect | Review the RFI and supporting documentation. Prepare a response or coordinate with the engineer if the question involves their discipline. |
| 4 | Engineer input (if needed) | To-Do | Engineer | Provide engineering input if the RFI involves structural, mechanical, or other engineering disciplines. Mark as complete if not applicable. |
| 5 | RFI response | File Request | Architect | Upload the formal RFI response including any revised sketches, details, or supplemental instructions for the contractor. |
| 6 | Response acknowledgement | Acknowledgement | Contractor | Acknowledge receipt and understanding of the RFI response. Note any follow-up questions or cost/schedule impacts. |

#### Step 1: RFI submission — Form Fields

| Field | Type | Required |
|-------|------|----------|
| RFI Subject | Text (Single Line) | Yes |
| Affected Drawing / Spec Section | Text (Single Line) | Yes |
| Detailed Question | Text (Multi Line) | Yes |
| Suggested Resolution (if any) | Text (Multi Line) | No |
| Response Needed By | Date | Yes |
| Impact if Delayed | Dropdown | No |

---

## 6. Change Order Approval

**Tags**: Construction | **Complexity**: Standard | **Trigger**: Scope change / Design modification / Unforeseen condition

**Description**: Process change orders from initial request through cost review, architect evaluation, and owner approval to signed execution. Maintain budget control and a clear audit trail for every scope modification on your project.

**Use Cases**:
- Process a change order for unforeseen soil conditions requiring additional foundation work
- Route an owner-requested design modification through pricing and approval
- Document and approve a code-required scope addition identified during inspection
- Handle a material substitution change order due to supply chain delays

**Requirements**:
- [ ] Upload your change order execution document for e-signature (replaces sample)

**Recommendations**:
- Connect to Procore or Autodesk Build to auto-sync approved change orders into the project change log and update the committed cost report
- Integrate with your construction accounting system (Sage 300, Viewpoint Vista) to automatically adjust the contract value and budget when change orders are executed
- Set up Slack or Teams notifications to alert the owner representative when a new change order is submitted, and notify the contractor when approvals or counter-proposals are issued
- Push executed change order documents to DocuSign for e-signature and auto-archive signed copies to the project document management system

**Roles**: Contractor, Project Manager, Architect, Owner Representative

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Change order request | Form | Contractor | Submit the change order request with a description of the scope change, affected specifications, and reason for the modification. |
| 2 | Cost breakdown & backup | File Request | Contractor | Upload the detailed cost breakdown including sub-quotes, material takeoffs, labor estimates, and site photos documenting the condition. |
| 3 | PM review | To-Do | Project Manager | Review the change order request and cost breakdown for completeness, accuracy, and schedule impact. Prepare a recommendation for the owner. |
| 4 | Architect review | To-Do | Architect | Review the change order for design impact, code compliance, and alignment with the project design intent. |
| 5 | Owner negotiation / questions | Form | Owner Representative | Review the change order details and submit any questions, counter-proposals, or negotiation points. |
| 6 | Owner approval | Approval | Owner Representative | Approve the change order after reviewing the cost breakdown, PM recommendation, and architect assessment. |
| 7 | Change order execution | E-Sign | Owner Representative | Sign the change order document to formally authorize the scope change, adjusted contract amount, and any schedule modifications. |
| 8 | Change log update | To-Do | Project Manager | Update the project change log with the approved change order details, revised contract value, and any schedule adjustments. |

#### Step 1: Change order request — Form Fields

| Field | Type | Required |
|-------|------|----------|
| CO Number | Text (Single Line) | Yes |
| Category | Dropdown | Yes |
| Description of Change | Text (Multi Line) | Yes |
| Affected Specifications / Drawings | Text (Multi Line) | Yes |

#### Step 5: Owner negotiation / questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Questions or Comments | Text (Multi Line) | No |
| Counter-Proposal Amount ($) | Number | No |
| Additional Conditions | Text (Multi Line) | No |

---

## 7. Construction Project Closeout

**Tags**: Construction | **Complexity**: Complex | **Trigger**: Substantial completion claimed

**Description**: Guide a construction project from substantial completion through punch list resolution, closeout documentation, owner training, and final payment. Ensure nothing falls through the cracks during the critical final phase of your project.

**Use Cases**:
- Close out a commercial tenant improvement project with multiple trades
- Manage the punch list and turnover process for a new office building
- Coordinate final inspections, documentation, and training for a school construction project
- Process retainage release and final payment after all closeout requirements are met

**Recommendations**:
- Connect to Procore to auto-track punch list items, sync completion status, and generate the closeout documentation checklist from the project setup
- Integrate with your construction accounting system (Sage 300, Viewpoint) to auto-trigger retainage release and final payment processing when closeout approvals are complete
- Push all closeout documents (O&M manuals, as-builts, warranties) to a shared document platform (Box, SharePoint) for owner access and long-term archival
- Set up automated email notifications to the owner and architect when punch list milestones are reached and when the project is officially closed out

**Roles**: GC/Contractor, Architect, Owner

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Substantial completion notification | Form | GC/Contractor | Notify the project team that substantial completion has been reached. Provide the completion date and any known outstanding items. |
| 2 | Architect inspection & punch list | Form | Architect | Conduct a substantial completion inspection and document all punch list items that need to be addressed before final acceptance. |
| 3 | Punch list acknowledgement | Acknowledgement | GC/Contractor | Acknowledge receipt of the punch list and commit to completing all items within the agreed timeframe. |
| 4 | Certificate of Occupancy & permits | File Request | GC/Contractor | Upload the Certificate of Occupancy, final inspection sign-offs, and all required permit close-out documentation. |
| 5 | Punch list completion report | Form | GC/Contractor | Report on the status of all punch list items, documenting completion with dates and descriptions. |
| 6 | Punch list final approval | Approval | Owner | Review the punch list completion report and approve that all items have been satisfactorily resolved. |
| 7 | Closeout documentation | File Request | GC/Contractor | Upload all closeout documents including O&M manuals, warranty information, final lien waivers, and as-built drawings. |
| 8 | Owner training & orientation | To-Do | GC/Contractor | Conduct owner training on building systems, equipment operation, and maintenance procedures. Document the training session and attendees. |
| 9 | Final payment & retainage release | Approval | Owner | Approve the final payment and retainage release after all closeout requirements have been met. |
| 10 | Project closure notification | To-Do | GC/Contractor | Automated notification: Send project closure notifications to all stakeholders confirming the project is officially closed out. |

#### Step 1: Substantial completion notification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Project Name | Text (Single Line) | Yes |
| Substantial Completion Date | Date | Yes |
| Known Outstanding Items | Text (Multi Line) | No |
| Certificate of Occupancy Status | Dropdown | No |

#### Step 2: Architect inspection & punch list — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Inspection Date | Date | Yes |
| Punch List Items | Text (Multi Line) | Yes |
| Total Punch List Items | Number | Yes |
| Critical Items Requiring Immediate Attention | Text (Multi Line) | No |

#### Step 5: Punch list completion report — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Items Completed | Number | Yes |
| Items Remaining (if any) | Number | No |
| Completion Notes | Text (Multi Line) | Yes |
| Completion Date | Date | Yes |

---

## 8. Residential Purchase Transaction

**Tags**: Real Estate, Mortgage, Title | **Complexity**: Complex | **Trigger**: Purchase agreement executed

**Description**: Coordinate a residential real estate purchase from executed agreement through escrow, inspections, loan processing, and closing. Keep buyers, sellers, and agents aligned on contingency deadlines and closing milestones.

**Use Cases**:
- Manage a first-time home buyer purchase with FHA financing
- Coordinate a cash purchase with accelerated closing timeline
- Track contingency removal deadlines for a competitive market purchase
- Facilitate a relocation purchase with remote closing requirements

**Requirements**:
- [ ] Upload your closing/settlement document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your MLS system (Zillow, MLS Grid) to auto-populate property details and purchase terms from the listing data
- Connect to DocuSign or Dotloop to streamline e-signature workflows for disclosures, contingency removals, and closing documents
- Set up automated email and SMS reminders for contingency deadlines, inspection scheduling, and closing date milestones to keep all parties on track
- Integrate with your title company or escrow platform (Qualia, SoftPro) to sync transaction status, document uploads, and funding confirmation in real time

**Roles**: Buyer, Seller, Escrow/Title Agent, Buyer Agent

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Purchase agreement intake | Form | Buyer Agent | Enter the key terms from the executed purchase agreement to initiate the transaction workflow. |
| 2 | Escrow opening & EMD | To-Do | Escrow/Title Agent | Open escrow and confirm receipt of the earnest money deposit. Distribute escrow instructions to all parties. |
| 3 | Title report & seller disclosures | File Request | Seller | Upload the preliminary title report, Transfer Disclosure Statement (TDS), Seller Property Questionnaire (SPQ), Natural Hazard Disclosure (NHD), and lead-based paint disclosure if applicable. |
| 4 | Inspection reports | File Request | Buyer | Upload all inspection reports including general home inspection, pest inspection, and any specialty inspections (roof, sewer, foundation, etc.). |
| 5 | Buyer repair request / contingency removal | Form | Buyer | Submit your response to inspection findings including items accepted as-is, repair requests, and your decision to proceed or cancel. |
| 6 | Appraisal & loan processing | Form | Buyer Agent | Provide an update on the appraisal results and loan processing status. |
| 7 | Contingency removal — appraisal & loan | Acknowledgement | Buyer | Acknowledge removal of appraisal and loan contingencies. Note that your earnest money deposit is now at risk if you fail to close. |
| 8 | Title clearance & closing prep | To-Do | Escrow/Title Agent | Clear all title exceptions, prepare closing documents, and coordinate the signing appointment with all parties. |
| 9 | Final walkthrough | To-Do | Buyer | Conduct the final walkthrough of the property to confirm condition matches expectations and any agreed repairs have been completed. |
| 10 | Closing signing & funding | E-Sign | Buyer | Sign all closing and settlement documents. Funds will be disbursed upon recording. |
| 11 | Recording & key transfer | To-Do | Escrow/Title Agent | Record the deed with the county, confirm funding, and coordinate key transfer to the buyer. |

#### Step 1: Purchase agreement intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Property Address | Text (Single Line) | Yes |
| Purchase Price ($) | Number | Yes |
| Earnest Money Deposit ($) | Number | Yes |
| Loan Type | Dropdown | Yes |
| Contingency Periods (days) | Text (Single Line) | No |
| Close of Escrow Date | Date | Yes |

#### Step 5: Buyer repair request / contingency removal — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Items Accepted As-Is | Text (Multi Line) | No |
| Repair Requests | Text (Multi Line) | No |
| Decision | Dropdown | Yes |

#### Step 6: Appraisal & loan processing — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Appraisal Value ($) | Number | Yes |
| Appraisal Conditions | Text (Multi Line) | No |
| Loan Approval Status | Dropdown | Yes |

---

## 9. Commercial Lease Execution

**Tags**: Commercial Real Estate, Property Management | **Complexity**: Standard | **Trigger**: Lease terms agreed / LOI signed

**Description**: Move a commercial lease from application through credit checks, negotiation, and dual-party execution. Streamline the leasing process so tenants can move in faster with all documentation properly executed.

**Use Cases**:
- Execute a new retail lease in a shopping center
- Process an office lease for a growing startup expanding to a new floor
- Onboard a medical tenant with specialized build-out requirements
- Renew and re-execute a commercial lease with updated terms

**Requirements**:
- [ ] Upload your credit/background check authorization document for e-signature (replaces sample)
- [ ] Upload your lease agreement document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your property management system (Yardi, AppFolio, MRI) to auto-create tenant records and lease abstracts when the lease is fully executed
- Connect to a credit screening service (Experian, TransUnion) to auto-run tenant credit and background checks upon authorization signature
- Push executed lease documents to DocuSign for dual-party e-signature and auto-archive signed copies to your lease management repository
- Set up Slack or email notifications to the property manager when lease milestones are reached (application received, credit approved, lease signed) to coordinate move-in logistics

**Roles**: Tenant, Landlord Representative, Property Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Lease application | Form | Tenant | Complete the lease application with your business information, requested space details, and intended use. |
| 2 | Financial documentation | File Request | Tenant | Upload financial documentation including business tax returns, bank statements, profit & loss statements, and any personal guarantor financials if applicable. |
| 3 | Credit / background check authorization | E-Sign | Tenant | Sign the authorization for the landlord to run credit and background checks on the business and any personal guarantors. |
| 4 | Landlord review | To-Do | Landlord Representative | Review the tenant application, financial documentation, and credit check results. Determine whether to proceed with the lease. |
| 5 | Lease negotiation | Form | Tenant | Review the proposed lease terms and submit any requested modifications or questions. |
| 6 | Lease execution | E-Sign | Tenant | Sign the finalized lease agreement including all exhibits and addenda. |
| 7 | Landlord execution | E-Sign | Landlord Representative | Counter-sign the lease agreement to complete the dual-party execution. |
| 8 | Move-in acknowledgement | Acknowledgement | Property Manager | Acknowledge the executed lease and initiate move-in coordination including key issuance, parking assignments, and building orientation scheduling. |

#### Step 1: Lease application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Business Legal Name | Text (Single Line) | Yes |
| Business Type / Industry | Text (Single Line) | Yes |
| Years in Business | Number | No |
| Requested Space / Suite | Text (Single Line) | Yes |
| Intended Use | Text (Multi Line) | Yes |
| Desired Lease Start Date | Date | Yes |
| Lease Term (months) | Number | Yes |
| Primary Contact Email | Email | Yes |

#### Step 5: Lease negotiation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Proposed Modifications | Text (Multi Line) | No |
| Questions for Landlord | Text (Multi Line) | No |
| Tenant Improvement Requests | Text (Multi Line) | No |

---

## 10. Tenant Move-Out & Security Deposit

**Tags**: Property Management, Residential, Commercial | **Complexity**: Standard | **Trigger**: Move-out notice / Lease end date approaching

**Description**: Manage the tenant move-out process from notice through final inspection, key return, and security deposit accounting. Protect your property and ensure transparent, timely deposit dispositions that comply with local regulations.

**Use Cases**:
- Process a residential tenant move-out at lease expiration
- Handle an early lease termination with required notice period
- Manage a commercial tenant move-out with restoration requirements
- Document property condition and calculate deposit deductions transparently

**Recommendations**:
- Integrate with your property management system (Yardi, AppFolio, Buildium) to auto-update unit availability, close out the tenant ledger, and trigger deposit disposition processing
- Connect to your accounting software (QuickBooks, Sage) to auto-generate the security deposit accounting statement and issue refund checks or ACH transfers
- Set up automated email reminders to the tenant for move-out checklist deadlines, key return, and utility transfer cutoff dates
- Push completed inspection reports and deposit disposition documents to your document management system for compliance archival and audit readiness

**Roles**: Tenant, Property Manager, Maintenance, Accounting

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Move-out notice | Form | Tenant | Submit your formal move-out notice with the intended move-out date and forwarding address for deposit return. |
| 2 | Pre-move-out inspection | To-Do | Property Manager | Schedule and conduct a pre-move-out inspection with the tenant. Document the current condition and identify any items requiring attention before move-out. |
| 3 | Move-out checklist | Acknowledgement | Tenant | Acknowledge receipt of the move-out checklist including cleaning requirements, key return instructions, and utility transfer deadlines. |
| 4 | Key return acknowledgement | Acknowledgement | Tenant | Confirm that all keys, access cards, and remote controls have been returned to the property management office. |
| 5 | Final inspection | To-Do | Maintenance | Conduct the final move-out inspection. Document the condition of each room, note any damage beyond normal wear and tear, and estimate repair costs. |
| 6 | Final inspection report | File Request | Property Manager | Upload the completed final inspection report including photos, condition notes, and any estimated repair or cleaning costs. |
| 7 | Deposit accounting | To-Do | Accounting | Prepare the security deposit accounting statement itemizing any deductions for damages, unpaid rent, or cleaning charges. Calculate the refund amount. |
| 8 | Deposit disposition acknowledgement | Acknowledgement | Tenant | Acknowledge receipt of the security deposit disposition statement and any refund issued. |

#### Step 1: Move-out notice — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Unit / Suite Number | Text (Single Line) | Yes |
| Intended Move-Out Date | Date | Yes |
| Reason for Move-Out | Dropdown | No |
| Forwarding Address | Text (Multi Line) | Yes |
| Forwarding Email | Email | Yes |
