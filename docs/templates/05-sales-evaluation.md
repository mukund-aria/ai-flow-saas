# Sales & Evaluation (5 Templates)

> Structured workflows for managing product trials, enterprise pilots, proposal delivery, and RFP response coordination. Designed to keep prospects engaged, sales teams aligned, and evaluation processes on track from first contact through contract execution.

---

## 1. Guided Product Trial

**Tags**: SaaS, Technology | **Complexity**: Standard | **Trigger**: Prospect requests structured trial

**Description**: Run structured product trials from registration through mid-trial check-in and conversion decision. Keeps prospects engaged with guided milestones while giving sales reps clear signals on trial health and buying intent.

**Use Cases**:
- SaaS prospect evaluating project management software for their team
- Mid-market company trialing a new CRM before annual contract commitment
- IT department testing a security tool with a limited pilot group
- Startup evaluating analytics platform with free-trial-to-paid conversion path

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your CRM (HubSpot, Salesforce) to auto-create a trial opportunity and sync engagement data as the prospect progresses through milestones
- Integrate with your product analytics platform (Mixpanel, Amplitude, Pendo) to pull real-time usage metrics into the mid-trial check-in step
- Use AI to analyze mid-trial survey responses and usage data to auto-generate a personalized demo agenda focused on the prospect's underexplored features and stated blockers
- Chain with the Proposal & SOW Delivery template when the trial outcome decision is "convert" to seamlessly transition into contract execution

**Roles**: Prospect, Sales Rep

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Trial Setup** | | | |
| 1 | Trial registration form | Form | Prospect | Complete your trial registration so we can tailor the experience to your needs. Tell us about your company, team, and what you hope to achieve during the trial. |
| 2 | Trial environment setup | To-Do | Sales Rep | Provision the trial environment, configure it for the prospect's use case, and prepare onboarding materials. Send access credentials and getting-started guide. |
| 3 | Trial plan acknowledgement | Acknowledgement | Prospect | Review and acknowledge the trial plan including timeline, key milestones, and support resources available during your evaluation period. |
| | **📌 Evaluation & Check-in** | | | |
| 4 | Mid-trial check-in survey | Form | Prospect | Share your trial experience so far. This helps us understand what's working, identify any blockers, and tailor the remaining trial period to your needs. |
| 5 | Guided demo of advanced features | To-Do | Sales Rep | Conduct a personalized demo of advanced features based on the prospect's mid-trial feedback. Address blockers and showcase capabilities aligned with their goals. |
| | **📌 Conversion** | | | |
| 6 | Trial outcome decision | Decision | Sales Rep | Evaluate the prospect's engagement and trial outcomes. Decide whether to convert to a paid plan, extend the trial for further evaluation, or close the opportunity. |
| 7 | Proposal delivery | File Request | Sales Rep | Upload the customized proposal based on the prospect's trial usage and requirements. Include pricing, implementation timeline, and support terms. |
| 8 | Proposal sign-off | Approval | Prospect | Review the proposal and confirm you'd like to proceed. If you have questions or need adjustments, use this step to request changes before signing. |

#### Step 1: Trial registration form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text (Single Line) | Yes |
| Industry | Text (Single Line) | Yes |
| Team Size | Number | Yes |
| Primary Use Case | Text (Multi Line) | Yes |
| Current Tools | Text (Single Line) | No |
| Goals for This Trial | Text (Multi Line) | Yes |

#### Step 4: Mid-trial check-in survey — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Which features have you explored? | Text (Multi Line) | Yes |
| Any blockers or challenges? | Text (Multi Line) | No |
| Overall Satisfaction | Dropdown | Yes |
| Integration needs? | Text (Multi Line) | No |

---

## 2. Pilot Program Evaluation

**Tags**: Technology, Enterprise SaaS | **Complexity**: Complex | **Trigger**: Enterprise prospect requests pilot

**Description**: Manage enterprise pilot programs from scoping success criteria through mid-pilot reviews, data-driven evaluation, and final contract execution. Provides structured governance so both vendor and prospect stay aligned on outcomes.

**Use Cases**:
- Enterprise evaluating a new collaboration platform across multiple business units
- Healthcare system piloting an EHR integration with a department-level rollout
- Financial institution testing a compliance automation tool before enterprise deployment
- Manufacturing company piloting IoT analytics with a single facility

**Requirements**:
- [ ] Upload your contract document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to Salesforce to auto-update the opportunity stage as the pilot moves through scoping, mid-review, and go/no-go decision milestones
- Integrate with your product analytics dashboard to auto-populate mid-pilot status review forms with actual adoption and usage metrics
- Use AI to generate the evaluation report by comparing actual pilot metrics against defined success criteria and quantifying business impact with a data-driven go/no-go recommendation
- Chain with the Quarterly Business Review (QBR) template after go-live to establish an ongoing success measurement cadence with the new customer

**Roles**: Prospect Sponsor, Pilot Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Scoping & Setup** | | | |
| 1 | Pilot scope & objectives form | Form | Prospect Sponsor | Define the pilot scope including which business unit will participate, the evaluation timeline, user count, and the specific success metrics and KPIs you'll measure. |
| 2 | Success criteria sign-off | Acknowledgement | Prospect Sponsor | Review and confirm the agreed-upon success criteria, evaluation methodology, and pilot timeline before the pilot begins. |
| 3 | Technical environment setup | To-Do | Pilot Lead | Set up the pilot environment including infrastructure provisioning, user accounts, SSO integration, data migration (if applicable), and monitoring dashboards. |
| | **📌 Active Pilot** | | | |
| 4 | Pilot kickoff acknowledgement | Acknowledgement | Prospect Sponsor | Acknowledge the pilot kickoff, confirm that pilot users have access, and note the support escalation path and scheduled check-in cadence. |
| 5 | Mid-pilot status review | Form | Prospect Sponsor | Provide a mid-pilot status update on adoption, user feedback, and any issues encountered. This helps the team adjust course if needed. |
| 6 | Steering committee decision | Approval | Prospect Sponsor | Based on mid-pilot results, decide whether to continue the pilot as planned, adjust scope or timeline, or terminate the pilot early. |
| | **📌 Evaluation & Decision** | | | |
| 7 | Final pilot data collection | File Request | Prospect Sponsor | Upload final pilot data including usage reports, user survey results, performance metrics, and any internal evaluation documents. |
| 8 | AI evaluation report | To-Do | Pilot Lead | AI-powered: Generate a comprehensive evaluation report comparing actual results against success criteria, quantifying business impact, and providing a data-driven recommendation for the go/no-go decision. |
| 9 | Go/No-Go decision | Decision | Prospect Sponsor | Make the final go/no-go decision on enterprise rollout based on the pilot evaluation report, business impact analysis, and organizational readiness. |
| | **📌 Contract Execution** | | | |
| 10 | Final contract sign-off | E-Sign | Prospect Sponsor | Review and electronically sign the enterprise contract to proceed from pilot to full deployment. |

#### Step 1: Pilot scope & objectives form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Business Unit | Text (Single Line) | Yes |
| Pilot Duration | Dropdown | Yes |
| Number of Pilot Users | Number | Yes |
| Success Metrics / KPIs | Text (Multi Line) | Yes |
| Key Business Outcomes Expected | Text (Multi Line) | Yes |

#### Step 5: Mid-pilot status review — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Active Users | Number | Yes |
| Issues Encountered | Text (Multi Line) | No |
| Overall Sentiment | Dropdown | Yes |
| Risks or Concerns | Text (Multi Line) | No |

---

## 3. AI Pilot Evaluation

**Tags**: Technology, Enterprise, Cross-industry | **Complexity**: Standard | **Trigger**: AI tool/platform selected for evaluation

**Description**: Evaluate AI tools and platforms with built-in security review, data privacy sign-off, and structured user feedback collection. Ensures responsible AI adoption with quantified results and risk assessment before enterprise rollout.

**Use Cases**:
- Marketing team evaluating a generative AI content creation platform
- Customer support department piloting an AI chatbot for tier-1 tickets
- Legal department testing AI contract review and analysis software
- Engineering team evaluating AI code assistant tools for developer productivity

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your IT asset management or vendor risk management platform (ServiceNow, OneTrust) to auto-register the AI tool and track its risk classification
- Use AI to aggregate and analyze mid-pilot feedback surveys, calculating accuracy scores, time-saved estimates, and sentiment trends to auto-draft the final evaluation report
- Push final evaluation reports and approval records to your GRC platform for enterprise AI governance audit trail
- Chain with the Vendor Security Assessment template to run a full security review before any AI tool handling sensitive data enters the pilot phase

**Roles**: Business Sponsor, AI Lead, IT Security, Data Privacy Officer, Pilot Users

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Request & Security Review** | | | |
| 1 | AI pilot request | Form | Business Sponsor | Submit the AI pilot request with details about the tool, intended use case, data requirements, and success metrics for evaluation. |
| 2 | IT security & data privacy review | To-Do | IT Security | Review the AI tool's data handling practices, model hosting infrastructure, access controls, and PII/PHI exposure risk. Document findings and any required mitigations. |
| 3 | Data privacy sign-off | Approval | Data Privacy Officer | Review the IT security assessment and approve the AI pilot from a data privacy perspective. Ensure compliance with applicable privacy regulations (GDPR, CCPA, etc.). |
| | **📌 Active Pilot** | | | |
| 4 | Pilot environment setup | To-Do | AI Lead | Set up the pilot environment including sandbox configuration, test data preparation, user provisioning, and guardrails for responsible AI use. |
| 5 | Pilot kickoff acknowledgement | Acknowledgement | Pilot Users | Acknowledge the pilot kickoff, review the acceptable use guidelines, and confirm you understand the evaluation timeline and feedback expectations. |
| 6 | Mid-pilot feedback survey | Form | Pilot Users | Share your experience using the AI tool so far. Your feedback on accuracy, usability, and time savings is critical for the evaluation. |
| | **📌 Evaluation & Rollout Decision** | | | |
| 7 | Final results & risk assessment | File Request | AI Lead | Upload the final evaluation report including quantified results vs. success metrics, hallucination rate analysis, bias findings, cost analysis, and risk assessment. |
| 8 | Go/No-Go decision | Decision | Business Sponsor | Based on the evaluation report, decide whether to scale the AI tool to the enterprise, extend the pilot for additional evaluation, or terminate the engagement. |
| 9 | Enterprise rollout approval | Approval | Business Sponsor | Provide final approval to proceed with enterprise-wide rollout of the AI tool, including budget authorization and implementation timeline sign-off. |

#### Step 1: AI pilot request — Form Fields

| Field | Type | Required |
|-------|------|----------|
| AI Tool / Vendor Name | Text (Single Line) | Yes |
| Use Case Description | Text (Multi Line) | Yes |
| Data Types Involved | Text (Multi Line) | Yes |
| Number of Pilot Users | Number | Yes |
| Success Metrics | Text (Multi Line) | Yes |
| Estimated Budget | Number | No |

#### Step 6: Mid-pilot feedback survey — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Accuracy of AI Outputs | Dropdown | Yes |
| Ease of Use | Dropdown | Yes |
| Estimated Time Saved per Week | Number | No |
| Concerns or Edge Cases | Text (Multi Line) | No |

---

## 4. Proposal & SOW Delivery

**Tags**: Cross-industry B2B | **Complexity**: Standard | **Trigger**: Post-discovery / qualification

**Description**: Deliver proposals and statements of work from internal drafting through client review, Q&A, and e-signature. Creates a professional, trackable process that shortens sales cycles and ensures nothing falls through the cracks.

**Use Cases**:
- SaaS vendor sending a multi-year enterprise proposal after discovery calls
- Consulting firm delivering a SOW for a digital transformation engagement
- Marketing agency proposing a retainer-based services agreement
- IT services company submitting a managed services proposal to a mid-market client

**Requirements**:
- [ ] Upload your SOW document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your CRM (Salesforce, HubSpot) to auto-update the deal stage and log proposal delivery, Q&A, and sign-off events on the opportunity timeline
- Integrate with DocuSign or Adobe Sign for the SOW e-signature step to provide a legally binding, tamper-evident signing experience
- Use AI to draft personalized Q&A responses by analyzing the client's submitted questions against the proposal terms, pricing model, and prior deal context
- Chain with the Engagement Kickoff template upon SOW signature to seamlessly hand off from sales to the delivery team with full context

**Roles**: Client Prospect, Sales Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Internal Preparation** | | | |
| 1 | Proposal request details | Form | Sales Lead | Capture the key details needed to draft the proposal including client information, opportunity value, product scope, and specific requirements. |
| 2 | Draft proposal & SOW upload | File Request | Sales Lead | Upload the draft proposal and statement of work for internal review before sending to the client. |
| 3 | Internal review & approval | Approval | Sales Lead | Review the proposal and SOW for accuracy, pricing alignment, and compliance with company policies. Approve to release to the client. |
| 4 | Proposal delivery | To-Do | Sales Lead | Automated notification: Send the approved proposal and SOW to the client prospect with a personalized cover message highlighting key value points. |
| | **📌 Client Review & Negotiation** | | | |
| 5 | Client Q&A submission | Form | Client Prospect | Review the proposal and submit any questions, concerns, or requested modifications. We want to make sure every detail meets your expectations. |
| 6 | Revised terms / Q&A response | File Request | Sales Lead | Upload the revised proposal addressing the client's questions and requested changes, or a written Q&A response document. |
| 7 | Client final review | Approval | Client Prospect | Review the final proposal and confirm you are satisfied with the terms, pricing, and scope. Approve to proceed to contract signing. |
| | **📌 Execution & Handoff** | | | |
| 8 | SOW e-signature | E-Sign | Client Prospect | Review and electronically sign the statement of work to formally engage and kick off the project. |
| 9 | Handoff to delivery team | To-Do | Sales Lead | Complete the internal handoff to the delivery team including signed SOW, client requirements, key contacts, and any special agreements or commitments made during the sales process. |

#### Step 1: Proposal request details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Client / Company Name | Text (Single Line) | Yes |
| Opportunity Value | Number | Yes |
| Products / Services | Text (Multi Line) | Yes |
| Contract Term | Dropdown | Yes |
| Specific Requirements or Notes | Text (Multi Line) | No |

#### Step 5: Client Q&A submission — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Questions or Feedback | Text (Multi Line) | Yes |
| Requested Changes | Text (Multi Line) | No |

---

## 5. RFP Response Coordination

**Tags**: Cross-industry, Government, Enterprise | **Complexity**: Complex | **Trigger**: RFP received from prospect

**Description**: Coordinate multi-stakeholder RFP responses from intake and go/no-go evaluation through SME contributions, quality review, and executive sign-off. Keeps complex proposal efforts on track with clear ownership and deadlines.

**Use Cases**:
- Government agency RFP requiring cross-departmental technical and pricing inputs
- Enterprise software RFP with security, compliance, and integration requirements
- Healthcare system RFP for a multi-year services and technology contract
- Financial institution RFP for managed IT services with strict SLA requirements

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your CRM to auto-log the RFP opportunity, track go/no-go decisions, and update deal stage as the response progresses through review and submission
- Connect to a content library or proposal management tool (Loopio, Responsive, Qvidian) to help SMEs pull pre-approved answers for common RFP requirements
- Use AI to parse the uploaded RFP document, extract and categorize each requirement by functional area, and auto-generate the SME assignment matrix with section-level deadlines
- Chain with the Proposal & SOW Delivery template when the RFP is awarded to move directly into formal contract execution

**Roles**: Proposal Lead, SMEs, Executive Sponsor

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Intake & Assessment** | | | |
| 1 | RFP intake & details | Form | Proposal Lead | Log the RFP details including the issuing organization, submission deadline, estimated deal value, and evaluation criteria. |
| 2 | RFP document upload | File Request | Proposal Lead | Upload the complete RFP document and any attachments, addenda, or Q&A responses from the issuing organization. |
| 3 | Go/No-Go evaluation | Decision | Proposal Lead | Evaluate whether to pursue this RFP based on solution fit, estimated win probability, required resources, and strategic value. Document the rationale for the decision. |
| 4 | AI RFP requirements analysis | To-Do | Proposal Lead | AI-powered: Parse the RFP requirements, categorize them by department or functional area, and create an assignment matrix mapping each requirement to the appropriate SME. |
| | **📌 Response Development** | | | |
| 5 | Response kickoff & assignments | Form | Proposal Lead | Assign RFP sections to subject matter experts and set internal deadlines for each section submission. |
| 6 | SME section inputs | File Request | SMEs | Upload your completed section(s) of the RFP response. Ensure all requirements in your assigned sections are addressed with specific, evidence-backed answers. |
| 7 | Pricing & commercial terms | File Request | Proposal Lead | Upload the pricing model and commercial terms for the RFP response, including cost breakdown, payment terms, and any volume or term discounts. |
| | **📌 Review & Submission** | | | |
| 8 | Internal review & quality check | Approval | Proposal Lead | Review the assembled RFP response for completeness, consistency, compliance with RFP requirements, and quality of writing. Approve to send for executive review. |
| 9 | Executive sign-off | Approval | Executive Sponsor | Review the final RFP response and authorize submission. Confirm pricing, strategic commitments, and any exceptions or assumptions noted in the response. |
| 10 | Submission confirmation | To-Do | Proposal Lead | Submit the RFP response through the required channel (portal, email, physical delivery) and confirm receipt. Archive the final submitted version for records. |

#### Step 1: RFP intake & details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Issuing Organization | Text (Single Line) | Yes |
| Submission Deadline | Date | Yes |
| Estimated Deal Value | Number | No |
| Evaluation Criteria | Text (Multi Line) | Yes |

#### Step 5: Response kickoff & assignments — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Section Assignments Summary | Text (Multi Line) | Yes |
| Internal Deadline for SME Inputs | Date | Yes |
| Special Instructions | Text (Multi Line) | No |
