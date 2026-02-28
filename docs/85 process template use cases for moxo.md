# Moxo Flow Template Library — 85 Templates

## Summary
This is a curated list of 85 process templates optimized for Moxo Flow's unique value proposition: **orchestrating multi-party workflows that require coordination across external parties and internal departments, with document exchange that isn't fully handled by existing systems of record.**

## Selection Criteria
Each template was selected because it:
1. **Requires multi-party coordination** (external parties AND/OR internal cross-department)
2. **Involves document exchange** with back-and-forth iteration
3. **Isn't fully orchestrated by a single system of record** (gaps between CRM, ERP, HRIS, etc.)
4. **Has clear handoffs** between parties with accountability
5. **Benefits from structured workflow** vs. ad-hoc email chains

## Template Design Principles

**Right-sized starting points:**
- Templates are ~80% complete — users add company specifics, not delete half the steps
- Simple processes stay simple (NDA: 4 steps, 2 roles)
- Complex processes have appropriate detail (Loan Underwriting: 10 steps, 5 roles)

**Step count guidance:**
- Simple processes: 4-6 steps (NDA, COI Request, Litigation Hold)
- Standard processes: 6-8 steps (most templates)
- Complex processes: 10-15 steps (M&A, Loan Underwriting, Property Closing)

## Metadata Legend

Each template includes:
- **Tags**: Industry/vertical applicability
- **Complexity**: Simple | Standard | Complex
- **Trigger**: When to start this flow
- **Pairs With**: Related templates often used together
- **Compliance**: Regulatory requirements (where applicable)
- **Common Variations**: Typical customizations

## Conventions
- Roles are placeholders (Contact TBD)
- Sequential by default; no artificial branching
- Approvals represent decisions; follow-ups are explicit steps

---

## AUDIT, EVIDENCE & COMPLIANCE (10 Templates)

### 1. SOC 2 Evidence Collection (PBC)
**Why Moxo**: Auditors and control owners coordinate outside GRC tools; PBC lists require structured follow-up

**Tags**: [All Industries]
**Complexity**: Complex
**Trigger**: Annual audit cycle begins / Auditor engagement letter received
**Pairs With**: ISO 27001 Evidence Collection, Internal Audit Evidence Request
**Compliance**: SOC 2 Type I/II

Roles: Control Owner, Compliance Coordinator, External Auditor
1) Audit scope & period confirmation — Form — Compliance Coordinator
2) Evidence request list (PBC) — File Request — Control Owner
3) Clarification Q&A — Questionnaire — Control Owner
4) Evidence review — To-Do — Compliance Coordinator
5) Follow-up evidence request — File Request — Control Owner
6) Evidence package approved — Approval — Compliance Coordinator
7) Share with external auditor — File Request — External Auditor
8) Auditor follow-up questions — Questionnaire — External Auditor
9) Final evidence uploads — File Request — Control Owner
10) Audit closeout acknowledgement — Acknowledgement — Compliance Coordinator

**Common Variations:**
- For first-time audits: Add "Readiness assessment" step
- For Type II audits: Add multiple evidence collection periods

### 2. ISO 27001 Evidence Collection
**Why Moxo**: Multi-site evidence gathering from distributed control owners across departments

**Tags**: [All Industries]
**Complexity**: Complex
**Trigger**: Annual surveillance audit / Certification audit scheduled
**Pairs With**: SOC 2 Evidence Collection, Internal Control Self-Assessment
**Compliance**: ISO 27001

Roles: Control Owner, ISO Program Owner, External Auditor
1) ISMS scope & sites confirmation — Form — ISO Program Owner
2) Statement of Applicability mapping — File Request — ISO Program Owner
3) Evidence by control area — File Request — Control Owner
4) Control owner clarifications — Questionnaire — Control Owner
5) Evidence completeness review — To-Do — ISO Program Owner
6) Gap remediation evidence — File Request — Control Owner
7) Evidence accepted — Approval — ISO Program Owner
8) External auditor package — File Request — External Auditor
9) Finding acknowledgement — Acknowledgement — ISO Program Owner

**Common Variations:**
- For multi-site orgs: Add site-specific evidence collection steps

### 3. External Financial Audit Coordination
**Why Moxo**: Financial audits require coordination between external auditors and multiple internal departments

**Tags**: [All Industries]
**Complexity**: Complex
**Trigger**: Fiscal year end / Auditor engagement confirmed
**Pairs With**: Internal Audit Evidence Request
**Compliance**: GAAP, IFRS

Roles: External Auditor, Controller/CFO, Department Heads, Audit Committee
1) Audit planning & timeline — Form — External Auditor
2) PBC list distribution — File Request — Controller/CFO
3) Department evidence collection — File Request — Department Heads
4) Auditor clarifications — Questionnaire — Controller/CFO
5) Follow-up documentation — File Request — Department Heads
6) Draft findings review — To-Do — Controller/CFO
7) Management response — File Request — Controller/CFO
8) Audit committee presentation — Acknowledgement — Audit Committee
9) Final report acknowledgement — Acknowledgement — Controller/CFO

**Common Variations:**
- For public companies: Add SOX control testing steps

### 4. PCI DSS SAQ + AOC Collection
**Why Moxo**: Merchant compliance requires external attestation workflow across IT, security, and executive

**Tags**: [Retail, E-commerce, Financial Services]
**Complexity**: Standard
**Trigger**: Annual PCI compliance cycle / New merchant onboarding
**Pairs With**: Vendor Security Assessment
**Compliance**: PCI DSS

Roles: Merchant Contact, Security Lead, Executive Signer
1) Determine SAQ type — Questionnaire — Merchant Contact
2) Supporting evidence collection — File Request — Merchant Contact
3) IT environment documentation — File Request — Merchant Contact
4) Complete SAQ questionnaire — Questionnaire — Merchant Contact
5) Security review — To-Do — Security Lead
6) Remediation tasks (if required) — To-Do — Merchant Contact
7) SAQ approval — Approval — Security Lead
8) Executive attestation of compliance — E-Sign — Executive Signer

**Common Variations:**
- For SAQ D merchants: Add penetration test coordination

### 5. HIPAA Business Associate Attestation
**Why Moxo**: BA compliance sits outside covered entity's systems; requires external party documentation

**Tags**: [Healthcare, Providers, Payers, Health Tech]
**Complexity**: Simple
**Trigger**: New BA relationship / Annual BA renewal
**Pairs With**: Vendor Security Assessment
**Compliance**: HIPAA, BAA Required

Roles: Business Associate Contact, Compliance Lead
1) BA attestation questionnaire — Form — Business Associate Contact
2) Safeguard acknowledgement — Acknowledgement — Business Associate Contact
3) Sub-processor disclosure — File Request — Business Associate Contact
4) Security documentation — File Request — Business Associate Contact
5) Compliance review — To-Do — Compliance Lead
6) Attestation accepted — Approval — Compliance Lead
7) Completion acknowledgement — Acknowledgement — Business Associate Contact

**Common Variations:**
- For BAs with subcontractors: Add downstream BA verification

### 6. Internal Audit Evidence Request
**Why Moxo**: Internal audit coordinates across multiple departments outside audit management tools

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Internal audit plan schedule / Risk-based audit trigger
**Pairs With**: External Financial Audit, Internal Control Self-Assessment

Roles: Audit Lead, Control Owner, Department Manager, Audit Committee
1) Audit kickoff & scope — Form — Audit Lead
2) Evidence request — File Request — Control Owner
3) Clarification questions — Questionnaire — Control Owner
4) Evidence review — To-Do — Audit Lead
5) Follow-up request — File Request — Control Owner
6) Department manager sign-off — Approval — Department Manager
7) Finding response — File Request — Department Manager
8) Audit committee acknowledgement — Acknowledgement — Audit Committee

### 7. Vendor Compliance Certification (Annual)
**Why Moxo**: Vendor attestation requires external party document collection outside procurement systems

**Tags**: [All Industries]
**Complexity**: Simple
**Trigger**: Vendor anniversary date / Annual compliance calendar
**Pairs With**: Vendor Onboarding, Vendor Security Assessment

Roles: Vendor Contact, Compliance Reviewer, Procurement Lead
1) Annual refresh notification — Form — Vendor Contact
2) Updated certifications & policies — File Request — Vendor Contact
3) Insurance certificates — File Request — Vendor Contact
4) Compliance attestation — Acknowledgement — Vendor Contact
5) Documentation review — To-Do — Compliance Reviewer
6) Procurement acknowledgement — Acknowledgement — Procurement Lead
7) Compliance approved — Approval — Compliance Reviewer

### 8. Policy Acknowledgement & Exception Request
**Why Moxo**: Policy exceptions require cross-department approval (compliance and business unit)

**Tags**: [All Industries]
**Complexity**: Simple
**Trigger**: New policy published / Employee requests exception
**Pairs With**: Internal Control Self-Assessment

Roles: Policy Recipient, Compliance Admin, Business Unit Head
1) Policy acknowledgement — Acknowledgement — Policy Recipient
2) Comprehension verification — Questionnaire — Policy Recipient
3) Exception request (if needed) — Form — Policy Recipient
4) Business justification — File Request — Policy Recipient
5) Compliance review — To-Do — Compliance Admin
6) Business unit approval — Approval — Business Unit Head
7) Exception decision — Approval — Compliance Admin

**Common Variations:**
- For legal/regulatory policies: Add Legal review step

### 9. Regulatory Inquiry Response Coordination
**Why Moxo**: Regulatory responses require cross-functional evidence gathering and legal approval

**Tags**: [Financial Services, Healthcare, Regulated Industries]
**Complexity**: Standard
**Trigger**: Regulatory inquiry received
**Pairs With**: Litigation Hold, Subpoena Response

Roles: Compliance Owner, Subject Matter Expert, Legal Counsel, Executive Sponsor
1) Inquiry intake & scope — Form — Compliance Owner
2) Evidence collection from SMEs — File Request — Subject Matter Expert
3) SME clarifications — Questionnaire — Subject Matter Expert
4) Draft response preparation — To-Do — Compliance Owner
5) Legal review — To-Do — Legal Counsel
6) Executive approval — Approval — Executive Sponsor
7) Final submission confirmation — Acknowledgement — Compliance Owner

### 10. Internal Control Self-Assessment
**Why Moxo**: Control owners across departments attest to control effectiveness; ops coordinates

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Quarterly/Annual control assessment cycle
**Pairs With**: SOC 2 Evidence Collection, Internal Audit Evidence Request

Roles: Control Owner, Department Manager, Compliance Coordinator, Risk Committee
1) Assessment questionnaire distribution — Form — Compliance Coordinator
2) Control self-certification — Questionnaire — Control Owner
3) Supporting evidence — File Request — Control Owner
4) Manager review — To-Do — Department Manager
5) Exception documentation — File Request — Control Owner
6) Compliance validation — To-Do — Compliance Coordinator
7) Risk committee acknowledgement — Acknowledgement — Risk Committee

---

## CLIENT & VENDOR ONBOARDING (9 Templates)

### 11. Client Onboarding (Post-Sale)
**Why Moxo**: CRM tracks deals, not document collection; requires coordination across sales and ops

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Sales marks deal as "Closed Won" in CRM
**Pairs With**: Engagement Kickoff, Client Service Request

Roles: Client Admin, Account Manager, Operations Lead
1) Client information intake — Form — Client Admin
2) Primary contacts & roles — Questionnaire — Client Admin
3) Required documents (W-9, insurance, etc.) — File Request — Client Admin
4) Contract execution — E-Sign — Client Admin
5) Internal setup checklist — To-Do — Operations Lead
6) Compliance verification — Approval — Operations Lead
7) Go-live acknowledgement — Acknowledgement — Account Manager

**Common Variations:**
- For regulated industries: Add Compliance review step
- For high-value clients: Add Legal review step
- For enterprise clients: Add Finance setup step

### 12. Vendor Onboarding
**Why Moxo**: Procurement systems don't orchestrate external vendor document flow across departments

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: New vendor request submitted in procurement system
**Pairs With**: Vendor Security Assessment, Vendor Compliance Certification

Roles: Vendor Contact, Procurement Owner, Finance Reviewer
1) Vendor profile & capabilities — Form — Vendor Contact
2) Tax documents (W-9/W-8BEN) — File Request — Vendor Contact
3) Banking information — File Request — Vendor Contact
4) Insurance certificates — File Request — Vendor Contact
5) NDA / MSA execution — E-Sign — Vendor Contact
6) Finance verification — To-Do — Finance Reviewer
7) Vendor activation — Approval — Procurement Owner

**Common Variations:**
- For tech vendors with system access: Add IT Security Assessment step
- For vendors with sensitive data: Add Security questionnaire step
- For high-value vendors: Add Legal review step

### 13. Vendor Security Assessment
**Why Moxo**: Security questionnaires require back-and-forth outside GRC tools

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: New vendor with system/data access / Annual security refresh
**Pairs With**: Vendor Onboarding, Third-Party Due Diligence

Roles: Vendor Contact, Security Reviewer, IT Risk Manager, Procurement
1) Security questionnaire (SIG/CAIQ) — Questionnaire — Vendor Contact
2) Certification uploads (SOC 2, ISO, etc.) — File Request — Vendor Contact
3) Architecture documentation — File Request — Vendor Contact
4) Penetration test results — File Request — Vendor Contact
5) Security review — To-Do — Security Reviewer
6) Follow-up questions — Questionnaire — Vendor Contact
7) Risk assessment — To-Do — IT Risk Manager
8) Risk acceptance — Approval — IT Risk Manager
9) Procurement notification — Acknowledgement — Procurement

### 14. Third-Party Due Diligence
**Why Moxo**: Risk assessment requires external party participation and internal cross-department review

**Tags**: [Financial Services, Professional Services]
**Complexity**: Standard
**Trigger**: New third-party relationship / High-risk vendor identified
**Pairs With**: Vendor Onboarding, Vendor Security Assessment

Roles: Third Party Contact, Risk Reviewer, Legal Counsel, Compliance Officer
1) Due diligence questionnaire — Form — Third Party Contact
2) Supporting documentation — File Request — Third Party Contact
3) Ownership & structure disclosure — File Request — Third Party Contact
4) Clarification questions — Questionnaire — Third Party Contact
5) Legal review — To-Do — Legal Counsel
6) Compliance review — To-Do — Compliance Officer
7) Risk assessment — To-Do — Risk Reviewer
8) Due diligence decision — Approval — Risk Reviewer
9) Completion acknowledgement — Acknowledgement — Third Party Contact

### 15. Third-Party Remediation Tracking
**Why Moxo**: Remediation evidence collection from external parties with internal validation

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Audit finding / Risk assessment gap identified
**Pairs With**: Vendor Security Assessment, Third-Party Due Diligence

Roles: Third Party Contact, Risk Reviewer, Control Owner, Risk Committee
1) Remediation plan submission — Form — Third Party Contact
2) Timeline acknowledgement — Acknowledgement — Third Party Contact
3) Evidence of remediation — File Request — Third Party Contact
4) Internal control owner verification — To-Do — Control Owner
5) Remediation review — To-Do — Risk Reviewer
6) Follow-up evidence (if needed) — File Request — Third Party Contact
7) Remediation accepted — Approval — Risk Reviewer
8) Risk committee notification — Acknowledgement — Risk Committee

### 16. Customer Offboarding & Account Closure
**Why Moxo**: Offboarding coordination across departments not handled by CRM

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Client requests account closure / Contract termination
**Pairs With**: Client Onboarding

Roles: Client Contact, Account Manager, Operations Lead, Finance, IT/Security
1) Offboarding request confirmation — Form — Client Contact
2) Data export delivery — File Request — Account Manager
3) Final billing acknowledgement — Acknowledgement — Client Contact
4) Access revocation — To-Do — IT/Security
5) Final invoice — To-Do — Finance
6) Exit survey — Questionnaire — Client Contact
7) Closure acknowledgement — Acknowledgement — Client Contact

### 17. Partner Onboarding & Enablement
**Why Moxo**: Partner enablement requires coordination across partner ops, sales, and training

**Tags**: [Technology, SaaS, Professional Services]
**Complexity**: Standard
**Trigger**: Partner agreement signed / New partner approved
**Pairs With**: Referral Partner Agreement, Reseller Onboarding

Roles: Partner Contact, Partner Manager, Enablement Lead, Finance
1) Partner application — Form — Partner Contact
2) Company documentation — File Request — Partner Contact
3) Partner agreement — E-Sign — Partner Contact
4) Financial terms acknowledgement — Acknowledgement — Finance
5) Enablement training acknowledgement — Acknowledgement — Partner Contact
6) Certification requirements — To-Do — Enablement Lead
7) Partner activation — Approval — Partner Manager

**Common Variations:**
- For technology partners: Add integration/API access setup
- For high-tier partners: Add Legal review step

### 18. Referral Partner Agreement
**Why Moxo**: Referral programs require agreement and commission coordination across sales and finance

**Tags**: [All Industries]
**Complexity**: Simple
**Trigger**: Referral partner application received
**Pairs With**: Partner Onboarding

Roles: Referral Partner, Partner Manager, Finance
1) Referral program application — Form — Referral Partner
2) Company verification — File Request — Referral Partner
3) Partner agreement execution — E-Sign — Referral Partner
4) Commission structure acknowledgement — Acknowledgement — Referral Partner
5) Finance setup — To-Do — Finance
6) Partner portal setup — To-Do — Partner Manager
7) Welcome acknowledgement — Acknowledgement — Referral Partner

### 19. Reseller/Distributor Onboarding
**Why Moxo**: Channel partner setup requires extensive documentation exchange across multiple departments

**Tags**: [Manufacturing, Technology, Consumer Products]
**Complexity**: Standard
**Trigger**: Reseller agreement approved / Distribution deal closed
**Pairs With**: Partner Onboarding

Roles: Reseller Contact, Channel Manager, Legal Reviewer, Finance, Product Team
1) Reseller application — Form — Reseller Contact
2) Business credentials & financials — File Request — Reseller Contact
3) Territory/pricing acknowledgement — Acknowledgement — Reseller Contact
4) Reseller agreement — E-Sign — Reseller Contact
5) Legal review — To-Do — Legal Reviewer
6) Credit terms setup — To-Do — Finance
7) Product training — To-Do — Product Team
8) Partner activation — Approval — Channel Manager
9) Onboarding complete — Acknowledgement — Reseller Contact

---

## KYC / KYB / FINANCIAL COMPLIANCE (8 Templates)

### 20. Individual KYC Document Collection
**Why Moxo**: KYC systems ingest docs but don't orchestrate collection and back-and-forth

**Tags**: [Financial Services, Banking, Wealth Management]
**Complexity**: Standard
**Trigger**: New account application / High-risk customer identified
**Pairs With**: Periodic KYC Refresh, Business KYB Collection
**Compliance**: AML, KYC, FinCEN

Roles: Individual, Compliance Reviewer, Compliance Manager
1) Personal information intake — Form — Individual
2) Government ID upload — File Request — Individual
3) Proof of address — File Request — Individual
4) Source of funds documentation — File Request — Individual
5) Clarification questions — Questionnaire — Individual
6) Additional documentation (if needed) — File Request — Individual
7) KYC review — To-Do — Compliance Reviewer
8) KYC decision — Approval — Compliance Manager
9) Completion acknowledgement — Acknowledgement — Individual

### 21. Business KYB Document Collection
**Why Moxo**: Entity verification requires multiple document types and UBO coordination

**Tags**: [Financial Services, Banking, FinTech]
**Complexity**: Standard
**Trigger**: New business account application
**Pairs With**: Individual KYC, Beneficial Ownership Collection
**Compliance**: AML, KYB, FinCEN

Roles: Business Admin, Beneficial Owner, Compliance Reviewer, Compliance Manager
1) Business information intake — Form — Business Admin
2) Formation documents (Articles, Cert of Good Standing) — File Request — Business Admin
3) Ownership structure documentation — File Request — Business Admin
4) Beneficial owner identification — Form — Beneficial Owner
5) Beneficial owner ID verification — File Request — Beneficial Owner
6) KYB review — To-Do — Compliance Reviewer
7) Clarification questions — Questionnaire — Business Admin
8) KYB decision — Approval — Compliance Manager

### 22. Beneficial Ownership (FinCEN BOI) Collection
**Why Moxo**: BOI reporting requires coordinating across multiple UBOs and company applicants

**Tags**: [All Industries, Corporate Services, Legal]
**Complexity**: Simple
**Trigger**: New company formation / BOI reporting deadline
**Pairs With**: Business KYB Collection, New Business Formation
**Compliance**: FinCEN, BOI Reporting

Roles: Company Applicant, Beneficial Owner, Compliance Lead, Authorized Signer
1) Company applicant information — Form — Company Applicant
2) UBO identification form — Form — Beneficial Owner
3) Government ID upload (each UBO) — File Request — Beneficial Owner
4) Compliance review — To-Do — Compliance Lead
5) Clarification questions — Questionnaire — Beneficial Owner
6) Authorized signer attestation — E-Sign — Authorized Signer
7) Filing confirmation — Acknowledgement — Compliance Lead

### 23. Periodic KYC/KYB Refresh
**Why Moxo**: Refresh cycles require re-engaging external parties for updated documentation

**Tags**: [Financial Services, Banking]
**Complexity**: Simple
**Trigger**: KYC refresh date (1-3 year cycle) / Risk trigger
**Pairs With**: Individual KYC, Business KYB
**Compliance**: AML, KYC

Roles: Client Contact, Beneficial Owner, Compliance Reviewer
1) Refresh notification — Form — Client Contact
2) Updated documentation — File Request — Client Contact
3) UBO changes (if any) — Questionnaire — Client Contact
4) Updated UBO documentation — File Request — Beneficial Owner
5) Change confirmation — Questionnaire — Client Contact
6) Refresh review — To-Do — Compliance Reviewer
7) Refresh approved — Approval — Compliance Reviewer

### 24. Commercial Loan Application & Underwriting
**Why Moxo**: Loan origination systems don't orchestrate borrower doc collection and back-and-forth

**Tags**: [Banking, Credit Unions, Commercial Lending]
**Complexity**: Complex
**Trigger**: Loan application submitted / Pre-qualification completed
**Pairs With**: Credit Line Renewal

Roles: Borrower, Loan Officer, Underwriter, Credit Committee, Closer
1) Loan application intake — Form — Borrower
2) Personal financial statement — File Request — Borrower
3) Business tax returns (3 years) — File Request — Borrower
4) Business financial statements — File Request — Borrower
5) Collateral documentation — File Request — Borrower
6) Underwriter questions — Questionnaire — Borrower
7) Conditional approval — Approval — Underwriter
8) Additional conditions — File Request — Borrower
9) Credit committee approval — Approval — Credit Committee
10) Closing document execution — E-Sign — Borrower

### 25. Wire Transfer Authorization
**Why Moxo**: High-value transfers require out-of-band verification across treasury, approvers, and ops

**Tags**: [Financial Services, Treasury, Corporate]
**Complexity**: Simple
**Trigger**: Wire transfer request submitted
**Pairs With**: N/A

Roles: Requestor, Authorized Signer, Secondary Approver, Treasury Operations
1) Wire request details — Form — Requestor
2) Supporting documentation — File Request — Requestor
3) Authorized signer approval — Approval — Authorized Signer
4) Secondary approval (high value) — Approval — Secondary Approver
5) Verification callback confirmation — Acknowledgement — Authorized Signer
6) Wire execution confirmation — Acknowledgement — Treasury Operations

### 26. Investment Account Opening
**Why Moxo**: Brokerage/RIA account opening requires external document coordination and compliance review

**Tags**: [Wealth Management, Brokerage, RIA]
**Complexity**: Standard
**Trigger**: New client engagement / Account opening request
**Pairs With**: Individual KYC
**Compliance**: SEC, FINRA, Reg BI

Roles: Investor, Account Manager, Compliance Officer, Operations
1) Account application — Form — Investor
2) Identity verification documents — File Request — Investor
3) Accreditation documentation (if applicable) — File Request — Investor
4) Suitability questionnaire — Questionnaire — Investor
5) Risk disclosure acknowledgement — Acknowledgement — Investor
6) Account agreement — E-Sign — Investor
7) Compliance review — To-Do — Compliance Officer
8) Operations setup — To-Do — Operations
9) Account activation — Approval — Account Manager

### 27. Credit Line Renewal/Increase Request
**Why Moxo**: Renewal requests require updated financial documentation from borrowers

**Tags**: [Banking, Commercial Lending]
**Complexity**: Standard
**Trigger**: Credit line expiration approaching / Increase request submitted
**Pairs With**: Commercial Loan Application

Roles: Borrower, Relationship Manager, Credit Analyst, Credit Committee
1) Renewal/increase request — Form — Borrower
2) Updated financial statements — File Request — Borrower
3) Tax returns (current year) — File Request — Borrower
4) AR/AP aging (if applicable) — File Request — Borrower
5) Credit analysis — To-Do — Credit Analyst
6) Analyst questions — Questionnaire — Borrower
7) Terms acknowledgement — Acknowledgement — Borrower
8) Credit committee approval — Approval — Credit Committee
9) Agreement execution — E-Sign — Borrower

---

## LEGAL & CORPORATE GOVERNANCE (10 Templates)

### 28. Legal Intake & Matter Coordination
**Why Moxo**: Matter management systems don't handle client/internal document exchange and iteration

**Tags**: [Legal, Professional Services]
**Complexity**: Standard
**Trigger**: Legal request submitted / New matter opened
**Pairs With**: Contract Exception Request

Roles: Client/Requestor, Legal Owner, Paralegal, Partner/Approver
1) Legal request intake — Form — Client/Requestor
2) Supporting documents — File Request — Client/Requestor
3) Clarification questions — Questionnaire — Client/Requestor
4) Matter setup — To-Do — Paralegal
5) Legal work completion — To-Do — Legal Owner
6) Partner review — To-Do — Partner/Approver
7) Deliverable/guidance — File Request — Legal Owner
8) Acknowledgement — Acknowledgement — Client/Requestor

### 29. Contract Exception Request
**Why Moxo**: Contract exceptions require cross-functional approval outside CLM (legal, business, finance)

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Sales requests non-standard terms / Customer redlines received
**Pairs With**: NDA Execution, Legal Intake

Roles: Requestor, Legal Reviewer, Business Approver, Finance Reviewer, Deal Desk
1) Exception request details — Form — Requestor
2) Proposed redlines — File Request — Requestor
3) Business justification — File Request — Requestor
4) Legal analysis — To-Do — Legal Reviewer
5) Finance impact assessment — To-Do — Finance Reviewer
6) Business approval — Approval — Business Approver
7) Deal desk approval — Approval — Deal Desk
8) Decision acknowledgement — Acknowledgement — Requestor

### 30. Litigation Hold Acknowledgement
**Why Moxo**: Custodian acknowledgement required across organization outside legal hold systems

**Tags**: [All Industries]
**Complexity**: Simple
**Trigger**: Litigation filed / Threat of litigation received
**Pairs With**: Subpoena Response

Roles: Custodian, Legal Owner
1) Litigation hold notice — Acknowledgement — Custodian
2) Custodian questionnaire — Questionnaire — Custodian
3) Data preservation confirmation — Acknowledgement — Custodian
4) Completion confirmation — Acknowledgement — Legal Owner

**Common Variations:**
- For IT-managed data: Add IT preservation steps
- For compliance-sensitive matters: Add Compliance verification

### 31. Board Resolution & Consent Collection
**Why Moxo**: Board consent requires signature collection from multiple directors outside board portals

**Tags**: [All Industries, Corporate Governance]
**Complexity**: Standard
**Trigger**: Board action required / Annual resolutions
**Pairs With**: Director/Officer Change

Roles: Corporate Secretary, Board Member, General Counsel, CEO
1) Resolution draft distribution — File Request — Corporate Secretary
2) Director review acknowledgement — Acknowledgement — Board Member
3) Questions/comments — Questionnaire — Board Member
4) Legal review — To-Do — General Counsel
5) Final resolution distribution — File Request — Corporate Secretary
6) Resolution execution — E-Sign — Board Member
7) CEO attestation — E-Sign — CEO
8) Filing confirmation — Acknowledgement — Corporate Secretary

### 32. M&A Due Diligence Document Request
**Why Moxo**: Data room tools store docs but Moxo orchestrates the requests and follow-ups

**Tags**: [Investment Banking, Private Equity, Corporate Development]
**Complexity**: Complex
**Trigger**: LOI signed / Due diligence period begins
**Pairs With**: NDA Execution

Roles: Target Company Contact, Deal Team Lead, Buyer Counsel, Financial Advisor
1) Due diligence request list — Form — Deal Team Lead
2) Corporate documents — File Request — Target Company Contact
3) Financial statements & tax returns — File Request — Target Company Contact
4) Material contracts — File Request — Target Company Contact
5) Employee/HR documentation — File Request — Target Company Contact
6) IP & technology documentation — File Request — Target Company Contact
7) Buyer counsel questions — Questionnaire — Target Company Contact
8) Financial advisor questions — Questionnaire — Target Company Contact
9) Follow-up requests — File Request — Target Company Contact
10) Diligence completion — Approval — Deal Team Lead

### 33. DSAR / Privacy Rights Request
**Why Moxo**: Privacy requests require verification, cross-department data collection, and legal review

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Privacy rights request received (access, deletion, etc.)
**Pairs With**: N/A
**Compliance**: GDPR, CCPA

Roles: Data Subject, Privacy Operations, IT/Data Team, Legal Reviewer
1) Request intake & verification — Form — Data Subject
2) Identity verification documents — File Request — Data Subject
3) Scope clarification — Questionnaire — Data Subject
4) Data collection across systems — To-Do — IT/Data Team
5) Legal review/redaction — To-Do — Legal Reviewer
6) Privacy ops review — To-Do — Privacy Operations
7) Response delivery — File Request — Privacy Operations
8) Completion acknowledgement — Acknowledgement — Data Subject

### 34. NDA Execution
**Why Moxo**: Simple NDA flow outside CLM for quick deals with external parties

**Tags**: [All Industries]
**Complexity**: Simple
**Trigger**: Confidential discussion requested / Deal exploration begins
**Pairs With**: M&A Due Diligence, Client Onboarding

Roles: External Party, Legal Owner
1) NDA request details — Form — External Party
2) NDA review — To-Do — Legal Owner
3) NDA execution — E-Sign — External Party
4) Executed copy delivery — File Request — Legal Owner

**Common Variations:**
- For mutual NDAs: Add internal signer step
- For custom terms: Add Legal negotiation step

### 35. Power of Attorney Authorization
**Why Moxo**: POA requires coordination between principal, agent, and witnesses/notary

**Tags**: [Legal, Estate Planning, Elder Care]
**Complexity**: Standard
**Trigger**: POA requested / Estate planning engagement
**Pairs With**: N/A

Roles: Principal, Agent, Witness/Notary, Legal Counsel
1) POA scope & limitations — Form — Principal
2) Agent acceptance — Acknowledgement — Agent
3) Legal review — To-Do — Legal Counsel
4) POA document review — To-Do — Principal
5) POA execution — E-Sign — Principal
6) Witness/notary attestation — E-Sign — Witness/Notary
7) Executed POA delivery — File Request — Agent

### 36. Trademark/IP Assignment
**Why Moxo**: IP transfers require coordination between assignor, assignee, and legal teams

**Tags**: [Legal, Technology, Creative Industries]
**Complexity**: Standard
**Trigger**: IP sale/transfer agreed / M&A asset transfer
**Pairs With**: M&A Due Diligence

Roles: Assignor, Assignee, Assignor Counsel, Assignee Counsel
1) Assignment request details — Form — Assignor
2) IP documentation & chain of title — File Request — Assignor
3) Assignee counsel review — To-Do — Assignee Counsel
4) Assignor counsel review — To-Do — Assignor Counsel
5) Assignment agreement — E-Sign — Assignor
6) Assignment agreement — E-Sign — Assignee
7) Recording acknowledgement — Acknowledgement — Assignor Counsel

### 37. Subpoena Response Coordination
**Why Moxo**: Subpoena responses require coordination across legal, IT, custodians, and outside counsel

**Tags**: [All Industries]
**Complexity**: Standard
**Trigger**: Subpoena received
**Pairs With**: Litigation Hold

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

## PROFESSIONAL SERVICES & ENGAGEMENTS (9 Templates)

### 38. Engagement Kickoff & Scope Confirmation
**Why Moxo**: PSA tools track time, not client coordination and stakeholder alignment

**Tags**: [Professional Services, Consulting, Accounting]
**Complexity**: Simple
**Trigger**: Contract signed / Project start date reached
**Pairs With**: Client Onboarding, Deliverable Review

Roles: Client Sponsor, Client Stakeholders, Engagement Manager, Delivery Lead
1) Engagement details confirmation — Form — Engagement Manager
2) Client stakeholder identification — Questionnaire — Client Sponsor
3) Stakeholder introductions — Acknowledgement — Client Stakeholders
4) Scope acknowledgement — Acknowledgement — Client Sponsor
5) Project access/credentials — File Request — Client Sponsor
6) Internal team assignment — To-Do — Delivery Lead
7) Kickoff complete — Acknowledgement — Engagement Manager

### 39. Client Service Request Fulfillment
**Why Moxo**: Ad-hoc requests require structured intake and delivery with internal routing

**Tags**: [Professional Services, Managed Services]
**Complexity**: Simple
**Trigger**: Client submits service request
**Pairs With**: Deliverable Review

Roles: Client Requestor, Service Owner, Manager
1) Service request intake — Form — Client Requestor
2) Clarification questions — Questionnaire — Client Requestor
3) Required inputs/documents — File Request — Client Requestor
4) Work execution — To-Do — Service Owner
5) Manager review — Approval — Manager
6) Deliverable acknowledgement — Acknowledgement — Client Requestor

**Common Variations:**
- For quality-critical work: Add Quality review step

### 40. Deliverable Review & Client Approval
**Why Moxo**: Client sign-off on work product requires iteration outside project tools

**Tags**: [Professional Services, Creative, Consulting]
**Complexity**: Simple
**Trigger**: Deliverable ready for client review
**Pairs With**: Change Request, Engagement Kickoff

Roles: Service Owner, Client Reviewer, Client Approver
1) Deliverable upload — File Request — Service Owner
2) Client review — To-Do — Client Reviewer
3) Feedback/revision requests — Questionnaire — Client Reviewer
4) Revised deliverable — File Request — Service Owner
5) Final approval — Approval — Client Approver
6) Completion acknowledgement — Acknowledgement — Service Owner

**Common Variations:**
- For regulated deliverables: Add internal Quality review step

### 41. Change Request / Scope Change
**Why Moxo**: Scope changes require client acknowledgement and internal approval chain

**Tags**: [Professional Services, Consulting, IT Services]
**Complexity**: Standard
**Trigger**: Client requests scope change / Out-of-scope work identified
**Pairs With**: Deliverable Review

Roles: Client Requestor, Engagement Manager, Finance/Billing, Approver
1) Change request details — Form — Client Requestor
2) Impact assessment — File Request — Engagement Manager
3) Financial impact — To-Do — Finance/Billing
4) Cost/timeline acknowledgement — Acknowledgement — Client Requestor
5) Change approval — Approval — Approver
6) SOW amendment — E-Sign — Client Requestor
7) Change confirmation — Acknowledgement — Client Requestor

### 42. RFP/Proposal Response Coordination
**Why Moxo**: SME input collection for proposals requires coordination across departments and with client

**Tags**: [Professional Services, Government Contracting, Enterprise Sales]
**Complexity**: Standard
**Trigger**: RFP received / Opportunity identified
**Pairs With**: N/A

Roles: Proposal Lead, Subject Matter Expert, Pricing/Finance, Client Contact, Executive Sponsor
1) RFP intake & assignment — Form — Proposal Lead
2) SME section inputs — File Request — Subject Matter Expert
3) Pricing development — To-Do — Pricing/Finance
4) Client Q&A submission — Questionnaire — Client Contact
5) Q&A responses — File Request — Proposal Lead
6) Executive review — To-Do — Executive Sponsor
7) Final proposal review — Approval — Proposal Lead
8) Submission confirmation — Acknowledgement — Proposal Lead

### 43. Quarterly Business Review (QBR) Preparation
**Why Moxo**: Client input for reviews requires coordination outside CRM

**Tags**: [Professional Services, SaaS, Managed Services]
**Complexity**: Simple
**Trigger**: QBR scheduled / Quarterly calendar trigger
**Pairs With**: Client Onboarding

Roles: Client Stakeholder, Account Manager, Delivery Lead, Executive Sponsor
1) Feedback questionnaire — Questionnaire — Client Stakeholder
2) Supporting materials request — File Request — Client Stakeholder
3) Delivery metrics compilation — To-Do — Delivery Lead
4) Internal synthesis — To-Do — Account Manager
5) Executive talking points — To-Do — Executive Sponsor
6) Agenda confirmation — Acknowledgement — Client Stakeholder

### 44. Client Information Collection (Recurring)
**Why Moxo**: Periodic data requests from clients require structured follow-up

**Tags**: [Professional Services, Accounting, Financial Planning]
**Complexity**: Simple
**Trigger**: Recurring data collection schedule / Project milestone
**Pairs With**: Tax Return Preparation

Roles: Client Contact, Service Owner, Manager
1) Data request context — Form — Service Owner
2) Requested documents/data — File Request — Client Contact
3) Clarification questions — Questionnaire — Client Contact
4) Data review — To-Do — Service Owner
5) Acceptance confirmation — Approval — Manager

**Common Variations:**
- For analytical work: Add Data Analyst validation step

### 45. Expert Witness Engagement
**Why Moxo**: Expert coordination requires document exchange across legal teams and expert

**Tags**: [Legal, Litigation Support]
**Complexity**: Standard
**Trigger**: Expert needed for litigation / Expert identified
**Pairs With**: Litigation Hold

Roles: Expert Witness, Engaging Attorney, Paralegal, Opposing Counsel Liaison
1) Engagement request — Form — Engaging Attorney
2) Expert qualifications/CV — File Request — Expert Witness
3) Conflict check acknowledgement — Acknowledgement — Expert Witness
4) Engagement agreement — E-Sign — Expert Witness
5) Case materials delivery — File Request — Paralegal
6) Expert questions — Questionnaire — Expert Witness
7) Expert report submission — File Request — Expert Witness
8) Report review — To-Do — Engaging Attorney

### 46. Tax Return Preparation Coordination
**Why Moxo**: Tax prep requires document collection from clients; tax software doesn't orchestrate this

**Tags**: [Accounting, Tax, Financial Services]
**Complexity**: Complex
**Trigger**: Tax season / Engagement letter signed
**Pairs With**: Client Information Collection

Roles: Client/Taxpayer, Tax Preparer, Tax Reviewer, Client Signer
1) Engagement letter — E-Sign — Client/Taxpayer
2) Tax organizer questionnaire — Questionnaire — Client/Taxpayer
3) Source documents (W-2s, 1099s, etc.) — File Request — Client/Taxpayer
4) Clarification questions — Questionnaire — Client/Taxpayer
5) Additional documentation — File Request — Client/Taxpayer
6) Preparer review — To-Do — Tax Preparer
7) Partner/manager review — To-Do — Tax Reviewer
8) Draft return delivery — File Request — Tax Preparer
9) Client approval & e-file authorization — E-Sign — Client Signer
10) Filing confirmation — Acknowledgement — Client/Taxpayer

---

## INSURANCE & CLAIMS (7 Templates)

### 47. Insurance Claim Coordination
**Why Moxo**: Claims systems manage claims but not claimant document collection and back-and-forth

**Tags**: [Insurance, Property & Casualty]
**Complexity**: Standard
**Trigger**: Claim filed (FNOL)
**Pairs With**: N/A

Roles: Claimant, Claims Adjuster, Claims Manager, Third-Party (witness/contractor)
1) Claim intake (FNOL) — Form — Claimant
2) Supporting documentation — File Request — Claimant
3) Incident questionnaire — Questionnaire — Claimant
4) Third-party statement (if applicable) — Questionnaire — Third-Party
5) Adjuster assessment — To-Do — Claims Adjuster
6) Additional documentation request — File Request — Claimant
7) Claim decision — Approval — Claims Manager
8) Settlement acknowledgement — Acknowledgement — Claimant

### 48. Insurance Application & Underwriting
**Why Moxo**: Application document collection from applicants with underwriter back-and-forth

**Tags**: [Insurance, Brokerage]
**Complexity**: Standard
**Trigger**: Insurance application submitted
**Pairs With**: Policy Renewal

Roles: Applicant, Agent/Broker, Underwriter, Underwriting Manager
1) Application intake — Form — Applicant
2) Supporting documentation — File Request — Applicant
3) Agent submission — To-Do — Agent/Broker
4) Underwriting questions — Questionnaire — Applicant
5) Risk assessment — To-Do — Underwriter
6) Conditional requirements — File Request — Applicant
7) Manager review (if needed) — To-Do — Underwriting Manager
8) Underwriting decision — Approval — Underwriter
9) Policy acknowledgement — Acknowledgement — Applicant

### 49. Certificate of Insurance Request
**Why Moxo**: COI requests from third parties outside policy systems with back-and-forth

**Tags**: [All Industries, Insurance]
**Complexity**: Simple
**Trigger**: Contract requires COI / Third party requests proof of insurance
**Pairs With**: Vendor Onboarding, Subcontractor Qualification

Roles: Certificate Holder, Insured, Insurance Coordinator, Agent
1) COI request details — Form — Certificate Holder
2) Additional insured requirements — Questionnaire — Certificate Holder
3) Insured authorization — Acknowledgement — Insured
4) Agent coordination — To-Do — Agent
5) COI generation — To-Do — Insurance Coordinator
6) COI delivery — File Request — Insurance Coordinator
7) Receipt acknowledgement — Acknowledgement — Certificate Holder

### 50. Workers' Compensation Claim Coordination
**Why Moxo**: WC claims require employee, employer, medical provider, and carrier coordination

**Tags**: [All Industries, HR, Insurance]
**Complexity**: Standard
**Trigger**: Workplace injury reported
**Pairs With**: Leave of Absence
**Compliance**: State WC Laws

Roles: Injured Employee, HR Contact, Medical Provider, Claims Administrator
1) Incident report — Form — Injured Employee
2) Supervisor incident report — Form — HR Contact
3) Medical documentation — File Request — Medical Provider
4) Employer incident details — Questionnaire — HR Contact
5) Claim review — To-Do — Claims Administrator
6) Medical updates — File Request — Medical Provider
7) Return-to-work documentation — File Request — Injured Employee
8) Claim resolution — Approval — Claims Administrator
9) Closure acknowledgement — Acknowledgement — Injured Employee

### 51. Policy Renewal Coordination
**Why Moxo**: Renewal requires updated information from insured parties and broker coordination

**Tags**: [Insurance, Commercial Lines]
**Complexity**: Standard
**Trigger**: Policy renewal date approaching (60-90 days)
**Pairs With**: Insurance Application

Roles: Policyholder, Account Manager, Underwriter, Broker
1) Renewal notice acknowledgement — Acknowledgement — Policyholder
2) Updated exposure information — Questionnaire — Policyholder
3) Loss run / claims history — File Request — Policyholder
4) Broker review — To-Do — Broker
5) Underwriter questions — Questionnaire — Policyholder
6) Renewal quote review — To-Do — Account Manager
7) Quote acceptance — Approval — Policyholder
8) Renewal documents — E-Sign — Policyholder

### 52. Surety Bond Application
**Why Moxo**: Bond applications require extensive financial documentation and multi-party coordination

**Tags**: [Construction, Surety, Contractors]
**Complexity**: Standard
**Trigger**: Bond required for contract / Bid bond needed
**Pairs With**: Subcontractor Qualification

Roles: Principal, Surety Agent, Underwriter, Obligee
1) Bond application — Form — Principal
2) Financial statements — File Request — Principal
3) Personal financial statement (owners) — File Request — Principal
4) Work-in-progress schedule — File Request — Principal
5) Obligee requirements — Questionnaire — Obligee
6) Underwriting review — To-Do — Underwriter
7) Underwriter questions — Questionnaire — Principal
8) Bond approval — Approval — Underwriter
9) Bond execution — E-Sign — Principal

### 53. Insurance Audit Coordination
**Why Moxo**: Premium audits require payroll/sales data from policyholder and auditor coordination

**Tags**: [Insurance, Commercial Lines]
**Complexity**: Simple
**Trigger**: Policy audit scheduled
**Pairs With**: Policy Renewal

Roles: Policyholder, Auditor, Underwriter, Account Manager
1) Audit notice acknowledgement — Acknowledgement — Policyholder
2) Payroll records — File Request — Policyholder
3) Sales/revenue records — File Request — Policyholder
4) Classification questionnaire — Questionnaire — Policyholder
5) Auditor review — To-Do — Auditor
6) Clarification questions — Questionnaire — Policyholder
7) Audit findings — File Request — Auditor
8) Premium adjustment acknowledgement — Acknowledgement — Policyholder

---

## HEALTHCARE (5 Templates)

### 54. Prior Authorization Coordination
**Why Moxo**: PA requires coordination between provider, payer, and patient outside EHR

**Tags**: [Healthcare, Providers, Payers]
**Complexity**: Standard
**Trigger**: Treatment/procedure requires prior auth
**Pairs With**: N/A

Roles: Patient, Provider Staff, Payer Contact, Physician
1) Treatment request details — Form — Provider Staff
2) Clinical documentation — File Request — Provider Staff
3) Patient consent — Acknowledgement — Patient
4) Payer review — To-Do — Payer Contact
5) Payer questions — Questionnaire — Provider Staff
6) Physician peer-to-peer (if needed) — To-Do — Physician
7) Additional clinical information — File Request — Provider Staff
8) Authorization decision — Approval — Payer Contact
9) Decision acknowledgement — Acknowledgement — Provider Staff

### 55. Patient Intake & Medical Records Collection
**Why Moxo**: New patient document collection from external sources outside EHR

**Tags**: [Healthcare, Providers]
**Complexity**: Standard
**Trigger**: New patient scheduled
**Pairs With**: Medical Records Release
**Compliance**: HIPAA

Roles: Patient, Intake Coordinator, Prior Provider, Insurance Verifier
1) Patient demographics — Form — Patient
2) Insurance information — File Request — Patient
3) Insurance verification — To-Do — Insurance Verifier
4) Medical history questionnaire — Questionnaire — Patient
5) Prior medical records request — File Request — Prior Provider
6) Prior records delivery — File Request — Prior Provider
7) Consent forms — E-Sign — Patient
8) Intake complete — Acknowledgement — Intake Coordinator

### 56. Medical Records Release Authorization
**Why Moxo**: Records release requires patient authorization and receiving party coordination

**Tags**: [Healthcare, Providers]
**Complexity**: Simple
**Trigger**: Records release requested
**Pairs With**: Patient Intake
**Compliance**: HIPAA

Roles: Patient/Authorized Representative, Records Coordinator, Receiving Party
1) Release request — Form — Patient/Authorized Representative
2) HIPAA authorization — E-Sign — Patient/Authorized Representative
3) Identity verification — File Request — Patient/Authorized Representative
4) Receiving party confirmation — Acknowledgement — Receiving Party
5) Records preparation — To-Do — Records Coordinator
6) Records delivery — File Request — Records Coordinator
7) Receipt acknowledgement — Acknowledgement — Receiving Party

### 57. Provider Credentialing
**Why Moxo**: Credentialing requires extensive documentation from providers and multi-party verification

**Tags**: [Healthcare, Providers, Payers, Health Systems]
**Complexity**: Complex
**Trigger**: New provider hire / Recredentialing due
**Pairs With**: N/A
**Compliance**: NCQA, Joint Commission

Roles: Provider, Credentialing Coordinator, Primary Source (schools, boards), Medical Director
1) Credentialing application — Form — Provider
2) License & certifications — File Request — Provider
3) Education verification — File Request — Primary Source
4) Board certification verification — File Request — Primary Source
5) Malpractice history & insurance — File Request — Provider
6) Reference questionnaire — Questionnaire — Provider
7) Credentialing review — To-Do — Credentialing Coordinator
8) Committee approval — Approval — Medical Director
9) Credentialing confirmation — Acknowledgement — Provider

### 58. Clinical Trial Participant Enrollment
**Why Moxo**: Trial enrollment requires consent and documentation coordination outside CTMS

**Tags**: [Healthcare, Life Sciences, Research]
**Complexity**: Standard
**Trigger**: Participant screening passed
**Pairs With**: N/A
**Compliance**: FDA, IRB

Roles: Participant, Study Coordinator, Principal Investigator, IRB Liaison
1) Eligibility screening — Questionnaire — Participant
2) Informed consent document review — To-Do — Participant
3) Questions about consent — Questionnaire — Participant
4) Informed consent execution — E-Sign — Participant
5) Medical history documentation — File Request — Participant
6) IRB documentation — To-Do — IRB Liaison
7) Baseline assessments — To-Do — Study Coordinator
8) Enrollment confirmation — Approval — Principal Investigator

---

## CONSTRUCTION & REAL ESTATE (10 Templates)

### 59. Subcontractor Qualification
**Why Moxo**: Sub qualification requires documents from subs with internal safety/ops review

**Tags**: [Construction, General Contractors]
**Complexity**: Standard
**Trigger**: New subcontractor needed / Bid received
**Pairs With**: Lien Waiver Collection

Roles: Subcontractor, Project Manager, Safety Lead, Insurance Coordinator
1) Company profile & capabilities — Form — Subcontractor
2) Insurance certificates (GL, WC, Auto) — File Request — Subcontractor
3) Safety program documentation — File Request — Subcontractor
4) License & bonding verification — File Request — Subcontractor
5) References — Questionnaire — Subcontractor
6) Insurance review — To-Do — Insurance Coordinator
7) Safety review — To-Do — Safety Lead
8) Qualification decision — Approval — Project Manager
9) Qualification acknowledgement — Acknowledgement — Subcontractor

### 60. Lien Waiver Collection (Progress Payment)
**Why Moxo**: Lien waiver exchange tied to payments requires sub, GC, and owner coordination

**Tags**: [Construction, Real Estate Development]
**Complexity**: Standard
**Trigger**: Payment application submitted
**Pairs With**: Subcontractor Qualification, Change Order Approval
**Compliance**: Mechanics Lien Laws

Roles: Subcontractor, Project Manager, Accounts Payable, Owner Representative
1) Pay application submission — File Request — Subcontractor
2) Schedule of values review — To-Do — Project Manager
3) Conditional lien waiver — E-Sign — Subcontractor
4) Owner approval — Approval — Owner Representative
5) Payment processing — To-Do — Accounts Payable
6) Unconditional lien waiver — E-Sign — Subcontractor
7) Payment confirmation — Acknowledgement — Project Manager

### 61. Lien Waiver Collection (Final Payment)
**Why Moxo**: Final lien waivers from subs and suppliers for project closeout

**Tags**: [Construction, Real Estate Development]
**Complexity**: Standard
**Trigger**: Project substantial completion / Final pay application
**Pairs With**: Lien Waiver (Progress)
**Compliance**: Mechanics Lien Laws

Roles: Subcontractor, Project Manager, Accounts Payable, Owner Representative
1) Final pay application — File Request — Subcontractor
2) Conditional final waiver — E-Sign — Subcontractor
3) Supplier lien waivers — File Request — Subcontractor
4) Punch list completion — To-Do — Subcontractor
5) Owner final approval — Approval — Owner Representative
6) Final payment processing — To-Do — Accounts Payable
7) Unconditional final waiver — E-Sign — Subcontractor
8) Project closeout acknowledgement — Acknowledgement — Project Manager

### 62. Submittals & Shop Drawing Approval
**Why Moxo**: Submittal review involves external parties (architect, engineer, owner)

**Tags**: [Construction]
**Complexity**: Standard
**Trigger**: Subcontractor ready to order materials/fabricate
**Pairs With**: RFI Coordination

Roles: Subcontractor, Project Manager, Architect/Engineer, Owner Representative
1) Submittal package upload — File Request — Subcontractor
2) PM preliminary review — To-Do — Project Manager
3) Architect/Engineer review — To-Do — Architect/Engineer
4) Review comments — Questionnaire — Architect/Engineer
5) Owner review (if required) — To-Do — Owner Representative
6) Revised submittal (if required) — File Request — Subcontractor
7) Final approval — Approval — Architect/Engineer
8) Approval acknowledgement — Acknowledgement — Subcontractor

### 63. RFI (Request for Information) Coordination
**Why Moxo**: RFIs require coordination between contractor, architect, engineer, and owner

**Tags**: [Construction]
**Complexity**: Simple
**Trigger**: Field question / Design clarification needed
**Pairs With**: Submittals, Change Order

Roles: Contractor, Architect, Engineer, Owner Representative
1) RFI submission — Form — Contractor
2) Supporting documentation — File Request — Contractor
3) Architect review — To-Do — Architect
4) Engineer input (if needed) — To-Do — Engineer
5) Owner input (if required) — Questionnaire — Owner Representative
6) RFI response — File Request — Architect
7) Response acknowledgement — Acknowledgement — Contractor

### 64. Change Order Approval
**Why Moxo**: Change orders require multi-party approval (contractor, architect, owner)

**Tags**: [Construction]
**Complexity**: Standard
**Trigger**: Scope change identified / RFI results in change
**Pairs With**: RFI Coordination, Lien Waiver

Roles: Contractor, Project Manager, Architect, Owner Representative
1) Change order request — Form — Contractor
2) Cost breakdown & backup — File Request — Contractor
3) PM review — To-Do — Project Manager
4) Architect review — To-Do — Architect
5) Owner negotiation/questions — Questionnaire — Owner Representative
6) Owner approval — Approval — Owner Representative
7) Change order execution — E-Sign — Owner Representative
8) Change order acknowledgement — Acknowledgement — Contractor

### 65. Commercial Lease Execution
**Why Moxo**: Lease execution requires multi-party coordination (tenant, landlord, brokers)

**Tags**: [Commercial Real Estate, Property Management]
**Complexity**: Standard
**Trigger**: Lease terms agreed / LOI signed
**Pairs With**: Property Management Onboarding

Roles: Tenant, Landlord Representative, Tenant Broker, Landlord Broker, Property Manager
1) Lease application — Form — Tenant
2) Financial documentation — File Request — Tenant
3) Credit/background check authorization — E-Sign — Tenant
4) Landlord review — To-Do — Landlord Representative
5) Lease negotiation — Questionnaire — Tenant
6) Broker commission agreement — E-Sign — Tenant Broker
7) Lease execution — E-Sign — Tenant
8) Landlord execution — E-Sign — Landlord Representative
9) Move-in acknowledgement — Acknowledgement — Property Manager

### 66. Property Purchase Closing Coordination
**Why Moxo**: Closing requires coordination between buyer, seller, lender, title, and agents

**Tags**: [Real Estate, Mortgage, Title]
**Complexity**: Complex
**Trigger**: Purchase agreement signed / Closing date set
**Pairs With**: N/A

Roles: Buyer, Seller, Closing Agent, Lender Representative, Buyer Agent
1) Purchase agreement execution — E-Sign — Buyer
2) Earnest money acknowledgement — Acknowledgement — Closing Agent
3) Inspection contingency documents — File Request — Buyer
4) Seller disclosures — File Request — Seller
5) Title commitment review — Acknowledgement — Buyer
6) Lender closing package — File Request — Lender Representative
7) Final walkthrough acknowledgement — Acknowledgement — Buyer Agent
8) Closing document execution — E-Sign — Buyer
9) Seller closing documents — E-Sign — Seller
10) Closing confirmation — Acknowledgement — Closing Agent

### 67. Tenant Move-Out & Security Deposit
**Why Moxo**: Move-out coordination and deposit accounting outside property management systems

**Tags**: [Property Management, Residential, Commercial]
**Complexity**: Simple
**Trigger**: Move-out notice received / Lease end date approaching
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

### 68. Property Management Onboarding
**Why Moxo**: Owner onboarding for property management requires multi-department coordination

**Tags**: [Property Management]
**Complexity**: Standard
**Trigger**: Property management agreement signed
**Pairs With**: Commercial Lease Execution

Roles: Property Owner, Property Manager, Accounting, Maintenance Coordinator
1) Owner information intake — Form — Property Owner
2) Property documentation — File Request — Property Owner
3) Management agreement — E-Sign — Property Owner
4) Banking/ACH setup — File Request — Property Owner
5) Accounting setup — To-Do — Accounting
6) Property inspection — To-Do — Maintenance Coordinator
7) Tenant notification — To-Do — Property Manager
8) Onboarding complete — Acknowledgement — Property Manager

---

## TRADE, LOGISTICS & SUPPLY CHAIN (6 Templates)

### 69. Import Customs Clearance
**Why Moxo**: Customs clearance requires coordination between importer, broker, freight forwarder, and supplier

**Tags**: [Import/Export, Manufacturing, Retail]
**Complexity**: Standard
**Trigger**: Shipment departed origin / ETA notification
**Pairs With**: Export License Application
**Compliance**: CBP, Customs

Roles: Importer, Customs Broker, Freight Forwarder, Supplier
1) Shipment notification — Form — Supplier
2) Commercial invoice & packing list — File Request — Supplier
3) Bill of lading / airway bill — File Request — Freight Forwarder
4) Certificate of origin — File Request — Supplier
5) Customs classification — To-Do — Customs Broker
6) Importer questions — Questionnaire — Importer
7) Entry filing — To-Do — Customs Broker
8) Duty payment authorization — Approval — Importer
9) Release confirmation — Acknowledgement — Customs Broker

### 70. Export License Application
**Why Moxo**: Export compliance requires coordination between exporter and compliance

**Tags**: [Manufacturing, Technology, Defense]
**Complexity**: Standard
**Trigger**: Export to controlled destination / Controlled item identified
**Pairs With**: Import Customs Clearance
**Compliance**: EAR, ITAR

Roles: Exporter, Export Compliance Officer, Government Liaison
1) Export classification request — Form — Exporter
2) Product/technology documentation — File Request — Exporter
3) End-user information — Questionnaire — Exporter
4) Compliance review — To-Do — Export Compliance Officer
5) License application preparation — To-Do — Export Compliance Officer
6) Government submission — To-Do — Government Liaison
7) License receipt — Acknowledgement — Exporter

**Common Variations:**
- For complex classifications: Add Legal review step

### 71. Freight Claim Coordination
**Why Moxo**: Freight claims require coordination between shipper, carrier, consignee, and insurance

**Tags**: [Logistics, Shipping, Manufacturing]
**Complexity**: Standard
**Trigger**: Damaged/lost shipment reported
**Pairs With**: N/A

Roles: Shipper, Carrier, Consignee, Insurance Adjuster
1) Damage/loss report — Form — Consignee
2) Photos and documentation — File Request — Consignee
3) Bill of lading & POD — File Request — Carrier
4) Shipper statement — Questionnaire — Shipper
5) Carrier investigation — To-Do — Carrier
6) Insurance adjuster review — To-Do — Insurance Adjuster
7) Claim decision — Approval — Insurance Adjuster
8) Settlement acknowledgement — Acknowledgement — Consignee

### 72. Supplier Corrective Action Request (SCAR)
**Why Moxo**: Quality issues with suppliers require documentation and remediation tracking

**Tags**: [Manufacturing, Quality, Supply Chain]
**Complexity**: Standard
**Trigger**: Quality defect identified / Non-conformance reported
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

### 73. First Article Inspection (FAI)
**Why Moxo**: FAI requires coordination between supplier, quality, and engineering

**Tags**: [Manufacturing, Aerospace, Automotive]
**Complexity**: Standard
**Trigger**: First production run / New part approval needed
**Pairs With**: SCAR
**Compliance**: AS9102 (Aerospace)

Roles: Supplier, Quality Engineer, Design Engineer, Quality Manager
1) FAI submission — File Request — Supplier
2) Dimensional report — File Request — Supplier
3) Material certifications — File Request — Supplier
4) Process documentation — File Request — Supplier
5) Quality review — To-Do — Quality Engineer
6) Engineering review — To-Do — Design Engineer
7) Clarification questions — Questionnaire — Supplier
8) FAI approval — Approval — Quality Manager
9) Approval acknowledgement — Acknowledgement — Supplier

### 74. Product Recall Coordination
**Why Moxo**: Recalls require coordination across manufacturer, distributors, retailers, and regulatory

**Tags**: [Manufacturing, Consumer Products, Food & Beverage]
**Complexity**: Standard
**Trigger**: Safety issue identified / Regulatory recall order
**Pairs With**: N/A
**Compliance**: CPSC, FDA

Roles: Manufacturer, Distributor, Retailer, Regulatory Liaison
1) Recall notification — Form — Manufacturer
2) Product identification — File Request — Manufacturer
3) Distributor acknowledgement — Acknowledgement — Distributor
4) Retailer acknowledgement — Acknowledgement — Retailer
5) Inventory reconciliation — Questionnaire — Distributor
6) Retail inventory count — Questionnaire — Retailer
7) Return instructions — File Request — Manufacturer
8) Regulatory notification — To-Do — Regulatory Liaison
9) Recall completion report — File Request — Manufacturer

---

## ENTITY FORMATION & CORPORATE CHANGES (5 Templates)

### 75. New Business Formation Coordination
**Why Moxo**: Formation requires coordination with founders, legal, registered agent, and accountant

**Tags**: [Legal, Corporate Services, Startups]
**Complexity**: Standard
**Trigger**: New entity needed / Founder ready to incorporate
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

### 76. Annual Report & Registered Agent Coordination
**Why Moxo**: Annual filings require external party coordination (registered agent, sometimes accountant)

**Tags**: [Corporate Services, Legal]
**Complexity**: Simple
**Trigger**: Annual report due date approaching
**Pairs With**: Director/Officer Change

Roles: Business Owner, Registered Agent, Filing Coordinator, Accountant
1) Annual report data confirmation — Form — Business Owner
2) Changes to officers/address — Questionnaire — Business Owner
3) Financial data (if required) — File Request — Accountant
4) Filing preparation — To-Do — Filing Coordinator
5) Business owner approval — Approval — Business Owner
6) Filing submission — To-Do — Registered Agent
7) Filing confirmation — Acknowledgement — Registered Agent

### 77. Director/Officer Change Filing
**Why Moxo**: Officer changes require new officer participation and legal/secretary coordination

**Tags**: [Corporate Governance, Legal]
**Complexity**: Standard
**Trigger**: Board approves officer change / Officer resignation
**Pairs With**: Board Resolution, Annual Report

Roles: Business Owner, New Officer, Resigning Officer, Legal Advisor, Corporate Secretary
1) Change request details — Form — Business Owner
2) Board/owner approval — Approval — Business Owner
3) Resigning officer acknowledgement — Acknowledgement — Resigning Officer
4) New officer acceptance — Acknowledgement — New Officer
5) New officer documentation — File Request — New Officer
6) Legal review — To-Do — Legal Advisor
7) Filing preparation — To-Do — Corporate Secretary
8) Change confirmation — Acknowledgement — Business Owner

### 78. Business Dissolution Coordination
**Why Moxo**: Wind-down requires external stakeholder coordination (creditors, tax, legal)

**Tags**: [Corporate Services, Legal]
**Complexity**: Standard
**Trigger**: Dissolution decision made / Business closure
**Pairs With**: N/A

Roles: Business Owner, Legal Advisor, Tax Advisor, Creditor, Registered Agent
1) Dissolution request — Form — Business Owner
2) Outstanding obligations checklist — Questionnaire — Business Owner
3) Creditor notification — Acknowledgement — Creditor
4) Final tax filings — To-Do — Tax Advisor
5) Asset distribution acknowledgement — Acknowledgement — Business Owner
6) Legal filing preparation — To-Do — Legal Advisor
7) Dissolution document execution — E-Sign — Business Owner
8) Registered agent termination — Acknowledgement — Registered Agent
9) Dissolution confirmation — Acknowledgement — Business Owner

### 79. Franchise Agreement Execution
**Why Moxo**: Franchise setup requires FDD review and multi-party agreement coordination

**Tags**: [Franchising, Retail, Food Service]
**Complexity**: Complex
**Trigger**: Franchise application approved / Discovery day completed
**Pairs With**: N/A
**Compliance**: FTC Franchise Rule

Roles: Franchisee, Franchise Development Manager, Legal Reviewer, Finance, Training Lead
1) Franchise application — Form — Franchisee
2) Financial qualification documents — File Request — Franchisee
3) FDD acknowledgement (14-day waiting period) — Acknowledgement — Franchisee
4) Franchisee questions — Questionnaire — Franchisee
5) Discovery day confirmation — Acknowledgement — Franchisee
6) Franchise agreement review — To-Do — Legal Reviewer
7) Financial terms — To-Do — Finance
8) Franchise agreement execution — E-Sign — Franchisee
9) Training schedule — To-Do — Training Lead
10) Onboarding kickoff — Acknowledgement — Franchise Development Manager

---

## HR & EMPLOYEE LIFECYCLE (6 Templates)

### 80. Employee Relocation Coordination
**Why Moxo**: Relocation requires coordination between employee, HR, relocation company, and vendors

**Tags**: [HR, Enterprise, Global Companies]
**Complexity**: Standard
**Trigger**: Relocation approved / Employee transfer
**Pairs With**: Internal Transfer

Roles: Employee, HR Coordinator, Relocation Company, Destination Services
1) Relocation authorization — Form — HR Coordinator
2) Employee preferences — Questionnaire — Employee
3) Policy acknowledgement — Acknowledgement — Employee
4) Home sale/lease break assistance — To-Do — Relocation Company
5) Destination home search — To-Do — Destination Services
6) Moving estimate — File Request — Relocation Company
7) Move date confirmation — Acknowledgement — Employee
8) Expense documentation — File Request — Employee
9) Relocation complete — Acknowledgement — HR Coordinator

### 81. Contractor/Freelancer Onboarding
**Why Moxo**: Contractor setup requires coordination across hiring manager and finance

**Tags**: [All Industries]
**Complexity**: Simple
**Trigger**: Contractor engagement approved
**Pairs With**: Background Check

Roles: Contractor, Hiring Manager, Finance
1) Contractor information — Form — Contractor
2) W-9 / tax documentation — File Request — Contractor
3) SOW / agreement execution — E-Sign — Contractor
4) Rate/payment terms — To-Do — Finance
5) NDA execution — E-Sign — Contractor
6) Onboarding complete — Acknowledgement — Hiring Manager

**Common Variations:**
- For contractors with system access: Add IT setup step
- For non-standard terms: Add Legal review step

### 82. Background Check & Employment Verification
**Why Moxo**: Background checks require coordination between candidate, employer, and verification vendor

**Tags**: [HR, Recruiting]
**Complexity**: Standard
**Trigger**: Offer extended / Pre-employment screening
**Pairs With**: Employee Onboarding

Roles: Candidate, HR Coordinator, Background Vendor, Previous Employer
1) Background check authorization — E-Sign — Candidate
2) Candidate information — Form — Candidate
3) Employment history — Questionnaire — Candidate
4) Verification request — To-Do — Background Vendor
5) Previous employer verification — Questionnaire — Previous Employer
6) Education verification — To-Do — Background Vendor
7) Results review — To-Do — HR Coordinator
8) Candidate acknowledgement — Acknowledgement — Candidate

### 83. Employee Termination / Offboarding
**Why Moxo**: Offboarding requires cross-department coordination (HR, IT, finance, manager)

**Tags**: [All Industries, HR]
**Complexity**: Standard
**Trigger**: Termination decision / Resignation received
**Pairs With**: N/A

Roles: Departing Employee, HR Coordinator, IT Administrator, Finance, Manager
1) Separation notice — Acknowledgement — Departing Employee
2) Exit interview — Questionnaire — Departing Employee
3) Benefits/COBRA information — File Request — HR Coordinator
4) Final expense submission — File Request — Departing Employee
5) Equipment return — To-Do — Departing Employee
6) Access revocation — To-Do — IT Administrator
7) Final paycheck — To-Do — Finance
8) Separation agreement (if applicable) — E-Sign — Departing Employee
9) Offboarding complete — Acknowledgement — Manager

### 84. Leave of Absence Request & Management
**Why Moxo**: LOA requires coordination between employee, HR, manager, and sometimes medical provider

**Tags**: [All Industries, HR]
**Complexity**: Simple
**Trigger**: LOA request submitted
**Pairs With**: Workers' Compensation (if injury-related)
**Compliance**: FMLA (if applicable)

Roles: Employee, Manager, HR Coordinator, Medical Provider (if applicable)
1) LOA request — Form — Employee
2) Manager acknowledgement — Acknowledgement — Manager
3) Medical certification (if FMLA) — File Request — Medical Provider
4) HR review — To-Do — HR Coordinator
5) LOA approval — Approval — HR Coordinator
6) Return-to-work certification (if medical) — File Request — Medical Provider
7) Return-to-work acknowledgement — Acknowledgement — Manager

### 85. Internal Transfer / Promotion Coordination
**Why Moxo**: Internal moves require coordination between employee, current manager, new manager, and HR

**Tags**: [All Industries, HR]
**Complexity**: Standard
**Trigger**: Transfer/promotion approved
**Pairs With**: Employee Relocation (if relocating)

Roles: Employee, Current Manager, New Manager, HR Business Partner, Compensation
1) Transfer/promotion request — Form — Employee
2) Current manager approval — Approval — Current Manager
3) New manager approval — Approval — New Manager
4) Compensation review — To-Do — Compensation
5) Offer letter — File Request — HR Business Partner
6) Employee acceptance — E-Sign — Employee
7) Transition plan — Questionnaire — Current Manager
8) Start date confirmation — Acknowledgement — New Manager

---

## Verification
- Total: 85 templates
- All require multi-party coordination (external and/or cross-department)
- All represent workflows not fully orchestrated by systems of record
- Steps align with real-world industry processes
- Templates are right-sized (simple processes: 4-6 steps; standard: 6-8; complex: 10+)

## Template Distribution by Category
| Category | Count |
|----------|-------|
| Audit, Evidence & Compliance | 10 |
| Client & Vendor Onboarding | 9 |
| KYC / KYB / Financial Compliance | 8 |
| Legal & Corporate Governance | 10 |
| Professional Services & Engagements | 9 |
| Insurance & Claims | 7 |
| Healthcare | 5 |
| Construction & Real Estate | 10 |
| Trade, Logistics & Supply Chain | 6 |
| Entity Formation & Corporate Changes | 5 |
| HR & Employee Lifecycle | 6 |

## Complexity Distribution
| Complexity | Count | Characteristics |
|------------|-------|-----------------|
| Simple | 18 | 4-6 steps, 2-3 roles |
| Standard | 55 | 6-8 steps, 3-4 roles |
| Complex | 12 | 10+ steps, 4-5 roles |

## Sources Referenced
- [Moodys - Client Onboarding Best Practices](https://www.moodys.com/web/en/us/kyc/resources/insights/customer-onboarding-best-practices-financial-institutions.html)
- [FMSB - Client Onboarding Documentation Standards](https://fmsb.com/standard-for-client-onboarding-documentation-and-processes/)
- [Siteline - Construction Lien Waivers Guide](https://www.siteline.com/blog/guide-to-construction-lien-waivers)
- [National Funding - Loan Underwriting Process](https://www.nationalfunding.com/blog/the-5-step-underwriting-process-for-business-loans/)
- [Myndshft - Prior Authorization Guide](https://www.myndshft.com/the-ultimate-guide-to-prior-authorization/)
- [CapLinked - M&A Due Diligence Data Rooms](https://www.caplinked.com/due-diligence/)
- [Loopio - RFP Response Process](https://loopio.com/resources/ultimate-rfp-response-process/)
- [Wilkinson Law - Board Written Consents](https://www.wilkinsonlawllc.com/corporate-formation/2025/03/19/corporate-governance-made-easy-unanimous-written-consents-for-boards/)
- [NCQA - Provider Credentialing Standards](https://www.ncqa.org/programs/health-plans/credentials-verification-organization-cvo/)
- [AGC - Construction Change Order Best Practices](https://www.agc.org/learn/construction-data/construction-industry-resources)
- [CBP - Import Entry Process](https://www.cbp.gov/trade/basic-import-export)
- [SHRM - Employee Relocation Best Practices](https://www.shrm.org/topics-tools/tools/policies/relocation-policy)
