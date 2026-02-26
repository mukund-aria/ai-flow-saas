# Account Management (4 Templates)

> Workflows for managing ongoing client relationships including quarterly business reviews, contract renewals, proactive health checks, and billing dispute resolution. Built to reduce churn, strengthen partnerships, and maintain revenue integrity.

---

## 1. Quarterly Business Review (QBR)

**Tags**: SaaS, Professional Services, B2B | **Complexity**: Simple | **Trigger**: Quarterly cadence

**Description**: Prepare and execute quarterly business reviews with structured data collection from both internal teams and client stakeholders. Ensures every QBR is backed by real metrics and ends with documented action items.

**Use Cases**:
- SaaS account manager preparing a QBR for a key enterprise customer
- Professional services firm reviewing project portfolio with a retainer client
- Managed services provider presenting quarterly SLA and performance metrics
- Agency presenting campaign results and recommending next-quarter strategy

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your CRM (Salesforce, HubSpot) to pull ARR, renewal date, and support ticket counts directly into the QBR preparation step
- Use AI to analyze usage patterns and client survey responses to auto-generate the QBR presentation deck with trend analysis, ROI highlights, and recommended next-quarter priorities
- Set up quarterly auto-launch tied to your fiscal calendar so QBR preparation begins automatically without manual kickoff
- Chain with the Annual Renewal template as accounts approach contract expiration to transition seamlessly from review to retention

**Roles**: Client Stakeholder, Account Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 QBR Preparation** | | | |
| 1 | Pre-QBR data collection | Form | Account Manager | Compile the key account metrics and context needed for the QBR presentation, including renewal timeline, revenue, support history, and relationship highlights. |
| 2 | QBR presentation upload | File Request | Account Manager | Upload your QBR presentation deck with account performance data, usage trends, ROI analysis, and proposed recommendations for the upcoming quarter. |
| 3 | Client pre-QBR survey | Form | Client Stakeholder | Share your perspective before the QBR meeting. Your input on satisfaction, priorities, and feature needs helps us make the session as productive as possible. |
| | **📌 Meeting & Follow-up** | | | |
| 4 | QBR meeting completion | To-Do | Account Manager | Conduct the QBR meeting, present findings and recommendations, capture client feedback, and document agreed-upon action items with owners and due dates. |
| 5 | Action items acknowledgement | Acknowledgement | Client Stakeholder | Review and acknowledge the action items agreed upon during the QBR meeting. This confirms mutual understanding of next steps and responsibilities. |
| 6 | Internal debrief | To-Do | Account Manager | Complete the internal debrief by updating the CRM, logging action items, flagging any risks or expansion opportunities, and sharing notes with the extended account team. |

#### Step 1: Pre-QBR data collection — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Renewal Date | Date | Yes |
| Annual Recurring Revenue (ARR) | Number | Yes |
| Support Tickets (This Quarter) | Number | No |
| NPS Score | Number | No |
| Key Wins This Quarter | Text (Multi Line) | Yes |

#### Step 3: Client pre-QBR survey — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Overall Satisfaction | Dropdown | Yes |
| Top Priorities for Next Quarter | Text (Multi Line) | Yes |
| Feature Requests or Improvements | Text (Multi Line) | No |

---

## 2. Annual Renewal

**Tags**: SaaS, Professional Services, Subscription | **Complexity**: Standard | **Trigger**: 90 days before contract expiration

**Description**: Drive contract renewals from 90-day-out kickoff through client survey, internal pricing approval, proposal delivery, and e-signature. Reduces churn risk by starting early and tracking every client touchpoint.

**Use Cases**:
- SaaS subscription renewal with potential upsell to a higher tier
- Professional services retainer renewal with scope adjustments
- Annual software license renewal with volume discount negotiation
- Managed services contract renewal requiring updated SLA terms

**Requirements**:
- [ ] Upload your renewal contract document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to DocuSign or Adobe Sign for the e-signature step to provide a seamless, legally binding signing experience
- Use AI to analyze the client renewal survey responses and usage report to auto-generate a churn risk score and recommended retention strategy before the CSM prepares the renewal offer
- Schedule auto-launch 90 days before contract expiration to start the renewal process and ensure no accounts lapse without outreach
- Push updated contract details (new ARR, term dates, seat count) to your billing system (Stripe, Chargebee, Zuora) upon signature to eliminate manual data entry
- Follow up with the Quarterly Business Review (QBR) template to establish an ongoing cadence after renewal is complete

**Roles**: Client Contact, CSM, Finance

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Discovery & Assessment** | | | |
| 1 | Renewal kickoff details | Form | CSM | Capture the renewal context including current contract details, account health indicators, and any upsell or risk factors to guide the renewal strategy. |
| 2 | Usage & value report upload | File Request | CSM | Upload a usage and value report showing the client's product adoption, ROI metrics, and key achievements during the current contract period. |
| 3 | Client renewal survey | Form | Client Contact | Help us understand your renewal priorities. Your feedback on satisfaction, usage, and budget directly shapes the renewal offer we prepare for you. |
| | **📌 Proposal & Negotiation** | | | |
| 4 | Internal pricing approval | Approval | Finance | Review the proposed renewal pricing, discount levels, and terms. Approve the pricing before the renewal proposal is sent to the client. |
| 5 | Renewal proposal delivery | File Request | CSM | Upload the renewal proposal with updated pricing, terms, and any scope changes for delivery to the client. |
| 6 | Client proposal review | Decision | Client Contact | Review the renewal proposal and indicate your decision. You can accept the proposal as-is, request negotiations on pricing or terms, downgrade your plan, or indicate you will not be renewing. |
| | **📌 Contract Execution** | | | |
| 7 | Renewal contract e-signature | E-Sign | Client Contact | Review and electronically sign the renewal contract to continue your subscription or service agreement. |
| 8 | Post-renewal CRM update | To-Do | CSM | Update the CRM with the new contract details, renewal date, updated ARR, and any commitments made during the renewal process. Set the next renewal reminder. |

#### Step 1: Renewal kickoff details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Account Name | Text (Single Line) | Yes |
| Contract End Date | Date | Yes |
| Current ARR | Number | Yes |
| Number of Licenses / Seats | Number | No |
| Renewal Risk Factors | Text (Multi Line) | No |
| Upsell Opportunities | Text (Multi Line) | No |

#### Step 3: Client renewal survey — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Overall Satisfaction | Dropdown | Yes |
| Current Usage Level | Dropdown | Yes |
| Any budget changes expected? | Dropdown | Yes |
| Other vendors being evaluated? | Text (Multi Line) | No |

---

## 3. Client Health Check

**Tags**: SaaS, Professional Services | **Complexity**: Simple | **Trigger**: Health score drop / key contact change / scheduled pulse

**Description**: Proactively assess at-risk accounts when health scores drop or key contacts change. Captures client sentiment, documents risk factors, and drives a structured action plan to get the relationship back on track.

**Use Cases**:
- Account health score dropped below threshold after a support escalation
- Key executive sponsor left the client organization
- Usage metrics declined significantly over the past 30 days
- Scheduled quarterly pulse check for strategic accounts

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your customer success platform (Gainsight, Totango, ChurnZero) to auto-trigger health check flows when account health scores drop below threshold
- Connect to your product analytics to include real-time usage trend data (logins, feature adoption, API calls) in the internal risk assessment step
- Enable AI-powered sentiment analysis on client satisfaction survey responses to auto-classify risk level and recommend specific intervention strategies before the CSM review
- Chain with the Annual Renewal template when health checks reveal at-risk accounts approaching contract expiration within 90 days

**Roles**: Client Contact, CSM

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Assessment** | | | |
| 1 | Health check trigger details | Form | CSM | Document what triggered this health check, the current account status, and how close the account is to renewal. |
| 2 | Client satisfaction survey | Form | Client Contact | We value your feedback and want to ensure you're getting the most from our partnership. Please share your honest assessment of how things are going. |
| 3 | Internal risk assessment | Form | CSM | Assess the account risk based on the client survey response and your relationship knowledge. Identify the primary risk factors and recommend an intervention strategy. |
| | **📌 Intervention & Resolution** | | | |
| 4 | Health check meeting | To-Do | CSM | Conduct the health check meeting with the client. Listen actively, address concerns, and collaboratively develop an action plan with clear owners and timelines. |
| 5 | Action plan acknowledgement | Acknowledgement | Client Contact | Review and acknowledge the action plan developed during the health check meeting. This confirms our shared commitment to resolving the identified issues. |
| 6 | Follow-up completion | To-Do | CSM | Complete all follow-up actions from the health check. Update the account health score, log outcomes in the CRM, and schedule the next check-in if needed. |

#### Step 1: Health check trigger details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Trigger Reason | Dropdown | Yes |
| Current Health (R/Y/G) | Dropdown | Yes |
| Days to Renewal | Number | No |

#### Step 2: Client satisfaction survey — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Overall Satisfaction | Dropdown | Yes |
| What is working well? | Text (Multi Line) | No |
| What could be improved? | Text (Multi Line) | Yes |
| Anything we should know? | Text (Multi Line) | No |

#### Step 3: Internal risk assessment — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Risk Level | Dropdown | Yes |
| Primary Risk Factors | Text (Multi Line) | Yes |
| Recommended Intervention | Text (Multi Line) | Yes |

---

## 4. Billing Dispute Resolution

**Tags**: Cross-industry | **Complexity**: Standard | **Trigger**: Client raises billing dispute

**Description**: Resolve billing disputes from initial intake through investigation, approval, and client acknowledgement. Provides a transparent, documented process that maintains client trust while protecting revenue integrity.

**Use Cases**:
- Client disputing charges for unused licenses after a mid-term downgrade
- Invoice amount mismatch due to a pricing error or miscommunication
- Duplicate charge identified by the client during reconciliation
- Client requesting a credit for a service outage or SLA breach

**Recommendations**:
- Integrate with your billing system (Stripe, NetSuite, Zuora) to auto-pull invoice details and charge history when a dispute is submitted, reducing manual lookup
- Connect to your CRM to log the dispute on the account record and flag the account health score during the investigation period
- Use AI to compare the disputed invoice against contract terms and billing records to auto-generate an investigation summary with a recommended resolution before the finance lead review
- Chain with the Client Health Check template when repeated disputes signal a deteriorating account relationship that needs proactive attention

**Roles**: Client, Finance Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Dispute Intake** | | | |
| 1 | Dispute intake form | Form | Client | Submit the details of your billing dispute so our finance team can investigate promptly. Include the invoice reference and a clear description of the issue. |
| 2 | Supporting documentation | File Request | Client | Upload any supporting documentation for your dispute, such as the original invoice, contract excerpts, correspondence, or screenshots showing the discrepancy. |
| | **📌 Investigation & Decision** | | | |
| 3 | Internal investigation | To-Do | Finance Lead | Investigate the billing dispute by reviewing billing records, verifying charges against the contract terms, and determining the appropriate resolution. |
| 4 | Resolution approval | Approval | Finance Lead | Approve the proposed resolution for the billing dispute. Document the resolution type (credit, refund, adjustment, or denial) and the rationale. |
| 5 | Resolution notification | To-Do | Finance Lead | Automated notification: Notify the client of the dispute resolution decision, including a clear explanation of the findings and the action being taken. |
| 6 | Resolution acceptance | Decision | Client | Review the resolution proposed by our finance team. You may accept the resolution, escalate if you disagree, or provide additional information to support your case. |
| | **📌 Resolution & Close-out** | | | |
| 7 | Resolution processing | To-Do | Finance Lead | Process the approved resolution including issuing credit memos, processing refunds, or making billing adjustments in the system. |
| 8 | Resolution acknowledgement | Acknowledgement | Client | Acknowledge that the billing dispute has been resolved to your satisfaction. This closes the dispute record in our system. |

#### Step 1: Dispute intake form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Invoice Number | Text (Single Line) | Yes |
| Disputed Amount | Number | Yes |
| Dispute Category | Dropdown | Yes |
| Description of Dispute | Text (Multi Line) | Yes |
| Expected Resolution | Text (Multi Line) | Yes |
