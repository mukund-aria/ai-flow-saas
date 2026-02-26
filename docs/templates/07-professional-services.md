# Professional Services (6 Templates)

> Workflow templates for professional services firms including consulting engagements, deliverable management, go-live coordination, service requests, scope changes, and tax preparation.

---

## 1. Engagement Kickoff & Scope Confirmation

**Tags**: Professional Services, Consulting, SaaS | **Complexity**: Simple | **Trigger**: Contract signed / project start

**Description**: Streamline the transition from sales to delivery with a structured handoff, stakeholder alignment, and project plan sign-off. Ensures nothing falls through the cracks between deal close and project start.

**Use Cases**:
- SaaS implementation kickoff after contract execution
- Consulting engagement handoff from business development to delivery team
- Professional services project initiation with client stakeholder alignment
- Technology deployment kickoff requiring environment provisioning

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your CRM (Salesforce, HubSpot) to auto-populate deal details in the sales-to-delivery handoff form
- Integrate with your PSA tool (ConnectWise, Autotask) to auto-create the project and sync milestones once the plan is approved
- Use AI to auto-analyze the pre-kickoff requirements and generate a draft project plan with milestones, risk flags, and resource recommendations based on similar past engagements
- Chain with the Deliverable Review & Client Approval template when the first project milestone is ready for client review

**Roles**: Client Sponsor, Implementation Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Handoff & Discovery** | | | |
| 1 | Sales-to-delivery handoff | Form | Implementation Lead | Complete the handoff form capturing key deal details so the delivery team has full context before engaging the client. |
| 2 | Customer stakeholder identification | Form | Client Sponsor | Identify the key stakeholders from your organization who will be involved in the implementation. |
| 3 | Pre-kickoff requirements | Form | Client Sponsor | Provide details about your current environment and any requirements that will shape the implementation plan. |
| | **📌 Planning & Approval** | | | |
| 4 | Project plan creation | To-Do | Implementation Lead | Create the project plan incorporating the handoff details, stakeholder input, and pre-kickoff requirements. Include milestones, timelines, and resource assignments. |
| 5 | Project plan approval | Approval | Client Sponsor | Review the proposed project plan including milestones, timelines, and resource commitments. Approve to proceed or request changes. |
| | **📌 Provisioning & Launch** | | | |
| 6 | Environment provisioning | To-Do | Implementation Lead | Provision the client environment including user accounts, sandbox setup, and any required infrastructure configuration. |
| 7 | Kickoff acknowledgement | Acknowledgement | Client Sponsor | Acknowledge that the engagement has officially kicked off and confirm your understanding of the project plan, timeline, and next steps. |

#### Step 1: Sales-to-delivery handoff — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Deal Summary | TEXT_MULTI_LINE | Yes |
| Contract Terms | TEXT_MULTI_LINE | Yes |
| Modules / Products Purchased | TEXT_MULTI_LINE | Yes |
| Key Stakeholders | TEXT_MULTI_LINE | Yes |
| Go-Live Target Date | DATE | Yes |

#### Step 2: Customer stakeholder identification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Executive Sponsor Name | TEXT_SINGLE_LINE | Yes |
| Executive Sponsor Email | EMAIL | Yes |
| Project Lead Name | TEXT_SINGLE_LINE | Yes |
| Project Lead Email | EMAIL | Yes |
| Additional Team Members | TEXT_MULTI_LINE | No |

#### Step 3: Pre-kickoff requirements — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Current Systems in Use | TEXT_MULTI_LINE | Yes |
| Data Migration Scope | TEXT_MULTI_LINE | No |
| Required Integrations | TEXT_MULTI_LINE | No |
| Known Blockers or Constraints | TEXT_MULTI_LINE | No |

---

## 2. Deliverable Review & Client Approval

**Tags**: Professional Services, Creative, Consulting | **Complexity**: Simple | **Trigger**: Deliverable ready for client review

**Description**: Manage the end-to-end deliverable review cycle from initial upload through client feedback, revision, and final approval. Keeps creative and consulting teams aligned with client expectations.

**Use Cases**:
- Design agency submitting creative assets for client review and approval
- Consulting firm delivering strategy documents requiring client sign-off
- Development team presenting completed sprint deliverables for acceptance
- Marketing agency routing campaign materials through client approval

**Recommendations**:
- Connect to Google Drive or SharePoint to auto-archive approved deliverables and maintain version history
- Integrate with your project management tool (Asana, Monday.com, Jira) to auto-update task status when deliverables are approved
- Use AI to auto-summarize deliverable feedback from multiple reviewers into a consolidated action list with priority ranking for the service owner
- Chain with the Change Request / Scope Change template when client feedback requires work beyond the original engagement scope

**Roles**: Service Owner, Client Reviewer, Client Approver

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Deliverable upload | File Request | Service Owner | Upload the completed deliverable for client review. Include any supporting documentation or context notes. |
| 2 | Client review | To-Do | Client Reviewer | Review the uploaded deliverable against the agreed scope and requirements. Note any feedback or revision requests. |
| 3 | Feedback / revision requests | Form | Client Reviewer | Provide your feedback on the deliverable including any specific revision requests or areas that need attention. |
| 4 | Revised deliverable | File Request | Service Owner | Upload the revised deliverable incorporating the client feedback. Include a summary of changes made. |
| 5 | Final approval | Approval | Client Approver | Review the final deliverable and approve for acceptance. This confirms the deliverable meets all agreed requirements. |
| 6 | Completion acknowledgement | Acknowledgement | Service Owner | Acknowledge that the deliverable has been approved and the review cycle is complete. Archive the final version for project records. |

#### Step 3: Feedback / revision requests — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Overall Assessment | DROPDOWN | Yes |
| Detailed Feedback | TEXT_MULTI_LINE | Yes |
| Specific Revision Requests | TEXT_MULTI_LINE | No |

---

## 3. Go-Live / Launch Readiness

**Tags**: SaaS, Technology | **Complexity**: Standard | **Trigger**: All implementation milestones complete

**Description**: Coordinate the full go-live process from readiness assessment through production cutover and hypercare transition. Ensures all stakeholders confirm readiness before flipping the switch.

**Use Cases**:
- SaaS platform go-live after completing all implementation milestones
- Enterprise system cutover requiring multi-team readiness verification
- Technology migration launch with UAT sign-off and rollback planning
- Product launch readiness coordination across engineering and client teams

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your monitoring platform (Datadog, PagerDuty, New Relic) to auto-trigger post-cutover verification checks and escalate failures
- Integrate with your PSA tool (ConnectWise, Autotask) to auto-transition the project from implementation to hypercare support phase
- Use AI to auto-score go-live readiness by analyzing the assessment form, open defects, and training completion against historical go-live success benchmarks
- Chain with the Client Service Request Fulfillment template during the hypercare period so post-go-live issues are tracked in a structured workflow

**Roles**: Client Sponsor, Implementation Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Readiness Assessment** | | | |
| 1 | Go-live readiness assessment | Form | Implementation Lead | Complete the readiness assessment confirming the status of all go-live prerequisites. |
| 2 | UAT sign-off | File Request | Client Sponsor | Upload the signed UAT completion document including the test summary and list of accepted known issues. |
| 3 | Technical readiness certification | Approval | Implementation Lead | Certify that all technical prerequisites for go-live have been met including infrastructure, integrations, and performance benchmarks. |
| | **📌 Go/No-Go Decision** | | | |
| 4 | Go/No-Go decision | Decision | Implementation Lead | Make the go/no-go decision based on the readiness assessment, UAT results, and technical certification. Choose Go, Go with Conditions, or Postpone. |
| 5 | Client go-live authorization | Approval | Client Sponsor | Authorize the production cutover to proceed. This is the final client approval before go-live execution. |
| | **📌 Cutover & Verification** | | | |
| 6 | Production cutover execution | To-Do | Implementation Lead | Execute the production cutover plan including DNS changes, data migration finalization, and system activation. |
| 7 | Post-cutover verification | Form | Implementation Lead | Verify that all critical flows are working correctly in the production environment after cutover. |
| | **📌 Hypercare Transition** | | | |
| 8 | Go-live acknowledgement | Acknowledgement | Client Sponsor | Acknowledge that the system is live in production and confirm your understanding of the hypercare support period and escalation procedures. |
| 9 | Hypercare exit & steady-state transition | Approval | Client Sponsor | Approve the transition from hypercare to steady-state support. Confirm that all post-go-live issues have been resolved and the system is operating as expected. |

#### Step 1: Go-live readiness assessment — Form Fields

| Field | Type | Required |
|-------|------|----------|
| All Milestones Signed Off | DROPDOWN | Yes |
| Open Defects Summary | TEXT_MULTI_LINE | Yes |
| Data Migration Status | DROPDOWN | Yes |
| Training Completion % | NUMBER | Yes |

#### Step 7: Post-cutover verification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| User Login Flow | DROPDOWN | Yes |
| Data Integration Flow | DROPDOWN | Yes |
| Core Business Process Flow | DROPDOWN | Yes |
| Reporting / Analytics Flow | DROPDOWN | Yes |
| Additional Notes | TEXT_MULTI_LINE | No |

---

## 4. Client Service Request Fulfillment

**Tags**: Professional Services, Managed Services | **Complexity**: Simple | **Trigger**: Client submits service request

**Description**: Handle client service requests from intake through fulfillment with structured review and approval. Provides a consistent process for any ad hoc service delivery.

**Use Cases**:
- Managed services team handling client configuration change requests
- Consulting firm processing ad hoc advisory service requests
- IT services provider fulfilling client support escalations
- Accounting firm handling client requests for special reports or analyses

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your PSA tool (ConnectWise, Autotask) or ticketing system (ServiceNow, Freshdesk) to auto-create service tickets from intake submissions
- Integrate with your billing system to auto-log billable hours and associate completed work with the client account
- Use AI to auto-categorize and prioritize incoming service requests based on request description, client SLA tier, and historical resolution patterns
- Chain with the Change Request / Scope Change template when a service request is determined to exceed the contracted service scope

**Roles**: Client Requestor, Service Owner, Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Service request intake | Form | Client Requestor | Submit your service request with enough detail for the team to understand and scope the work. |
| 2 | Clarification questions | Form | Client Requestor | Answer the clarification questions from the service team to help scope and prioritize your request. |
| 3 | Required inputs / documents | File Request | Client Requestor | Upload any documents, files, or reference materials needed to complete the service request. |
| 4 | Work execution | To-Do | Service Owner | Complete the service request according to the intake details and client-provided materials. Document any decisions or deviations. |
| 5 | Manager review | Approval | Manager | Review the completed work for quality and completeness before delivering to the client. |
| 6 | Deliverable acknowledgement | Acknowledgement | Client Requestor | Acknowledge receipt of the completed service request deliverable and confirm it meets your requirements. |

#### Step 1: Service request intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Request Title | TEXT_SINGLE_LINE | Yes |
| Request Description | TEXT_MULTI_LINE | Yes |
| Priority | DROPDOWN | Yes |
| Desired Completion Date | DATE | No |

#### Step 2: Clarification questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Additional Context | TEXT_MULTI_LINE | Yes |
| Impacted Users or Systems | TEXT_MULTI_LINE | No |
| Any Known Constraints | TEXT_MULTI_LINE | No |

---

## 5. Change Request / Scope Change

**Tags**: Professional Services, Consulting, IT Services | **Complexity**: Simple | **Trigger**: Client requests scope change

**Description**: Manage scope change requests with impact assessment, cost acknowledgement, and formal SOW amendment. Keeps project scope under control while providing a clear path for necessary changes.

**Use Cases**:
- Consulting client requesting additional deliverables mid-engagement
- IT services project scope expansion requiring budget adjustment
- Professional services engagement adding new workstreams
- Software implementation project requiring feature additions beyond original scope

**Requirements**:
- [ ] Upload your SOW amendment document for e-signature (replaces sample)

**Recommendations**:
- Integrate with DocuSign or Adobe Sign to streamline the SOW amendment e-signature process with audit trail
- Connect to your PSA tool (ConnectWise, Autotask) to auto-update project scope, budget, and timeline when the change is approved
- Use AI to auto-generate the impact assessment draft by analyzing the change request against the current project plan, resource utilization, and budget remaining
- Chain with the Deliverable Review & Client Approval template when the approved scope change produces a new deliverable requiring client sign-off

**Roles**: Client Requestor, Engagement Manager, Approver

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Change request details | Form | Client Requestor | Describe the requested change in detail so the team can assess impact on timeline, budget, and resources. |
| 2 | Impact assessment | File Request | Engagement Manager | Upload the impact assessment document covering timeline, cost, and resource implications of the requested change. |
| 3 | Cost / timeline acknowledgement | Acknowledgement | Client Requestor | Review and acknowledge the impact assessment including any changes to cost, timeline, or resource allocation resulting from this scope change. |
| 4 | Change approval | Approval | Approver | Review the change request and impact assessment. Approve to proceed with the scope change and SOW amendment. |
| 5 | SOW amendment | E-Sign | Client Requestor | Review and sign the Statement of Work amendment reflecting the approved scope change, updated timeline, and revised budget. |
| 6 | Change confirmation | Acknowledgement | Client Requestor | Acknowledge that the scope change has been formally approved and the SOW has been amended. Work on the change will begin according to the updated plan. |

#### Step 1: Change request details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Change Request Title | TEXT_SINGLE_LINE | Yes |
| Description of Requested Change | TEXT_MULTI_LINE | Yes |
| Business Justification | TEXT_MULTI_LINE | Yes |
| Desired Timeline | TEXT_SINGLE_LINE | No |

---

## 6. Tax Return Preparation Coordination

**Tags**: Accounting, Tax, Financial Services | **Complexity**: Complex | **Trigger**: Tax season / engagement letter signed

**Description**: Coordinate the full tax return preparation lifecycle from engagement letter through document collection, preparation, review, and e-file authorization. Keeps clients and preparers aligned throughout tax season.

**Use Cases**:
- CPA firm coordinating individual tax return preparation with clients
- Accounting practice managing business tax return document collection
- Tax advisory firm handling complex multi-entity return preparation
- Seasonal tax preparation with high-volume client document intake

**Requirements**:
- [ ] Upload your engagement letter document for e-signature (replaces sample)
- [ ] Upload your e-file authorization document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your practice management system (CCH Axcess, Lacerte, Drake) to auto-create the tax engagement and sync client data
- Integrate with a secure document portal (SmartVault, ShareFile) for encrypted tax document collection and delivery
- Use AI to auto-scan uploaded income and deduction documents, extract key figures (W-2 wages, 1099 amounts, mortgage interest), and flag missing documents against the prior year return
- Schedule annual auto-launch for each client 90 days before their filing deadline based on entity type (April 15 for individuals, March 15 for partnerships/S-corps)

**Roles**: Client/Taxpayer, Tax Preparer, Tax Reviewer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Engagement & Intake** | | | |
| 1 | Engagement letter | E-Sign | Client/Taxpayer | Review and sign the engagement letter outlining the scope of tax preparation services, fees, and responsibilities. |
| 2 | Tax organizer questionnaire | Form | Client/Taxpayer | Complete the tax organizer questionnaire to help your preparer understand your tax situation for the current year. |
| | **📌 Document Collection** | | | |
| 3 | Income documents upload | File Request | Client/Taxpayer | Upload all income-related documents including W-2s, 1099s, K-1s, and SSA-1099 forms. |
| 4 | Deduction & credit documents | File Request | Client/Taxpayer | Upload documents supporting deductions and credits including 1098 mortgage interest, property tax statements, charitable contribution receipts, medical expenses, and education expenses. |
| 5 | Prior year returns (if new client) | File Request | Client/Taxpayer | If you are a new client, please upload your prior year federal and state tax returns for reference. |
| 6 | Missing document follow-up | Form | Client/Taxpayer | Respond to any follow-up questions about missing or unclear documents identified during the initial review. |
| | **📌 Preparation & Review** | | | |
| 7 | Preparer review | To-Do | Tax Preparer | Review all submitted documents, prepare the tax return, and identify any issues or optimization opportunities for the client. |
| 8 | Partner / manager review | To-Do | Tax Reviewer | Perform quality review of the prepared tax return. Verify calculations, check for missed deductions, and ensure compliance with current tax law. |
| | **📌 Delivery & Filing** | | | |
| 9 | Draft return delivery | File Request | Tax Preparer | Upload the draft tax return for client review. Include a summary of key figures and any items requiring client attention. |
| 10 | Client approval & e-file authorization | E-Sign | Client/Taxpayer | Review the draft return, confirm all information is accurate, and sign the e-file authorization to allow electronic filing. |

#### Step 2: Tax organizer questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Filing Type | DROPDOWN | Yes |
| Life Changes This Year | TEXT_MULTI_LINE | No |
| Income Sources | TEXT_MULTI_LINE | Yes |
| Deductions & Credits to Claim | TEXT_MULTI_LINE | No |

#### Step 6: Missing document follow-up — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Missing Document Status | TEXT_MULTI_LINE | Yes |
| Additional Information | TEXT_MULTI_LINE | No |
