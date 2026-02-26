# Insurance & Claims (7 Templates)

> Workflow templates for insurance operations including claims coordination, application underwriting, certificates of insurance, workers' compensation, policy renewals, surety bonds, and premium audits.

---

## 1. Insurance Claim Coordination

**Tags**: Insurance, P&C | **Complexity**: Standard | **Trigger**: Claim filed (FNOL)

**Description**: Coordinate insurance claims from first notice of loss through investigation, documentation, and settlement. Ensures claimants and adjusters stay aligned throughout the process.

**Use Cases**:
- Property damage claim following a covered event
- Auto insurance claim requiring adjuster investigation and documentation
- Homeowner claim with multiple parties and repair estimates
- Commercial property claim with complex loss documentation

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your claims management system (Guidewire, Duck Creek, Majesco) to auto-create claim records from FNOL submissions and sync status updates
- Integrate with your policy administration system to auto-verify coverage and pull policy details during the triage step
- Set up email or SMS notifications to claimants with real-time claim status updates at each stage of the process
- Connect to your payment system to auto-initiate settlement disbursement once the claim decision is approved

**Roles**: Claimant, Claims Adjuster, Claims Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | First Notice of Loss (FNOL) | Form | Claimant | Report the details of your loss or incident. Provide as much information as possible to help expedite your claim. |
| 2 | AI coverage verification & triage | To-Do | Claims Adjuster | AI-powered: Validate policy coverage, confirm applicable coverages, check for exclusions, flag potential fraud indicators, and assign severity level based on the FNOL details. |
| 3 | Claim acknowledgement | To-Do | Claims Adjuster | Automated notification: Send claim acknowledgement to the claimant including their claim number, assigned adjuster contact information, expected next steps, and estimated timeline. |
| 4 | Loss documentation & evidence | File Request | Claimant | Upload documentation and evidence supporting your claim including photos or video of damage, police report (if applicable), repair estimates, and receipts for damaged items. |
| 5 | Adjuster assessment & investigation | To-Do | Claims Adjuster | Review all submitted documentation, conduct the claim investigation, and prepare your assessment including coverage determination, damage valuation, and settlement recommendation. |
| 6 | Additional documentation request | File Request | Claimant | Upload any additional documentation requested by the claims adjuster to complete the investigation. |
| 7 | Claim decision | Approval | Claims Manager | Review the adjuster assessment and investigation findings. Approve the claim settlement, request additional investigation, or deny the claim with documented rationale. |
| 8 | Settlement acknowledgement | Acknowledgement | Claimant | Review and acknowledge the claim settlement decision including the approved amount, payment method, and any next steps for receiving your settlement. |

#### Step 1: First Notice of Loss (FNOL) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Policy Number | TEXT_SINGLE_LINE | Yes |
| Date of Loss | DATE | Yes |
| Location of Loss | TEXT_SINGLE_LINE | Yes |
| Loss Type | DROPDOWN | Yes |
| Description of Incident | TEXT_MULTI_LINE | Yes |
| Initial Damage Estimate ($) | NUMBER | No |

---

## 2. Insurance Application & Underwriting

**Tags**: Insurance, Brokerage | **Complexity**: Standard | **Trigger**: Insurance application submitted

**Description**: Guide insurance applications through the full underwriting process from intake through risk assessment and policy issuance. Keeps applicants, brokers, and underwriters coordinated at every stage.

**Use Cases**:
- New commercial insurance policy application and underwriting
- Personal lines insurance application with broker coordination
- Specialty insurance underwriting requiring detailed risk assessment
- Group insurance application for a new employer client

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your policy administration system (Guidewire, Duck Creek) to auto-create submissions and push approved policies directly into the system of record
- Integrate with third-party data providers (LexisNexis, Verisk) to auto-pull loss history and risk scoring during underwriting review
- Set up Slack or Teams notifications to alert underwriters when new applications are submitted and when applicants respond to underwriting questions
- Connect to your agency management system (Applied Epic, Vertafore AMS360) to sync application status and policy details with the broker

**Roles**: Applicant, Agent/Broker, Underwriter, Underwriting Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Application intake | Form | Applicant | Complete the insurance application with your business or personal information to begin the underwriting process. |
| 2 | Supporting documentation | File Request | Applicant | Upload supporting documents for your application such as financial statements, loss runs, prior policy declarations, or industry-specific documentation. |
| 3 | Agent submission | To-Do | Agent/Broker | Review the completed application and supporting documents for completeness. Submit the application package to the underwriting team with your broker notes and recommendation. |
| 4 | Underwriting questions | Form | Applicant | Answer additional questions from the underwriting team to help them assess your risk profile. |
| 5 | Risk assessment | To-Do | Underwriter | Perform the risk assessment including analysis of the application, supporting documents, claims history, and industry benchmarks. Prepare the underwriting recommendation. |
| 6 | Conditional requirements | File Request | Applicant | Upload any additional documents requested as conditional requirements for underwriting approval, such as updated inspections, safety programs, or financial statements. |
| 7 | Manager review (if needed) | To-Do | Underwriting Manager | Review the underwriting file for applications that exceed standard authority limits or present unusual risk characteristics. Provide guidance or final decision. |
| 8 | Underwriting decision | Approval | Underwriter | Issue the underwriting decision including approved terms, premium, conditions, and any exclusions. Approve, modify, or decline the application. |
| 9 | Policy acknowledgement | Acknowledgement | Applicant | Review and acknowledge the underwriting decision. If approved, confirm your understanding of the policy terms, premium, and effective date. |

#### Step 1: Application intake — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Applicant Name | TEXT_SINGLE_LINE | Yes |
| Business Name (if applicable) | TEXT_SINGLE_LINE | No |
| Email Address | EMAIL | Yes |
| Insurance Type Requested | DROPDOWN | Yes |
| Requested Coverage Amount | NUMBER | Yes |
| Desired Effective Date | DATE | Yes |

#### Step 4: Underwriting questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Years in Business | NUMBER | No |
| Prior Claims History | TEXT_MULTI_LINE | Yes |
| Risk Management Practices | TEXT_MULTI_LINE | No |
| Additional Information | TEXT_MULTI_LINE | No |

---

## 3. Certificate of Insurance Request

**Tags**: All Industries, Insurance | **Complexity**: Simple | **Trigger**: Contract requires COI / Third party request

**Description**: Process certificate of insurance requests from intake through issuance and delivery. Coordinates between certificate holders, insureds, and agents for efficient COI fulfillment.

**Use Cases**:
- Vendor providing COI to a new client as part of contract requirements
- Subcontractor furnishing proof of insurance to general contractor
- Tenant providing landlord with certificate of insurance for lease compliance
- Company providing COI for a special event or venue requirement

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your agency management system (Applied Epic, Vertafore AMS360) to auto-pull policy and coverage data for COI generation
- Integrate with an ACORD forms platform to auto-populate Certificate of Insurance (ACORD 25) fields from request details
- Set up automated email delivery to certificate holders with the completed COI attached as soon as it is uploaded

**Roles**: Certificate Holder, Insured, Insurance Coordinator, Agent

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | COI request details | Form | Certificate Holder | Provide the details for your certificate of insurance request including the required coverages and certificate holder information. |
| 2 | Additional insured requirements | Form | Certificate Holder | Specify any additional insured endorsement requirements or special provisions that must appear on the certificate. |
| 3 | Insured authorization | Acknowledgement | Insured | Authorize the release of your certificate of insurance information to the requesting certificate holder. |
| 4 | Agent coordination | To-Do | Agent | Coordinate with the insurance carrier to arrange any required endorsements, additional insured status, or waiver of subrogation as specified in the request. |
| 5 | COI generation | To-Do | Insurance Coordinator | Generate the certificate of insurance with all required information, endorsements, and certificate holder details. Verify accuracy before delivery. |
| 6 | COI delivery | File Request | Insurance Coordinator | Upload the completed certificate of insurance for delivery to the certificate holder. |
| 7 | Receipt acknowledgement | Acknowledgement | Certificate Holder | Acknowledge receipt of the certificate of insurance and confirm it meets your requirements. |

#### Step 1: COI request details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Certificate Holder Name | TEXT_SINGLE_LINE | Yes |
| Certificate Holder Address | TEXT_MULTI_LINE | Yes |
| Required Coverage Types | TEXT_MULTI_LINE | Yes |
| Minimum Coverage Amounts | TEXT_MULTI_LINE | No |
| Date Needed By | DATE | Yes |

#### Step 2: Additional insured requirements — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Additional Insured Required | DROPDOWN | Yes |
| Additional Insured Name & Address | TEXT_MULTI_LINE | No |
| Waiver of Subrogation Required | DROPDOWN | No |
| Special Provisions or Endorsements | TEXT_MULTI_LINE | No |

---

## 4. Workers' Compensation Claim Coordination

**Tags**: All Industries, HR, Insurance | **Complexity**: Standard | **Trigger**: Workplace injury reported

**Description**: Manage workplace injury claims from initial report through investigation, medical documentation, and return-to-work coordination. Ensures compliance with state workers' compensation laws and OSHA requirements.

**Use Cases**:
- Employee workplace injury requiring medical treatment and modified duty
- On-the-job accident with OSHA recordability assessment
- Repetitive strain injury claim requiring ongoing treatment coordination
- Workplace incident investigation with witness statements and safety review

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your HRIS (ADP, Workday, BambooHR) to auto-pull employee wage data and job classification for benefits calculation
- Integrate with your state workers' compensation board e-filing portal to auto-submit the First Report of Injury (FROI) within mandated deadlines
- Set up Teams or Slack notifications to alert HR and the claims adjuster immediately when a new injury report is submitted
- Connect to your OSHA recordkeeping system to auto-log recordable incidents and maintain your 300 log

**Roles**: Injured Employee, Employer/HR, Claims Adjuster, Treating Physician

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Injury report | Form | Injured Employee | Report the details of your workplace injury as soon as possible. Accurate information helps ensure you receive proper care and benefits. |
| 2 | Employer incident investigation | Form | Employer/HR | Complete the incident investigation documenting the root cause, safety conditions, and OSHA recordability determination. |
| 3 | Wage statement & employment verification | Form | Employer/HR | Provide the wage and employment details needed for benefits calculation and claim processing. |
| 4 | First Report of Injury (FROI) filing | To-Do | Employer/HR | File the First Report of Injury with the state workers' compensation board and insurance carrier within the state-mandated deadline (typically 5-10 days). Document the filing confirmation. |
| 5 | Medical records & treatment plan | File Request | Treating Physician | Upload the medical documentation including diagnosis, treatment plan, work restrictions, and disability status determination. |
| 6 | Compensability determination | Decision | Claims Adjuster | Review all investigation materials, medical documentation, and employment records. Determine claim compensability: Accept, Deny, or Investigate Further. |
| 7 | Return-to-work plan | Form | Treating Physician | Provide the return-to-work plan with any restrictions, accommodations, and expected timeline for the injured employee. |
| 8 | Modified duty acknowledgement | Acknowledgement | Injured Employee | Review and acknowledge the return-to-work plan including any work restrictions, modified duty assignments, and follow-up requirements. |
| 9 | Claim closure approval | Approval | Claims Adjuster | Review the claim for closure. Verify that all benefits have been paid, treatment is complete or at maximum medical improvement (MMI), and authorize final case closure. |

#### Step 1: Injury report — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Date of Injury | DATE | Yes |
| Time of Injury | TEXT_SINGLE_LINE | Yes |
| Location of Injury | TEXT_SINGLE_LINE | Yes |
| Nature of Injury | TEXT_MULTI_LINE | Yes |
| Body Part Affected | TEXT_SINGLE_LINE | Yes |
| Witnesses | TEXT_MULTI_LINE | No |
| Immediate Treatment Received | TEXT_MULTI_LINE | No |

#### Step 2: Employer incident investigation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Root Cause Analysis | TEXT_MULTI_LINE | Yes |
| OSHA Recordable | DROPDOWN | Yes |
| Witness Statements | TEXT_MULTI_LINE | No |
| Safety Conditions at Time of Incident | TEXT_MULTI_LINE | Yes |

#### Step 3: Wage statement & employment verification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Average Weekly Wage | NUMBER | Yes |
| Pay Rate | NUMBER | Yes |
| Hours Worked Per Week | NUMBER | Yes |
| Job Classification | TEXT_SINGLE_LINE | Yes |
| Modified Duty Available | DROPDOWN | Yes |

#### Step 7: Return-to-work plan — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Work Restrictions | TEXT_MULTI_LINE | Yes |
| Duty Status | DROPDOWN | Yes |
| Required Accommodations | TEXT_MULTI_LINE | No |
| Expected Duration | TEXT_SINGLE_LINE | Yes |

---

## 5. Policy Renewal Coordination

**Tags**: Insurance, Commercial Lines | **Complexity**: Standard | **Trigger**: Renewal date approaching (60-90 days)

**Description**: Coordinate insurance policy renewals from initial notice through updated exposure data collection, underwriting review, and formal acceptance. Ensures timely renewals with no coverage gaps.

**Use Cases**:
- Annual commercial property insurance policy renewal
- Workers' compensation policy renewal with updated payroll data
- General liability policy renewal for a growing business
- Multi-line commercial insurance renewal coordination

**Requirements**:
- [ ] Upload your renewal documents for e-signature (replaces sample)

**Recommendations**:
- Connect to your policy administration system (Guidewire, Duck Creek) to auto-trigger renewal flows 90 days before expiration and pre-fill current policy data
- Integrate with your agency management system (Applied Epic, Vertafore AMS360) to sync renewal quotes and bind confirmations with the broker of record
- Set up automated email reminders to policyholders with escalating urgency as the renewal deadline approaches
- Connect to third-party data providers (Verisk, ISO) to auto-pull updated loss cost data and industry benchmarks for underwriting review

**Roles**: Policyholder, Account Manager, Underwriter, Broker

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Renewal notice acknowledgement | Acknowledgement | Policyholder | Acknowledge receipt of your upcoming policy renewal notice and confirm your intent to proceed with the renewal process. |
| 2 | Updated exposure information | Form | Policyholder | Provide updated exposure information for the renewal period to ensure your coverage accurately reflects your current operations. |
| 3 | Loss run / claims history | File Request | Policyholder | Upload your current loss run or claims history documentation for the underwriter to review during the renewal assessment. |
| 4 | Broker review | To-Do | Broker | Review the updated exposure information and loss history. Prepare the renewal submission with market analysis and coverage recommendations. |
| 5 | Underwriter questions | Form | Policyholder | Answer additional questions from the underwriter about changes to your operations, claims, or risk profile since the last policy period. |
| 6 | Renewal quote review | To-Do | Account Manager | Review the renewal quote terms, premium, and coverage changes. Prepare a comparison to the expiring policy and present options to the policyholder. |
| 7 | Quote acceptance | Approval | Policyholder | Review the renewal quote including premium, coverage terms, and any changes from the expiring policy. Approve to bind the renewal. |
| 8 | Renewal documents | E-Sign | Policyholder | Review and sign the renewal documents to formally bind coverage for the new policy period. |

#### Step 2: Updated exposure information — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Current Revenue | NUMBER | Yes |
| Number of Employees | NUMBER | Yes |
| Property Value Updates | TEXT_MULTI_LINE | No |
| New Locations or Operations | TEXT_MULTI_LINE | No |
| Changes to Operations Since Last Renewal | TEXT_MULTI_LINE | No |

#### Step 5: Underwriter questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Risk Management Updates | TEXT_MULTI_LINE | No |
| Open Claims Status | TEXT_MULTI_LINE | No |
| Additional Information | TEXT_MULTI_LINE | No |

---

## 6. Surety Bond Application

**Tags**: Construction, Surety, Contractors | **Complexity**: Standard | **Trigger**: Bond required for contract / Bid bond needed

**Description**: Manage surety bond applications from intake through financial underwriting, indemnity agreement execution, and bond issuance. Coordinates principals, agents, and underwriters through a thorough evaluation process.

**Use Cases**:
- Contractor applying for a performance and payment bond on a public project
- Bid bond application for a competitive construction procurement
- Subdivision bond or site improvement bond for a real estate developer
- License and permit bond application for a new contractor

**Requirements**:
- [ ] Upload your General Indemnity Agreement document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your surety management system (Tinuiti, SurePath) to auto-create bond submissions and track bonding capacity utilization
- Integrate with credit bureaus (Dun & Bradstreet, Experian) for automated credit pulls on principals and indemnitors during underwriting
- Set up email notifications to the surety agent when financial documents and the signed GIA are submitted so underwriting can begin promptly
- Connect to your construction project management platform (Procore, Sage) to auto-verify project details and contractor performance history

**Roles**: Principal (Applicant), Surety Agent, Underwriter

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Bond application | Form | Principal (Applicant) | Complete the bond application with your project and company details to begin the underwriting process. |
| 2 | Financial documentation | File Request | Principal (Applicant) | Upload your financial documentation including 3 years of CPA-prepared corporate financials, personal financial statements of owners, bank references, and current insurance certificates. |
| 3 | Work-in-progress schedule | File Request | Principal (Applicant) | Upload your work-in-progress schedule including current projects, backlog, completed project history, and bonding capacity needs. |
| 4 | General Indemnity Agreement | E-Sign | Principal (Applicant) | Review and execute the General Indemnity Agreement (GIA) by the principal and all individual indemnitors. This is required before underwriting proceeds. |
| 5 | Credit check & loss history review | To-Do | Surety Agent | Pull a soft credit report on the principal and individual indemnitors. Obtain prior surety loss runs and claims history from previous surety companies. |
| 6 | Underwriting review | To-Do | Underwriter | Evaluate the three Cs of surety underwriting: Character, Capacity, and Capital. Review financials, work-in-progress schedule, credit reports, claims history, and the executed GIA. |
| 7 | Bond approval & terms | Decision | Underwriter | Issue the bond decision: Approve, Conditional Approval, or Decline. Include premium rate, bond limits, and any conditions that must be met. |
| 8 | Bond issuance & delivery | To-Do | Surety Agent | Execute the bond document, verify all obligee requirements are met, and deliver the executed bond to the obligee. |

#### Step 1: Bond application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Bond Type | DROPDOWN | Yes |
| Penal Sum ($) | NUMBER | Yes |
| Obligee Name | TEXT_SINGLE_LINE | Yes |
| Project Details (if contract bond) | TEXT_MULTI_LINE | No |
| Ownership Structure | TEXT_MULTI_LINE | Yes |

---

## 7. Insurance Audit Coordination

**Tags**: Insurance, Commercial Lines | **Complexity**: Standard | **Trigger**: Policy audit scheduled

**Description**: Coordinate insurance policy audits from initial notice through records collection, auditor review, and premium adjustment. Ensures policyholders provide timely documentation for accurate premium reconciliation.

**Use Cases**:
- Annual workers' compensation policy audit requiring payroll verification
- General liability policy audit based on revenue or sales figures
- Commercial insurance audit following policy expiration
- Premium audit requiring classification verification across multiple locations

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your payroll provider (ADP, Paychex, Gusto) to auto-pull payroll records and classification data for the audit period
- Integrate with your accounting system (QuickBooks, Sage, Xero) to auto-export sales and revenue records needed for premium calculation
- Set up automated email reminders to policyholders with document checklists and escalating deadlines as the audit window progresses

**Roles**: Policyholder, Auditor, Account Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Audit notice acknowledgement | Acknowledgement | Policyholder | Acknowledge receipt of the audit notice and confirm your understanding of the documentation requirements and timeline. |
| 2 | Payroll records | File Request | Policyholder | Upload your payroll records for the audit period including quarterly tax returns, payroll summaries by classification, and overtime detail. |
| 3 | Sales / revenue records | File Request | Policyholder | Upload your sales and revenue records for the audit period including annual financial statements, sales reports, and subcontractor payment records. |
| 4 | Classification questionnaire | Form | Policyholder | Complete the classification questionnaire to help the auditor accurately categorize your operations and employee classifications. |
| 5 | Auditor review | To-Do | Auditor | Review all submitted records, verify classifications, and calculate the audited premium based on actual exposures during the policy period. |
| 6 | Clarification questions | Form | Policyholder | Answer any clarification questions from the auditor regarding your records, classifications, or operations. |
| 7 | Audit findings | File Request | Auditor | Upload the completed audit findings report including the audited premium calculation, classification adjustments, and any discrepancies identified. |
| 8 | Premium adjustment acknowledgement | Acknowledgement | Policyholder | Review and acknowledge the audit findings and resulting premium adjustment. Contact your account manager if you have questions about the adjustment. |

#### Step 4: Classification questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Number of Employees by Classification | TEXT_MULTI_LINE | Yes |
| Description of Operations | TEXT_MULTI_LINE | Yes |
| Subcontractor Usage | TEXT_MULTI_LINE | No |
| Changes in Operations During Policy Period | TEXT_MULTI_LINE | No |

#### Step 6: Clarification questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Response to Auditor Questions | TEXT_MULTI_LINE | Yes |
| Additional Documentation Notes | TEXT_MULTI_LINE | No |
