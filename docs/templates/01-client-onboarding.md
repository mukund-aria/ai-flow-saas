# Client Onboarding (7 Templates)

> Client intake, setup, and onboarding workflows

---

## 1. SaaS Customer Onboarding

**Tags**: Technology, SaaS | **Complexity**: Complex | **Trigger**: New customer contract signed

**Description**: Guide new SaaS customers from signed contract through environment configuration, data migration, and go-live. Covers kickoff, technical requirements, provisioning, training, and UAT sign-off so every deployment starts right.

**Use Cases**:
- New enterprise customer signs annual contract
- SMB customer upgrades to paid tier requiring implementation
- Existing customer purchases an add-on product needing configuration
- Partner refers a new client for white-glove onboarding

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Customer Contact, Implementation Lead, CSM

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Customer kickoff form | Form | Customer Contact | Complete this kickoff form so we can tailor your implementation. Provide your company details, expected user count, subscription tier, target go-live date, integration needs, and key objectives. |
| 2 | Technical requirements questionnaire | Form | Customer Contact | Fill out your technical requirements so we can prepare your environment. Include details on SSO, user provisioning, API integrations, data migration scope, and compliance needs. |
| 3 | Data migration upload | File Request | Customer Contact | Upload your data migration files (CSV exports, database dumps, or structured data) so our team can begin the import process. |
| 4 | Environment configuration | To-Do | Implementation Lead | Set up the customer tenant: configure SSO/SCIM if needed, apply branding, set permissions, and verify the environment is ready for provisioning. |
| 5 | User provisioning form | Form | Customer Contact | Provide admin user details, team structure, and role assignments so we can provision accounts in your new environment. |
| 6 | Training & UAT | To-Do | Implementation Lead | Conduct admin training, end-user training sessions, and facilitate user acceptance testing. Document any issues found during UAT. |
| 7 | UAT sign-off | Approval | Customer Contact | Review the configured environment and confirm that acceptance testing is complete. Approve to proceed to go-live. |
| 8 | Go-live notification | To-Do | CSM | Automated notification: Send the go-live announcement to the customer team with access details and support resources. |
| 9 | Onboarding complete | Acknowledgement | CSM | Acknowledge that onboarding is complete and the account is being handed off to ongoing success management. |

#### Step 1: Customer kickoff form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text (single line) | Yes |
| Expected Number of Users | Number | Yes |
| Subscription Tier | Dropdown | Yes |
| Target Go-Live Date | Date | Yes |
| Integration Requirements | Text (multi-line) | No |
| Key Objectives | Text (multi-line) | Yes |

#### Step 2: Technical requirements questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| SSO Provider | Dropdown | No |
| User Provisioning Method | Dropdown | No |
| API Integration Needs | Text (multi-line) | No |
| Data Migration Scope | Text (multi-line) | No |
| Compliance Requirements | Text (multi-line) | No |

#### Step 5: User provisioning form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Primary Admin Name | Text (single line) | Yes |
| Primary Admin Email | Email | Yes |
| Team Structure / Departments | Text (multi-line) | No |
| Role Assignments | Text (multi-line) | No |

---

## 2. Financial Services Client Onboarding (KYC)

**Tags**: Banking, Wealth Management | **Complexity**: Complex | **Trigger**: New account application

**Description**: Streamline new client intake from initial application through KYC verification and account activation. Collects identity documents, runs compliance screening, and obtains required signatures before opening the account.

**Use Cases**:
- High-net-worth individual opens a new investment account
- Business entity applies for a commercial banking relationship
- Existing client adds a trust or beneficiary account
- Periodic re-verification of a high-risk client triggers full KYC refresh

**Requirements**:
- [ ] Upload your account agreement document for e-signature (replaces sample)

**Roles**: Client, KYC Analyst, Compliance Officer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Client information form | Form | Client | Provide your personal and financial information to begin the account opening process. All fields are required for regulatory compliance. |
| 2 | Identity document upload | File Request | Client | Upload a government-issued photo ID and proof of address dated within the last 90 days (e.g., utility bill or bank statement). |
| 3 | Customer Due Diligence questionnaire | Form | Client | Answer due diligence questions about the intended use of your account, expected transaction patterns, and any political or foreign account exposure. |
| 4 | AI risk scoring & sanctions screening | To-Do | KYC Analyst | AI-powered: Screen the applicant against OFAC sanctions lists, PEP databases, and adverse media sources. Generate a risk score (Low/Medium/High) with supporting rationale. |
| 5 | High-risk client? | Decision | KYC Analyst | Evaluate the risk scoring results. Route High-risk or PEP-flagged applicants to the Enhanced Due Diligence path; route Standard-risk applicants directly to review. |
| 6 | Enhanced Due Diligence documentation | File Request | Client | Upload additional documentation to support your application: source-of-wealth evidence, recent tax returns, and bank statements. |
| 7 | KYC analyst review | To-Do | KYC Analyst | Verify all submitted documents, cross-reference information across sources, and complete the Customer Identification Program (CIP) checklist. |
| 8 | Compliance officer approval | Approval | Compliance Officer | Review the KYC analyst findings and approve or reject the client application based on compliance standards and risk assessment. |
| 9 | Account agreement | E-Sign | Client | Review and electronically sign the account agreement to finalize your new account. |
| 10 | Welcome notification | To-Do | KYC Analyst | Automated notification: Send the welcome email to the new client with account details, online access instructions, and next steps. |

#### Step 1: Client information form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Full Name | Text (single line) | Yes |
| Date of Birth | Date | Yes |
| SSN / TIN | Text (single line) | Yes |
| Residential Address | Text (multi-line) | Yes |
| Citizenship | Text (single line) | Yes |
| Occupation | Text (single line) | Yes |
| Annual Income | Dropdown | Yes |
| Estimated Net Worth | Dropdown | Yes |
| Source of Wealth | Text (multi-line) | Yes |

#### Step 3: Customer Due Diligence questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Purpose of Account | Text (multi-line) | Yes |
| Expected Monthly Transaction Volume | Dropdown | Yes |
| Are you a Politically Exposed Person (PEP)? | Dropdown | Yes |
| Do you hold foreign financial accounts? | Dropdown | Yes |
| Foreign Account Details (if applicable) | Text (multi-line) | No |

---

## 3. Accounting Firm Client Onboarding

**Tags**: Accounting, Tax | **Complexity**: Standard | **Trigger**: New client engagement

**Description**: Onboard new accounting clients from initial intake through engagement letter execution and system setup. Captures entity details, service scope, tax authorizations, and prior-year financials so your team can hit the ground running.

**Use Cases**:
- New small business engages the firm for tax preparation and bookkeeping
- Individual client signs up for personal tax advisory services
- Existing client adds a new entity requiring separate engagement
- Referral from partner firm needs full intake and authorization

**Requirements**:
- [ ] Upload your engagement letter document for e-signature (replaces sample)

**Roles**: Client, Engagement Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Client information form | Form | Client | Provide your basic information so we can set up your account. Include your legal name, entity type, Tax ID, fiscal year end, and states of filing. |
| 2 | Service scope selection | Form | Client | Select the services you need and share relevant details about your business operations, revenue, and current accounting software. |
| 3 | Engagement letter | E-Sign | Client | Review and sign the engagement letter that outlines the scope of services, fees, and responsibilities. |
| 4 | Tax authorization forms | File Request | Client | Upload signed IRS Form 8821 or 2848, plus any required state authorization forms, so we can access your tax records. |
| 5 | Prior year returns & financials | File Request | Client | Upload your prior year tax returns and financial statements so we have a baseline for your engagement. |
| 6 | Accounting system access (if bookkeeping/payroll) | Form | Client | If you selected bookkeeping or payroll services, provide access credentials for your accounting system and bank feed details. |
| 7 | Initial document review | To-Do | Engagement Manager | Review all submitted documents, verify completeness, and flag any missing or inconsistent information before proceeding. |
| 8 | Client portal setup | To-Do | Engagement Manager | Create the client profile in the firm management system, set up the document portal, and configure recurring task schedules. |
| 9 | Onboarding complete | Acknowledgement | Client | Acknowledge that your onboarding is complete. Your engagement manager will reach out with next steps and timelines. |

#### Step 1: Client information form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Name | Text (single line) | Yes |
| Entity Type | Dropdown | Yes |
| Tax ID (EIN or SSN) | Text (single line) | Yes |
| Fiscal Year End | Date | Yes |
| States of Filing | Text (multi-line) | Yes |

#### Step 2: Service scope selection — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Tax Preparation | Checkbox | No |
| Bookkeeping | Checkbox | No |
| Payroll | Checkbox | No |
| Audit | Checkbox | No |
| Advisory | Checkbox | No |
| Approximate Annual Revenue | Text (single line) | No |
| Current Accounting Software | Dropdown | No |

#### Step 6: Accounting system access (if bookkeeping/payroll) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Accounting Platform | Dropdown | No |
| Login Email | Email | No |
| Bank Feed Setup Instructions | Text (multi-line) | No |

---

## 4. Legal Client Intake & Matter Opening

**Tags**: Legal | **Complexity**: Standard | **Trigger**: New client inquiry / matter request

**Description**: Process new legal client inquiries from intake through conflict checks, engagement execution, and matter setup. Ensures proper vetting, fee arrangements, and case organization before the first billable hour.

**Use Cases**:
- Prospective client contacts the firm about a commercial litigation matter
- Existing client opens a new matter in a different practice area
- Referral from another attorney requires full intake and conflict check
- Corporate client engages the firm for M&A advisory

**Requirements**:
- [ ] Upload your engagement letter document for e-signature (replaces sample)

**Roles**: Client, Intake Attorney, Paralegal

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Client intake form | Form | Client | Complete the intake form with your contact information, the practice area involved, a description of the matter, any opposing parties, and the urgency level. |
| 2 | Conflict of interest check | To-Do | Paralegal | Run a conflict check against the firm database using all party names. Document any potential conflicts and flag them for attorney review. |
| 3 | Matter evaluation & staffing | To-Do | Intake Attorney | Evaluate the matter for viability, determine the appropriate fee arrangement (hourly, contingency, flat fee), and assign staffing. |
| 4 | Engagement letter execution | E-Sign | Client | Review and sign the engagement letter that defines the scope of representation, fee structure, and terms of the attorney-client relationship. |
| 5 | Retainer payment processing | To-Do | Paralegal | Process the retainer payment, confirm receipt, and record it in the trust accounting system. |
| 6 | Supporting document upload | File Request | Client | Upload any documents related to your matter, such as contracts, correspondence, court filings, or other relevant records. |
| 7 | Client portal & matter setup | To-Do | Paralegal | Create the matter in the case management system, set up the client portal, organize document folders, and configure billing codes. |
| 8 | Kickoff meeting | To-Do | Intake Attorney | Schedule and conduct the kickoff meeting with the client to discuss strategy, timeline, and immediate next steps. |
| 9 | Welcome & next steps | To-Do | Paralegal | Automated notification: Send the welcome email to the client with portal access details, team contacts, and an outline of next steps. |

#### Step 1: Client intake form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Name | Text (single line) | Yes |
| Practice Area | Dropdown | Yes |
| Matter Description | Text (multi-line) | Yes |
| Opposing Parties | Text (multi-line) | No |
| Urgency | Dropdown | Yes |

---

## 5. Insurance New Business Submission

**Tags**: Insurance, Brokerage | **Complexity**: Complex | **Trigger**: New policy application from broker

**Description**: Manage the full lifecycle of a new insurance policy application from broker submission through underwriting analysis, quoting, and policy issuance. Validates completeness, triages risk, and tracks subjectivity clearance.

**Use Cases**:
- Commercial broker submits a new general liability application
- Large account renewal triggers a full re-underwriting process
- Specialty risk submission requires multi-line quoting
- New broker relationship submits first piece of business

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Broker/Applicant, Underwriter

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Insured information form | Form | Broker/Applicant | Provide the insured entity details including legal name, entity type, FEIN, SIC/NAICS code, revenue, employee count, and lines of coverage requested. |
| 2 | ACORD application & loss runs | File Request | Broker/Applicant | Upload the completed ACORD 125 application with any line-specific supplements, plus the most recent 5-year loss run history. |
| 3 | Supplemental documentation | File Request | Broker/Applicant | Upload supplemental materials such as financial statements, fleet or property schedules, and safety programs as applicable. |
| 4 | AI submission triage | To-Do | Underwriter | AI-powered: Validate submission completeness, check appetite-fit by class code, and flag any missing information or coverage gaps. |
| 5 | Complete and within appetite? | Decision | Underwriter | Determine whether the submission is complete and fits within underwriting appetite. Route complete submissions to underwriting analysis; incomplete or out-of-appetite submissions back to the broker for additional information. |
| 6 | Underwriting analysis | To-Do | Underwriter | Perform full underwriting analysis: risk classification, premium development, loss projection, and industry benchmarking. |
| 7 | Underwriting decision | Decision | Underwriter | Make the underwriting decision: issue a quote, decline the risk, or refer to senior underwriting for further review. |
| 8 | Quote proposal delivery | File Request | Underwriter | Upload and deliver the quote proposal document to the broker for review and presentation to the insured. |
| 9 | Bind request & subjectivity clearance | File Request | Broker/Applicant | Upload the signed bind order, executed applications, and any required loss control or subjectivity clearance documents. |
| 10 | Policy issuance & delivery | To-Do | Underwriter | Generate policy documents and certificates of insurance, set up the policy in the management system, and deliver final documents to the broker. |

#### Step 1: Insured information form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Named Insured | Text (single line) | Yes |
| Entity Type | Dropdown | Yes |
| FEIN | Text (single line) | Yes |
| SIC/NAICS Code | Text (single line) | Yes |
| Annual Revenue | Text (single line) | Yes |
| Number of Employees | Number | Yes |
| Lines of Coverage Requested | Text (multi-line) | Yes |

---

## 6. Client Onboarding — General (Post-Sale)

**Tags**: All Industries | **Complexity**: Simple | **Trigger**: Deal closed in CRM

**Description**: Execute a straightforward post-sale onboarding for new clients across any industry. Collects client information, required documents, and contract signatures, then hands off to operations for setup and go-live.

**Use Cases**:
- Sales team closes a new mid-market deal and initiates handoff
- Self-serve customer upgrades and needs guided onboarding
- Channel partner signs a new client requiring standard setup
- Renewal with scope change triggers a mini re-onboarding

**Requirements**:
- [ ] Upload your contract document for e-signature (replaces sample)

**Roles**: Client Admin, Account Manager, Operations Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Client information intake | Form | Client Admin | Provide your organization details so we can get your account set up. Include company name, address, and billing information. |
| 2 | Primary contacts & roles | Form | Client Admin | Identify your primary contacts and their roles so we know who to reach for different matters. |
| 3 | Required documents (W-9, insurance, etc.) | File Request | Client Admin | Upload required compliance documents such as W-9, certificate of insurance, and any other documents specified in your agreement. |
| 4 | Contract execution | E-Sign | Client Admin | Review and sign the contract to formalize our engagement. |
| 5 | Internal setup checklist | To-Do | Operations Lead | Complete the internal setup checklist: create the client in billing, provision access, configure integrations, and verify all systems are ready. |
| 6 | Compliance verification | Approval | Operations Lead | Verify that all required documents have been received, compliance checks are clear, and the account is ready for activation. |
| 7 | Go-live acknowledgement | Acknowledgement | Account Manager | Acknowledge that the client is live and the account has been successfully handed off from onboarding to ongoing account management. |

#### Step 1: Client information intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text (single line) | Yes |
| Company Address | Text (multi-line) | Yes |
| Billing Contact Name | Text (single line) | Yes |
| Billing Contact Email | Email | Yes |

#### Step 2: Primary contacts & roles — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Primary Contact Name | Text (single line) | Yes |
| Primary Contact Email | Email | Yes |
| Primary Contact Role | Text (single line) | Yes |
| Secondary Contact Name | Text (single line) | No |
| Secondary Contact Email | Email | No |

---

## 7. Customer Offboarding & Account Closure

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Client requests closure / contract termination

**Description**: Manage the complete customer offboarding process from closure request through data export, billing reconciliation, access revocation, and final feedback. Ensures a clean, professional exit that preserves the relationship.

**Use Cases**:
- Customer decides not to renew at end of contract term
- Client merges with another organization and consolidates vendors
- Customer downgrades and needs to close a secondary account
- Mutual agreement to terminate a pilot engagement

**Roles**: Client Contact, Account Manager, IT/Security, Finance

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Offboarding request confirmation | Form | Client Contact | Confirm your offboarding request by providing the reason for closure and your preferred timeline. |
| 2 | Data export delivery | File Request | Account Manager | Prepare and deliver the client data export package including all stored records, reports, and configuration data. |
| 3 | Final billing acknowledgement | Acknowledgement | Client Contact | Review and acknowledge the final billing summary, including any remaining charges, credits, or refunds. |
| 4 | Access revocation | To-Do | IT/Security | Revoke all user access, disable API keys, remove SSO integrations, and archive the client tenant per data retention policy. |
| 5 | Final invoice | To-Do | Finance | Generate and send the final invoice reflecting any prorated charges, credits, or refunds owed. |
| 6 | Exit survey | Form | Client Contact | Share your feedback to help us improve. Your candid responses are valued and will remain confidential. |
| 7 | Closure acknowledgement | Acknowledgement | Client Contact | Acknowledge that your account has been closed. We appreciate your business and wish you well. |

#### Step 1: Offboarding request confirmation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Reason for Closure | Dropdown | Yes |
| Additional Details | Text (multi-line) | No |
| Preferred Closure Date | Date | Yes |

#### Step 6: Exit survey — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Overall Satisfaction (1-10) | Number | No |
| What did we do well? | Text (multi-line) | No |
| What could we have done better? | Text (multi-line) | No |
| Would you consider returning in the future? | Dropdown | No |
