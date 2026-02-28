# Merged Template Gallery — 93 Templates

> Curated from the **Template Gallery Spec** (39 templates) and **85 Process Templates for Moxo** (85 templates). Takes the best of both: the 85 list's breadth/metadata, the Gallery Spec's accuracy and AI differentiation. Every step represents a real handoff or action in the actual business process.

## Design Principles

- **Right-sized**: Templates are ~80% complete — users add company specifics, not delete half the steps
- **Accurate**: Steps reflect how these processes actually work, not how they ideally could work
- **AI where it matters**: AI steps only where they gate a decision or produce output the next step acts on — not as "nice to have" content generation
- **No padding**: System emails only where the notification IS the step; no "you're done" acknowledgements unless someone genuinely needs to confirm

## Categories (13)

| # | Category | Templates | Type |
|---|----------|-----------|------|
| 1 | Client Onboarding | 7 | Cross-industry |
| 2 | Vendor & Partner Management | 7 | Cross-industry |
| 3 | HR & Employee Lifecycle | 5 | Cross-industry |
| 4 | Banking & Financial Services | 8 | Industry vertical |
| 5 | Sales & Evaluation | 5 | Cross-industry |
| 6 | Account Management | 4 | Cross-industry |
| 7 | Professional Services & Delivery | 6 | Cross-industry |
| 8 | Insurance & Claims | 7 | Industry vertical |
| 9 | Healthcare | 5 | Industry vertical |
| 10 | Legal & Corporate Governance | 11 | Cross-industry |
| 11 | Audit & Compliance | 10 | Cross-industry |
| 12 | Construction & Real Estate | 10 | Industry vertical |
| 13 | Order & Supply Chain | 8 | Cross-industry |

## Step Type Legend

| Type | Description |
|------|-------------|
| **Form** | Structured data collection |
| **Approval** | Approve/reject gate |
| **File Request** | Document upload |
| **To-Do** | Task completion checkpoint |
| **Acknowledgement** | Confirm/acknowledge something |
| **Decision** | Choice point routing to different paths |
| **Branch** | Conditional routing (Yes/No, A/B/C) |
| **AI Automation** | AI-powered step that gates the next action |
| **System Email** | Automated notification |
| **E-Sign** | Electronic signature |

## Complexity Guide

| Level | Steps | Roles |
|-------|-------|-------|
| **Simple** | 4–7 | 2–3 |
| **Standard** | 7–9 | 3–4 |
| **Complex** | 10–12 | 4–5 |

---

# 1. CLIENT ONBOARDING (7)

## 1. SaaS Customer Onboarding

**Tags**: [Technology, SaaS] | **Complexity**: Complex | **Trigger**: New customer contract signed
**Pairs With**: Engagement Kickoff, QBR

Roles: Customer Contact, Implementation Lead, CSM
1) Customer kickoff form — Form — Customer Contact (company, users, tier, go-live date, integrations, objectives)
2) Technical requirements questionnaire — Form — Customer Contact (SSO, provisioning, API needs, data migration, compliance)
3) Data migration upload — File Request — Customer Contact
4) Environment configuration — To-Do — Implementation Lead (tenant setup, SSO/SCIM if needed, branding, permissions)
5) User provisioning form — Form — Customer Contact (admin users, team structure, role assignments)
6) Training & UAT — To-Do — Implementation Lead (admin training, end-user training, acceptance testing)
7) UAT sign-off — Approval — Customer Contact
8) Go-live notification — System Email — System
9) Onboarding complete — Acknowledgement — CSM (handoff to ongoing success management)

**Common Variations:**
- Enterprise w/ SSO: Add dedicated SSO configuration step before environment config
- Data-heavy migrations: Add separate data validation step after migration upload

---

## 2. Financial Services Client Onboarding (KYC)

**Tags**: [Banking, Wealth Management] | **Complexity**: Complex | **Trigger**: New account application
**Pairs With**: Individual KYC, Investment Account Opening
**Compliance**: AML, KYC, FinCEN

Roles: Client, KYC Analyst, Compliance Officer, AI
1) Client information form — Form — Client (legal name, DOB, SSN/TIN, address, citizenship, occupation, income, net worth, source of wealth)
2) Identity document upload — File Request — Client (government photo ID + proof of address within 90 days)
3) Customer Due Diligence questionnaire — Form — Client (account purpose, expected transactions, PEP declaration, foreign accounts)
4) AI risk scoring & sanctions screening — AI Automation — AI (OFAC, PEP databases, adverse media → Low/Medium/High with rationale)
5) High-risk client? — Branch — KYC Analyst (High/PEP → EDD path; Standard → review)
6) Enhanced Due Diligence documentation — File Request — Client (source-of-wealth evidence, tax returns, bank statements)
7) KYC analyst review — To-Do — KYC Analyst (verify documents, cross-reference, complete CIP checklist)
8) Compliance officer approval — Approval — Compliance Officer
9) Account agreement — E-Sign — Client
10) Welcome notification — System Email — System

---

## 3. Accounting Firm Client Onboarding

**Tags**: [Accounting, Tax] | **Complexity**: Standard | **Trigger**: New client engagement
**Pairs With**: Tax Return Preparation

Roles: Client, Engagement Manager
1) Client information form — Form — Client (name, entity type, Tax ID, fiscal year end, states of filing)
2) Service scope selection — Form — Client (tax prep, bookkeeping, payroll, audit, advisory; revenue, software)
3) Engagement letter — E-Sign — Client
4) Tax authorization forms — File Request — Client (IRS Form 8821 or 2848, state authorizations)
5) Prior year returns & financials — File Request — Client
6) Accounting system access (if bookkeeping/payroll) — Form — Client (QuickBooks/Xero credentials, bank feeds)
7) Initial document review — To-Do — Engagement Manager
8) Client portal setup — To-Do — Engagement Manager
9) Onboarding complete — Acknowledgement — Client

---

## 4. Legal Client Intake & Matter Opening

**Tags**: [Legal] | **Complexity**: Standard | **Trigger**: New client inquiry / matter request
**Pairs With**: NDA Execution, Contract Review
**Also in:** Colleague list as "Legal intake and matter coordination"

Roles: Client, Intake Attorney, Paralegal
1) Client intake form — Form — Client (legal name, practice area, matter description, opposing parties, urgency)
2) Conflict of interest check — To-Do — Paralegal
3) Matter evaluation & staffing — To-Do — Intake Attorney (viability, fee arrangement, staffing)
4) Engagement letter execution — E-Sign — Client
5) Retainer payment processing — To-Do — Paralegal
6) Supporting document upload — File Request — Client
7) Client portal & matter setup — To-Do — Paralegal
8) Kickoff meeting — To-Do — Intake Attorney
9) Welcome & next steps — System Email — System

**Common Variations:**
- Conflict found: Add conflict resolution review (Approval) before matter evaluation
- Litigation matters: Add preservation/hold notice step

---

## 5. Insurance New Business Submission

**Tags**: [Insurance, Brokerage] | **Complexity**: Complex | **Trigger**: New policy application from broker
**Pairs With**: Policy Renewal, Insurance Audit

Roles: Broker/Applicant, Underwriter, AI
1) Insured information form — Form — Broker/Applicant (named insured, entity type, FEIN, SIC/NAICS, revenue, employees, lines requested)
2) ACORD application & loss runs — File Request — Broker/Applicant (ACORD 125 + supplements, 5-year loss runs)
3) Supplemental documentation — File Request — Broker/Applicant (financials, fleet/property schedules, safety programs)
4) AI submission triage — AI Automation — AI (validates completeness, checks appetite-fit by class code, flags missing info)
5) Complete and within appetite? — Branch — Underwriter (Yes → underwriting; No → request more info)
6) Underwriting analysis — To-Do — Underwriter (risk classification, premium development, loss projection, benchmarking)
7) Underwriting decision — Decision — Underwriter (Quote / Decline / Refer to senior)
8) Quote proposal delivery — File Request — Underwriter
9) Bind request & subjectivity clearance — File Request — Broker/Applicant (bind order, signed apps, loss control plans)
10) Policy issuance & delivery — To-Do — Underwriter (generate policy docs, certificates, set up in system)

---

## 6. Client Onboarding — General (Post-Sale)

**Tags**: [All Industries] | **Complexity**: Simple | **Trigger**: Deal closed in CRM
**Pairs With**: Engagement Kickoff, Client Service Request
**Also in:** Colleague list as "Client onboarding (post-sale)"

Roles: Client Admin, Account Manager, Operations Lead
1) Client information intake — Form — Client Admin
2) Primary contacts & roles — Form — Client Admin
3) Required documents (W-9, insurance, etc.) — File Request — Client Admin
4) Contract execution — E-Sign — Client Admin
5) Internal setup checklist — To-Do — Operations Lead
6) Compliance verification — Approval — Operations Lead
7) Go-live acknowledgement — Acknowledgement — Account Manager

**Common Variations:**
- Regulated industries: Add Compliance review step
- Enterprise clients: Add Finance and Legal setup steps

---

## 7. Customer Offboarding & Account Closure

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Client requests closure / contract termination
**Pairs With**: Client Onboarding

Roles: Client Contact, Account Manager, IT/Security, Finance
1) Offboarding request confirmation — Form — Client Contact
2) Data export delivery — File Request — Account Manager
3) Final billing acknowledgement — Acknowledgement — Client Contact
4) Access revocation — To-Do — IT/Security
5) Final invoice — To-Do — Finance
6) Exit survey — Form — Client Contact
7) Closure acknowledgement — Acknowledgement — Client Contact

---

# 2. VENDOR & PARTNER MANAGEMENT (7)

## 8. Vendor Onboarding

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: New vendor/supplier engagement
**Pairs With**: Vendor Security Assessment, Vendor Compliance Certification
**Also in:** Colleague list as "Vendor onboarding"

Roles: Vendor Contact, Procurement Owner, Finance Reviewer, AI
1) Vendor registration form — Form — Vendor Contact (legal name, entity type, DUNS, products/services, NAICS)
2) Tax & insurance documents — File Request — Vendor Contact (W-9/W-8BEN, CGL, Professional Liability, WC)
3) Compliance questionnaire — Form — Vendor Contact (OFAC, anti-bribery, data privacy, diversity, references)
4) AI vendor risk assessment — AI Automation — AI (financial stability, industry risk, insurance adequacy, sanctions screening)
5) NDA / MSA execution — E-Sign — Vendor Contact
6) Banking & payment setup — Form — Vendor Contact (routing/account, payment terms, invoice instructions)
7) Procurement approval — Approval — Procurement Owner
8) Vendor activation notification — System Email — System

**Common Variations:**
- Tech vendors with system access: Add Vendor Security Assessment
- High-value/sole-source: Add enhanced due diligence + senior approval

---

## 9. Vendor Security Assessment

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: New vendor with system/data access / Annual refresh
**Pairs With**: Vendor Onboarding, Third-Party Due Diligence
**Also in:** Colleague list as "Vendor security assessment"

Roles: Vendor Contact, Security Reviewer, IT Risk Manager
1) Security questionnaire (SIG/CAIQ) — Form — Vendor Contact
2) Certification uploads (SOC 2, ISO, etc.) — File Request — Vendor Contact
3) Architecture documentation — File Request — Vendor Contact
4) Penetration test results — File Request — Vendor Contact
5) Security review — To-Do — Security Reviewer
6) Follow-up questions — Form — Vendor Contact
7) Risk assessment — To-Do — IT Risk Manager
8) Risk acceptance — Approval — IT Risk Manager

---

## 10. Vendor Compliance Certification (Annual)

**Tags**: [All Industries] | **Complexity**: Simple | **Trigger**: Vendor anniversary / Annual compliance calendar
**Pairs With**: Vendor Onboarding, Vendor Security Assessment
**Also in:** Colleague list as "Vendor compliance certification (annual)"

Roles: Vendor Contact, Compliance Reviewer
1) Annual refresh notification — Form — Vendor Contact
2) Updated certifications & policies — File Request — Vendor Contact
3) Insurance certificates — File Request — Vendor Contact
4) Compliance attestation — Acknowledgement — Vendor Contact
5) Documentation review — To-Do — Compliance Reviewer
6) Compliance approved — Approval — Compliance Reviewer

---

## 11. Third-Party Due Diligence

**Tags**: [Financial Services, Professional Services] | **Complexity**: Standard | **Trigger**: New third-party relationship / High-risk vendor
**Pairs With**: Vendor Onboarding, Vendor Security Assessment
**Also in:** Colleague list as "Third-party due diligence"

Roles: Third Party Contact, Risk Reviewer, Legal Counsel, Compliance Officer
1) Due diligence questionnaire — Form — Third Party Contact
2) Supporting documentation — File Request — Third Party Contact
3) Ownership & structure disclosure — File Request — Third Party Contact
4) Clarification questions — Form — Third Party Contact
5) Legal review — To-Do — Legal Counsel
6) Compliance review — To-Do — Compliance Officer
7) Risk assessment — To-Do — Risk Reviewer
8) Due diligence decision — Approval — Risk Reviewer

---

## 12. Third-Party Remediation Tracking

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Audit finding / Risk assessment gap identified
**Pairs With**: Vendor Security Assessment, Third-Party Due Diligence
**Also in:** Colleague list as "Third-party remediation tracking"

Roles: Third Party Contact, Risk Reviewer, Control Owner
1) Remediation plan submission — Form — Third Party Contact
2) Timeline acknowledgement — Acknowledgement — Third Party Contact
3) Evidence of remediation — File Request — Third Party Contact
4) Internal control owner verification — To-Do — Control Owner
5) Remediation review — To-Do — Risk Reviewer
6) Follow-up evidence (if needed) — File Request — Third Party Contact
7) Remediation accepted — Approval — Risk Reviewer
8) Completion notification — Acknowledgement — Risk Reviewer

---

## 13. Partner / Channel Onboarding

**Tags**: [Technology, SaaS, Professional Services] | **Complexity**: Standard | **Trigger**: New partner agreement signed
**Pairs With**: Reseller Onboarding
**Also in:** Colleague list as "Partner Onboarding and Enablement"

Roles: Partner Contact, Partner Manager
1) Partner application form — Form — Partner Contact (company, partner type, market, geography, sales capacity)
2) Partner qualification questionnaire — Form — Partner Contact (certifications, experience, revenue commitment)
3) Partnership agreement — E-Sign — Partner Contact
4) NDA execution — E-Sign — Partner Contact
5) Portal & demo environment setup — To-Do — Partner Manager
6) Sales & technical certification — To-Do — Partner Contact
7) Go-to-market plan review — Approval — Partner Manager
8) Launch readiness confirmation — To-Do — Partner Manager
9) Partner launch announcement — System Email — System

---

## 14. Reseller / Distributor Onboarding

**Tags**: [Manufacturing, Technology, Consumer Products] | **Complexity**: Standard | **Trigger**: Reseller agreement approved
**Pairs With**: Partner Onboarding
**Also in:** Colleague list as "Reseller / Distributor Onboarding"

Roles: Reseller Contact, Channel Manager, Legal Reviewer, Finance
1) Reseller application — Form — Reseller Contact
2) Business credentials & financials — File Request — Reseller Contact
3) Territory / pricing acknowledgement — Acknowledgement — Reseller Contact
4) Reseller agreement — E-Sign — Reseller Contact
5) Legal review — To-Do — Legal Reviewer
6) Credit terms setup — To-Do — Finance
7) Product training — To-Do — Reseller Contact
8) Partner activation — Approval — Channel Manager
9) Onboarding complete — Acknowledgement — Reseller Contact

---

# 3. HR & EMPLOYEE LIFECYCLE (5)

## 15. Employee Onboarding

**Tags**: [All Industries] | **Complexity**: Complex | **Trigger**: Offer accepted
**Pairs With**: Background Check

Roles: New Hire, HR Coordinator, Hiring Manager
1) Personal information form — Form — New Hire (legal name, DOB, contact, emergency contact)
2) Offer letter & employment agreements — E-Sign — New Hire (offer, NDA, IP assignment, handbook acknowledgement)
3) Tax forms (W-4, state) — File Request — New Hire
4) I-9 verification documents — File Request — New Hire (List A or List B + C)
5) I-9 employer verification — To-Do — HR Coordinator (examine documents, complete Section 2, within 3 business days)
6) Direct deposit & benefits enrollment — Form — New Hire (banking, medical/dental/vision, 401k)
7) Equipment provisioning — To-Do — HR Coordinator
8) System access & accounts — To-Do — HR Coordinator (email, SSO, role-specific apps)
9) First-day orientation — To-Do — HR Coordinator
10) Manager welcome & 30-day plan — Acknowledgement — Hiring Manager

---

## 16. Contractor / Freelancer Onboarding

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Contractor engagement approved
**Pairs With**: Background Check

Roles: Contractor, Hiring Manager, Finance, AI
1) Contractor information form — Form — Contractor (legal/business name, entity type, work authorization)
2) Engagement details — Form — Hiring Manager (project, dates, rate, budget, justification)
3) AI classification risk check — AI Automation — AI (IRS 20-factor test → Low/Medium/High misclassification risk)
4) SOW / contractor agreement — E-Sign — Contractor
5) NDA execution — E-Sign — Contractor
6) W-9 & insurance documents — File Request — Contractor
7) Payment setup form — Form — Contractor (banking, payment method, invoice instructions)
8) System access provisioning — To-Do — Hiring Manager
9) Onboarding complete — Acknowledgement — Hiring Manager

---

## 17. Background Check & Employment Verification

**Tags**: [HR, Recruiting] | **Complexity**: Standard | **Trigger**: Offer extended / Pre-employment screening
**Pairs With**: Employee Onboarding

Roles: Candidate, HR Coordinator, Background Vendor, Previous Employer
1) Background check authorization — E-Sign — Candidate
2) Candidate information — Form — Candidate
3) Employment history — Form — Candidate
4) Verification request — To-Do — Background Vendor
5) Previous employer verification — Form — Previous Employer
6) Education verification — To-Do — Background Vendor
7) Results review — To-Do — HR Coordinator
8) Candidate acknowledgement — Acknowledgement — Candidate

---

## 18. Employee Termination / Offboarding

**Tags**: [All Industries, HR] | **Complexity**: Standard | **Trigger**: Termination decision / Resignation

Roles: Departing Employee, HR Coordinator, IT Administrator, Finance, Manager
1) Separation notice — Acknowledgement — Departing Employee
2) Exit interview — Form — Departing Employee
3) Benefits / COBRA information — File Request — HR Coordinator
4) Final expense submission — File Request — Departing Employee
5) Equipment return — To-Do — Departing Employee
6) Access revocation — To-Do — IT Administrator
7) Final paycheck — To-Do — Finance
8) Separation agreement (if applicable) — E-Sign — Departing Employee
9) Offboarding complete — Acknowledgement — Manager

---

## 19. Employee Relocation

**Tags**: [HR, Enterprise, Global Companies] | **Complexity**: Standard | **Trigger**: Relocation approved / Employee transfer

Roles: Employee, HR Coordinator, Relocation Company, Destination Services
1) Relocation authorization — Form — HR Coordinator
2) Employee preferences — Form — Employee
3) Policy acknowledgement — Acknowledgement — Employee
4) Home sale / lease break assistance — To-Do — Relocation Company
5) Destination home search — To-Do — Destination Services
6) Moving estimate — File Request — Relocation Company
7) Move date confirmation — Acknowledgement — Employee
8) Expense documentation — File Request — Employee
9) Relocation complete — Acknowledgement — HR Coordinator

---

# 4. BANKING & FINANCIAL SERVICES (8)

## 20. Individual KYC Verification

**Tags**: [Financial Services, Banking, Wealth Management] | **Complexity**: Complex | **Trigger**: New account / periodic review
**Pairs With**: Business KYB, Periodic KYC Refresh
**Compliance**: AML, KYC, FinCEN
**Also in:** Colleague list as "Individual KYC Document Collection"

Roles: Individual, Compliance Reviewer, Compliance Manager, AI
1) Personal information intake — Form — Individual (legal name, DOB, nationality, TIN, address, occupation, source of funds)
2) Government ID upload — File Request — Individual
3) Proof of address — File Request — Individual
4) Source of funds documentation — File Request — Individual
5) CDD questionnaire — Form — Individual (international wires, PEP status, other accounts, crypto)
6) AI risk scoring & sanctions screening — AI Automation — AI (OFAC, PEP databases, adverse media → Low/Med/High)
7) EDD required? — Branch — Compliance Reviewer (High risk → EDD; Standard → approval)
8) EDD additional documentation — File Request — Individual
9) Compliance review — To-Do — Compliance Reviewer
10) KYC decision — Approval — Compliance Manager

---

## 21. Business KYB Document Collection

**Tags**: [Financial Services, Banking, FinTech] | **Complexity**: Standard | **Trigger**: New business account application
**Pairs With**: Individual KYC, Beneficial Ownership
**Compliance**: AML, KYB, FinCEN
**Also in:** Colleague list as "Business KYB Document collection"

Roles: Business Admin, Beneficial Owner, Compliance Reviewer, Compliance Manager
1) Business information intake — Form — Business Admin
2) Formation documents (Articles, Cert of Good Standing) — File Request — Business Admin
3) Ownership structure documentation — File Request — Business Admin
4) Beneficial owner identification — Form — Beneficial Owner
5) Beneficial owner ID verification — File Request — Beneficial Owner
6) KYB review — To-Do — Compliance Reviewer
7) Clarification questions — Form — Business Admin
8) KYB decision — Approval — Compliance Manager

---

## 22. Beneficial Ownership (FinCEN BOI) Collection

**Tags**: [All Industries, Corporate Services, Legal] | **Complexity**: Standard | **Trigger**: New company formation / BOI deadline
**Pairs With**: Business KYB, New Business Formation
**Compliance**: FinCEN, Corporate Transparency Act

Roles: Company Contact, Beneficial Owner, Filing Agent
1) Exemption & reporting determination — Form — Filing Agent (entity type, formation jurisdiction, exemption category analysis — 23 CTA exemption categories)
2) Reporting company information — Form — Company Contact (legal name, DBAs, EIN, jurisdiction of formation, current U.S. address)
3) Beneficial owner identification — Form — Company Contact (list all individuals with 25%+ ownership or substantial control — senior officers, appointment authority, key decision-makers)
4) Beneficial owner details & ID upload — Form — Beneficial Owner (full legal name, DOB, residential address, ID number from passport/driver's license/state ID + document image)
5) Company applicant information (if post-2024 entity) — Form — Filing Agent (up to 2 applicants — direct filer + person directing filing; name, DOB, business address, ID + image)
6) Filing agent review & validation — To-Do — Filing Agent (verify completeness, cross-reference ownership %, validate ID documents)
7) BOI report filing confirmation — Acknowledgement — Filing Agent (FinCEN confirmation, note 30-day update/correction obligation)

---

## 23. Periodic KYC/KYB Refresh

**Tags**: [Financial Services, Banking] | **Complexity**: Simple | **Trigger**: KYC refresh date (1–3 year cycle) / Risk trigger
**Pairs With**: Individual KYC, Business KYB
**Compliance**: AML, KYC
**Also in:** Colleague list as "Periodic KYC / KYB refresh"

Roles: Client Contact, Beneficial Owner, Compliance Reviewer
1) Refresh notification — Form — Client Contact
2) Updated documentation — File Request — Client Contact
3) UBO changes (if any) — Form — Client Contact
4) Updated UBO documentation — File Request — Beneficial Owner
5) Refresh review — To-Do — Compliance Reviewer
6) Refresh approved — Approval — Compliance Reviewer

---

## 24. Commercial Loan Application & Underwriting

**Tags**: [Banking, Credit Unions, Commercial Lending] | **Complexity**: Complex | **Trigger**: Loan application submitted
**Also in:** Colleague list as "Commercial loan application and underwriting"

Roles: Borrower, Loan Officer, Underwriter, Credit Committee
1) Loan application intake — Form — Borrower (legal name, SSN, employment, loan purpose, amount, property type)
2) Personal financial statement — File Request — Borrower
3) Business tax returns & financial statements — File Request — Borrower (3 years)
4) Collateral documentation — File Request — Borrower
5) Underwriter questions — Form — Borrower
6) Conditional approval — Approval — Underwriter
7) Additional conditions — File Request — Borrower
8) Credit committee approval — Approval — Credit Committee
9) Borrower disclosures — Acknowledgement — Borrower
10) Closing document execution — E-Sign — Borrower

---

## 25. Wire Transfer Authorization

**Tags**: [Financial Services, Treasury, Corporate] | **Complexity**: Standard | **Trigger**: Wire transfer request submitted
**Also in:** Colleague list as "Wire transfer authorization"

Roles: Requestor, Approver 1, Approver 2, Treasury Operations
1) Wire transfer request — Form — Requestor (beneficiary name, bank name/SWIFT/ABA, account number, amount, currency, purpose, reference)
2) Supporting documentation — File Request — Requestor (invoice, contract, or approval memo)
3) OFAC/sanctions screening — To-Do — Treasury Operations (screen beneficiary and banks against OFAC SDN list; escalate any hits)
4) Beneficiary verification & callback — To-Do — Treasury Operations (match to approved payee list, verify bank details, callback to known phone number to confirm instructions)
5) First authorization — Approval — Approver 1
6) Second authorization — Approval — Approver 2 (independent review; required for amounts above threshold)
7) Wire execution confirmation — Acknowledgement — Treasury Operations (confirm wire submitted, record confirmation/Fed reference number)
8) Post-transfer reconciliation — To-Do — Treasury Operations (verify wire posted to bank statement, reconcile against GL)

---

## 26. Investment Account Opening

**Tags**: [Wealth Management, Brokerage, RIA] | **Complexity**: Standard | **Trigger**: New client engagement
**Pairs With**: Individual KYC
**Compliance**: SEC, FINRA, Reg BI
**Also in:** Colleague list as "Investment account opening"

Roles: Investor, Account Manager, Compliance Officer, Operations
1) Account application — Form — Investor
2) Identity verification documents — File Request — Investor
3) Accreditation documentation (if applicable) — File Request — Investor
4) Suitability questionnaire — Form — Investor
5) Risk disclosure acknowledgement — Acknowledgement — Investor
6) Account agreement — E-Sign — Investor
7) Compliance review — To-Do — Compliance Officer
8) Operations setup — To-Do — Operations
9) Account activation — Approval — Account Manager

---

## 27. Credit Line Renewal / Increase Request

**Tags**: [Banking, Commercial Lending, Credit Unions] | **Complexity**: Standard | **Trigger**: Credit facility approaching maturity / Borrower requests increase
**Pairs With**: Commercial Loan Application
**Also in:** Colleague list as "Credit line renewal/increase request"

Roles: Borrower, Relationship Manager, Credit Analyst, Credit Committee
1) Renewal/increase request — Form — Borrower (facility type, current limit, requested limit/term, purpose, business changes since origination)
2) Updated financial statements — File Request — Borrower (current year P&L, balance sheet, interim financials, tax returns)
3) Borrower update questionnaire — Form — Borrower (material changes, new debt, litigation, ownership changes, collateral status)
4) Credit analysis & financial spreading — To-Do — Credit Analyst (covenant compliance, collateral coverage, cash flow, industry trends)
5) Credit analyst recommendation — File Request — Credit Analyst
6) Relationship manager endorsement — Approval — Relationship Manager
7) Credit committee approval — Approval — Credit Committee
8) Renewal/modification documents — E-Sign — Borrower
9) Facility activation confirmation — Acknowledgement — Relationship Manager

**Common Variations:**
- Secured facilities: Add updated appraisal / collateral valuation step
- Covenant waiver needed: Add waiver request form before credit committee

---

# 5. SALES & EVALUATION (5)

## 28. Guided Product Trial

**Tags**: [SaaS, Technology] | **Complexity**: Standard | **Trigger**: Prospect requests structured trial
**Pairs With**: Pilot Program, Proposal & SOW

Roles: Prospect, Sales Rep
1) Trial registration form — Form — Prospect (company, industry, team size, use case, current tools, goals)
2) Trial environment setup — To-Do — Sales Rep
3) Trial plan acknowledgement — Acknowledgement — Prospect
4) Mid-trial check-in survey — Form — Prospect (features explored, blockers, satisfaction, integration needs)
5) Guided demo of advanced features — To-Do — Sales Rep
6) Trial outcome decision — Decision — Sales Rep (Convert / Extend / Close)
7) Proposal delivery — File Request — Sales Rep
8) Proposal sign-off — Approval — Prospect

---

## 29. Pilot Program Evaluation

**Tags**: [Technology, Enterprise SaaS] | **Complexity**: Complex | **Trigger**: Enterprise prospect requests pilot
**Pairs With**: Guided Product Trial, Proposal & SOW

Roles: Prospect Sponsor, Pilot Lead, AI
1) Pilot scope & objectives form — Form — Prospect Sponsor (business unit, duration, user count, success metrics, KPIs)
2) Success criteria sign-off — Acknowledgement — Prospect Sponsor
3) Technical environment setup — To-Do — Pilot Lead
4) Pilot kickoff acknowledgement — Acknowledgement — Prospect Sponsor
5) Mid-pilot status review — Form — Prospect Sponsor (active users, issues, sentiment, risks)
6) Steering committee decision — Approval — Prospect Sponsor (continue / adjust / terminate)
7) Final pilot data collection — File Request — Prospect Sponsor
8) AI evaluation report — AI Automation — AI (results vs. criteria, quantified impact, data-driven recommendation)
9) Go/No-Go decision — Decision — Prospect Sponsor
10) Final contract sign-off — E-Sign — Prospect Sponsor

---

## 30. AI Pilot Evaluation

**Tags**: [Technology, Enterprise, Cross-industry] | **Complexity**: Standard | **Trigger**: AI tool/platform selected for evaluation
**Pairs With**: Pilot Program Evaluation, Vendor Security Assessment

Roles: Business Sponsor, AI Lead, IT Security, Data Privacy Officer, Pilot Users
1) AI pilot request — Form — Business Sponsor (tool/vendor, use case, data involved, user count, success metrics, budget)
2) IT security & data privacy review — To-Do — IT Security (data handling, model hosting, access controls, PII/PHI exposure)
3) Data privacy sign-off — Approval — Data Privacy Officer
4) Pilot environment setup — To-Do — AI Lead (sandbox, test data, user provisioning, guardrails)
5) Pilot kickoff acknowledgement — Acknowledgement — Pilot Users
6) Mid-pilot feedback survey — Form — Pilot Users (accuracy, usability, time saved, concerns, edge cases)
7) Final results & risk assessment — File Request — AI Lead (quantified results vs. metrics, hallucination rate, bias findings, cost analysis)
8) Go/No-Go decision — Decision — Business Sponsor (scale / extend / terminate)
9) Enterprise rollout approval — Approval — Business Sponsor

**Common Variations:**
- Regulated industries: Add compliance review step (HIPAA, SOX, GDPR implications)
- Customer-facing AI: Add output quality review and bias testing step

---

## 31. Proposal & SOW Delivery

**Tags**: [Cross-industry B2B] | **Complexity**: Standard | **Trigger**: Post-discovery / qualification
**Pairs With**: RFP Response, Engagement Kickoff

Roles: Client Prospect, Sales Lead
1) Proposal request details — Form — Sales Lead (client, opportunity value, products, term, requirements)
2) Draft proposal & SOW upload — File Request — Sales Lead
3) Internal review & approval — Approval — Sales Lead
4) Proposal delivery — System Email — System
5) Client Q&A submission — Form — Client Prospect
6) Revised terms / Q&A response — File Request — Sales Lead
7) Client final review — Approval — Client Prospect
8) SOW e-signature — E-Sign — Client Prospect
9) Handoff to delivery team — To-Do — Sales Lead

---

## 32. RFP Response Coordination

**Tags**: [Cross-industry, Government, Enterprise] | **Complexity**: Complex | **Trigger**: RFP received from prospect
**Pairs With**: Proposal & SOW
**Also in:** Colleague list as "RFP/Proposal Response coordination"

Roles: Proposal Lead, SMEs, Executive Sponsor, AI
1) RFP intake & details — Form — Proposal Lead (issuing org, deadline, deal value, evaluation criteria)
2) RFP document upload — File Request — Proposal Lead
3) Go/No-Go evaluation — Decision — Proposal Lead (solution fit, win probability, resources, strategic value)
4) AI RFP requirements analysis — AI Automation — AI (parses requirements, categorizes by department, creates assignment matrix)
5) Response kickoff & assignments — Form — Proposal Lead
6) SME section inputs — File Request — SMEs
7) Pricing & commercial terms — File Request — Proposal Lead
8) Internal review & quality check — Approval — Proposal Lead
9) Executive sign-off — Approval — Executive Sponsor
10) Submission confirmation — To-Do — Proposal Lead

---

# 6. ACCOUNT MANAGEMENT (4)

## 33. Quarterly Business Review (QBR)

**Tags**: [SaaS, Professional Services, B2B] | **Complexity**: Simple | **Trigger**: Quarterly cadence
**Pairs With**: Annual Renewal, Client Health Check
**Also in:** Colleague list as "Quarterly business review (QBR) Preparation"

Roles: Client Stakeholder, Account Manager
1) Pre-QBR data collection — Form — Account Manager (renewal date, ARR, support tickets, NPS, key wins)
2) QBR presentation upload — File Request — Account Manager
3) Client pre-QBR survey — Form — Client Stakeholder (satisfaction, priorities, feature requests)
4) QBR meeting completion — To-Do — Account Manager
5) Action items acknowledgement — Acknowledgement — Client Stakeholder
6) Internal debrief — To-Do — Account Manager

---

## 34. Annual Renewal

**Tags**: [SaaS, Professional Services, Subscription] | **Complexity**: Standard | **Trigger**: 90 days before contract expiration
**Pairs With**: QBR, Client Health Check

Roles: Client Contact, CSM, Finance
1) Renewal kickoff details — Form — CSM (account, contract end, ARR, licenses, risks, upsell opportunities)
2) Usage & value report upload — File Request — CSM
3) Client renewal survey — Form — Client Contact (satisfaction, usage, budget changes, vendors evaluated)
4) Internal pricing approval — Approval — Finance
5) Renewal proposal delivery — File Request — CSM
6) Client proposal review — Decision — Client Contact (Accept / Negotiate / Downgrade / Will not renew)
7) Renewal contract e-signature — E-Sign — Client Contact
8) Post-renewal CRM update — To-Do — CSM

---

## 35. Client Health Check

**Tags**: [SaaS, Professional Services] | **Complexity**: Simple | **Trigger**: Health score drop / key contact change / scheduled pulse
**Pairs With**: QBR, Annual Renewal

Roles: Client Contact, CSM
1) Health check trigger details — Form — CSM (trigger reason, current health R/Y/G, days to renewal)
2) Client satisfaction survey — Form — Client Contact
3) Internal risk assessment — Form — CSM (risk level, primary factors, recommended intervention)
4) Health check meeting — To-Do — CSM
5) Action plan acknowledgement — Acknowledgement — Client Contact
6) Follow-up completion — To-Do — CSM

---

## 36. Billing Dispute Resolution

**Tags**: [Cross-industry] | **Complexity**: Standard | **Trigger**: Client raises billing dispute

Roles: Client, Finance Lead
1) Dispute intake form — Form — Client (invoice number, amount, category, description, expected resolution)
2) Supporting documentation — File Request — Client
3) Internal investigation — To-Do — Finance Lead (review billing records, verify against contract)
4) Resolution approval — Approval — Finance Lead
5) Resolution notification — System Email — System
6) Resolution acceptance — Decision — Client (Accept / Escalate / Provide more info)
7) Resolution processing — To-Do — Finance Lead (credit memo, refund, or adjustment)
8) Resolution acknowledgement — Acknowledgement — Client

---

# 7. PROFESSIONAL SERVICES & DELIVERY (6)

## 37. Engagement Kickoff & Scope Confirmation

**Tags**: [Professional Services, Consulting, SaaS] | **Complexity**: Simple | **Trigger**: Contract signed / project start
**Pairs With**: Deliverable Review, Go-Live
**Also in:** Colleague list as "Engagement kickoff and scope confirmation"

Roles: Client Sponsor, Implementation Lead
1) Sales-to-delivery handoff — Form — Implementation Lead (deal summary, terms, modules, stakeholders, go-live target)
2) Customer stakeholder identification — Form — Client Sponsor
3) Pre-kickoff requirements — Form — Client Sponsor (current systems, migration scope, integrations, blockers)
4) Project plan creation — To-Do — Implementation Lead
5) Project plan approval — Approval — Client Sponsor
6) Environment provisioning — To-Do — Implementation Lead
7) Kickoff acknowledgement — Acknowledgement — Client Sponsor

---

## 38. Deliverable Review & Client Approval

**Tags**: [Professional Services, Creative, Consulting] | **Complexity**: Simple | **Trigger**: Deliverable ready for client review
**Pairs With**: Change Request, Engagement Kickoff
**Also in:** Colleague list as "Deliverable review and client approval"

Roles: Service Owner, Client Reviewer, Client Approver
1) Deliverable upload — File Request — Service Owner
2) Client review — To-Do — Client Reviewer
3) Feedback / revision requests — Form — Client Reviewer
4) Revised deliverable — File Request — Service Owner
5) Final approval — Approval — Client Approver
6) Completion acknowledgement — Acknowledgement — Service Owner

---

## 39. Go-Live / Launch Readiness

**Tags**: [SaaS, Technology] | **Complexity**: Standard | **Trigger**: All implementation milestones complete
**Pairs With**: Engagement Kickoff, Deliverable Review

Roles: Client Sponsor, Implementation Lead
1) Go-live readiness assessment — Form — Implementation Lead (milestones signed off, defects, migration status, training %)
2) UAT sign-off — File Request — Client Sponsor (signed UAT completion, test summary, accepted known issues)
3) Technical readiness certification — Approval — Implementation Lead
4) Go/No-Go decision — Decision — Implementation Lead (Go / Go with Conditions / Postpone)
5) Client go-live authorization — Approval — Client Sponsor
6) Production cutover execution — To-Do — Implementation Lead
7) Post-cutover verification — Form — Implementation Lead (each critical flow: pass/fail)
8) Go-live acknowledgement — Acknowledgement — Client Sponsor
9) Hypercare exit & steady-state transition — Approval — Client Sponsor

---

## 40. Client Service Request Fulfillment

**Tags**: [Professional Services, Managed Services] | **Complexity**: Simple | **Trigger**: Client submits service request
**Pairs With**: Deliverable Review
**Also in:** Colleague list as "Client service request fulfillment"

Roles: Client Requestor, Service Owner, Manager
1) Service request intake — Form — Client Requestor
2) Clarification questions — Form — Client Requestor
3) Required inputs / documents — File Request — Client Requestor
4) Work execution — To-Do — Service Owner
5) Manager review — Approval — Manager
6) Deliverable acknowledgement — Acknowledgement — Client Requestor

---

## 41. Change Request / Scope Change

**Tags**: [Professional Services, Consulting, IT Services] | **Complexity**: Simple | **Trigger**: Client requests scope change
**Pairs With**: Deliverable Review
**Also in:** Colleague list as "Change request / scope change"

Roles: Client Requestor, Engagement Manager, Approver
1) Change request details — Form — Client Requestor
2) Impact assessment — File Request — Engagement Manager
3) Cost / timeline acknowledgement — Acknowledgement — Client Requestor
4) Change approval — Approval — Approver
5) SOW amendment — E-Sign — Client Requestor
6) Change confirmation — Acknowledgement — Client Requestor

---

## 42. Tax Return Preparation Coordination

**Tags**: [Accounting, Tax, Financial Services] | **Complexity**: Complex | **Trigger**: Tax season / engagement letter signed
**Pairs With**: Accounting Client Onboarding

Roles: Client/Taxpayer, Tax Preparer, Tax Reviewer
1) Engagement letter — E-Sign — Client/Taxpayer
2) Tax organizer questionnaire — Form — Client/Taxpayer (filing type, life changes, income sources, deductions)
3) Income documents upload — File Request — Client/Taxpayer (W-2s, 1099s, K-1s, SSA-1099)
4) Deduction & credit documents — File Request — Client/Taxpayer (1098, property tax, charitable, medical, education)
5) Prior year returns (if new client) — File Request — Client/Taxpayer
6) Missing document follow-up — Form — Client/Taxpayer
7) Preparer review — To-Do — Tax Preparer
8) Partner / manager review — To-Do — Tax Reviewer
9) Draft return delivery — File Request — Tax Preparer
10) Client approval & e-file authorization — E-Sign — Client/Taxpayer

---

# 8. INSURANCE & CLAIMS (7)

## 43. Insurance Claim Coordination

**Tags**: [Insurance, P&C] | **Complexity**: Standard | **Trigger**: Claim filed (FNOL)
**Pairs With**: Workers' Compensation Claim

Roles: Claimant, Claims Adjuster, Claims Manager, AI
1) First Notice of Loss (FNOL) — Form — Claimant (policy number, date/location, loss type, description, initial estimate)
2) AI coverage verification & triage — AI Automation — AI (validates policy, confirms coverage, checks exclusions, flags fraud indicators, assigns severity)
3) Claim acknowledgement — System Email — System (claim number, adjuster contact, next steps, timeline)
4) Loss documentation & evidence — File Request — Claimant (photos/video, police report, repair estimates, receipts)
5) Adjuster assessment & investigation — To-Do — Claims Adjuster
6) Additional documentation request — File Request — Claimant
7) Claim decision — Approval — Claims Manager
8) Settlement acknowledgement — Acknowledgement — Claimant

---

## 44. Insurance Application & Underwriting

**Tags**: [Insurance, Brokerage] | **Complexity**: Standard | **Trigger**: Insurance application submitted
**Pairs With**: Policy Renewal

Roles: Applicant, Agent/Broker, Underwriter, Underwriting Manager
1) Application intake — Form — Applicant
2) Supporting documentation — File Request — Applicant
3) Agent submission — To-Do — Agent/Broker
4) Underwriting questions — Form — Applicant
5) Risk assessment — To-Do — Underwriter
6) Conditional requirements — File Request — Applicant
7) Manager review (if needed) — To-Do — Underwriting Manager
8) Underwriting decision — Approval — Underwriter
9) Policy acknowledgement — Acknowledgement — Applicant

---

## 45. Certificate of Insurance Request

**Tags**: [All Industries, Insurance] | **Complexity**: Simple | **Trigger**: Contract requires COI / Third party request
**Pairs With**: Vendor Onboarding, Subcontractor Qualification

Roles: Certificate Holder, Insured, Insurance Coordinator, Agent
1) COI request details — Form — Certificate Holder
2) Additional insured requirements — Form — Certificate Holder
3) Insured authorization — Acknowledgement — Insured
4) Agent coordination — To-Do — Agent
5) COI generation — To-Do — Insurance Coordinator
6) COI delivery — File Request — Insurance Coordinator
7) Receipt acknowledgement — Acknowledgement — Certificate Holder

---

## 46. Workers' Compensation Claim Coordination

**Tags**: [All Industries, HR, Insurance] | **Complexity**: Standard | **Trigger**: Workplace injury reported
**Compliance**: State WC Laws, OSHA

Roles: Injured Employee, Employer/HR, Claims Adjuster, Treating Physician
1) Injury report — Form — Injured Employee (date, time, location, nature of injury, body part, witnesses, immediate treatment received)
2) Employer incident investigation — Form — Employer/HR (root cause, OSHA recordability, witness statements, safety conditions)
3) Wage statement & employment verification — Form — Employer/HR (average weekly wage, pay rate, hours worked, job classification, modified duty availability)
4) First Report of Injury (FROI) filing — To-Do — Employer/HR (file with state WC board and carrier within state-mandated deadline, typically 5–10 days)
5) Medical records & treatment plan — File Request — Treating Physician (diagnosis, treatment plan, work restrictions, disability status)
6) Compensability determination — Decision — Claims Adjuster (Accept / Deny / Investigate further)
7) Return-to-work plan — Form — Treating Physician (restrictions, full vs. modified duty, accommodations, expected duration)
8) Modified duty acknowledgement — Acknowledgement — Injured Employee
9) Claim closure approval — Approval — Claims Adjuster (benefits paid, treatment complete or at MMI, authorize case closure)

---

## 47. Policy Renewal Coordination

**Tags**: [Insurance, Commercial Lines] | **Complexity**: Standard | **Trigger**: Renewal date approaching (60–90 days)
**Pairs With**: Insurance Application

Roles: Policyholder, Account Manager, Underwriter, Broker
1) Renewal notice acknowledgement — Acknowledgement — Policyholder
2) Updated exposure information — Form — Policyholder
3) Loss run / claims history — File Request — Policyholder
4) Broker review — To-Do — Broker
5) Underwriter questions — Form — Policyholder
6) Renewal quote review — To-Do — Account Manager
7) Quote acceptance — Approval — Policyholder
8) Renewal documents — E-Sign — Policyholder

---

## 48. Surety Bond Application

**Tags**: [Construction, Surety, Contractors] | **Complexity**: Standard | **Trigger**: Bond required for contract / Bid bond needed
**Pairs With**: Subcontractor Qualification

Roles: Principal (Applicant), Surety Agent, Underwriter
1) Bond application — Form — Principal (bond type, penal sum, obligee, project details if contract bond, ownership structure)
2) Financial documentation — File Request — Principal (3 years corporate financials CPA-prepared, personal financial statements of owners, bank references, insurance certificates)
3) Work-in-progress schedule — File Request — Principal (current projects, backlog, completed project history, bonding capacity needs)
4) General Indemnity Agreement — E-Sign — Principal (GIA executed by principal and individual indemnitors; required before underwriting proceeds)
5) Credit check & loss history review — To-Do — Surety Agent (pull soft credit report, obtain prior surety loss runs/claims history)
6) Underwriting review — To-Do — Underwriter (evaluate Character, Capacity, Capital; review financials, WIP, credit, claims, GIA)
7) Bond approval & terms — Decision — Underwriter (Approve / Conditional / Decline — with premium rate and bond limits)
8) Bond issuance & delivery — To-Do — Surety Agent (execute bond, verify obligee requirements, deliver to obligee)

---

## 49. Insurance Audit Coordination

**Tags**: [Insurance, Commercial Lines] | **Complexity**: Standard | **Trigger**: Policy audit scheduled
**Pairs With**: Policy Renewal

Roles: Policyholder, Auditor, Account Manager
1) Audit notice acknowledgement — Acknowledgement — Policyholder
2) Payroll records — File Request — Policyholder
3) Sales / revenue records — File Request — Policyholder
4) Classification questionnaire — Form — Policyholder
5) Auditor review — To-Do — Auditor
6) Clarification questions — Form — Policyholder
7) Audit findings — File Request — Auditor
8) Premium adjustment acknowledgement — Acknowledgement — Policyholder

---

# 9. HEALTHCARE (5)

## 50. Prior Authorization Coordination

**Tags**: [Healthcare, Providers, Payers] | **Complexity**: Standard | **Trigger**: Treatment/procedure requires prior auth

Roles: Patient, Provider Staff, Payer Contact, Physician
1) Treatment request details — Form — Provider Staff
2) Clinical documentation — File Request — Provider Staff
3) Patient consent — Acknowledgement — Patient
4) Payer review — To-Do — Payer Contact
5) Payer questions — Form — Provider Staff
6) Physician peer-to-peer (if needed) — To-Do — Physician
7) Additional clinical information — File Request — Provider Staff
8) Authorization decision — Approval — Payer Contact
9) Decision acknowledgement — Acknowledgement — Provider Staff

---

## 51. Patient Intake & Medical Records Collection

**Tags**: [Healthcare, Providers] | **Complexity**: Standard | **Trigger**: New patient scheduled
**Pairs With**: Medical Records Release
**Compliance**: HIPAA

Roles: Patient, Intake Coordinator, Prior Provider, Insurance Verifier
1) Patient demographics — Form — Patient
2) Insurance information — File Request — Patient
3) Insurance verification — To-Do — Insurance Verifier
4) Medical history questionnaire — Form — Patient
5) Prior medical records request — File Request — Prior Provider
6) Prior records delivery — File Request — Prior Provider
7) Consent forms — E-Sign — Patient
8) Intake complete — Acknowledgement — Intake Coordinator

---

## 52. Medical Records Release Authorization

**Tags**: [Healthcare, Providers] | **Complexity**: Simple | **Trigger**: Records release requested
**Compliance**: HIPAA

Roles: Patient, Records Coordinator, Receiving Party
1) Release request — Form — Patient
2) HIPAA authorization — E-Sign — Patient
3) Identity verification — File Request — Patient
4) Receiving party confirmation — Acknowledgement — Receiving Party
5) Records preparation — To-Do — Records Coordinator
6) Records delivery — File Request — Records Coordinator
7) Receipt acknowledgement — Acknowledgement — Receiving Party

---

## 53. Provider Credentialing

**Tags**: [Healthcare, Providers, Payers, Health Systems] | **Complexity**: Standard | **Trigger**: New provider hire / Recredentialing due
**Compliance**: NCQA, Joint Commission

Roles: Provider, Credentialing Coordinator, Medical Director, Credentialing Committee
1) Credentialing application & attestation — Form — Provider (demographics, education, training, work history 5 years, licensure, DEA, board cert, hospital affiliations, malpractice history, privilege delineation + signed attestation of accuracy)
2) Supporting credentials upload — File Request — Provider (medical license, DEA certificate, board certification, malpractice insurance face sheet, CV, peer reference contacts, government ID)
3) Primary source verification & sanctions screening — To-Do — Credentialing Coordinator (state license board, NPDB query, education/training verification, board cert with ABMS, DEA status, OIG/SAM exclusion lists, peer reference calls, work history verification)
4) Credentialing file assembly — To-Do — Credentialing Coordinator (compile all documents, PSV results, reference responses; verify completeness; prepare recommendation)
5) Medical Director review — Approval — Medical Director (review compiled file, evaluate any flags/gaps/malpractice history, approve or escalate)
6) Credentialing Committee decision — Approval — Credentialing Committee (approve with full privileges / approve with restrictions / deny with rationale)
7) Provider notification — System Email — System (decision, effective date, approved privileges, appeal process if denied)
8) Provider agreement — E-Sign — Provider (acknowledge approved privileges, organizational policies, re-credentialing obligations)
9) Re-credentialing schedule — To-Do — Credentialing Coordinator (set 36-month re-credentialing trigger, enroll in continuous NPDB monitoring, set license expiration alerts)

---

## 54. Clinical Trial Participant Enrollment

**Tags**: [Healthcare, Life Sciences, Research] | **Complexity**: Standard | **Trigger**: Potential participant identified
**Compliance**: FDA 21 CFR 50, 21 CFR Part 11, HIPAA

Roles: Participant, Study Coordinator, Principal Investigator
1) Informed consent & HIPAA authorization — E-Sign — Participant (IRB-approved ICF covering study purpose, procedures, risks, benefits, alternatives, confidentiality, voluntary participation + HIPAA authorization for PHI use in research)
2) Pre-screening questionnaire — Form — Participant (demographics, medical history summary, preliminary eligibility questions)
3) Medical history & eligibility assessment — Form — Participant (detailed medical history, current medications, lab results, condition-specific information per protocol)
4) Inclusion/exclusion criteria verification — To-Do — Study Coordinator (review responses against protocol criteria, document which are met/unmet, prepare eligibility summary for PI)
5) Eligibility determination — Decision — Principal Investigator (Eligible / Screen failure / Rescreening required)
6) Baseline assessments & enrollment — To-Do — Study Coordinator (protocol-required baseline assessments, enrollment CRF in EDC system)
7) Enrollment confirmation & study materials — Acknowledgement — Participant (study schedule, visit calendar, site contact information, instructions)
8) Randomization & treatment assignment — System Email — System (randomization per protocol scheme, treatment arm notification; blinding rules apply)

---

# 10. LEGAL & CORPORATE GOVERNANCE (10)

## 55. Contract Review & Execution

**Tags**: [Cross-industry] | **Complexity**: Complex | **Trigger**: Contract drafted or received
**Pairs With**: Contract Exception Request, NDA Execution

Roles: Counterparty, Legal Reviewer, Executive, AI
1) Contract intake — Form — Legal Reviewer (type, counterparty, value, term, auto-renewal, department)
2) Draft contract upload — File Request — Legal Reviewer
3) AI contract risk analysis — AI Automation — AI (non-standard clauses, liability caps, IP, data protection, auto-renewal traps)
4) Legal & financial review — To-Do — Legal Reviewer (indemnification, IP, termination, pricing, payment terms)
5) Redline document upload — File Request — Legal Reviewer
6) Counterparty negotiation — File Request — Counterparty (accepted changes, counter-proposals, new redlines)
7) Negotiation resolution — Decision — Legal Reviewer (Accept / Further negotiation / Escalate / Terminate)
8) Executive approval (if needed) — Approval — Executive
9) Contract execution — E-Sign — Counterparty
10) Executed contract filing — To-Do — Legal Reviewer

---

## 56. Contract Exception Request

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Non-standard terms requested / Customer redlines
**Pairs With**: NDA Execution, Contract Review
**Also in:** Colleague list as "Contract exception request"

Roles: Requestor, Legal Reviewer, Business Approver, Finance Reviewer, Deal Desk
1) Exception request details — Form — Requestor
2) Proposed redlines — File Request — Requestor
3) Business justification — File Request — Requestor
4) Legal analysis — To-Do — Legal Reviewer
5) Finance impact assessment — To-Do — Finance Reviewer
6) Business approval — Approval — Business Approver
7) Deal desk approval — Approval — Deal Desk
8) Decision acknowledgement — Acknowledgement — Requestor

---

## 57. NDA Execution

**Tags**: [All Industries] | **Complexity**: Simple | **Trigger**: Confidential discussion / deal exploration
**Pairs With**: M&A Due Diligence, Client Onboarding
**Also in:** Colleague list as "NDA execution"

Roles: External Party, Legal Owner
1) NDA request details — Form — External Party (counterparty, type, purpose, confidentiality period)
2) Legal review (if non-standard) — To-Do — Legal Owner
3) NDA document upload — File Request — Legal Owner
4) Counterparty review — File Request — External Party
5) NDA execution — E-Sign — External Party
6) Executed copy distribution — To-Do — Legal Owner

---

## 58. Litigation Hold Acknowledgement

**Tags**: [All Industries] | **Complexity**: Simple | **Trigger**: Litigation filed / Threat of litigation
**Pairs With**: Subpoena Response
**Also in:** Colleague list as "Litigation hold acknowledgement"

Roles: Custodian, Legal Owner
1) Litigation hold notice — Acknowledgement — Custodian
2) Custodian questionnaire — Form — Custodian
3) Data preservation confirmation — Acknowledgement — Custodian
4) Completion confirmation — Acknowledgement — Legal Owner

**Common Variations:**
- IT-managed data: Add IT preservation steps
- Compliance-sensitive: Add Compliance verification

---

## 59. Board Resolution & Consent Collection

**Tags**: [All Industries, Corporate Governance] | **Complexity**: Standard | **Trigger**: Board action required / Annual resolutions
**Also in:** Colleague list as "Board resolution and consent collection"

Roles: Corporate Secretary, Board Member, General Counsel, CEO
1) Resolution draft distribution — File Request — Corporate Secretary
2) Director review acknowledgement — Acknowledgement — Board Member
3) Questions / comments — Form — Board Member
4) Legal review — To-Do — General Counsel
5) Final resolution distribution — File Request — Corporate Secretary
6) Resolution execution — E-Sign — Board Member
7) CEO attestation — E-Sign — CEO
8) Filing confirmation — Acknowledgement — Corporate Secretary

---

## 60. M&A Due Diligence Document Request

**Tags**: [Investment Banking, Private Equity, Corporate Development] | **Complexity**: Complex | **Trigger**: LOI signed / DD phase begins
**Pairs With**: NDA Execution
**Also in:** Colleague list as "M&A Due Diligence Document Request"

Roles: Target Company Contact, Deal Team Lead, Buyer Counsel, AI
1) NDA & data room access — Acknowledgement — Target Company Contact
2) DD request list distribution — File Request — Deal Team Lead
3) Corporate & financial documents — File Request — Target Company Contact
4) Tax & legal documents — File Request — Target Company Contact
5) Employment, IP & contracts — File Request — Target Company Contact
6) Management questionnaire — Form — Target Company Contact (off-balance-sheet liabilities, litigation, customer concentration, risks)
7) Buyer counsel questions & follow-ups — Form — Target Company Contact
8) Follow-up documentation — File Request — Target Company Contact
9) AI red flag summary — AI Automation — AI (synthesizes across workstreams: material risks, gaps, deal-breakers, rep/warranty needs)
10) Go/No-Go decision — Approval — Deal Team Lead

---

## 61. DSAR / Privacy Rights Request

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Privacy rights request received
**Compliance**: GDPR, CCPA
**Also in:** Colleague list as "DSAR / Privacy rights request"

Roles: Data Subject, Privacy Operations, IT/Data Team, Legal Reviewer
1) Request intake & verification — Form — Data Subject
2) Identity verification documents — File Request — Data Subject
3) Scope clarification — Form — Data Subject
4) Data collection across systems — To-Do — IT/Data Team
5) Legal review / redaction — To-Do — Legal Reviewer
6) Privacy ops review — To-Do — Privacy Operations
7) Response delivery — File Request — Privacy Operations
8) Completion acknowledgement — Acknowledgement — Data Subject

---

## 62. Subpoena Response Coordination

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Subpoena received
**Pairs With**: Litigation Hold
**Also in:** Colleague list as "Subpoena response coordination"

Roles: Legal Owner, Custodian, IT Administrator, Outside Counsel
1) Subpoena intake & analysis — Form — Legal Owner
2) Custodian identification — To-Do — Legal Owner
3) Document preservation notice — Acknowledgement — Custodian
4) IT data preservation — To-Do — IT Administrator
5) Document collection — File Request — Custodian
6) Outside counsel review — To-Do — Outside Counsel
7) Privilege review — To-Do — Legal Owner
8) Response submission confirmation — Acknowledgement — Legal Owner

---

## 63. New Business Formation

**Tags**: [Legal, Corporate Services, Startups] | **Complexity**: Standard | **Trigger**: New entity needed
**Pairs With**: Beneficial Ownership Collection

Roles: Founder, Legal Advisor, Registered Agent, Accountant
1) Formation intake — Form — Founder
2) Ownership & structure details — Form — Founder
3) Founder identity documents — File Request — Founder
4) Operating agreement / bylaws review — To-Do — Legal Advisor
5) Formation document execution — E-Sign — Founder
6) Registered agent acceptance — Acknowledgement — Registered Agent
7) EIN application — To-Do — Accountant
8) Post-formation checklist — To-Do — Legal Advisor
9) Formation complete — Acknowledgement — Founder

---

## 64. Franchise Agreement Execution

**Tags**: [Franchising, Retail, Food Service] | **Complexity**: Complex | **Trigger**: Franchise application approved
**Compliance**: FTC Franchise Rule

Roles: Franchisee, Franchise Development Manager, Legal Reviewer, Finance, Training Lead
1) Franchise application — Form — Franchisee
2) Financial qualification documents — File Request — Franchisee
3) FDD acknowledgement (14-day waiting period) — Acknowledgement — Franchisee
4) Franchisee questions — Form — Franchisee
5) Discovery day confirmation — Acknowledgement — Franchisee
6) Franchise agreement review — To-Do — Legal Reviewer
7) Financial terms — To-Do — Finance
8) Franchise agreement execution — E-Sign — Franchisee
9) Training schedule — To-Do — Training Lead
10) Onboarding kickoff — Acknowledgement — Franchise Development Manager

---

## 65. Trademark / IP Assignment

**Tags**: [Legal, Corporate, IP] | **Complexity**: Standard | **Trigger**: IP transfer needed (acquisition, employee assignment, corporate restructuring)
**Pairs With**: M&A Due Diligence, NDA Execution
**Also in:** Colleague list as "Trademark/IP Assignment"

Roles: Assignor, IP Counsel, Assignee, IP Administrator
1) Assignment request intake — Form — IP Counsel (IP type, registration numbers, assignor/assignee details, jurisdiction, consideration, reason for transfer)
2) IP schedule & registration documents — File Request — Assignor (registration certificates, prior assignments, existing licenses, encumbrances)
3) Chain of title verification — To-Do — IP Counsel (confirm ownership, check liens/encumbrances, verify registration status)
4) Assignment agreement review — File Request — IP Counsel
5) Assignee review & comments — Form — Assignee
6) Assignment execution — E-Sign — Assignor
7) Assignee countersignature — E-Sign — Assignee
8) Recording with IP office (USPTO/WIPO/etc.) — To-Do — IP Administrator
9) Recordation confirmation — Acknowledgement — IP Counsel

**Common Variations:**
- Employee IP assignment: Simpler — skip chain of title, often part of onboarding
- M&A bulk assignment: Add IP due diligence step, multiple schedules

---

# 11. AUDIT & COMPLIANCE (10)

## 66. SOC 2 Evidence Collection (PBC)

**Tags**: [All Industries] | **Complexity**: Complex | **Trigger**: Annual audit cycle begins
**Pairs With**: ISO 27001 Evidence, Internal Audit
**Compliance**: SOC 2 Type I/II
**Also in:** Colleague list as "SOC 2 Evidence Collection PBC"

Roles: Control Owner, Compliance Coordinator, External Auditor
1) Audit scope & period confirmation — Form — Compliance Coordinator
2) Evidence request list (PBC) — File Request — Control Owner
3) Clarification Q&A — Form — Control Owner
4) Evidence review — To-Do — Compliance Coordinator
5) Follow-up evidence request — File Request — Control Owner
6) Evidence package approved — Approval — Compliance Coordinator
7) Share with external auditor — File Request — External Auditor
8) Auditor follow-up questions — Form — External Auditor
9) Final evidence uploads — File Request — Control Owner
10) Audit closeout acknowledgement — Acknowledgement — Compliance Coordinator

---

## 67. ISO 27001 Evidence Collection

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Surveillance audit / Certification audit
**Pairs With**: SOC 2 Evidence Collection
**Compliance**: ISO 27001
**Also in:** Colleague list as "ISO 27001 Evidence collection"

Roles: Control Owner, ISO Program Owner, External Auditor
1) ISMS scope & sites confirmation — Form — ISO Program Owner
2) Statement of Applicability mapping — File Request — ISO Program Owner
3) Evidence by control area — File Request — Control Owner
4) Control owner clarifications — Form — Control Owner
5) Evidence completeness review — To-Do — ISO Program Owner
6) Gap remediation evidence — File Request — Control Owner
7) Evidence accepted — Approval — ISO Program Owner
8) External auditor package — File Request — External Auditor
9) Finding acknowledgement — Acknowledgement — ISO Program Owner

---

## 68. External Financial Audit Coordination

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Fiscal year end / Auditor engagement confirmed
**Compliance**: GAAP, IFRS

Roles: External Auditor, Controller/CFO, Department Heads
1) Audit planning & timeline — Form — External Auditor
2) PBC list distribution — File Request — Controller/CFO
3) Department evidence collection — File Request — Department Heads
4) Auditor clarifications — Form — Controller/CFO
5) Follow-up documentation — File Request — Department Heads
6) Draft findings review — To-Do — Controller/CFO
7) Management response — File Request — Controller/CFO
8) Final report acknowledgement — Acknowledgement — Controller/CFO

**Common Variations:**
- Public companies: Add SOX control testing steps

---

## 69. PCI DSS SAQ + AOC Collection

**Tags**: [Retail, E-commerce, Financial Services] | **Complexity**: Standard | **Trigger**: Annual PCI cycle / New merchant onboarding
**Compliance**: PCI DSS

Roles: Merchant Contact, Security Lead, Executive Signer
1) Determine SAQ type — Form — Merchant Contact
2) Supporting evidence collection — File Request — Merchant Contact
3) IT environment documentation — File Request — Merchant Contact
4) Complete SAQ questionnaire — Form — Merchant Contact
5) Security review — To-Do — Security Lead
6) Remediation tasks (if required) — To-Do — Merchant Contact
7) SAQ approval — Approval — Security Lead
8) Executive attestation of compliance — E-Sign — Executive Signer

---

## 70. HIPAA Business Associate Attestation

**Tags**: [Healthcare, Providers, Payers, Health Tech] | **Complexity**: Simple | **Trigger**: New BA relationship / Annual renewal
**Pairs With**: Vendor Security Assessment
**Compliance**: HIPAA, BAA
**Also in:** Colleague list as "HIPAA Business Associate Attestation"

Roles: Business Associate Contact, Compliance Lead
1) BA attestation questionnaire — Form — Business Associate Contact
2) Safeguard acknowledgement — Acknowledgement — Business Associate Contact
3) Sub-processor disclosure — File Request — Business Associate Contact
4) Security documentation — File Request — Business Associate Contact
5) Compliance review — To-Do — Compliance Lead
6) Attestation accepted — Approval — Compliance Lead
7) Completion acknowledgement — Acknowledgement — Business Associate Contact

---

## 71. Internal Audit Evidence Request

**Tags**: [All Industries] | **Complexity**: Standard | **Trigger**: Internal audit plan / Risk-based trigger
**Pairs With**: External Financial Audit
**Also in:** Colleague list as "Internal audit evidence request"

Roles: Audit Lead, Control Owner, Department Manager
1) Audit kickoff & scope — Form — Audit Lead
2) Evidence request — File Request — Control Owner
3) Clarification questions — Form — Control Owner
4) Evidence review — To-Do — Audit Lead
5) Follow-up request — File Request — Control Owner
6) Department manager sign-off — Approval — Department Manager
7) Finding response — File Request — Department Manager
8) Audit closeout — Acknowledgement — Audit Lead

---

## 72. Periodic Compliance Certification

**Tags**: [Financial Services, Regulated Industries] | **Complexity**: Standard | **Trigger**: Quarterly/annual compliance cycle
**Compliance**: SOX, Regulatory

Roles: Certifier, Compliance Officer, Executive, AI
1) Certification cycle initiation — Form — Compliance Officer (period, type, deadline, certifier list)
2) Pre-certification materials — File Request — Compliance Officer
3) Certification notification — System Email — System
4) Compliance self-assessment — Form — Certifier
5) Supporting evidence upload — File Request — Certifier
6) AI certification aggregation — AI Automation — AI (flags "No" responses, exceptions, inconsistencies across units)
7) Exception investigation — To-Do — Compliance Officer
8) Compliance officer review — Approval — Compliance Officer
9) Executive certification — E-Sign — Executive

---

## 73. Policy Acknowledgement Rollout

**Tags**: [All Industries] | **Complexity**: Simple | **Trigger**: New/updated policy / Annual re-acknowledgement

Roles: Policy Recipient, Compliance Admin
1) Policy publication details — Form — Compliance Admin (title, category, effective date, audience, deadline)
2) Policy document upload — File Request — Compliance Admin
3) Distribution notification — System Email — System
4) Policy review & acknowledgement — Acknowledgement — Policy Recipient
5) Knowledge verification (if required) — Form — Policy Recipient
6) Manager follow-up for non-respondents — To-Do — Compliance Admin
7) Rollout closure — Acknowledgement — Compliance Admin

---

## 74. Regulatory Inquiry Response Coordination

**Tags**: [Financial Services, Healthcare, Regulated Industries] | **Complexity**: Simple | **Trigger**: Regulatory inquiry received
**Pairs With**: Litigation Hold, Subpoena Response
**Also in:** Colleague list as "Regulatory inquiry response coordination"

Roles: Compliance Owner, Subject Matter Expert, Legal Counsel, Executive Sponsor
1) Inquiry intake & scope — Form — Compliance Owner
2) Evidence collection from SMEs — File Request — Subject Matter Expert
3) SME clarifications — Form — Subject Matter Expert
4) Draft response preparation — To-Do — Compliance Owner
5) Legal review — To-Do — Legal Counsel
6) Executive approval — Approval — Executive Sponsor
7) Final submission confirmation — Acknowledgement — Compliance Owner

---

## 75. Internal Control Self-Assessment

**Tags**: [All Industries, GRC] | **Complexity**: Standard | **Trigger**: Quarterly/annual assessment cycle / Risk event
**Pairs With**: SOC 2 Evidence Collection, Internal Audit Evidence Request
**Compliance**: SOX (where applicable)
**Also in:** Colleague list as "Internal control self-assessment"

Roles: Control Owner, Compliance Coordinator, Department Manager
1) Assessment cycle initiation — Form — Compliance Coordinator (period, scope, control areas, deadline, control owner assignments)
2) Control inventory & prior findings — File Request — Compliance Coordinator (control descriptions, expected evidence, prior assessment results)
3) Self-assessment questionnaire — Form — Control Owner (control effectiveness rating, deviations noted, process changes, remediation status of prior findings)
4) Supporting evidence upload — File Request — Control Owner
5) Compliance coordinator review — To-Do — Compliance Coordinator
6) Clarification questions — Form — Control Owner
7) Remediation plan for gaps (if any) — Form — Control Owner
8) Department manager attestation — Approval — Department Manager
9) Assessment closure — Acknowledgement — Compliance Coordinator

**Common Variations:**
- SOX-regulated: Add IT general controls (ITGC) section, executive sub-certification
- Risk-triggered: Skip cycle initiation, start with targeted control scope

---

# 12. CONSTRUCTION & REAL ESTATE (10)

## 76. Subcontractor Qualification

**Tags**: [Construction, General Contractors] | **Complexity**: Standard | **Trigger**: New subcontractor needed / Bid received
**Pairs With**: Lien Waiver Collection

Roles: Subcontractor, Project Manager, Safety Lead, Insurance Coordinator
1) Company profile & capabilities — Form — Subcontractor
2) Insurance certificates (GL, WC, Auto) — File Request — Subcontractor
3) Safety program documentation — File Request — Subcontractor
4) License & bonding verification — File Request — Subcontractor
5) References — Form — Subcontractor
6) Insurance review — To-Do — Insurance Coordinator
7) Safety review — To-Do — Safety Lead
8) Qualification decision — Approval — Project Manager
9) Qualification acknowledgement — Acknowledgement — Subcontractor

---

## 77. Lien Waiver Collection — Progress Payment

**Tags**: [Construction, Real Estate Development] | **Complexity**: Simple | **Trigger**: Payment application submitted
**Pairs With**: Subcontractor Qualification, Change Order
**Compliance**: Mechanics Lien Laws

Roles: Subcontractor, Project Manager, Accounts Payable, Owner Representative
1) Payment application — Form — Subcontractor (billing period, work completed, materials stored, retainage, change orders, current amount due)
2) Schedule of values & compliance docs — File Request — Subcontractor (updated SOV, certified payroll if required, current insurance certificates, sub-tier lien waivers if applicable)
3) Conditional lien waiver — E-Sign — Subcontractor (conditional waiver for current billing period, effective only upon receipt of payment)
4) Field verification & pay app review — To-Do — Project Manager (verify work quantities match application, review SOV, confirm stored materials)
5) Payment application approval — Approval — Project Manager
6) Payment processing — To-Do — Accounts Payable
7) Unconditional lien waiver (prior period) — E-Sign — Subcontractor (confirms receipt of previous period's payment, immediately waives lien rights for that prior period)

---

## 78. Lien Waiver Collection — Final Payment

**Tags**: [Construction, Real Estate Development] | **Complexity**: Standard | **Trigger**: Substantial completion / Final pay application
**Pairs With**: Lien Waiver (Progress), Construction Closeout
**Compliance**: Mechanics Lien Laws

Roles: Subcontractor, Project Manager, Accounts Payable, Owner Representative
1) Final payment application — Form — Subcontractor (final contract amount, total completed, total retainage held, final amount due including retention)
2) Punch list completion — To-Do — Subcontractor (complete all remaining punch list items from substantial completion walkthrough)
3) Punch list verification — To-Do — Project Manager (verify all items satisfactorily completed, document with photos)
4) Closeout documents & sub-tier waivers — File Request — Subcontractor (as-builts, warranty documents, O&M manuals, final sub-tier lien waivers from all lower-tier vendors/suppliers)
5) Final conditional lien waiver — E-Sign — Subcontractor (waives all remaining lien rights including retention, effective only upon receipt of final payment)
6) Owner final approval — Approval — Owner Representative (approve final payment including retention release)
7) Final payment processing — To-Do — Accounts Payable (process final payment including all retained funds)
8) Final unconditional lien waiver — E-Sign — Subcontractor (confirms receipt of all payments including retention, immediately waives all lien rights — sign only after funds clear)
9) Retention release confirmation — Acknowledgement — Subcontractor (acknowledge receipt of all contract funds, confirm account fully settled)

---

## 79. Submittals & Shop Drawing Approval

**Tags**: [Construction] | **Complexity**: Standard | **Trigger**: Subcontractor ready to order/fabricate
**Pairs With**: RFI Coordination

Roles: Subcontractor, Project Manager, Architect/Engineer, Owner Representative
1) Submittal package upload — File Request — Subcontractor
2) PM preliminary review — To-Do — Project Manager
3) Architect/Engineer review — To-Do — Architect/Engineer
4) Review comments — Form — Architect/Engineer
5) Owner review (if required) — To-Do — Owner Representative
6) Revised submittal (if required) — File Request — Subcontractor
7) Final approval — Approval — Architect/Engineer
8) Approval acknowledgement — Acknowledgement — Subcontractor

---

## 80. RFI (Request for Information) Coordination

**Tags**: [Construction] | **Complexity**: Simple | **Trigger**: Field question / Design clarification needed
**Pairs With**: Submittals, Change Order

Roles: Contractor, Architect, Engineer
1) RFI submission — Form — Contractor
2) Supporting documentation — File Request — Contractor
3) Architect review — To-Do — Architect
4) Engineer input (if needed) — To-Do — Engineer
5) RFI response — File Request — Architect
6) Response acknowledgement — Acknowledgement — Contractor

---

## 81. Change Order Approval

**Tags**: [Construction] | **Complexity**: Standard | **Trigger**: Scope change / Design modification / Unforeseen condition
**Pairs With**: RFI Coordination, Lien Waiver

Roles: Contractor, Project Manager, Architect, Owner Representative
1) Change order request — Form — Contractor (CO number, category, description, affected specs)
2) Cost breakdown & backup — File Request — Contractor (sub quotes, material takeoffs, site photos)
3) PM review — To-Do — Project Manager
4) Architect review — To-Do — Architect
5) Owner negotiation / questions — Form — Owner Representative
6) Owner approval — Approval — Owner Representative
7) Change order execution — E-Sign — Owner Representative
8) Change log update — To-Do — Project Manager

---

## 82. Construction Project Closeout

**Tags**: [Construction] | **Complexity**: Complex | **Trigger**: Substantial completion claimed
**Pairs With**: Lien Waiver (Final)

Roles: GC/Contractor, Architect, Owner
1) Substantial completion notification — Form — GC/Contractor
2) Architect inspection & punch list — Form — Architect
3) Punch list acknowledgement — Acknowledgement — GC/Contractor
4) Certificate of Occupancy & permits — File Request — GC/Contractor
5) Punch list completion report — Form — GC/Contractor
6) Punch list final approval — Approval — Owner
7) Closeout documentation — File Request — GC/Contractor (O&M manuals, warranties, lien waivers, as-builts)
8) Owner training & orientation — To-Do — GC/Contractor
9) Final payment & retainage release — Approval — Owner
10) Project closure notification — System Email — System

---

## 83. Residential Purchase Transaction

**Tags**: [Real Estate, Mortgage, Title] | **Complexity**: Complex | **Trigger**: Purchase agreement executed

Roles: Buyer, Seller, Escrow/Title Agent, Buyer Agent
1) Purchase agreement intake — Form — Buyer Agent (property, price, EMD, loan type, contingency periods, COE date)
2) Escrow opening & EMD — To-Do — Escrow/Title Agent
3) Title report & seller disclosures — File Request — Seller (prelim title, TDS, SPQ, NHD, lead paint)
4) Inspection reports — File Request — Buyer
5) Buyer repair request / contingency removal — Form — Buyer (items accepted, repair requests, proceed/cancel)
6) Appraisal & loan processing — Form — Buyer Agent (appraisal value, conditions, approval status)
7) Contingency removal — appraisal & loan — Acknowledgement — Buyer (EMD now at risk)
8) Title clearance & closing prep — To-Do — Escrow/Title Agent
9) Final walkthrough — To-Do — Buyer
10) Closing signing & funding — E-Sign — Buyer
11) Recording & key transfer — To-Do — Escrow/Title Agent

---

## 84. Commercial Lease Execution

**Tags**: [Commercial Real Estate, Property Management] | **Complexity**: Standard | **Trigger**: Lease terms agreed / LOI signed

Roles: Tenant, Landlord Representative, Property Manager
1) Lease application — Form — Tenant
2) Financial documentation — File Request — Tenant
3) Credit / background check authorization — E-Sign — Tenant
4) Landlord review — To-Do — Landlord Representative
5) Lease negotiation — Form — Tenant
6) Lease execution — E-Sign — Tenant
7) Landlord execution — E-Sign — Landlord Representative
8) Move-in acknowledgement — Acknowledgement — Property Manager

---

## 85. Tenant Move-Out & Security Deposit

**Tags**: [Property Management, Residential, Commercial] | **Complexity**: Standard | **Trigger**: Move-out notice / Lease end date approaching
**Pairs With**: Commercial Lease Execution

Roles: Tenant, Property Manager, Maintenance, Accounting
1) Move-out notice — Form — Tenant
2) Pre-move-out inspection — To-Do — Property Manager
3) Move-out checklist — Acknowledgement — Tenant
4) Key return acknowledgement — Acknowledgement — Tenant
5) Final inspection — To-Do — Maintenance
6) Final inspection report — File Request — Property Manager
7) Deposit accounting — To-Do — Accounting
8) Deposit disposition acknowledgement — Acknowledgement — Tenant

---

# 13. ORDER & SUPPLY CHAIN (8)

## 86. Order Fulfillment

**Tags**: [Manufacturing, Distribution] | **Complexity**: Standard | **Trigger**: Purchase order received from customer

Roles: Customer, Warehouse Lead, Shipping Coordinator
1) Purchase order submission — Form — Customer (PO number, ship-to, delivery date, line items, special instructions)
2) PO acknowledgement & validation — To-Do — Warehouse Lead (verify pricing, inventory, credit)
3) Order confirmation — Acknowledgement — Customer
4) Pick, pack & quality check — To-Do — Warehouse Lead
5) Shipping & BOL upload — File Request — Shipping Coordinator (carrier, tracking, BOL, packing slip)
6) Shipment notification — System Email — System
7) Delivery confirmation — Acknowledgement — Customer
8) Invoice & supporting docs — File Request — Shipping Coordinator
9) Payment confirmation — Acknowledgement — Warehouse Lead

---

## 87. Purchase Order Processing

**Tags**: [Manufacturing, Cross-industry] | **Complexity**: Standard | **Trigger**: Purchase requisition submitted

Roles: Requisitioner, Procurement Lead, Vendor
1) Purchase requisition — Form — Requisitioner (department, GL account, item, cost, quantity, justification, vendor)
2) Manager approval — Approval — Procurement Lead
3) Vendor selection & PO creation — To-Do — Procurement Lead
4) Purchase order dispatch — File Request — Procurement Lead
5) Vendor order acknowledgement — Acknowledgement — Vendor
6) Goods receipt & inspection — Form — Procurement Lead (PO number, quantity, condition, discrepancies)
7) Vendor invoice submission — File Request — Vendor
8) 3-way match & discrepancy resolution — To-Do — Procurement Lead (PO vs. receiving vs. invoice)
9) Payment authorization — Approval — Procurement Lead

---

## 88. RMA / Return Processing

**Tags**: [Manufacturing, Retail, SaaS] | **Complexity**: Standard | **Trigger**: Customer requests return or reports defect

Roles: Customer, Returns Lead
1) Return request submission — Form — Customer (order number, product, quantity, reason, desired resolution)
2) Supporting evidence — File Request — Customer (photos, packing slip, error codes)
3) RMA approval — Approval — Returns Lead
4) Return shipping instructions — Acknowledgement — Customer (RMA number, return address, packaging instructions)
5) Return receipt & inspection — Form — Returns Lead (condition, defect verified, serial/lot number)
6) Disposition decision — Decision — Returns Lead (Restock / Repair / Scrap / Return to Vendor)
7) Credit memo / refund processing — To-Do — Returns Lead
8) Resolution confirmation — Acknowledgement — Customer

---

## 89. Customer Complaint Resolution

**Tags**: [Manufacturing, Cross-industry] | **Complexity**: Standard | **Trigger**: Customer complaint received

Roles: Customer, Quality Lead, AI
1) Complaint registration — Form — Customer (product/service, category, severity, description, desired resolution)
2) Supporting documentation — File Request — Customer
3) AI complaint triage — AI Automation — AI (classifies severity, checks for patterns, routes to department, sets SLA)
4) Complaint acknowledgement — System Email — System (reference number, assigned rep, expected timeline)
5) Investigation & root cause analysis — To-Do — Quality Lead
6) Corrective action plan — File Request — Quality Lead
7) Corrective action verification — Approval — Quality Lead
8) Customer resolution offer — Form — Quality Lead
9) Customer acceptance — Approval — Customer

---

## 90. Import Customs Clearance

**Tags**: [Import/Export, Manufacturing, Retail] | **Complexity**: Standard | **Trigger**: Shipment in transit / Pre-arrival
**Compliance**: CBP, Customs

Roles: Importer, Customs Broker, Regulatory Liaison
1) Shipment details & bond confirmation — Form — Importer (origin, destination, commodity, value, Incoterms, confirm valid customs bond on file)
2) Commercial documents upload — File Request — Importer (commercial invoice, packing list, bill of lading/airway bill, certificate of origin if applicable, PGA permits/licenses)
3) ISF (10+2) filing — To-Do — Customs Broker (file via ACE at least 24 hours before vessel loading at origin; $5K/violation penalty)
4) Tariff classification & entry preparation — To-Do — Customs Broker (HTS classification, duty rate determination, prepare CBP Form 3461)
5) Duty & fee estimate approval — Approval — Importer (review estimated duties, taxes, MPF, HMF; authorize payment)
6) Government agency review (if applicable) — Decision — Regulatory Liaison (FDA/USDA/EPA/CPSC holds — coordinate clearance or mark N/A)
7) Customs release confirmation — Acknowledgement — Customs Broker (CBP authorized release, cargo cleared for pickup)
8) Entry summary filing & delivery — To-Do — Customs Broker (file CBP Form 7501 within 10 working days of release; coordinate final delivery)

---

## 91. Supplier Corrective Action Request (SCAR)

**Tags**: [Manufacturing, Quality, Supply Chain] | **Complexity**: Standard | **Trigger**: Quality defect / Non-conformance
**Pairs With**: First Article Inspection

Roles: Supplier Contact, Quality Engineer, Procurement Lead, Quality Manager
1) Non-conformance report — Form — Quality Engineer
2) Supplier acknowledgement — Acknowledgement — Supplier Contact
3) Root cause analysis — File Request — Supplier Contact
4) Corrective action plan — File Request — Supplier Contact
5) Quality review — To-Do — Quality Engineer
6) Evidence of implementation — File Request — Supplier Contact
7) Verification — To-Do — Quality Engineer
8) Procurement acknowledgement — Acknowledgement — Procurement Lead
9) SCAR closure — Approval — Quality Manager

---

## 92. First Article Inspection (FAI)

**Tags**: [Manufacturing, Aerospace, Automotive] | **Complexity**: Standard | **Trigger**: First production run / New part approval
**Pairs With**: SCAR
**Compliance**: AS9102 (Aerospace)

Roles: Supplier, Quality Engineer, Engineering Reviewer
1) FAI request & part identification — Form — Quality Engineer (part number, revision, drawing number, FAI reason, applicable specs, customer requirements)
2) FAI requirements acknowledgement — Acknowledgement — Supplier (confirm understanding of AS9102 deliverables — Forms 1–3 and sample parts)
3) First article sample submission — File Request — Supplier (ship sample parts; upload shipping confirmation, lot/serial numbers, production run details)
4) AS9102 FAI package — File Request — Supplier (Form 1: Part Number Accountability — part ID, materials, sub-components; Form 2: Product Accountability — raw material certs, special process approvals, functional test results; Form 3: Characteristic Accountability — dimensional inspection results for every drawing characteristic)
5) Quality engineer review — To-Do — Quality Engineer (verify Form 1 traceability, Form 2 material/process certs, Form 3 dimensional data against drawing; independent verification measurements if required)
6) Engineering design review — To-Do — Engineering Reviewer (verify Form 3 data against design intent, key characteristics, GD&T callouts; confirm Form 2 special process results meet engineering requirements)
7) FAI disposition — Decision — Quality Engineer (Approve / Conditional — resubmit affected forms / Reject — root cause analysis required)
8) FAI completion notification — System Email — System (disposition status, conditions or corrective actions, approved FAI reference number)

---

## 93. Product Recall Coordination

**Tags**: [Manufacturing, Consumer Products, Food & Beverage] | **Complexity**: Standard | **Trigger**: Safety issue identified / Regulatory recall order
**Compliance**: CPSC, FDA

Roles: Manufacturer, Distributor, Retailer, Regulatory Liaison
1) Recall notification — Form — Manufacturer
2) Product identification documentation — File Request — Manufacturer
3) Distributor acknowledgement — Acknowledgement — Distributor
4) Retailer acknowledgement — Acknowledgement — Retailer
5) Inventory reconciliation — Form — Distributor
6) Retail inventory count — Form — Retailer
7) Return instructions — File Request — Manufacturer
8) Regulatory notification — To-Do — Regulatory Liaison
9) Recall completion report — File Request — Manufacturer

---

# Summary

| # | Category | Templates | Step Range |
|---|----------|-----------|------------|
| 1 | Client Onboarding | 7 | 7–10 |
| 2 | Vendor & Partner Management | 7 | 6–10 |
| 3 | HR & Employee Lifecycle | 5 | 8–10 |
| 4 | Banking & Financial Services | 8 | 6–10 |
| 5 | Sales & Evaluation | 5 | 8–10 |
| 6 | Account Management | 4 | 6–8 |
| 7 | Professional Services & Delivery | 6 | 6–10 |
| 8 | Insurance & Claims | 7 | 7–9 |
| 9 | Healthcare | 5 | 7–9 |
| 10 | Legal & Corporate Governance | 11 | 4–10 |
| 11 | Audit & Compliance | 10 | 7–10 |
| 12 | Construction & Real Estate | 10 | 6–11 |
| 13 | Order & Supply Chain | 8 | 8–9 |
| **Total** | **13 categories** | **93 templates** | **avg ~8 steps** |

## AI Automation Steps (~12 templates)

AI steps are included only where they gate a real decision:

| Template | AI Step | Why It's a Step |
|----------|---------|-----------------|
| Financial Services KYC | Risk scoring & sanctions screening | Determines standard vs. EDD path |
| Individual KYC | Risk scoring & sanctions screening | Determines standard vs. EDD path |
| Insurance New Business | Submission triage | Determines if submission proceeds to underwriting |
| Insurance Claim | Coverage verification & triage | Validates coverage before investigation begins |
| Vendor Onboarding | Vendor risk assessment | Gates procurement approval |
| Contractor Onboarding | Classification risk check | IRS compliance — determines W-2 vs. 1099 |
| Contract Review | Contract risk analysis | Flags issues for legal review focus |
| M&A Due Diligence | Red flag summary | Synthesizes across workstreams for go/no-go |
| Pilot Program | Evaluation report | Data-driven go/no-go recommendation |
| RFP Response | Requirements analysis | Creates assignment matrix that drives work |
| Compliance Certification | Certification aggregation | Flags exceptions requiring investigation |
| Customer Complaint | Complaint triage | Routes complaint, sets SLA timer |

## Complexity Distribution

| Complexity | Count | % |
|------------|-------|---|
| Simple (4–7 steps) | 18 | 19% |
| Standard (7–9 steps) | 59 | 64% |
| Complex (10–12 steps) | 16 | 17% |

## Industries Covered

Financial Services, Banking, Insurance, Healthcare, Legal, Accounting, Construction, Real Estate, Manufacturing, Technology/SaaS, Professional Services, Franchising, Import/Export, Aerospace, Government, Life Sciences, Property Management, Consumer Products