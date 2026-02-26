# Vendor & Partner Management (7 Templates)

> Vendor onboarding, security assessments, and partner enablement

---

## 1. Vendor Onboarding

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: New vendor/supplier engagement

**Description**: Bring new vendors from registration through compliance screening, contract execution, and payment setup. Captures tax and insurance documentation, runs risk assessment, and ensures procurement approval before activation.

**Use Cases**:
- Procurement team qualifies a new technology vendor for an enterprise license
- Facilities department onboards a new janitorial services provider
- Marketing team engages a new agency partner requiring full vetting
- Operations adds a critical raw materials supplier to the approved vendor list

**Requirements**:
- [ ] Upload your NDA / MSA document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your ERP (NetSuite, SAP) or procurement platform (Coupa, Ariba) to auto-create vendor master records upon approval
- Use AI to auto-screen uploaded insurance certificates and flag coverage gaps, expired policies, or limits below your minimum thresholds
- Connect to Dun & Bradstreet or Creditsafe to auto-pull financial stability scores during the AI vendor risk assessment step
- Pair with the Vendor Security Assessment template for vendors that will have access to your systems or sensitive data

**Roles**: Vendor Contact, Procurement Owner, Finance Reviewer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Vendor registration form | Form | Vendor Contact | Register your organization by providing legal name, entity type, DUNS number, products or services offered, and NAICS code. |
| 2 | Tax & insurance documents | File Request | Vendor Contact | Upload your W-9 (or W-8BEN for international vendors), certificate of general liability insurance, professional liability insurance, and workers compensation documentation. |
| 3 | Compliance questionnaire | Form | Vendor Contact | Complete the compliance questionnaire covering OFAC sanctions, anti-bribery policies, data privacy practices, diversity certifications, and references. |
| 4 | AI vendor risk assessment | To-Do | Procurement Owner | AI-powered: Assess the vendor across financial stability, industry risk, insurance adequacy, and sanctions screening. Generate a risk profile with recommendations. |
| 5 | NDA / MSA execution | E-Sign | Vendor Contact | Review and sign the Non-Disclosure Agreement and Master Service Agreement to formalize the vendor relationship. |
| 6 | Banking & payment setup | Form | Vendor Contact | Provide your banking and payment details so we can set up your account in our payables system. |
| 7 | Procurement approval | Approval | Procurement Owner | Review all submitted vendor information, risk assessment results, and executed agreements. Approve to activate the vendor in the procurement system. |
| 8 | Vendor activation notification | To-Do | Procurement Owner | Automated notification: Send the vendor activation confirmation with purchase order procedures, portal access, and key contact information. |

#### Step 1: Vendor registration form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Legal Company Name | Text (single line) | Yes |
| Entity Type | Dropdown | Yes |
| DUNS Number | Text (single line) | No |
| Products / Services Offered | Text (multi-line) | Yes |
| NAICS Code | Text (single line) | No |

#### Step 3: Compliance questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| OFAC / Sanctions Compliance Confirmation | Checkbox | Yes |
| Anti-Bribery / FCPA Policy in Place | Checkbox | Yes |
| Data Privacy Practices Description | Text (multi-line) | Yes |
| Diversity Certifications (if any) | Text (multi-line) | No |
| References (Company, Contact, Phone) | Text (multi-line) | Yes |

#### Step 6: Banking & payment setup — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Bank Name | Text (single line) | Yes |
| Routing Number | Text (single line) | Yes |
| Account Number | Text (single line) | Yes |
| Payment Terms | Dropdown | Yes |
| Invoice Submission Instructions | Text (multi-line) | No |

---

## 2. Vendor Security Assessment

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: New vendor with system/data access / Annual refresh

**Description**: Evaluate a vendor's security posture before granting system or data access. Collects security questionnaires, certifications, architecture docs, and penetration test results for thorough risk analysis and acceptance.

**Use Cases**:
- New SaaS vendor needs access to company data for integration
- Annual security reassessment of existing cloud infrastructure provider
- Vendor requesting elevated API access triggers security review
- M&A due diligence requires security assessment of target company vendors

**Recommendations**:
- Integrate with SecurityScorecard or BitSight to auto-pull external security ratings as supplemental data for the risk assessment
- Use AI to compare vendor questionnaire responses against your security baseline and auto-flag controls that fall below minimum standards
- Set up a recurring schedule to auto-launch this flow annually for each vendor with system or data access
- Connect to a GRC platform (ServiceNow, OneTrust, Vanta) to auto-import vendor security questionnaire responses and track assessment status

**Roles**: Vendor Contact, Security Reviewer, IT Risk Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Security questionnaire (SIG/CAIQ) | Form | Vendor Contact | Complete the standardized security questionnaire covering your organization's information security controls, policies, and practices. |
| 2 | Certification uploads (SOC 2, ISO, etc.) | File Request | Vendor Contact | Upload current security certifications such as SOC 2 Type II report, ISO 27001 certificate, or other relevant compliance documentation. |
| 3 | Architecture documentation | File Request | Vendor Contact | Upload your system architecture documentation showing data flows, network topology, and security boundaries relevant to our integration. |
| 4 | Penetration test results | File Request | Vendor Contact | Upload your most recent penetration test report and any remediation evidence for identified findings. |
| 5 | Security review | To-Do | Security Reviewer | Review all submitted security documentation, questionnaire responses, and certifications. Document findings and identify any gaps or concerns. |
| 6 | Follow-up questions | Form | Vendor Contact | Answer follow-up questions from our security team regarding any gaps or clarifications needed from the initial review. |
| 7 | Risk assessment | To-Do | IT Risk Manager | Complete the formal risk assessment based on security review findings. Assign a risk rating and document any required compensating controls or conditions. |
| 8 | Risk acceptance | Approval | IT Risk Manager | Approve or reject the vendor based on the completed risk assessment. If approved with conditions, document the conditions and timeline for remediation. |

#### Step 1: Security questionnaire (SIG/CAIQ) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Data Encryption at Rest | Dropdown | Yes |
| Data Encryption in Transit | Dropdown | Yes |
| Multi-Factor Authentication Enforced | Dropdown | Yes |
| Incident Response Plan | Dropdown | Yes |
| Data Hosting Locations | Text (multi-line) | Yes |
| Subprocessors with Data Access | Text (multi-line) | No |

#### Step 6: Follow-up questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Responses | Text (multi-line) | Yes |
| Additional Supporting Information | Text (multi-line) | No |

---

## 3. Vendor Compliance Certification (Annual)

**Tags**: All Industries | **Complexity**: Simple | **Trigger**: Vendor anniversary / Annual compliance calendar

**Description**: Run the annual vendor compliance refresh to ensure continued adherence to your organization's standards. Collects updated certifications, insurance certificates, and a compliance attestation before review and approval.

**Use Cases**:
- Annual calendar triggers compliance renewal for all active vendors
- Vendor anniversary date prompts scheduled recertification
- Regulatory audit requires up-to-date vendor compliance documentation
- Contract renewal contingent on passing annual compliance review

**Recommendations**:
- Set up a recurring schedule to auto-launch this flow annually on each vendor anniversary date
- Use AI to compare uploaded certifications against prior-year submissions and auto-flag any lapsed, downgraded, or missing documentation
- Connect to your insurance verification service to auto-validate certificate of insurance coverage amounts and expiration dates
- Pair with the Third-Party Remediation Tracking template when a vendor fails certification to formally track corrective actions

**Roles**: Vendor Contact, Compliance Reviewer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Annual refresh notification | Form | Vendor Contact | Confirm your organization details are still current and indicate any material changes since the last compliance certification. |
| 2 | Updated certifications & policies | File Request | Vendor Contact | Upload your current certifications, updated policies, and any new compliance documentation for the annual review. |
| 3 | Insurance certificates | File Request | Vendor Contact | Upload current certificates of insurance showing active coverage that meets our minimum requirements. |
| 4 | Compliance attestation | Acknowledgement | Vendor Contact | Attest that your organization continues to comply with all contractual obligations, regulatory requirements, and our vendor code of conduct. |
| 5 | Documentation review | To-Do | Compliance Reviewer | Review all submitted certifications, insurance documents, and the compliance attestation. Verify currency and adequacy of all documentation. |
| 6 | Compliance approved | Approval | Compliance Reviewer | Approve or reject the vendor's annual compliance certification based on the documentation review. |

#### Step 1: Annual refresh notification — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Any Material Changes Since Last Certification? | Dropdown | Yes |
| Change Details (if applicable) | Text (multi-line) | No |
| Current Primary Contact Name | Text (single line) | Yes |
| Current Primary Contact Email | Email | Yes |

---

## 4. Third-Party Due Diligence

**Tags**: Financial Services, Professional Services | **Complexity**: Standard | **Trigger**: New third-party relationship / High-risk vendor

**Description**: Conduct thorough due diligence on high-risk third-party relationships. Collects questionnaires, ownership disclosures, and supporting documentation for legal, compliance, and risk review before rendering a formal decision.

**Use Cases**:
- New financial technology partner requires enhanced due diligence
- Offshore service provider engagement triggers third-party review
- Regulatory requirement mandates due diligence for data subprocessors
- High-value sole-source vendor needs comprehensive risk evaluation

**Recommendations**:
- Integrate with LexisNexis or Refinitiv World-Check to auto-screen third parties against sanctions, PEP, and adverse media databases
- Use AI to analyze uploaded ownership and financial documents and auto-generate a risk summary highlighting red flags for the review team
- Run legal review and compliance review in parallel to cut due diligence turnaround by 50%
- Connect to your GRC platform (ServiceNow, Archer, OneTrust) to centralize due diligence records and link findings to your enterprise risk register

**Roles**: Third Party Contact, Risk Reviewer, Legal Counsel, Compliance Officer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Due diligence questionnaire | Form | Third Party Contact | Complete the due diligence questionnaire covering your organization's background, operations, financial stability, and regulatory standing. |
| 2 | Supporting documentation | File Request | Third Party Contact | Upload supporting documentation such as financial statements, regulatory filings, and compliance certifications. |
| 3 | Ownership & structure disclosure | File Request | Third Party Contact | Upload documents disclosing your organizational structure, beneficial ownership (25%+ owners), and any parent/subsidiary relationships. |
| 4 | Clarification questions | Form | Third Party Contact | Answer any clarification questions that arose during the initial review of your due diligence submission. |
| 5 | Legal review | To-Do | Legal Counsel | Review submitted documentation for legal risks, contractual concerns, regulatory exposure, and litigation history. |
| 6 | Compliance review | To-Do | Compliance Officer | Review the third party against AML/KYC requirements, sanctions lists, and anti-corruption standards. Document compliance findings. |
| 7 | Risk assessment | To-Do | Risk Reviewer | Consolidate legal and compliance findings into a comprehensive risk assessment with an overall risk rating and recommendations. |
| 8 | Due diligence decision | Approval | Risk Reviewer | Render the final due diligence decision: approve the relationship, approve with conditions, or decline. |

#### Step 1: Due diligence questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Organization Legal Name | Text (single line) | Yes |
| Jurisdiction of Incorporation | Text (single line) | Yes |
| Years in Business | Number | Yes |
| Description of Services | Text (multi-line) | Yes |
| Any Pending Litigation or Regulatory Actions? | Dropdown | Yes |
| Litigation / Regulatory Details (if applicable) | Text (multi-line) | No |

#### Step 4: Clarification questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Responses to Clarification Questions | Text (multi-line) | Yes |

---

## 5. Third-Party Remediation Tracking

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Audit finding / Risk assessment gap identified

**Description**: Track and verify remediation of audit findings or risk gaps identified in a third-party assessment. Manages the submission of remediation plans, evidence collection, and internal verification through to final acceptance.

**Use Cases**:
- Vendor security assessment reveals critical control gaps requiring remediation
- Regulatory exam identifies third-party compliance deficiencies
- Annual audit finds vendor has lapsed certifications needing renewal
- Penetration test uncovers vulnerabilities in a vendor integration

**Recommendations**:
- Connect to your GRC platform (ServiceNow, Archer) to auto-create remediation tracking tickets linked to the original audit findings
- Use AI to compare remediation evidence against the original findings and auto-assess whether each corrective action fully addresses the identified gap
- Integrate with Jira or Azure DevOps to track technical remediation items alongside your engineering team backlog for coordinated resolution
- Pair with the Vendor Security Assessment template to run a follow-up assessment after all remediation items are closed

**Roles**: Third Party Contact, Risk Reviewer, Control Owner

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Remediation plan submission | Form | Third Party Contact | Submit your remediation plan detailing each finding, the corrective action to be taken, responsible parties, and target completion dates. |
| 2 | Timeline acknowledgement | Acknowledgement | Third Party Contact | Acknowledge and commit to the agreed remediation timeline and milestones. |
| 3 | Evidence of remediation | File Request | Third Party Contact | Upload evidence demonstrating that the corrective actions have been implemented (screenshots, configuration exports, updated policies, test results). |
| 4 | Internal control owner verification | To-Do | Control Owner | Verify the remediation evidence against the original findings. Confirm that the corrective actions adequately address each identified gap. |
| 5 | Remediation review | To-Do | Risk Reviewer | Review the control owner verification and remediation evidence. Determine if all findings have been satisfactorily addressed or if follow-up is needed. |
| 6 | Follow-up evidence (if needed) | File Request | Third Party Contact | If additional evidence was requested during the review, upload the supplemental documentation here. |
| 7 | Remediation accepted | Approval | Risk Reviewer | Approve or reject the remediation based on the evidence review. If rejected, document the remaining gaps and required next steps. |
| 8 | Completion notification | Acknowledgement | Risk Reviewer | Acknowledge that the remediation process is complete and all findings have been satisfactorily resolved. |

#### Step 1: Remediation plan submission — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Finding Reference Number(s) | Text (single line) | Yes |
| Root Cause Analysis | Text (multi-line) | Yes |
| Corrective Actions | Text (multi-line) | Yes |
| Responsible Party | Text (single line) | Yes |
| Target Completion Date | Date | Yes |

---

## 6. Partner / Channel Onboarding

**Tags**: Technology, SaaS, Professional Services | **Complexity**: Standard | **Trigger**: New partner agreement signed

**Description**: Onboard new channel or technology partners from application through agreement execution, enablement, and launch readiness. Covers qualification, certification, portal setup, and go-to-market planning.

**Use Cases**:
- Technology company signs a new reseller partner in a target geography
- Consulting firm joins the partner program for implementation services
- ISV partner integrates and needs sales enablement before launch
- Existing customer transitions to a referral partner relationship

**Requirements**:
- [ ] Upload your partnership agreement document for e-signature (replaces sample)
- [ ] Upload your NDA document for e-signature (replaces sample)

**Recommendations**:
- Connect to your PRM (Partner Relationship Management) system like Impartner or PartnerStack to auto-create partner records and track pipeline from day one
- Use AI to evaluate partner qualification responses and auto-recommend the appropriate partner tier based on experience, certifications, and revenue commitment
- Integrate with your LMS (Lessonly, Docebo) to auto-enroll new partners in certification courses and track completion status
- Chain with the Quarterly Business Review template to establish a regular performance review cadence once the partner is active

**Roles**: Partner Contact, Partner Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Partner application form | Form | Partner Contact | Submit your partner application with company details, partner type, target market, geography, and sales capacity. |
| 2 | Partner qualification questionnaire | Form | Partner Contact | Provide details on your team's certifications, relevant experience, and revenue commitment to help us determine the right partner tier. |
| 3 | Partnership agreement | E-Sign | Partner Contact | Review and sign the partnership agreement that defines terms, commissions, territories, and obligations. |
| 4 | NDA execution | E-Sign | Partner Contact | Review and sign the mutual Non-Disclosure Agreement to protect confidential information shared during the partnership. |
| 5 | Portal & demo environment setup | To-Do | Partner Manager | Provision the partner portal account, set up the demo/sandbox environment, and configure deal registration access. |
| 6 | Sales & technical certification | To-Do | Partner Contact | Complete the required sales and technical certification courses to become an authorized partner. Access training materials through the partner portal. |
| 7 | Go-to-market plan review | Approval | Partner Manager | Review and approve the partner's go-to-market plan including target accounts, marketing activities, and pipeline commitments. |
| 8 | Launch readiness confirmation | To-Do | Partner Manager | Verify that all enablement is complete, certifications are earned, and the partner is ready for launch. Confirm marketing materials and co-branded assets are prepared. |
| 9 | Partner launch announcement | To-Do | Partner Manager | Automated notification: Send the partner launch announcement internally and to the partner with welcome resources, key contacts, and first 90-day playbook. |

#### Step 1: Partner application form — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text (single line) | Yes |
| Partner Type | Dropdown | Yes |
| Target Market | Text (single line) | Yes |
| Geography / Region | Text (single line) | Yes |
| Sales Capacity (Reps) | Number | No |

#### Step 2: Partner qualification questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Relevant Certifications | Text (multi-line) | No |
| Years of Relevant Experience | Number | Yes |
| Annual Revenue Commitment | Text (single line) | Yes |
| Existing Customer Base Size | Number | No |

---

## 7. Reseller / Distributor Onboarding

**Tags**: Manufacturing, Technology, Consumer Products | **Complexity**: Standard | **Trigger**: Reseller agreement approved

**Description**: Onboard new resellers or distributors through application, credential verification, agreement execution, and product training. Covers legal review, credit setup, and channel activation to get partners selling quickly.

**Use Cases**:
- Manufacturer adds a new regional distributor for product expansion
- Software company onboards a value-added reseller in a new market
- Consumer brand authorizes a new retail distributor
- International expansion requires onboarding in-country reseller partners

**Requirements**:
- [ ] Upload your reseller agreement document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your ERP (NetSuite, SAP) or distribution management system to auto-create reseller accounts and configure pricing tiers upon activation
- Connect to a credit scoring service (Dun & Bradstreet, Experian Business) to auto-assess financial health before establishing credit terms
- Use AI to analyze uploaded business credentials and financial statements and auto-generate a reseller viability score with risk factors for the channel manager
- Schedule an Annual Renewal flow to auto-launch on each reseller agreement anniversary to review performance and renew terms

**Roles**: Reseller Contact, Channel Manager, Legal Reviewer, Finance

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Reseller application | Form | Reseller Contact | Submit your reseller application with company details, territory of interest, target customers, and sales team size. |
| 2 | Business credentials & financials | File Request | Reseller Contact | Upload your business credentials including incorporation documents, financial statements, and trade references. |
| 3 | Territory / pricing acknowledgement | Acknowledgement | Reseller Contact | Review and acknowledge the assigned territory boundaries, pricing schedules, discount structures, and minimum order requirements. |
| 4 | Reseller agreement | E-Sign | Reseller Contact | Review and sign the reseller agreement covering terms, territory rights, pricing, and performance obligations. |
| 5 | Legal review | To-Do | Legal Reviewer | Review the executed reseller agreement and supporting credentials for legal sufficiency and any risk flags. |
| 6 | Credit terms setup | To-Do | Finance | Establish credit terms based on the reseller's financial profile, set credit limits, and configure the account in the billing system. |
| 7 | Product training | To-Do | Reseller Contact | Complete the required product training modules covering product features, positioning, competitive differentiation, and support escalation procedures. |
| 8 | Partner activation | Approval | Channel Manager | Review all onboarding steps and approve the reseller for activation. Confirm training completion, legal clearance, and credit setup. |
| 9 | Onboarding complete | Acknowledgement | Reseller Contact | Acknowledge that onboarding is complete and you are ready to begin selling. Welcome to the partner network! |

#### Step 1: Reseller application — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text (single line) | Yes |
| Business Address | Text (multi-line) | Yes |
| Territory / Region | Text (single line) | Yes |
| Target Customer Segments | Text (multi-line) | Yes |
| Sales Team Size | Number | No |
| Years in Distribution / Resale | Number | Yes |
