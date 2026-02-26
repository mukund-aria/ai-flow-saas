# Legal & Governance (11 Templates)

> Manage contracts, legal processes, corporate governance, and intellectual property workflows. From NDA execution to M&A due diligence, these templates ensure proper legal review, risk analysis, and compliance throughout every stage.

**Concurrency notation**: Steps marked **(concurrent)** have `skipSequentialOrder: true` and can run in parallel with the preceding step rather than waiting for it to complete.

**Revision loop notation**: Steps marked with **[GOTO_DESTINATION: X]** define a revision loop anchor. A branch outcome marked **[GOTO X]** loops back to that anchor for iterative review cycles.

---

## 1. Contract Review & Execution

**Tags**: Cross-industry | **Complexity**: Complex | **Trigger**: Contract drafted or received

**Description**: Manage the full contract lifecycle from intake through negotiation and execution. Ensures legal review, risk analysis, and proper approvals before any agreement is signed.

**Use Cases**:
- Reviewing and executing vendor service agreements before engagement begins
- Processing customer contracts with non-standard terms requiring legal review
- Managing software license agreements with complex IP provisions
- Executing partnership agreements that require executive-level approval

**Requirements**:
- [ ] Upload your contract document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your CLM (Ironclad, Agiloft, DocuSign CLM) to auto-import contract drafts and sync executed versions back to the repository
- Connect to DocuSign or Adobe Sign for embedded e-signature execution with automatic status tracking
- Use AI to auto-review contract redlines and summarize material changes before legal review
- Set up auto-launch 60 days before contract expiration for renewal when auto-renewal terms apply

**Roles**: Counterparty, Legal Reviewer, Executive

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Intake & Review** | | | |
| 1 | Contract intake | Form | Legal Reviewer | Enter the key details of the contract being reviewed. Capture all relevant metadata to route the review properly. |
| 2 | Draft contract upload | File Request | Legal Reviewer | Upload the draft contract document for review. Include any related exhibits or schedules. |
| 3 | AI contract risk analysis | To-Do | Legal Reviewer | AI-powered: Analyze the contract for non-standard clauses, liability caps, IP provisions, data protection terms, and auto-renewal traps. |
| 4 | Legal & financial review **(concurrent)** | To-Do | Legal Reviewer | Review the contract for indemnification clauses, IP ownership, termination provisions, pricing structures, and payment terms. Document any concerns or required changes. |
| | **📌 Negotiation** | | | |
| | **[GOTO_DESTINATION: A]** | | | *Revision loop anchor -- rejected redlines loop back here* |
| 5 | Redline document upload | File Request | Legal Reviewer | Upload the redlined version of the contract with all proposed changes tracked. |
| 6 | Counterparty negotiation | File Request | Counterparty | Review the redlined contract and upload your response. Include accepted changes, counter-proposals, and any new redlines. |
| 7 | Negotiation resolution | Single Choice Branch | Legal Reviewer | Review the counterparty response and decide on next steps: accept the terms and proceed to execution, or reject and loop back for another round of redlines. Path "Rejected" triggers **[GOTO A]** to repeat the negotiation cycle. |
| | **📌 Execution & Filing** | | | |
| 8 | Executive approval (if needed) | Approval | Executive | Review the final negotiated terms and approve the contract for execution. Consider the business impact and risk exposure. |
| 9 | Contract execution | E-Sign | Counterparty | Review the final contract and apply your electronic signature to execute the agreement. |
| 10 | Executed contract filing | To-Do | Legal Reviewer | File the fully executed contract in the contract management system. Update the contract register and notify relevant stakeholders. |

#### Step 1: Contract intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Contract Type | Dropdown | Yes |
| Counterparty Name | Text (Single Line) | Yes |
| Contract Value | Number | Yes |
| Contract Term (months) | Number | Yes |
| Auto-Renewal | Dropdown | Yes |
| Requesting Department | Text (Single Line) | Yes |

---

## 2. Contract Exception Request

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Non-standard terms requested / Customer redlines

**Description**: Handle requests for non-standard contract terms through a structured review and approval process. Ensures all exceptions receive proper legal, financial, and business evaluation before approval.

**Use Cases**:
- Customer requesting extended payment terms beyond standard net-30
- Strategic deal requiring modified liability caps or indemnification terms
- Partner requesting non-standard SLA commitments for enterprise agreement
- Sales team seeking approval for pricing exceptions on a competitive deal

**Recommendations**:
- Integrate with your CLM (Ironclad, Agiloft) to auto-flag non-standard clauses and pull exception history for precedent analysis
- Connect to your CRM (Salesforce, HubSpot) to link exception requests to deal records and track approval impact on win rates
- Use AI to compare requested exceptions against your approved precedent library and recommend accept/reject with supporting rationale
- Follow approved exceptions with the Contract Review & Execution template to finalize the amended agreement

**Roles**: Requestor, Legal Reviewer, Business Approver, Finance Reviewer, Deal Desk

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Request & Documentation** | | | |
| 1 | Exception request details | Form | Requestor | Provide the details of the contract exception you are requesting. Be specific about what non-standard terms are needed and why. |
| 2 | Proposed redlines | File Request | Requestor | Upload the proposed contract redlines showing the specific language changes requested. |
| 3 | Business justification **(concurrent)** | File Request | Requestor | Upload any supporting documentation for the business justification, such as competitive analysis or customer relationship history. |
| | **📌 Review & Approval** | | | |
| 4 | Legal analysis | To-Do | Legal Reviewer | Analyze the requested exception for legal risk. Assess whether the proposed terms are acceptable, need modification, or should be rejected. |
| 5 | Finance impact assessment **(concurrent)** | To-Do | Finance Reviewer | Assess the financial impact of the requested exception. Consider revenue recognition, payment terms, and any precedent-setting implications. |
| 6 | Business approval | Approval | Business Approver | Review the exception request along with legal and finance assessments. Approve or reject based on overall business impact. |
| 7 | Deal desk approval | Approval | Deal Desk | Review the exception for deal structure compliance and confirm it aligns with pricing and commercial guidelines. |
| 8 | Decision acknowledgement | Acknowledgement | Requestor | Review the decision on your exception request. Acknowledge that you understand the outcome and any conditions attached. |

#### Step 1: Exception request details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Contract / Deal Name | Text (Single Line) | Yes |
| Exception Type | Dropdown | Yes |
| Requested Exception Details | Text (Multi Line) | Yes |
| Business Justification | Text (Multi Line) | Yes |
| Deal Value | Number | Yes |

---

## 3. NDA Execution

**Tags**: All Industries | **Complexity**: Simple | **Trigger**: Confidential discussion / deal exploration

**Description**: Streamline NDA processing from request through execution for confidential business discussions. Ensures proper legal review for non-standard terms and efficient execution for standard agreements.

**Use Cases**:
- Executing mutual NDAs before exploring a potential partnership or acquisition
- Protecting confidential information before sharing product roadmaps with prospects
- Establishing confidentiality agreements with consultants or contractors
- Processing standard NDAs quickly for deal exploration conversations

**Requirements**:
- [ ] Upload your NDA document for e-signature (replaces sample)

**Recommendations**:
- Integrate with DocuSign or Adobe Sign for one-click NDA execution and automatic countersignature tracking
- Connect to your CLM (Ironclad, DocuSign CLM) to auto-generate NDAs from templates and sync executed copies to the contract repository
- Enable AI to extract key clauses from uploaded NDAs and flag non-standard terms such as carve-outs, non-solicitation, or unusual jurisdiction provisions
- Follow NDA Execution with the Contract Review & Execution template for the full agreement lifecycle

**Roles**: External Party, Legal Owner

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | NDA request details | Form | External Party | Provide the details needed to prepare the NDA. This information will be used to generate the appropriate agreement. |
| 2 | Legal review (if non-standard) | To-Do | Legal Owner | Review the NDA request for any non-standard requirements. If the counterparty has requested custom terms, review and adjust the agreement accordingly. |
| 3 | NDA document upload | File Request | Legal Owner | Upload the finalized NDA document for counterparty review and execution. |
| 4 | Counterparty review | File Request | External Party | Review the NDA document. If you have any requested changes, upload a redlined version. |
| 5 | NDA execution | E-Sign | External Party | Review the final NDA and apply your electronic signature to execute the agreement. |
| 6 | Executed copy distribution | To-Do | Legal Owner | Distribute the fully executed NDA to all relevant parties and file it in the document management system. |

#### Step 1: NDA request details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Counterparty Organization | Text (Single Line) | Yes |
| NDA Type | Dropdown | Yes |
| Purpose of Disclosure | Text (Multi Line) | Yes |
| Confidentiality Period (years) | Number | Yes |

---

## 4. Litigation Hold Acknowledgement

**Tags**: All Industries | **Complexity**: Simple | **Trigger**: Litigation filed / Threat of litigation

**Description**: Issue and track litigation hold notices to ensure custodians preserve relevant data. Provides a clear audit trail of notification, acknowledgement, and data preservation confirmation.

**Use Cases**:
- Issuing company-wide litigation holds in response to filed lawsuits
- Preserving data for regulatory investigations or government inquiries
- Tracking acknowledgements across departments when a hold affects multiple custodians
- Documenting preservation compliance for discovery obligations

**Recommendations**:
- Connect to your e-discovery platform (Relativity, Exterro, Everlaw) to auto-trigger preservation workflows and sync custodian acknowledgement status
- Integrate with your HRIS (Workday, BambooHR) to auto-identify custodians by department and role when issuing holds
- Chain with the Subpoena Response Coordination template when the litigation hold leads to active document production requests

**Roles**: Custodian, Legal Owner

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Litigation hold notice | Acknowledgement | Custodian | Read the litigation hold notice carefully. You are required to preserve all documents, communications, and data related to this matter. Acknowledge that you have received and understand the hold. |
| 2 | Custodian questionnaire | Form | Custodian | Complete this questionnaire to help identify all relevant data sources you may have. Be thorough in identifying all locations where relevant information may exist. |
| 3 | Data preservation confirmation | Acknowledgement | Custodian | Confirm that you have taken steps to preserve all relevant data as described in the litigation hold notice. Do not delete, modify, or destroy any potentially relevant materials. |
| 4 | Completion confirmation | Acknowledgement | Legal Owner | Confirm that the custodian has been properly notified, has completed the questionnaire, and has acknowledged the data preservation obligations. |

#### Step 2: Custodian questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Do you have relevant documents? | Dropdown | Yes |
| Data locations (email, shared drives, local files, etc.) | Text (Multi Line) | Yes |
| Relevant date range | Text (Single Line) | Yes |
| Other custodians who may have relevant data | Text (Multi Line) | No |
| Questions or concerns about the hold | Text (Multi Line) | No |

---

## 5. Board Resolution & Consent Collection

**Tags**: All Industries, Corporate Governance | **Complexity**: Standard | **Trigger**: Board action required / Annual resolutions

**Description**: Coordinate board resolution review, approval, and execution through a structured workflow. Ensures all directors review materials, legal counsel validates the resolution, and proper signatures are collected.

**Use Cases**:
- Collecting board consent for annual officer appointments and compensation approvals
- Executing resolutions for major corporate transactions like acquisitions or financings
- Obtaining written consent in lieu of a meeting for time-sensitive matters
- Documenting board approval for stock option grants or equity issuances

**Requirements**:
- [ ] Upload your board resolution document for e-signature (replaces sample)
- [ ] Upload your CEO attestation document for e-signature (replaces sample)

**Recommendations**:
- Connect to your board portal (Diligent, BoardEffect, OnBoard) to distribute materials, collect votes, and sync resolution status automatically
- Integrate with DocuSign or Adobe Sign for secure board member e-signature collection with audit trail
- Enable AI to draft the board resolution summary from meeting minutes, highlighting key actions and voting outcomes
- Schedule annual auto-launch for recurring board resolutions such as officer appointments, compensation approvals, and auditor ratifications

**Roles**: Corporate Secretary, Board Member, General Counsel, CEO

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Draft Review & Feedback** | | | |
| 1 | Resolution draft distribution | File Request | Corporate Secretary | Upload the draft resolution document along with any supporting materials for board member review. |
| 2 | Director review acknowledgement | Acknowledgement | Board Member | Acknowledge that you have received and reviewed the draft resolution and supporting materials. |
| 3 | Questions / comments | Form | Board Member | Submit any questions, comments, or concerns about the draft resolution. If you have no comments, indicate that you have no objections. |
| 4 | Legal review | To-Do | General Counsel | Review the draft resolution for legal compliance, proper form, and alignment with corporate governance requirements. Address any board member questions. |
| | **📌 Execution & Filing** | | | |
| 5 | Final resolution distribution | File Request | Corporate Secretary | Upload the final version of the resolution incorporating any feedback from the board review and legal counsel. |
| 6 | Resolution execution | E-Sign | Board Member | Review the final resolution and apply your electronic signature to execute the board consent. |
| 7 | CEO attestation | E-Sign | CEO | Attest to the board resolution by applying your electronic signature as required by corporate governance procedures. |
| 8 | Filing confirmation | Acknowledgement | Corporate Secretary | Confirm that the executed resolution has been properly filed in the corporate records and all necessary regulatory filings have been submitted. |

#### Step 3: Questions / comments — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Do you have comments or questions? | Dropdown | Yes |
| Comments / Questions | Text (Multi Line) | No |

---

## 6. M&A Due Diligence Document Request

**Tags**: Investment Banking, Private Equity, Corporate Development | **Complexity**: Complex | **Trigger**: LOI signed / DD phase begins

**Description**: Coordinate comprehensive due diligence document collection from target companies during M&A transactions. Covers corporate, financial, legal, tax, employment, and IP workstreams with structured follow-up and risk assessment.

**Use Cases**:
- Collecting due diligence documents for a private equity acquisition of a mid-market company
- Coordinating cross-border M&A document requests with multiple jurisdictions
- Managing due diligence for a strategic corporate acquisition
- Running buy-side diligence for a venture-backed company acquisition

**Recommendations**:
- Connect to a virtual data room (Intralinks, Datasite, Box) to auto-organize uploaded documents by workstream and track access logs
- Integrate with your deal management platform (DealCloud, Midaxo) to sync diligence status, red flags, and go/no-go decisions back to the deal record
- Use AI to auto-classify uploaded diligence documents by workstream, flag missing items against the request list, and surface material risks across corporate, financial, and legal submissions
- Chain with the NDA Execution template at the start to ensure confidentiality agreements are in place before any documents are exchanged

**Roles**: Target Company Contact, Deal Team Lead, Buyer Counsel

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Data Room Setup** | | | |
| 1 | NDA & data room access | Acknowledgement | Target Company Contact | Acknowledge the NDA terms and confirm access to the virtual data room. You will use this data room to upload all requested due diligence documents. |
| 2 | DD request list distribution | File Request | Deal Team Lead | Upload the comprehensive due diligence request list organized by workstream (corporate, financial, tax, legal, employment, IP). |
| | **📌 Document Collection** | | | |
| 3 | Corporate & financial documents | File Request | Target Company Contact | Upload all requested corporate and financial documents including organizational documents, financial statements, capitalization tables, and material agreements. |
| 4 | Tax & legal documents | File Request | Target Company Contact | Upload all requested tax returns, legal filings, litigation records, and regulatory compliance documentation. |
| 5 | Employment, IP & contracts | File Request | Target Company Contact | Upload employment agreements, benefit plans, IP registrations, license agreements, and all material contracts. |
| 6 | Management questionnaire | Form | Target Company Contact | Complete the management questionnaire covering areas that are not fully captured in document review. Be thorough and transparent in your responses. |
| | **📌 Analysis & Decision** | | | |
| 7 | Buyer counsel questions & follow-ups | Form | Target Company Contact | Respond to follow-up questions from the buyer legal team based on their review of the submitted documents. |
| 8 | Follow-up documentation | File Request | Target Company Contact | Upload any additional documents requested as a result of the follow-up questions and ongoing review. |
| 9 | AI red flag summary | To-Do | Deal Team Lead | AI-powered: Synthesize findings across all due diligence workstreams to identify material risks, documentation gaps, potential deal-breakers, and representation/warranty requirements. |
| 10 | Transaction Go/No-Go | Decision | Deal Team Lead | Based on due diligence findings, determine whether to proceed with the transaction, renegotiate terms, or terminate the deal. |
| 11 | Go/No-Go decision | Approval | Deal Team Lead | Review the complete due diligence findings and red flag summary. Make the go/no-go decision on proceeding with the transaction. |

#### Step 6: Management questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Are there any off-balance-sheet liabilities? | Text (Multi Line) | Yes |
| Pending or threatened litigation | Text (Multi Line) | Yes |
| Top 10 customer concentration (% of revenue) | Text (Multi Line) | Yes |
| Known material risks or contingencies | Text (Multi Line) | Yes |

#### Step 7: Buyer counsel questions & follow-ups — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Question responses | Text (Multi Line) | Yes |
| Additional context or clarifications | Text (Multi Line) | No |

---

## 7. DSAR / Privacy Rights Request

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Privacy rights request received

**Description**: Process data subject access requests and privacy rights requests in compliance with GDPR and CCPA. Ensures proper identity verification, data collection, legal review, and timely response delivery.

**Use Cases**:
- Processing GDPR data subject access requests within the 30-day deadline
- Handling CCPA opt-out and deletion requests from California residents
- Managing employee privacy rights requests during offboarding
- Coordinating multi-system data collection for comprehensive DSAR responses

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your privacy management platform (OneTrust, BigID, TrustArc) to auto-log DSARs, track regulatory deadlines, and generate compliance reports
- Connect to identity verification services (Jumio, Onfido) to automate data subject identity confirmation before processing requests
- Use AI to auto-scan collected data for third-party PII and privileged content that requires redaction before the response is delivered
- Set up automated email notifications with countdown timers for GDPR 30-day and CCPA 45-day response deadlines

**Roles**: Data Subject, Privacy Operations, IT/Data Team, Legal Reviewer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Intake & Verification** | | | |
| 1 | Request intake & verification | Form | Data Subject | Submit your privacy rights request. Provide the details below so we can process your request in a timely manner. |
| 2 | Identity verification documents | File Request | Data Subject | Upload identity verification documents so we can confirm your identity before processing the request. This is required to protect your data from unauthorized access. |
| 3 | Scope clarification | Form | Data Subject | Help us narrow the scope of your request so we can respond accurately and efficiently. |
| | **📌 Data Processing & Review** | | | |
| 4 | Data collection across systems | To-Do | IT/Data Team | Collect all personal data associated with the data subject from all relevant systems. Document the data sources and compile a comprehensive data package. |
| 5 | Legal review / redaction | To-Do | Legal Reviewer | Review the collected data for legal exemptions, third-party data that must be redacted, and any privileged information. Apply necessary redactions. |
| | **📌 Response Delivery** | | | |
| 6 | Privacy ops review | To-Do | Privacy Operations | Verify completeness of the response, ensure regulatory timelines are met, and prepare the final response package for delivery. |
| 7 | Response delivery | File Request | Privacy Operations | Upload the final response package for the data subject. Include all collected data, any applicable explanations, and information about their rights. |
| 8 | Completion acknowledgement | Acknowledgement | Data Subject | Acknowledge receipt of the response to your privacy rights request. If you have further questions or are not satisfied with the response, you may submit a follow-up request. |

#### Step 1: Request intake & verification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | Text (Single Line) | Yes |
| Email Address | Email | Yes |
| Request Type | Dropdown | Yes |
| Details of Request | Text (Multi Line) | Yes |

#### Step 3: Scope clarification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Specific systems or services | Text (Multi Line) | No |
| Date range of interest | Text (Single Line) | No |
| Specific data categories | Text (Multi Line) | No |

---

## 8. Subpoena Response Coordination

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Subpoena received

**Description**: Coordinate the response to legal subpoenas through structured document identification, preservation, collection, and privilege review. Ensures compliance with legal obligations while protecting privileged information.

**Use Cases**:
- Responding to third-party subpoenas for business records in civil litigation
- Coordinating document production for regulatory investigations
- Managing custodian-level document collection for multi-party lawsuits
- Handling grand jury subpoenas requiring rapid document preservation and production

**Recommendations**:
- Connect to your e-discovery platform (Relativity, Exterro, Everlaw) to auto-collect, process, and review responsive documents
- Integrate with your legal hold system to auto-trigger preservation notices and sync custodian compliance status
- Use AI to auto-classify collected documents for responsiveness and privilege, generating a draft privilege log for attorney review
- Launch the Litigation Hold Acknowledgement template first to ensure all custodians have preserved relevant data before collection begins

**Roles**: Legal Owner, Custodian, IT Administrator, Outside Counsel

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Identification & Preservation** | | | |
| 1 | Subpoena intake & analysis | Form | Legal Owner | Log the subpoena details and analyze its scope, deadlines, and requirements. Identify the key issues and relevant custodians. |
| 2 | Custodian identification | To-Do | Legal Owner | Identify all custodians who may have responsive documents. Map data sources and document types to each custodian. |
| 3 | Document preservation notice | Acknowledgement | Custodian | Acknowledge receipt of the document preservation notice. You must preserve all documents, communications, and data that may be responsive to the subpoena. |
| 4 | IT data preservation **(concurrent)** | To-Do | IT Administrator | Implement technical preservation measures for relevant data sources. Suspend auto-deletion policies, preserve email archives, and secure backup tapes as needed. |
| | **📌 Collection & Review** | | | |
| 5 | Document collection | File Request | Custodian | Collect and upload all documents, communications, and data responsive to the subpoena from your data sources. |
| 6 | Outside counsel review | To-Do | Outside Counsel | Review the collected documents for responsiveness, relevance, and potential objections. Identify any documents requiring privilege review. |
| 7 | Privilege review | To-Do | Legal Owner | Conduct privilege review on flagged documents. Prepare the privilege log for any documents withheld on privilege grounds. |
| 8 | Response submission confirmation | Acknowledgement | Legal Owner | Confirm that the subpoena response has been submitted to the requesting party along with any privilege log and objections. |

#### Step 1: Subpoena intake & analysis — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Issuing Party / Court | Text (Single Line) | Yes |
| Case Name / Number | Text (Single Line) | Yes |
| Response Deadline | Date | Yes |
| Scope Description | Text (Multi Line) | Yes |
| Key Custodians Identified | Text (Multi Line) | Yes |

---

## 9. New Business Formation

**Tags**: Legal, Corporate Services, Startups | **Complexity**: Standard | **Trigger**: New entity needed

**Description**: Guide founders through the complete business formation process from entity selection through post-formation compliance. Coordinates legal, regulatory, and tax requirements across multiple professional advisors.

**Use Cases**:
- Forming a new LLC for a startup with multiple co-founders
- Incorporating a Delaware C-Corp for a venture-backed startup
- Setting up a subsidiary entity for a corporate expansion
- Establishing a professional services partnership or PLLC

**Requirements**:
- [ ] Upload your formation documents for e-signature (replaces sample)

**Recommendations**:
- Integrate with registered agent services (CSC, CT Corporation) to auto-file formation documents and track state filing status
- Connect to the IRS EIN application portal to streamline federal tax ID registration after entity formation
- Schedule annual auto-launch for recurring compliance filings such as annual reports, franchise tax payments, and registered agent renewals
- Follow formation with the Trademark / IP Assignment template to register and assign initial IP assets to the new entity

**Roles**: Founder, Legal Advisor, Registered Agent, Accountant

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Entity Planning** | | | |
| 1 | Formation intake | Form | Founder | Provide the basic details of the business entity you want to form. This information will guide the entity structure and formation filing. |
| 2 | Ownership & structure details | Form | Founder | Provide ownership and governance structure details. Include all founders, ownership percentages, and initial officers/managers. |
| 3 | Founder identity documents | File Request | Founder | Upload government-issued identification for all founders. This is required for the formation filing and EIN application. |
| | **📌 Formation & Execution** | | | |
| 4 | Operating agreement / bylaws review | To-Do | Legal Advisor | Draft or review the operating agreement (LLC) or bylaws (corporation). Ensure governance provisions align with the founders' intent and applicable state law. |
| 5 | Formation document execution | E-Sign | Founder | Review and sign the formation documents including articles of organization/incorporation and the operating agreement or bylaws. |
| 6 | Registered agent acceptance | Acknowledgement | Registered Agent | Acknowledge your acceptance of the registered agent appointment for the newly formed entity. |
| | **📌 Post-Formation Setup** | | | |
| 7 | EIN application | To-Do | Accountant | Apply for the Employer Identification Number (EIN) with the IRS. Set up initial accounting records and advise on tax election deadlines. |
| 8 | Post-formation checklist **(concurrent)** | To-Do | Legal Advisor | Complete the post-formation checklist: open bank account, obtain business licenses, register for state taxes, and set up initial corporate records. |
| 9 | Formation complete | Acknowledgement | Founder | Acknowledge that the business formation is complete. Review the summary of all filed documents, key dates, and ongoing compliance obligations. |

#### Step 1: Formation intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Proposed Entity Name | Text (Single Line) | Yes |
| Entity Type | Dropdown | Yes |
| State of Formation | Text (Single Line) | Yes |
| Business Purpose | Text (Multi Line) | Yes |
| Principal Office Address | Text (Multi Line) | Yes |

#### Step 2: Ownership & structure details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Founders / Members / Shareholders | Text (Multi Line) | Yes |
| Ownership Percentages | Text (Multi Line) | Yes |
| Initial Officers / Managers | Text (Multi Line) | Yes |
| Authorized Share Count (if applicable) | Number | No |

---

## 10. Franchise Agreement Execution

**Tags**: Franchising, Retail, Food Service | **Complexity**: Complex | **Trigger**: Franchise application approved

**Description**: Manage the franchise agreement process from application through execution and onboarding kickoff. Ensures FTC Franchise Rule compliance including the mandatory 14-day FDD review period.

**Use Cases**:
- Executing franchise agreements for new restaurant franchise locations
- Processing multi-unit franchise development agreements
- Onboarding new franchisees for retail or service-based franchise systems
- Managing franchise resale transactions with new owner execution

**Requirements**:
- [ ] Upload your franchise agreement document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your franchise management platform (FranConnect, FRANdata) to sync franchisee data, territory assignments, and onboarding milestones
- Connect to DocuSign for FDD delivery tracking with built-in 14-day cooling period enforcement before agreement execution
- Use AI to compare franchisee financial qualification documents against minimum thresholds and flag applicants that fall below requirements
- Set up auto-launch for franchise renewal 90 days before agreement expiration to begin the re-execution process

**Roles**: Franchisee, Franchise Development Manager, Legal Reviewer, Finance, Training Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Application & Qualification** | | | |
| 1 | Franchise application | Form | Franchisee | Complete the franchise application with your personal, financial, and business background information. |
| 2 | Financial qualification documents | File Request | Franchisee | Upload financial qualification documents including personal financial statements, bank statements, and tax returns. |
| 3 | Franchisee qualification decision | Decision | Franchise Development Manager | Evaluate the franchisee candidate: approve and proceed to agreement, request additional information, or decline the application. |
| | **📌 FDD Review & Discovery** | | | |
| 4 | FDD acknowledgement (14-day waiting period) | Acknowledgement | Franchisee | Acknowledge receipt of the Franchise Disclosure Document (FDD). Per FTC rules, you must have at least 14 days to review the FDD before signing the franchise agreement. |
| 5 | Franchisee questions | Form | Franchisee | Submit any questions about the FDD, franchise agreement, or franchise system. We encourage you to review the FDD with your own attorney. |
| 6 | Discovery day confirmation | Acknowledgement | Franchisee | Confirm your attendance at Discovery Day. This is your opportunity to visit headquarters, meet the team, and learn about day-to-day franchise operations. |
| | **📌 Agreement & Onboarding** | | | |
| 7 | Franchise agreement review | To-Do | Legal Reviewer | Review the franchise agreement for compliance, territory accuracy, and any negotiated modifications. Ensure FTC timing requirements have been met. |
| 8 | Financial terms **(concurrent)** | To-Do | Finance | Verify the financial terms of the franchise agreement including initial franchise fee, royalty rates, advertising fund contributions, and payment schedules. |
| 9 | Franchise agreement execution | E-Sign | Franchisee | Review the final franchise agreement and apply your electronic signature to execute the agreement. Ensure you have completed your 14-day FDD review period. |
| 10 | Training schedule | To-Do | Training Lead | Schedule the initial franchise training program for the new franchisee. Prepare training materials and confirm venue/virtual setup. |
| 11 | Onboarding kickoff | Acknowledgement | Franchise Development Manager | Confirm that the franchise onboarding process has been initiated. Verify that all required systems access, training schedule, and opening timeline have been communicated to the franchisee. |

#### Step 1: Franchise application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | Text (Single Line) | Yes |
| Business Entity Name (if applicable) | Text (Single Line) | No |
| Desired Territory / Location | Text (Single Line) | Yes |
| Liquid Capital Available | Number | Yes |
| Net Worth | Number | Yes |
| Prior Franchise or Business Experience | Text (Multi Line) | No |

#### Step 5: Franchisee questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Questions about the FDD | Text (Multi Line) | No |
| Questions about territory / operations | Text (Multi Line) | No |
| Have you consulted with an attorney? | Dropdown | Yes |

---

## 11. Trademark / IP Assignment

**Tags**: Legal, Corporate, IP | **Complexity**: Standard | **Trigger**: IP transfer needed (acquisition, employee assignment, corporate restructuring)

**Description**: Coordinate the transfer of intellectual property rights from assignor to assignee with proper due diligence, documentation, and recording. Supports trademark, patent, copyright, and trade secret assignments.

**Use Cases**:
- Transferring patent and trademark portfolios during a corporate acquisition
- Recording employee invention assignments as part of employment onboarding
- Reassigning IP assets during corporate restructuring between subsidiaries
- Executing trademark assignments for brand acquisition deals

**Requirements**:
- [ ] Upload your IP assignment agreement for e-signature (replaces sample)

**Recommendations**:
- Integrate with USPTO/WIPO electronic filing systems to auto-submit assignment recordation documents and track filing status
- Connect to your IP management platform (Anaqua, CPA Global, Clarivate) to sync assignment records, update ownership data, and maintain chain of title
- Use AI to verify chain-of-title completeness by cross-referencing uploaded assignment history against IP office records and flagging gaps
- Set up automated deadline alerts for recordation filing windows and post-assignment maintenance fee due dates

**Roles**: Assignor, IP Counsel, Assignee, IP Administrator

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Due Diligence** | | | |
| 1 | Assignment request intake | Form | IP Counsel | Provide the details of the intellectual property being assigned. Include all registration information and the reason for transfer. |
| 2 | IP schedule & registration documents | File Request | Assignor | Upload registration certificates, prior assignment records, existing license agreements, and documentation of any encumbrances on the IP. |
| 3 | Chain of title verification | To-Do | IP Counsel | Verify the chain of title for the IP being assigned. Confirm current ownership, check for liens or encumbrances, and verify registration status with the relevant IP office. |
| | **📌 Execution & Recording** | | | |
| 4 | Assignment agreement review | File Request | IP Counsel | Upload the draft IP assignment agreement for review. Include any schedules listing the specific IP assets being transferred. |
| 5 | Assignee review & comments | Form | Assignee | Review the assignment agreement and provide any comments or requested changes. |
| 6 | Assignment execution | E-Sign | Assignor | Review and sign the IP assignment agreement as the assignor, transferring your rights in the intellectual property. |
| 7 | Assignee countersignature | E-Sign | Assignee | Countersign the IP assignment agreement as the assignee, accepting the transfer of intellectual property rights. |
| 8 | Recording with IP office (USPTO/WIPO/etc.) | To-Do | IP Administrator | Record the assignment with the appropriate intellectual property office (USPTO, WIPO, or other relevant authority). Track the filing and recordation confirmation. |
| 9 | Recordation confirmation | Acknowledgement | IP Counsel | Confirm that the IP assignment has been recorded with the relevant IP office and all records have been updated. Distribute the recorded assignment to all parties. |

#### Step 1: Assignment request intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| IP Type | Dropdown | Yes |
| Registration / Application Numbers | Text (Multi Line) | Yes |
| Assignor Details | Text (Multi Line) | Yes |
| Assignee Details | Text (Multi Line) | Yes |
| Jurisdiction(s) | Text (Single Line) | Yes |
| Consideration / Value | Text (Single Line) | Yes |
| Reason for Transfer | Dropdown | Yes |

#### Step 5: Assignee review & comments — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Agreement Acceptable? | Dropdown | Yes |
| Comments or Requested Changes | Text (Multi Line) | No |
