# HR & Employee Lifecycle (5 Templates)

> Hiring, onboarding, transfers, and offboarding

---

## 1. Employee Onboarding

**Tags**: All Industries | **Complexity**: Complex | **Trigger**: Offer accepted

**Description**: Onboard new hires from offer acceptance through paperwork, I-9 verification, benefits enrollment, and first-day orientation. Coordinates HR, IT provisioning, and the hiring manager so every new employee starts productively on day one.

**Use Cases**:
- Full-time employee starts after accepting an offer letter
- Intern converts to permanent hire and needs full onboarding
- Acquired company employees transfer into new organization
- Remote employee in a different state requires compliant onboarding

**Requirements**:
- [ ] Upload your offer letter and employment agreements for e-signature (replaces sample)

**Roles**: New Hire, HR Coordinator, Hiring Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Personal information form | Form | New Hire | Provide your personal details so we can set up your employee record. Include your legal name, date of birth, contact information, and emergency contacts. |
| 2 | Offer letter & employment agreements | E-Sign | New Hire | Review and sign your offer letter, non-disclosure agreement, IP assignment agreement, and employee handbook acknowledgement. |
| 3 | Tax forms (W-4, state) | File Request | New Hire | Upload your completed federal W-4 and applicable state withholding forms for payroll setup. |
| 4 | I-9 verification documents | File Request | New Hire | Upload identity and employment authorization documents per I-9 requirements: either one List A document, or one List B plus one List C document. |
| 5 | I-9 employer verification | To-Do | HR Coordinator | Examine the new hire's I-9 documents, complete Section 2 of Form I-9, and ensure verification is completed within 3 business days of start date. |
| 6 | Direct deposit & benefits enrollment | Form | New Hire | Set up your direct deposit and enroll in benefits. Provide your banking information and select your medical, dental, vision, and 401(k) options. |
| 7 | Equipment provisioning | To-Do | HR Coordinator | Order and provision the new hire's equipment (laptop, monitors, peripherals) and ensure delivery before or on the start date. |
| 8 | System access & accounts | To-Do | HR Coordinator | Create the new hire's email account, SSO credentials, and access to role-specific applications. Verify all accounts are functional before day one. |
| 9 | First-day orientation | To-Do | HR Coordinator | Conduct the first-day orientation covering company overview, policies, facilities tour (or virtual equivalent), and introductions to key team members. |
| 10 | Manager welcome & 30-day plan | Acknowledgement | Hiring Manager | Welcome the new hire to the team and share the 30-day plan including initial goals, key meetings, and ramp-up milestones. |

#### Step 1: Personal information form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Full Name | Text (single line) | Yes |
| Date of Birth | Date | Yes |
| Personal Email | Email | Yes |
| Phone Number | Text (single line) | Yes |
| Home Address | Text (multi-line) | Yes |
| Emergency Contact Name | Text (single line) | Yes |
| Emergency Contact Phone | Text (single line) | Yes |
| Emergency Contact Relationship | Text (single line) | Yes |

#### Step 6: Direct deposit & benefits enrollment — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Bank Name | Text (single line) | Yes |
| Routing Number | Text (single line) | Yes |
| Account Number | Text (single line) | Yes |
| Account Type | Dropdown | Yes |
| Medical Plan | Dropdown | No |
| Dental Plan | Dropdown | No |
| Vision Plan | Dropdown | No |
| 401(k) Contribution % | Number | No |

---

## 2. Contractor / Freelancer Onboarding

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Contractor engagement approved

**Description**: Onboard independent contractors and freelancers with proper classification checks, agreement execution, and payment setup. Ensures compliance with IRS guidelines while getting contractors productive quickly.

**Use Cases**:
- Marketing team engages a freelance designer for a campaign project
- Engineering hires a contract developer for a 6-month sprint
- Consulting firm brings on a subject matter expert for a client engagement
- Company engages an interim executive while searching for a permanent hire

**Requirements**:
- [ ] Upload your SOW / contractor agreement for e-signature (replaces sample)
- [ ] Upload your NDA document for e-signature (replaces sample)

**Roles**: Contractor, Hiring Manager, Finance

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Contractor information form | Form | Contractor | Provide your business details including legal or business name, entity type, and work authorization status. |
| 2 | Engagement details | Form | Hiring Manager | Define the engagement parameters including project scope, start and end dates, rate, budget, and business justification. |
| 3 | AI classification risk check | To-Do | Hiring Manager | AI-powered: Evaluate the engagement against the IRS 20-factor test for worker classification. Generate a misclassification risk score (Low/Medium/High) with recommendations. |
| 4 | SOW / contractor agreement | E-Sign | Contractor | Review and sign the Statement of Work and independent contractor agreement defining scope, deliverables, and terms. |
| 5 | NDA execution | E-Sign | Contractor | Review and sign the Non-Disclosure Agreement to protect confidential information accessed during the engagement. |
| 6 | W-9 & insurance documents | File Request | Contractor | Upload your completed W-9 form and certificates of insurance (general liability and professional liability, if applicable). |
| 7 | Payment setup form | Form | Contractor | Provide your payment details so we can process invoices promptly. |
| 8 | System access provisioning | To-Do | Hiring Manager | Provision necessary system access for the contractor, including project tools, communication platforms, and any role-specific applications with appropriate permissions. |
| 9 | Onboarding complete | Acknowledgement | Hiring Manager | Acknowledge that the contractor onboarding is complete and the engagement is ready to begin. |

#### Step 1: Contractor information form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal / Business Name | Text (single line) | Yes |
| Entity Type | Dropdown | Yes |
| Work Authorization Status | Dropdown | Yes |
| Contact Email | Email | Yes |
| Phone Number | Text (single line) | No |

#### Step 2: Engagement details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Project / Engagement Name | Text (single line) | Yes |
| Start Date | Date | Yes |
| End Date | Date | Yes |
| Hourly Rate / Fixed Fee | Text (single line) | Yes |
| Total Budget | Text (single line) | Yes |
| Business Justification | Text (multi-line) | Yes |

#### Step 7: Payment setup form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Bank Name | Text (single line) | Yes |
| Routing Number | Text (single line) | Yes |
| Account Number | Text (single line) | Yes |
| Payment Method Preference | Dropdown | Yes |
| Invoice Submission Instructions | Text (multi-line) | No |

---

## 3. Background Check & Employment Verification

**Tags**: HR, Recruiting | **Complexity**: Standard | **Trigger**: Offer extended / Pre-employment screening

**Description**: Manage pre-employment screening from authorization through background checks, employment history verification, and education verification. Ensures thorough vetting while keeping the candidate informed throughout the process.

**Use Cases**:
- Standard pre-employment background check for a new hire
- Promotion to a sensitive role requires additional screening
- Contractor engagement mandates background verification
- Periodic re-screening for employees in regulated positions

**Requirements**:
- [ ] Upload your background check authorization document for e-signature (replaces sample)

**Roles**: Candidate, HR Coordinator, Background Vendor, Previous Employer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Background check authorization | E-Sign | Candidate | Review and sign the background check authorization form consenting to criminal, employment, and education verification. |
| 2 | Candidate information | Form | Candidate | Provide your personal information needed for the background screening process. |
| 3 | Employment history | Form | Candidate | List your employment history for the past 7 years, including employer name, title, dates, and supervisor contact information. |
| 4 | Verification request | To-Do | Background Vendor | Initiate the background check with the screening vendor. Submit candidate information and monitor progress across all verification categories. |
| 5 | Previous employer verification | Form | Previous Employer | Verify the candidate's employment with your organization by confirming dates of employment, title, and eligibility for rehire. |
| 6 | Education verification | To-Do | Background Vendor | Verify the candidate's educational credentials with the listed institutions. Confirm degrees, dates of attendance, and any honors. |
| 7 | Results review | To-Do | HR Coordinator | Review the completed background check results, employment verifications, and education verifications. Flag any discrepancies or adverse findings for further evaluation. |
| 8 | Candidate acknowledgement | Acknowledgement | Candidate | Acknowledge that the background check process is complete. You will be notified of the outcome by the hiring team. |

#### Step 2: Candidate information — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Full Name | Text (single line) | Yes |
| Other Names Used | Text (single line) | No |
| Date of Birth | Date | Yes |
| Social Security Number | Text (single line) | Yes |
| Current Address | Text (multi-line) | Yes |
| Addresses for Past 7 Years | Text (multi-line) | Yes |

#### Step 3: Employment history — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Employer Name | Text (single line) | Yes |
| Job Title | Text (single line) | Yes |
| Start Date | Date | Yes |
| End Date | Date | No |
| Supervisor Name & Contact | Text (single line) | No |
| Reason for Leaving | Text (single line) | No |

#### Step 5: Previous employer verification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Candidate Name | Text (single line) | Yes |
| Dates of Employment | Text (single line) | Yes |
| Job Title | Text (single line) | Yes |
| Eligible for Rehire? | Dropdown | Yes |
| Additional Comments | Text (multi-line) | No |

---

## 4. Employee Termination / Offboarding

**Tags**: All Industries, HR | **Complexity**: Standard | **Trigger**: Termination decision / Resignation

**Description**: Manage the complete employee separation process from notification through exit interview, benefits transition, equipment return, access revocation, and final pay. Ensures compliance and a respectful offboarding experience.

**Use Cases**:
- Employee submits voluntary resignation with standard notice period
- Involuntary termination requires structured offboarding process
- Retiring employee needs comprehensive benefits transition guidance
- Remote employee separation requires coordinated equipment return

**Requirements**:
- [ ] Upload your separation agreement document for e-signature (replaces sample)

**Roles**: Departing Employee, HR Coordinator, IT Administrator, Finance, Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Separation notice | Acknowledgement | Departing Employee | Acknowledge receipt of the separation notice and confirm your understanding of the offboarding timeline and process. |
| 2 | Exit interview | Form | Departing Employee | Complete the confidential exit interview to share your feedback about your experience, management, and suggestions for improvement. |
| 3 | Benefits / COBRA information | File Request | HR Coordinator | Prepare and deliver COBRA continuation coverage information, benefits termination details, and any applicable retirement plan distribution options. |
| 4 | Final expense submission | File Request | Departing Employee | Upload any outstanding expense reports and receipts for reimbursement processing before your last day. |
| 5 | Equipment return | To-Do | Departing Employee | Return all company-issued equipment including laptop, monitors, badges, keys, and any other company property. Ship to the provided address if working remotely. |
| 6 | Access revocation | To-Do | IT Administrator | Revoke all system access including email, SSO, VPN, cloud services, and building access. Archive the user account per retention policy. |
| 7 | Final paycheck | To-Do | Finance | Process the final paycheck including any accrued PTO payout, expense reimbursements, and prorated compensation per state requirements. |
| 8 | Separation agreement (if applicable) | E-Sign | Departing Employee | Review and sign the separation agreement, if applicable, covering release terms, severance, and any post-employment obligations. |
| 9 | Offboarding complete | Acknowledgement | Manager | Acknowledge that all offboarding steps are complete, access has been revoked, equipment returned, and final pay processed. |

#### Step 2: Exit interview — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Primary Reason for Leaving | Dropdown | Yes |
| Overall Experience Rating (1-10) | Number | No |
| What did we do well? | Text (multi-line) | No |
| What could we improve? | Text (multi-line) | No |
| Would you recommend this company to others? | Dropdown | No |

---

## 5. Employee Relocation

**Tags**: HR, Enterprise, Global Companies | **Complexity**: Standard | **Trigger**: Relocation approved / Employee transfer

**Description**: Coordinate employee relocations from authorization through preference gathering, home sale or lease assistance, destination services, and expense documentation. Keeps HR, the employee, and relocation partners aligned throughout the move.

**Use Cases**:
- Employee accepts a promotion requiring relocation to headquarters
- International transfer moves an employee to a new country office
- Office consolidation requires several employees to relocate
- New hire negotiates relocation assistance as part of offer package

**Roles**: Employee, HR Coordinator, Relocation Company, Destination Services

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Relocation authorization | Form | HR Coordinator | Complete the relocation authorization form with employee details, origin and destination locations, approved relocation tier, and budget. |
| 2 | Employee preferences | Form | Employee | Share your preferences for the relocation including housing type, school requirements, commute preferences, and any special considerations. |
| 3 | Policy acknowledgement | Acknowledgement | Employee | Review and acknowledge the relocation policy, including covered expenses, reimbursement procedures, tax implications, and clawback provisions. |
| 4 | Home sale / lease break assistance | To-Do | Relocation Company | Assist the employee with selling their current home or breaking their lease. Coordinate with real estate agents, manage listings, or negotiate lease termination as applicable. |
| 5 | Destination home search | To-Do | Destination Services | Help the employee find housing in the destination city based on their stated preferences. Arrange area tours, property viewings, and school visits. |
| 6 | Moving estimate | File Request | Relocation Company | Provide the detailed moving estimate including household goods shipment, packing services, insurance, and any storage needs. |
| 7 | Move date confirmation | Acknowledgement | Employee | Confirm the final move date and logistics. Acknowledge the packing, pickup, and delivery schedule. |
| 8 | Expense documentation | File Request | Employee | Upload all relocation expense receipts and documentation for reimbursement, including travel, temporary housing, and miscellaneous moving costs. |
| 9 | Relocation complete | Acknowledgement | HR Coordinator | Acknowledge that the relocation is complete. Confirm the employee has started at the new location and all expense claims have been submitted. |

#### Step 1: Relocation authorization — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Employee Name | Text (single line) | Yes |
| Current Location | Text (single line) | Yes |
| Destination Location | Text (single line) | Yes |
| Relocation Tier | Dropdown | Yes |
| Approved Budget | Text (single line) | Yes |
| Target Start Date at New Location | Date | Yes |

#### Step 2: Employee preferences — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Housing Preference | Dropdown | Yes |
| Number of Bedrooms Needed | Number | Yes |
| School-Age Children? | Dropdown | No |
| Preferred Neighborhoods / Areas | Text (multi-line) | No |
| Maximum Commute Time (minutes) | Number | No |
| Special Considerations | Text (multi-line) | No |
