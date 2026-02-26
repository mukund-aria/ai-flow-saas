# Banking & Financial Services (8 Templates)

> Compliance-driven workflows for financial institutions covering KYC/KYB verification, loan underwriting, wire transfers, investment account opening, and credit facility management. Designed to meet AML, SEC, FINRA, and FinCEN regulatory requirements.

---

## 1. Individual KYC Verification

**Tags**: Financial Services, Banking, Wealth Management | **Complexity**: Complex | **Trigger**: New account / periodic review

**Description**: Collect and verify individual identity documents from initial intake through risk scoring, EDD branching, and final compliance approval. Covers AML/KYC requirements end-to-end so new accounts are opened with full regulatory confidence.

**Use Cases**:
- New retail banking customer opening a checking or savings account
- Wealth management client onboarding for investment advisory services
- Periodic re-verification triggered by regulatory refresh cycle
- Cross-border client requiring enhanced due diligence documentation

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Individual, Compliance Reviewer, Compliance Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Personal information intake | Form | Individual | Provide your personal details so we can begin the KYC verification process. All information is kept confidential and used solely for regulatory compliance. |
| 2 | Government ID upload | File Request | Individual | Upload a clear copy of your government-issued photo ID (passport, driver's license, or national ID card). Both sides if applicable. |
| 3 | Proof of address | File Request | Individual | Upload a recent proof of address document such as a utility bill, bank statement, or government letter dated within the last 90 days. |
| 4 | Source of funds documentation | File Request | Individual | Upload documentation supporting your declared source of funds, such as pay stubs, business financials, or investment statements. |
| 5 | CDD questionnaire | Form | Individual | Answer these customer due diligence questions to help us assess your account profile and ensure regulatory compliance. |
| 6 | AI risk scoring & sanctions screening | To-Do | Compliance Reviewer | AI-powered: Screen the individual against OFAC, PEP databases, and adverse media sources. Generate a risk score (Low / Medium / High) based on the screening results and CDD responses. |
| 7 | EDD required? | Decision | Compliance Reviewer | Review the risk score and determine whether Enhanced Due Diligence is required. High-risk individuals proceed to EDD; standard-risk individuals advance directly to compliance review. |
| 8 | EDD additional documentation | File Request | Individual | Additional documentation is required for enhanced due diligence. Upload any requested materials such as detailed financial statements, source of wealth evidence, or reference letters. |
| 9 | Compliance review | To-Do | Compliance Reviewer | Review all collected documents, screening results, and risk assessment. Prepare your recommendation for the compliance manager. |
| 10 | KYC decision | Approval | Compliance Manager | Review the complete KYC file and compliance reviewer recommendation. Approve to activate the account or reject with documented reasons. |

#### Step 1: Personal information intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Full Name | Text (Single Line) | Yes |
| Date of Birth | Date | Yes |
| Nationality | Text (Single Line) | Yes |
| Tax Identification Number (TIN) | Text (Single Line) | Yes |
| Residential Address | Text (Multi Line) | Yes |
| Occupation | Text (Single Line) | Yes |
| Source of Funds | Dropdown | Yes |

#### Step 5: CDD questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Do you expect to send or receive international wire transfers? | Dropdown | Yes |
| Are you a Politically Exposed Person (PEP)? | Dropdown | Yes |
| Do you hold accounts at other financial institutions? | Dropdown | Yes |
| Do you hold or transact in cryptocurrency? | Dropdown | Yes |

---

## 2. Business KYB Document Collection

**Tags**: Financial Services, Banking, FinTech | **Complexity**: Standard | **Trigger**: New business account application

**Description**: Gather and validate business formation documents, ownership structures, and beneficial owner identities for new business account applications. Ensures AML/KYB compliance with a structured review-and-approval workflow.

**Use Cases**:
- New LLC opening a commercial deposit account
- FinTech partner onboarding requiring full KYB verification
- Subsidiary of an existing client adding a new entity account
- Non-profit organization applying for a business banking relationship

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Business Admin, Beneficial Owner, Compliance Reviewer, Compliance Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Business information intake | Form | Business Admin | Provide your company's basic business details including legal name, entity type, EIN, state of incorporation, and primary business activities. |
| 2 | Formation documents (Articles, Cert of Good Standing) | File Request | Business Admin | Upload your business formation documents including Articles of Incorporation/Organization and a current Certificate of Good Standing from your state of formation. |
| 3 | Ownership structure documentation | File Request | Business Admin | Upload your ownership structure documentation such as an operating agreement, shareholder registry, or organizational chart showing all owners with their ownership percentages. |
| 4 | Beneficial owner identification | Form | Beneficial Owner | Provide your personal details as a beneficial owner of the business. This information is required for regulatory compliance. |
| 5 | Beneficial owner ID verification | File Request | Beneficial Owner | Upload a clear copy of your government-issued photo ID (passport, driver's license, or national ID) for identity verification. |
| 6 | KYB review | To-Do | Compliance Reviewer | Review all submitted business documents and beneficial owner information for completeness and accuracy. Flag any discrepancies or missing items. |
| 7 | Clarification questions | Form | Business Admin | The compliance team has follow-up questions about your submission. Please provide the requested clarifications. |
| 8 | KYB decision | Approval | Compliance Manager | Review the complete KYB file including business documents, beneficial ownership verification, and compliance reviewer notes. Approve or reject the business account application. |

#### Step 1: Business information intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Business Name | Text (Single Line) | Yes |
| DBA / Trade Name | Text (Single Line) | No |
| Entity Type | Dropdown | Yes |
| EIN / Tax ID | Text (Single Line) | Yes |
| State of Incorporation | Text (Single Line) | Yes |
| Date of Incorporation | Date | Yes |
| Primary Business Activity | Text (Multi Line) | Yes |
| Business Address | Text (Multi Line) | Yes |

#### Step 4: Beneficial owner identification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | Text (Single Line) | Yes |
| Date of Birth | Date | Yes |
| Ownership Percentage | Number | Yes |
| Residential Address | Text (Multi Line) | Yes |
| Title / Role | Text (Single Line) | Yes |

#### Step 7: Clarification questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Details | Text (Multi Line) | Yes |

---

## 3. Beneficial Ownership (FinCEN BOI) Collection

**Tags**: All Industries, Corporate Services, Legal | **Complexity**: Standard | **Trigger**: New company formation / BOI deadline

**Description**: Collect and file Beneficial Ownership Information reports required by the Corporate Transparency Act. Guides reporting companies through exemption analysis, owner identification, and FinCEN submission with full audit trail.

**Use Cases**:
- Newly formed LLC filing its initial BOI report with FinCEN
- Law firm collecting BOI information on behalf of multiple entity clients
- Accounting firm managing BOI filings for small business clients
- Corporate services provider handling annual CTA compliance for portfolio companies

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Company Contact, Beneficial Owner, Filing Agent

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Exemption & reporting determination | Form | Filing Agent | Analyze the entity type, formation jurisdiction, and applicable exemption categories to determine if a BOI report is required. The CTA provides 23 exemption categories. |
| 2 | Reporting company information | Form | Company Contact | Provide the reporting company details required for the FinCEN BOI report, including all legal names, tax ID, and registered address. |
| 3 | Beneficial owner identification | Form | Company Contact | Identify all individuals with 25% or greater ownership or who exercise substantial control over the company, including senior officers, those with appointment authority, and key decision-makers. |
| 4 | Beneficial owner details & ID upload | Form | Beneficial Owner | Provide your personal details and upload your identifying document for the BOI report. Accepted IDs include passport, driver's license, or state-issued ID. |
| 5 | Company applicant information (if post-2024 entity) | Form | Filing Agent | For entities formed after January 1, 2024, provide information on up to two company applicants: the direct filer and the person who directed the filing. |
| 6 | Filing agent review & validation | To-Do | Filing Agent | Verify completeness of all submitted information, cross-reference ownership percentages, and validate ID documents before filing with FinCEN. |
| 7 | BOI report filing confirmation | Acknowledgement | Filing Agent | Confirm that the BOI report has been filed with FinCEN. Note the 30-day obligation to file updates or corrections if any reported information changes. |

#### Step 1: Exemption & reporting determination — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Entity Legal Name | Text (Single Line) | Yes |
| Entity Type | Dropdown | Yes |
| Jurisdiction of Formation | Text (Single Line) | Yes |
| Exemption Category (if applicable) | Dropdown | No |
| Exemption Analysis Notes | Text (Multi Line) | No |

#### Step 2: Reporting company information — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Name | Text (Single Line) | Yes |
| DBA / Trade Names | Text (Single Line) | No |
| EIN | Text (Single Line) | Yes |
| Jurisdiction of Formation | Text (Single Line) | Yes |
| Current U.S. Address | Text (Multi Line) | Yes |

#### Step 3: Beneficial owner identification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Beneficial Owner Full Name | Text (Single Line) | Yes |
| Ownership Percentage | Number | No |
| Basis of Beneficial Ownership | Dropdown | Yes |
| Role / Title | Text (Single Line) | Yes |

#### Step 4: Beneficial owner details & ID upload — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | Text (Single Line) | Yes |
| Date of Birth | Date | Yes |
| Residential Address | Text (Multi Line) | Yes |
| ID Document Type | Dropdown | Yes |
| ID Number | Text (Single Line) | Yes |

#### Step 5: Company applicant information (if post-2024 entity) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Applicant Full Name | Text (Single Line) | Yes |
| Date of Birth | Date | Yes |
| Business Address | Text (Multi Line) | Yes |
| ID Document Type | Dropdown | Yes |
| ID Number | Text (Single Line) | Yes |
| Role | Dropdown | Yes |

---

## 4. Periodic KYC/KYB Refresh

**Tags**: Financial Services, Banking | **Complexity**: Simple | **Trigger**: KYC refresh date (1-3 year cycle) / Risk trigger

**Description**: Run a streamlined refresh of existing KYC or KYB records when the review cycle triggers. Collects updated documentation from clients and beneficial owners, then routes through compliance review and approval.

**Use Cases**:
- Annual KYC refresh for high-risk retail banking clients
- Triennial review cycle for standard-risk business accounts
- Risk-triggered refresh after adverse media screening alert
- Regulatory exam preparation requiring updated client documentation

**Roles**: Client Contact, Beneficial Owner, Compliance Reviewer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Refresh notification | Form | Client Contact | Your account is due for a periodic KYC/KYB refresh. Please confirm your current details and indicate any changes to your personal or business information. |
| 2 | Updated documentation | File Request | Client Contact | Upload any updated documents such as a current government ID, proof of address, or updated financial statements as applicable to your account type. |
| 3 | UBO changes (if any) | Form | Client Contact | If there have been any changes to beneficial ownership, provide updated details here including new owners, ownership percentage changes, or departures. |
| 4 | Updated UBO documentation | File Request | Beneficial Owner | If beneficial ownership has changed, upload updated identification documents and any supporting ownership structure documentation. |
| 5 | Refresh review | To-Do | Compliance Reviewer | Review all updated documentation and compare against existing records. Verify that all changes are properly documented and the client profile is current. |
| 6 | Refresh approved | Approval | Compliance Reviewer | Approve the KYC/KYB refresh to confirm the client's records are current and compliant. Reject if additional documentation or clarification is needed. |

#### Step 1: Refresh notification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Have your personal/business details changed? | Dropdown | Yes |
| Description of Changes (if any) | Text (Multi Line) | No |

#### Step 3: UBO changes (if any) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Have there been changes to beneficial ownership? | Dropdown | Yes |
| Details of UBO Changes | Text (Multi Line) | No |

---

## 5. Commercial Loan Application & Underwriting

**Tags**: Banking, Credit Unions, Commercial Lending | **Complexity**: Complex | **Trigger**: Loan application submitted

**Description**: Guide commercial borrowers from initial application through underwriting, credit committee approval, and closing document execution. Captures financials, collateral, and disclosures in a structured pipeline that keeps every stakeholder aligned.

**Use Cases**:
- Small business applying for a commercial real estate loan
- Existing deposit customer requesting a working capital line of credit
- SBA loan application requiring federal documentation standards
- Agricultural borrower seeking seasonal operating line financing

**Requirements**:
- [ ] Upload your closing document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Roles**: Borrower, Loan Officer, Underwriter, Credit Committee

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Loan application intake | Form | Borrower | Complete the loan application with your personal and business details, the purpose of the loan, and the amount requested. |
| 2 | Personal financial statement | File Request | Borrower | Upload your personal financial statement showing assets, liabilities, and net worth. |
| 3 | Business tax returns & financial statements | File Request | Borrower | Upload your business tax returns and financial statements for the past 3 years, including income statements, balance sheets, and cash flow statements. |
| 4 | Collateral documentation | File Request | Borrower | Upload documentation for any collateral being offered, such as property appraisals, equipment valuations, or inventory reports. |
| 5 | Underwriter questions | Form | Borrower | The underwriting team has follow-up questions about your application. Please provide thorough answers to expedite the review process. |
| 6 | Conditional approval | Approval | Underwriter | Review the borrower's application, financial statements, and collateral documentation. Issue a conditional approval with any outstanding conditions, or decline with documented reasons. |
| 7 | Additional conditions | File Request | Borrower | Upload any additional documents required to satisfy the conditions of your conditional approval. |
| 8 | Credit committee approval | Approval | Credit Committee | Review the complete loan package including underwriter recommendation and conditional approval. Grant final approval or return for additional information. |
| 9 | Borrower disclosures | Acknowledgement | Borrower | Review and acknowledge the required loan disclosures, terms, and conditions before proceeding to closing. |
| 10 | Closing document execution | E-Sign | Borrower | Review and electronically sign the closing documents to finalize your commercial loan. |

#### Step 1: Loan application intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Name | Text (Single Line) | Yes |
| Social Security Number | Text (Single Line) | Yes |
| Employment / Business Name | Text (Single Line) | Yes |
| Loan Purpose | Text (Multi Line) | Yes |
| Requested Loan Amount | Number | Yes |
| Property Type (if applicable) | Dropdown | No |

#### Step 5: Underwriter questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Underwriter Questions & Responses | Text (Multi Line) | Yes |

---

## 6. Wire Transfer Authorization

**Tags**: Financial Services, Treasury, Corporate | **Complexity**: Standard | **Trigger**: Wire transfer request submitted

**Description**: Process wire transfer requests through dual authorization with OFAC screening, beneficiary verification, and post-transfer reconciliation. Enforces separation of duties and creates a complete audit trail for every outbound wire.

**Use Cases**:
- Vendor payment for a large capital equipment purchase
- International wire to a foreign subsidiary for payroll funding
- Client disbursement from a trust or escrow account
- Real estate closing funds transfer requiring same-day settlement

**Requirements**:
- [ ] Customize form fields to match your organization

**Roles**: Requestor, Approver 1, Approver 2, Treasury Operations

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Wire transfer request | Form | Requestor | Submit your wire transfer request with all beneficiary and payment details. Ensure bank routing information is accurate to avoid delays. |
| 2 | Supporting documentation | File Request | Requestor | Upload the supporting documentation for this wire transfer, such as an invoice, contract, or approval memo that justifies the payment. |
| 3 | OFAC/sanctions screening | To-Do | Treasury Operations | Screen the beneficiary and beneficiary bank against the OFAC SDN list and other applicable sanctions lists. Escalate any potential hits to compliance immediately. |
| 4 | Beneficiary verification & callback | To-Do | Treasury Operations | Match the beneficiary to the approved payee list, verify bank details against prior payments, and perform a callback to a known phone number to confirm wire instructions. |
| 5 | First authorization | Approval | Approver 1 | Review the wire transfer request, supporting documentation, and screening results. Authorize the wire or reject with documented reasons. |
| 6 | Second authorization | Approval | Approver 2 | Provide independent second authorization for this wire transfer. Required for amounts above the single-approval threshold. Verify the request independently from the first approver. |
| 7 | Wire execution confirmation | Acknowledgement | Treasury Operations | Confirm that the wire has been submitted for execution. Record the confirmation number and Fed reference number for audit purposes. |
| 8 | Post-transfer reconciliation | To-Do | Treasury Operations | Verify the wire posted to the bank statement, reconcile against the general ledger, and close out the transaction record. |

#### Step 1: Wire transfer request — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Beneficiary Name | Text (Single Line) | Yes |
| Bank Name | Text (Single Line) | Yes |
| SWIFT / BIC Code | Text (Single Line) | No |
| ABA Routing Number | Text (Single Line) | No |
| Account Number | Text (Single Line) | Yes |
| Amount | Number | Yes |
| Currency | Dropdown | Yes |
| Purpose / Reference | Text (Multi Line) | Yes |

---

## 7. Investment Account Opening

**Tags**: Wealth Management, Brokerage, RIA | **Complexity**: Standard | **Trigger**: New client engagement

**Description**: Open new investment accounts with identity verification, suitability assessment, risk disclosures, and account agreement execution. Meets SEC, FINRA, and Reg BI requirements while providing a smooth client experience.

**Use Cases**:
- High-net-worth individual opening a managed brokerage account
- New RIA client establishing a discretionary advisory relationship
- Existing bank customer adding an investment account through wealth management
- Trust or estate opening an investment account for beneficiaries

**Requirements**:
- [ ] Upload your account agreement document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Roles**: Investor, Account Manager, Compliance Officer, Operations

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Account application | Form | Investor | Complete your investment account application with personal details, employment information, and account preferences. |
| 2 | Identity verification documents | File Request | Investor | Upload a government-issued photo ID and a secondary verification document such as a utility bill or bank statement. |
| 3 | Accreditation documentation (if applicable) | File Request | Investor | If applicable, upload documentation supporting your accredited investor status such as recent tax returns, brokerage statements, or a CPA/attorney verification letter. |
| 4 | Suitability questionnaire | Form | Investor | Complete the suitability questionnaire to help us understand your investment objectives, risk tolerance, and financial situation. |
| 5 | Risk disclosure acknowledgement | Acknowledgement | Investor | Review and acknowledge the investment risk disclosures, including the potential for loss of principal, market volatility, and liquidity risks. |
| 6 | Account agreement | E-Sign | Investor | Review and electronically sign the account agreement, including terms of service, fee schedule, and advisory or brokerage agreement. |
| 7 | Compliance review | To-Do | Compliance Officer | Review the account application, identity verification, suitability questionnaire, and signed agreements for regulatory compliance. Flag any issues or discrepancies. |
| 8 | Operations setup | To-Do | Operations | Set up the account in the trading and custodial systems, configure permissions, and prepare for funding instructions. |
| 9 | Account activation | Approval | Account Manager | Confirm that compliance review and operations setup are complete. Activate the account and notify the investor that the account is ready for funding. |

#### Step 1: Account application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | Text (Single Line) | Yes |
| Date of Birth | Date | Yes |
| Social Security Number | Text (Single Line) | Yes |
| Email Address | Email | Yes |
| Employer Name | Text (Single Line) | No |
| Account Type | Dropdown | Yes |

#### Step 4: Suitability questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Investment Objective | Dropdown | Yes |
| Risk Tolerance | Dropdown | Yes |
| Investment Time Horizon | Dropdown | Yes |
| Annual Income | Dropdown | Yes |
| Liquid Net Worth | Dropdown | Yes |
| Investment Experience | Dropdown | Yes |

---

## 8. Credit Line Renewal / Increase Request

**Tags**: Banking, Commercial Lending, Credit Unions | **Complexity**: Standard | **Trigger**: Credit facility approaching maturity / Borrower requests increase

**Description**: Manage credit facility renewals and limit increase requests from borrower intake through credit analysis, dual approval, and document execution. Keeps relationship managers, analysts, and credit committees coordinated throughout the process.

**Use Cases**:
- Annual renewal of a revolving line of credit for a commercial borrower
- Borrower requesting a limit increase to fund business expansion
- Seasonal credit line adjustment for agricultural or retail businesses
- Credit facility restructuring to accommodate changed business conditions

**Requirements**:
- [ ] Upload your renewal/modification document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Roles**: Borrower, Relationship Manager, Credit Analyst, Credit Committee

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Renewal/increase request | Form | Borrower | Submit your credit line renewal or increase request. Provide details about the current facility, requested changes, and the business reasons for the request. |
| 2 | Updated financial statements | File Request | Borrower | Upload your current year profit & loss statement, balance sheet, interim financials, and most recent tax returns. |
| 3 | Borrower update questionnaire | Form | Borrower | Provide updates on your business since the original facility was established. This helps the credit team assess any material changes. |
| 4 | Credit analysis & financial spreading | To-Do | Credit Analyst | Perform financial spreading and credit analysis including covenant compliance, collateral coverage, cash flow adequacy, and industry trend assessment. |
| 5 | Credit analyst recommendation | File Request | Credit Analyst | Upload your credit analysis report with recommendation, including financial spreading results, risk assessment, and proposed terms. |
| 6 | Relationship manager endorsement | Approval | Relationship Manager | Review the credit analyst recommendation and endorse the renewal or increase request. Add any relationship context relevant to the credit decision. |
| 7 | Credit committee approval | Approval | Credit Committee | Review the complete credit package and provide final approval for the credit line renewal or increase. Note any conditions or modifications to the proposed terms. |
| 8 | Renewal/modification documents | E-Sign | Borrower | Review and electronically sign the renewal or modification documents to finalize the updated credit facility terms. |
| 9 | Facility activation confirmation | Acknowledgement | Relationship Manager | Confirm that the renewed or modified credit facility is active and available for use. Notify the borrower of the effective date and updated terms. |

#### Step 1: Renewal/increase request — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Facility Type | Dropdown | Yes |
| Current Limit | Number | Yes |
| Requested Limit / Term | Text (Single Line) | Yes |
| Purpose of Request | Text (Multi Line) | Yes |
| Business Changes Since Origination | Text (Multi Line) | No |

#### Step 3: Borrower update questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Any material changes to business operations? | Dropdown | Yes |
| Any new debt or obligations? | Dropdown | Yes |
| Any pending or active litigation? | Dropdown | Yes |
| Any ownership changes? | Dropdown | Yes |
| Collateral status update | Text (Multi Line) | No |
