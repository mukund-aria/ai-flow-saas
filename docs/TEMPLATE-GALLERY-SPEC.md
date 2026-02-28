# Template Gallery — Full Specification

> 39 workflow templates across 8 categories, each with step-level detail.
> Every template is designed to be **90% accurate** to what a real company would run.

---

## Table of Contents

1. [Onboarding](#1-onboarding) (9 templates)
2. [Sales & Evaluation](#2-sales--evaluation) (4 templates)
3. [Account Management](#3-account-management) (4 templates)
4. [Service Delivery](#4-service-delivery) (6 templates)
5. [Order & Fulfillment](#5-order--fulfillment) (4 templates)
6. [Document Collection](#6-document-collection) (4 templates)
7. [Approvals & Agreements](#7-approvals--agreements) (4 templates)
8. [Compliance & Risk](#8-compliance--risk) (4 templates)

### Step Type Legend

| Type | Description |
|------|-------------|
| **FORM** | Structured data collection — assignee fills out fields |
| **APPROVAL** | Approve/reject gate — someone reviews and decides |
| **FILE_REQUEST** | Document upload — assignee uploads files |
| **TODO** | Task completion checkpoint — someone marks as done |
| **ACKNOWLEDGEMENT** | Confirm/acknowledge something |
| **DECISION** | A choice point that routes to different paths |
| **SINGLE_CHOICE_BRANCH** | Routing based on a single choice (Yes/No, option A/B/C) |
| **AI_AUTOMATION** | AI/system step (summarizing, drafting, risk scoring, etc.) |
| **SYSTEM_EMAIL** | Automated email notification |
| **ESIGN** | Electronic signature |

### Role Legend

| Label | Who |
|-------|-----|
| **Coordinator** | Internal team member (ops, manager, analyst) |
| **Assignee** | External participant (client, vendor, partner — via magic link) |
| **AI** | Automated AI step |
| **System** | Automated system step |

---

# 1. Onboarding

> **Buyer intent:** "I need to get someone set up."

## 1.1 SaaS Customer Onboarding

**Industries:** Technology, SaaS
**Trigger:** New customer contract signed

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Customer kickoff form | FORM | Assignee | Company name, primary contact, number of licensed users, subscription tier, preferred go-live date, existing tools/integrations (CRM, SSO provider), primary business objective. |
| 2 | AI-generated implementation plan | AI_AUTOMATION | AI | Analyzes kickoff data — tier, user count, integrations — and generates a phased implementation plan with milestones, timelines, and configuration recommendations based on similar customer profiles. |
| 3 | Implementation plan acknowledgement | ACKNOWLEDGEMENT | Assignee | Customer reviews the plan, confirms milestones, and acknowledges timeline and responsibilities. |
| 4 | Technical requirements questionnaire | FORM | Assignee | SSO provider (Okta/Azure AD/Google), identity protocol (SAML/OIDC), provisioning method (SCIM/CSV/manual), API integration requirements, data migration source, IP allowlisting, compliance needs (SOC 2, HIPAA). |
| 5 | Does customer require SSO/SCIM? | SINGLE_CHOICE_BRANCH | Coordinator | Yes → SSO configuration step. No → skip to data migration. SSO setup adds 1–2 weeks and involves the customer's IT team. |
| 6 | SSO & SCIM configuration | TODO | Coordinator | Configure SAML/OIDC with customer's identity provider. Set up SCIM provisioning. Test login flow. Document configuration. |
| 7 | Data migration upload | FILE_REQUEST | Assignee | Customer uploads data exports from previous system (CSV/JSON/API credentials): user lists, historical records, configuration settings, custom field mappings. |
| 8 | Environment configuration | TODO | Coordinator | Configure tenant: branding, role-based permissions, notification preferences, workflow templates, custom fields, integrations. Import migrated data. |
| 9 | User provisioning form | FORM | Assignee | Admin user emails, department/team structure, role assignments (Admin, Manager, Standard User), custom permission groups. |
| 10 | Admin training session | TODO | Coordinator | Conduct live or recorded admin training: tenant config, user management, reporting, integration management. Share recordings and docs. |
| 11 | End-user training scheduling | TODO | Coordinator | Schedule role-based end-user training sessions. Prepare customized materials based on customer's configuration. |
| 12 | UAT sign-off | APPROVAL | Assignee | Customer conducts user acceptance testing — data migration accuracy, SSO login, permissions, integrations. Approves go-live or requests changes. |
| 13 | Go-live notification | SYSTEM_EMAIL | System | Email to all provisioned users: platform is live, login URL, quick-start guide, support contact. |
| 14 | AI-generated success summary | AI_AUTOMATION | AI | Generates customer success handoff document: configuration recap, key contacts, training status, open items, recommended 30/60/90-day health check cadence. |
| 15 | Onboarding complete acknowledgement | ACKNOWLEDGEMENT | Coordinator | CSM confirms onboarding is complete and customer has transitioned to ongoing success management. |

---

## 1.2 Financial Services Client Onboarding (KYC)

**Industries:** Banking, Wealth Management
**Trigger:** New account application

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Client information form | FORM | Assignee | Full legal name, DOB, SSN/TIN, residential address (current + 3-year history), citizenship, occupation/employer, annual income range, net worth range, source of wealth, anticipated account activity. |
| 2 | Identity document upload | FILE_REQUEST | Assignee | Government-issued photo ID (passport/driver's license/national ID) + proof of address (utility bill, bank statement, tax doc within 90 days). Non-US: passport + visa/residency docs. |
| 3 | Customer Due Diligence (CDD) questionnaire | FORM | Assignee | Purpose of account, expected transaction patterns, source of initial deposit, foreign account disclosures, PEP self-declaration, acting on behalf of third party/beneficial owner. |
| 4 | AI risk scoring | AI_AUTOMATION | AI | Analyzes all client data → risk score based on jurisdiction, occupation, PEP status, source of wealth complexity, transaction patterns, adverse media. Outputs Low/Medium/High with rationale. |
| 5 | High-risk client? | SINGLE_CHOICE_BRANCH | Coordinator | High risk or PEP match → Enhanced Due Diligence path. Otherwise → standard KYC review. Regulatory requirement. |
| 6 | Enhanced Due Diligence documentation | FILE_REQUEST | Assignee | (High-risk only) Certified source-of-wealth evidence (trust docs, business ownership, inheritance), 3 years tax returns, bank statements, professional reference letter. |
| 7 | Sanctions & watchlist screening | TODO | Coordinator | Screen against OFAC SDN, EU/UN sanctions, FinCEN 314(a), PEP databases, adverse media. Document all hits and dispositions. |
| 8 | KYC analyst review | TODO | Coordinator | Verify identity documents, cross-reference address history, validate source of wealth/funds, complete CIP checklist. Prepare KYC case file with findings. |
| 9 | AI-generated KYC summary | AI_AUTOMATION | AI | Compiles structured KYC memo: identity verification results, screening outcomes, risk classification rationale, flags/exceptions, recommendation. Saves 30–45 min of manual memo drafting. |
| 10 | Compliance officer approval | APPROVAL | Coordinator | Reviews complete KYC file, AI summary, analyst recommendation. Approves, requests more info, or declines. For high-risk, documents rationale for acceptance. |
| 11 | Account setup | TODO | Coordinator | Open account in core system. Configure account type, investment profile, fee schedule, reporting preferences, portal access. |
| 12 | Account agreement execution | ACKNOWLEDGEMENT | Assignee | Reviews and acknowledges account terms, fee schedule, privacy notice, electronic delivery consent, arbitration agreement. |
| 13 | Welcome notification | SYSTEM_EMAIL | System | Welcome email with account number, portal credentials, relationship manager contact, funding instructions. |

---

## 1.3 Accounting Firm Client Onboarding

**Industries:** Accounting, Tax
**Trigger:** New client engagement

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Client information form | FORM | Assignee | Business/individual name, entity type (Individual/S-Corp/C-Corp/Partnership/Non-Profit/Trust), Tax ID (SSN/EIN), fiscal year end, state(s) of filing, contact info, referral source. |
| 2 | Service scope selection | FORM | Assignee | Services needed: tax prep, bookkeeping, payroll, audit/review/compilation, advisory. Estimated annual revenue, employee count, current accounting software. |
| 3 | Engagement letter acknowledgement | ACKNOWLEDGEMENT | Assignee | Reviews and acknowledges engagement letter: services, fee schedule (fixed/hourly), payment terms, responsibilities, data retention policy. |
| 4 | Tax authorization forms | FILE_REQUEST | Assignee | Signed IRS Form 8821 (Tax Information Authorization) or Form 2848 (Power of Attorney). State-level authorization forms as applicable. |
| 5 | Prior year returns & financials | FILE_REQUEST | Assignee | Prior 2–3 years federal/state returns with all schedules, prior year financial statements, IRS/state correspondence (notices, audit letters). |
| 6 | Bookkeeping/payroll client? | SINGLE_CHOICE_BRANCH | Coordinator | Yes → accounting system access step. No → skip to initial review. Bookkeeping clients require live system access. |
| 7 | Accounting system access | FORM | Assignee | Accounting software credentials or accountant-level invite (QuickBooks/Xero), bank feed connections, payroll provider access, merchant platform access. |
| 8 | Financial records questionnaire | FORM | Assignee | Banking relationships, credit cards/lines of credit, outstanding loans, investment accounts, real estate holdings, retirement accounts, health insurance, prior accountant contact, known tax issues. |
| 9 | AI-generated engagement summary | AI_AUTOMATION | AI | Reviews all info → client profile: entity structure, key filing deadlines, risk areas (multi-state nexus, carryforwards, estimated tax history), recommended work calendar. |
| 10 | Initial document review | TODO | Coordinator | Review submitted docs, prior returns, financial records. Identify missing info, prior year errors/opportunities, carryforward items. |
| 11 | Client portal setup | TODO | Coordinator | Create portal account, configure folders by year/doc type, set up recurring reminders for quarterly estimated taxes and doc deadlines. |
| 12 | Kickoff call | TODO | Coordinator | Introduce assigned team, confirm scope, review deadlines, walk through portal, address initial review questions. |
| 13 | Onboarding complete acknowledgement | ACKNOWLEDGEMENT | Assignee | Client confirms onboarding is complete, portal access works, and they understand upcoming deadlines. |

---

## 1.4 Legal Client Intake & Matter Opening

**Industries:** Legal
**Trigger:** New client inquiry / matter request

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Client intake form | FORM | Assignee | Full legal name, entity type, contact info, practice area (Litigation/Corporate/Real Estate/Employment/Estate Planning/IP), matter description, opposing party names, referral source, urgency level. |
| 2 | Conflict of interest check | TODO | Coordinator | Run conflict check against firm's database for all parties: prospective client, opposing parties, related entities, affiliated persons. Document and classify as actual/potential/cleared. |
| 3 | Conflict exists? | SINGLE_CHOICE_BRANCH | Coordinator | Yes → conflict resolution review. No → matter evaluation. Ethical requirement under ABA Model Rules. |
| 4 | Conflict resolution review | APPROVAL | Coordinator | (Conflict path) Determine if waivable with informed consent, requires ethical wall, or is a hard conflict requiring decline. |
| 5 | Matter evaluation & staffing | TODO | Coordinator | Evaluate viability, complexity, fit. Determine fee arrangement (hourly/contingency/flat/hybrid), budget, staffing (lead attorney, associates, paralegals). |
| 6 | Accept this matter? | DECISION | Coordinator | Accept, decline with referral, or request more information. |
| 7 | AI-drafted engagement letter | AI_AUTOMATION | AI | Drafts engagement letter based on practice area, fee arrangement, matter description, staffing, firm's standard terms. Attorney reviews and finalizes. |
| 8 | Engagement letter execution | ACKNOWLEDGEMENT | Assignee | Client reviews and acknowledges: scope of representation, fee arrangement, billing rates, retainer requirements, attorney-client relationship terms. |
| 9 | Retainer payment processing | TODO | Coordinator | Process retainer deposit into IOLTA. Set up billing codes, matter number, timekeeper assignments in practice management system. |
| 10 | Supporting document upload | FILE_REQUEST | Assignee | All relevant documents: contracts, correspondence, court filings, financial records, photos, related materials. |
| 11 | AI-generated matter summary | AI_AUTOMATION | AI | Reviews uploaded docs and intake form → matter summary brief: key facts, timeline, legal issues, parties involved, preliminary research notes. |
| 12 | Client portal & matter setup | TODO | Coordinator | Set up portal access, create matter file structure (pleadings, correspondence, discovery, research), configure permissions and billing alerts. |
| 13 | Welcome & next steps | SYSTEM_EMAIL | System | Confirms engagement is active: assigned attorney contact, portal login, next steps, secure document sharing instructions. |

---

## 1.5 Insurance New Business Submission

**Industries:** Insurance
**Trigger:** New policy application from broker

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Insured information form | FORM | Assignee | Named insured, DBA, address, entity type, FEIN, SIC/NAICS code, years in business, revenue, employees, payroll, lines of coverage requested (GL, Property, WC, Auto, Umbrella, Professional Liability, Cyber). |
| 2 | ACORD application upload | FILE_REQUEST | Assignee | Completed ACORD 125 (Commercial Application) + supplemental forms: ACORD 126 (GL), 127 (Cyber), 130 (WC), 140 (Property). Signed and dated. |
| 3 | Loss run history upload | FILE_REQUEST | Assignee | 5-year loss runs from all carriers per line of coverage. Current within 60 days. Open/closed claims, incurred amounts, reserves. |
| 4 | Supplemental documentation | FILE_REQUEST | Assignee | 3 years financial statements, fleet schedule, property schedule with values/construction, safety programs, prior insurance certificates, inspection reports. |
| 5 | AI submission triage | AI_AUTOMATION | AI | Validates ACORD completeness, flags missing info, checks loss ratio trends, identifies appetite-fit by class code, generates submission quality score. |
| 6 | Complete and within appetite? | SINGLE_CHOICE_BRANCH | Coordinator | Yes → underwriting. No → additional info request. Underwriters triage 40–60 daily submissions — incomplete ones are returned immediately. |
| 7 | Additional information request | FORM | Assignee | (Incomplete path) Specific missing items: updated loss runs, financials, supplemental apps, inspection reports, exposure clarification. |
| 8 | Underwriting analysis | TODO | Coordinator | Full analysis: risk classification, premium development, loss projection, experience mod, schedule rating, comparable benchmarking, financial stability review. |
| 9 | AI loss analysis summary | AI_AUTOMATION | AI | Generates loss trend analysis: frequency/severity trends, large loss details, loss ratio by year/line, industry benchmarks, projected ultimate losses. Saves 20–30 min. |
| 10 | Underwriting decision | DECISION | Coordinator | Quote, decline, or refer to senior underwriting. Decline reasons documented. |
| 11 | Quote proposal delivery | FILE_REQUEST | Coordinator | Quote: coverage forms, limits, deductibles, premium by line, schedule rating detail, payment options, subjectivities, expiration date. |
| 12 | Bind request | APPROVAL | Assignee | Broker reviews with insured. Submits bind request: effective date, coverage selections, payment plan, agreement to subjectivities. |
| 13 | Subjectivity clearance | FILE_REQUEST | Assignee | Docs to clear binding subjectivities: signed applications, inspection access agreements, loss control plans. |
| 14 | Policy issuance | TODO | Coordinator | Generate policy docs, declarations pages, endorsements, certificates. Set up in management system with premium installments and commissions. |
| 15 | Policy delivery acknowledgement | ACKNOWLEDGEMENT | Assignee | Acknowledges receipt of policy documents and certificates. Confirms coverage details, dates, and premium are accurate. |

---

## 1.6 Vendor Onboarding

**Industries:** Cross-industry
**Trigger:** New vendor/supplier engagement

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Vendor registration form | FORM | Assignee | Company legal name, DBA, primary contact, business address, entity type, state of incorporation, years in business, DUNS number, revenue, employees, products/services, NAICS code. |
| 2 | W-9 / W-8BEN tax form | FILE_REQUEST | Assignee | Completed IRS W-9 (domestic) or W-8BEN/W-8BEN-E (foreign). Required for 1099 reporting compliance. |
| 3 | Insurance certificates | FILE_REQUEST | Assignee | CGL ($1M/occurrence min), Professional Liability/E&O, Workers' Comp (statutory), Auto Liability, Cyber Liability (if handling data). Company named as additional insured. |
| 4 | Compliance & diversity questionnaire | FORM | Assignee | OFAC/sanctions compliance, anti-bribery/FCPA policies, data privacy practices, diversity classifications (MBE/WBE/SDVOB/HUBZone/8(a)), conflict of interest disclosures, 3 client references. |
| 5 | AI vendor risk assessment | AI_AUTOMATION | AI | Risk score based on financial stability, industry risk, geographic risk, insurance adequacy, compliance maturity, adverse media/litigation screening. Flags sanctions matches, legal actions, negative news. |
| 6 | High-risk or sole-source? | SINGLE_CHOICE_BRANCH | Coordinator | Yes → additional due diligence + senior approval. No → standard compliance review. |
| 7 | Enhanced due diligence docs | FILE_REQUEST | Assignee | (High-risk path) Audited financials (2 years), SOC 2 Type II, BC/DR plan, 3 professional references. |
| 8 | Compliance review | TODO | Coordinator | Review questionnaire, verify insurance, validate diversity certs, screen against debarment lists (SAM.gov). Document findings. |
| 9 | Banking & payment setup | FORM | Assignee | Bank name, account name, routing/account numbers, payment preference (ACH/wire/check), payment terms (Net 30/45/60), remittance email, PO requirements. |
| 10 | Vendor agreement acknowledgement | ACKNOWLEDGEMENT | Assignee | Reviews and acknowledges: terms of service, payment terms, NDA/confidentiality, data protection addendum, indemnification, insurance requirements, termination provisions. |
| 11 | Procurement approval | APPROVAL | Coordinator | Reviews complete vendor file. Approves activation or requests more info. High-risk/sole-source escalates to VP/Director. |
| 12 | ERP/system setup | TODO | Coordinator | Create vendor master in ERP (SAP/Oracle/NetSuite). Configure payment terms, banking, tax classification, GL coding, approved purchase categories. |
| 13 | Vendor activation notification | SYSTEM_EMAIL | System | Confirms activation: vendor ID, PO process instructions, invoice submission requirements, payment schedule, procurement contact. |

---

## 1.7 Partner / Channel Onboarding

**Industries:** Cross-industry
**Trigger:** New partner agreement

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Partner application form | FORM | Assignee | Company name, contact info, website, partner type (Reseller/Referral/Technology-ISV/SI/MSP), target market, geographic coverage, sales rep count, revenue, customer base size. |
| 2 | Partner qualification questionnaire | FORM | Assignee | Technical certifications, sales team experience, implementation capacity, marketing resources, existing partnerships (complementary/competitive), target deal size, first-year revenue commitment. |
| 3 | Partner type determination | SINGLE_CHOICE_BRANCH | Coordinator | Reseller/MSP → reseller path (pricing/margins, deal registration, demo env). Referral → simpler path (referral fee, lead submission). |
| 4 | Partnership agreement acknowledgement | ACKNOWLEDGEMENT | Assignee | Partner tier and benefits, commission/margin schedule, territory rules, deal registration policies, co-marketing fund terms, performance requirements, termination provisions. |
| 5 | NDA execution | ACKNOWLEDGEMENT | Assignee | Mutual NDA covering product info, pricing, roadmap, customer data shared during partnership. |
| 6 | Portal & demo environment setup | TODO | Coordinator | Provision: deal registration system, marketing assets, sales playbooks, battle cards, pricing calculator, demo/sandbox environment, tier permissions. |
| 7 | Sales certification training | TODO | Assignee | Required modules: product knowledge, sales methodology (discovery, demo, objections), pricing/quoting. Must pass certification exam. |
| 8 | Technical certification training | TODO | Assignee | Product architecture, deployment, integrations/API, configuration, troubleshooting, support escalation. Must pass hands-on assessment. |
| 9 | AI-generated go-to-market plan | AI_AUTOMATION | AI | Customized GTM plan based on partner's market, geography, capabilities: recommended activities, target accounts, webinar topics, content co-creation, quarterly pipeline targets. |
| 10 | Go-to-market plan review | APPROVAL | Coordinator | Reviews GTM plan with partner. Finalizes targets, activities, co-marketing fund allocation. |
| 11 | First deal registration | FORM | Assignee | Prospect company name, contact info, estimated deal size, expected close date, competitive situation, partner's role. Validates process understanding. |
| 12 | Launch readiness confirmation | TODO | Coordinator | Verify all milestones: agreements signed, portal active, certifications passed, GTM approved, first deal registered. Schedule first partner QBR. |
| 13 | Partner launch announcement | SYSTEM_EMAIL | System | Confirms partnership is active: portal URL, support contact, deal registration link, tier benefits summary, performance targets. |

---

## 1.8 Contractor Onboarding

**Industries:** Cross-industry
**Trigger:** New contractor engagement

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Contractor information form | FORM | Assignee | Full legal/business name, email, phone, address, entity type, citizenship/work authorization status. |
| 2 | Engagement details form | FORM | Coordinator | Project name, department, start/end dates, rate type (hourly/daily/project), agreed rate, budget, work location, hiring manager, business justification. |
| 3 | Worker classification assessment | FORM | Coordinator | Structured IRS-aligned assessment: Does worker control how/when work is performed? Own tools? Defined project with deliverable? Serves other clients? |
| 4 | AI classification risk check | AI_AUTOMATION | AI | Analyzes responses against IRS 20-factor test and DOL economic reality test. Outputs Low/Medium/High risk with specific factors of concern. |
| 5 | Classification risk? | SINGLE_CHOICE_BRANCH | Coordinator | Medium/High → legal/HR review. Low → proceed. Misclassification carries significant back-tax liability and penalties. |
| 6 | Classification review | APPROVAL | Coordinator | (Risk path) HR/Legal reviews assessment and AI analysis. Approves contractor classification, recommends restructuring, or recommends W-2 hire. |
| 7 | SOW / contractor agreement | ACKNOWLEDGEMENT | Assignee | Scope, deliverables, rate, payment terms, timeline, IP assignment, confidentiality, termination provisions, independent contractor acknowledgement. |
| 8 | NDA execution | ACKNOWLEDGEMENT | Assignee | Covers confidential information, trade secrets, proprietary materials accessed during engagement. |
| 9 | W-9 tax form | FILE_REQUEST | Assignee | Completed IRS W-9. Required for 1099-NEC reporting if payments exceed $600/year. |
| 10 | Insurance verification | FILE_REQUEST | Assignee | General liability, professional liability/E&O, workers' comp (if contractor has employees). Requirements vary by engagement type. |
| 11 | Payment setup form | FORM | Assignee | Bank routing/account numbers, payment method (ACH/wire/check/platform), invoice instructions, payment terms (Net 15/30). |
| 12 | System access provisioning | TODO | Coordinator | Provision project-scoped access: email alias, project tools, code repos, shared drives, VPN, communication platforms. |
| 13 | AP/finance setup | TODO | Coordinator | Set up in AP system: vendor record, payment terms, rate/budget tracking, cost center, 1099 configuration. |
| 14 | Onboarding complete | ACKNOWLEDGEMENT | Coordinator | Confirms all agreements signed, tax forms received, payment configured, access provisioned. Contractor cleared to begin. |

---

## 1.9 Employee Onboarding

**Industries:** Cross-industry
**Trigger:** Offer accepted

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Personal information form | FORM | Assignee | Full legal name, preferred name, DOB, personal email, phone, home address, emergency contact, shirt size (swag), dietary restrictions (orientation), preferred pronouns. |
| 2 | Offer letter acknowledgement | ACKNOWLEDGEMENT | Assignee | Confirms: title, department, manager, start date, compensation, bonus eligibility, equity grant, at-will status. |
| 3 | Employment agreement & policies | ACKNOWLEDGEMENT | Assignee | At-will acknowledgement, NDA/confidentiality, IP assignment, non-solicitation, handbook acknowledgement, arbitration, e-communications consent. |
| 4 | W-4 tax withholding | FILE_REQUEST | Assignee | Completed IRS W-4 (filing status, dependents, additional withholding) + state W-4 equivalent if applicable. |
| 5 | I-9 Section 1 | FORM | Assignee | Legal name, other names used, address, DOB, citizenship/immigration status, USCIS/alien number. Must be completed by first day. |
| 6 | I-9 document upload | FILE_REQUEST | Assignee | List A (US Passport, Permanent Resident Card) OR List B (Driver's License) + List C (Social Security Card, Birth Certificate). |
| 7 | I-9 verification | TODO | Coordinator | Examine original I-9 documents (physically or virtually), complete Section 2, record details. Must be done within 3 business days of start. E-Verify if participating. |
| 8 | Direct deposit setup | FORM | Assignee | Bank routing/account numbers, account type (checking/savings), allocation if splitting between accounts. |
| 9 | Benefits enrollment | FORM | Assignee | Medical (PPO/HMO/HDHP), dental, vision, life insurance, disability (STD/LTD), HSA/FSA, 401(k) contribution %, dependent/beneficiary info. 30-day enrollment window. |
| 10 | Remote or relocating? | SINGLE_CHOICE_BRANCH | Coordinator | Remote → ship equipment. On-site → desk setup and office assignment. |
| 11 | Equipment provisioning | TODO | Coordinator | Laptop (OS, security, VPN), monitors, peripherals, headset, role-specific hardware. Remote: ship with tracking. On-site: stage at desk. |
| 12 | System access & accounts | TODO | Coordinator | Corporate email, SSO, Slack/Teams, HR system, payroll, role-specific apps (Salesforce/Jira/GitHub), building/badge access. |
| 13 | AI-generated first-week schedule | AI_AUTOMATION | AI | Personalized schedule based on department, role, team size: Day 1 orientation, IT setup, manager 1:1, team lunch, HR benefits review, buddy intro, role training. |
| 14 | First-day orientation | TODO | Coordinator | Company overview, org chart, office tour (or virtual walkthrough), security/safety, HR policies, benefits walkthrough, Q&A. |
| 15 | Manager welcome & 30-day plan | ACKNOWLEDGEMENT | Coordinator | Confirms first-week schedule set, buddy assigned, team intros scheduled, 30/60/90-day goals prepared. Handoff from HR to team. |

---

# 2. Sales & Evaluation

> **Buyer intent:** "I need to structure a pre-sale process."

## 2.1 Guided Product Trial

**Industries:** SaaS, Technology
**Trigger:** Prospect requests structured trial

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Trial registration form | FORM | Assignee | Company name, industry, team size, primary use case, current tools, key goals, preferred start date. |
| 2 | AI generates personalized trial plan | AI_AUTOMATION | AI | Analyzes registration data → customized trial plan with recommended features, milestones, and 14-day timeline tailored to industry and use case. |
| 3 | Trial environment setup | TODO | Coordinator | Provision trial environment, configure sample data for prospect's industry, send login credentials. |
| 4 | Trial plan acknowledgement | ACKNOWLEDGEMENT | Assignee | Reviews personalized trial plan, timeline, and success milestones. |
| 5 | Week 1 check-in survey | FORM | Assignee | Features explored (multi-select), ease of setup (1–5), blockers encountered, questions, overall impression (1–5). |
| 6 | Mid-trial usage review | AI_AUTOMATION | AI | Analyzes usage data and survey → mid-trial engagement summary: feature adoption, risk signals, recommended next actions. |
| 7 | Guided demo of advanced features | TODO | Coordinator | Personalized demo of advanced features based on mid-trial summary. |
| 8 | Week 2 check-in survey | FORM | Assignee | Most valuable features, integration needs, team members who tried it, likelihood to purchase (1–10), remaining concerns. |
| 9 | Integration/technical requirements upload | FILE_REQUEST | Assignee | Technical requirements, integration specs, security questionnaires, IT policies. |
| 10 | AI drafts trial summary & ROI analysis | AI_AUTOMATION | AI | Trial results: usage metrics, feature adoption, estimated ROI, comparison to current tools. |
| 11 | Trial outcome decision | DECISION | Coordinator | Convert to paid / extend trial / close — no fit. Routes to different follow-up paths. |
| 12 | Proposal delivery | FILE_REQUEST | Coordinator | Formal pricing proposal/quote for prospect review. |
| 13 | Proposal review & sign-off | APPROVAL | Assignee | Reviews proposal, approves to move forward or requests modifications. |

---

## 2.2 Pilot Program Evaluation

**Industries:** Technology, Enterprise SaaS
**Trigger:** Enterprise prospect requests pilot

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Pilot scope & objectives form | FORM | Assignee | Business unit, duration (30/60/90 days), pilot user count, primary success metrics (adoption rate, time savings, cost reduction, error reduction, satisfaction), target KPIs, budget, executive sponsor. |
| 2 | Success criteria document upload | FILE_REQUEST | Coordinator | Formal success criteria: measurable outcomes, data collection methods, pass/fail thresholds. |
| 3 | Success criteria sign-off | ACKNOWLEDGEMENT | Assignee | Acknowledges success criteria, evaluation methodology, and timeline. |
| 4 | AI generates pilot project plan | AI_AUTOMATION | AI | Detailed plan: phases, milestones, resource allocation, risk mitigations, communication cadence. |
| 5 | Technical environment setup | TODO | Coordinator | Provision with production-like config, SSO, sample data, user accounts. |
| 6 | Pilot kickoff acknowledgement | ACKNOWLEDGEMENT | Assignee | Pilot users acknowledge access, training materials, timeline, and responsibilities. |
| 7 | Bi-weekly status report | FORM | Assignee | Active users, key activities, issues encountered, tickets raised, user sentiment (R/Y/G), risks/blockers. |
| 8 | Mid-pilot review | AI_AUTOMATION | AI | Aggregates status reports, usage data, tickets → mid-pilot health assessment with trends and risk flags. |
| 9 | Mid-pilot steering committee review | APPROVAL | Assignee | Continue as-is, adjust scope, or terminate early. |
| 10 | Final pilot data collection | FILE_REQUEST | Assignee | Final metrics, user survey results, outcome evidence. |
| 11 | AI generates evaluation report | AI_AUTOMATION | AI | Results vs. success criteria, quantified business impact, user feedback themes, data-driven recommendation. |
| 12 | Go/No-Go decision | DECISION | Assignee | Approve full rollout / extend with modifications / discontinue. Documented rationale. |
| 13 | Contract negotiation terms | FORM | Coordinator | Proposed term, license count, pricing tier, implementation timeline, SLA requirements, special terms. |
| 14 | Final contract sign-off | ESIGN | Assignee | E-signature on enterprise license agreement. |

---

## 2.3 Proposal & SOW Delivery

**Industries:** Cross-industry B2B
**Trigger:** Post-discovery / qualification

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Proposal request details | FORM | Coordinator | Client company, opportunity value, products/services proposed, contract term, implementation timeline, key stakeholders, special requirements. |
| 2 | AI drafts proposal narrative | AI_AUTOMATION | AI | Generates executive summary, solution overview, and value proposition from request details and discovery notes. |
| 3 | Draft proposal & SOW upload | FILE_REQUEST | Coordinator | Draft proposal with scope, deliverables, timeline, pricing, terms. |
| 4 | Internal review & approval | APPROVAL | Coordinator | Reviews pricing accuracy, margin compliance, resource feasibility, strategic alignment. |
| 5 | Proposal delivery to client | SYSTEM_EMAIL | System | Delivers approved proposal and SOW with personalized cover message. |
| 6 | Proposal acknowledgement | ACKNOWLEDGEMENT | Assignee | Acknowledges receipt and confirms review timeframe. |
| 7 | Client Q&A submission | FORM | Assignee | Questions about scope, pricing, timeline, terms. Request meeting for discussion (yes/no). |
| 8 | AI summarizes client questions | AI_AUTOMATION | AI | Categorizes questions, flags deal risk signals, suggests response talking points. |
| 9 | Q&A response & negotiation notes | FILE_REQUEST | Coordinator | Formal Q&A response document with any revised pricing/scope. |
| 10 | Revised proposal upload | FILE_REQUEST | Coordinator | Revised proposal/SOW incorporating negotiated changes (or confirmation doc if no changes). |
| 11 | Client final review | APPROVAL | Assignee | Approves final proposal or requests additional changes. |
| 12 | SOW e-signature | ESIGN | Assignee | Signs Statement of Work to formalize engagement. |
| 13 | Handoff to delivery team | TODO | Coordinator | Create project, introduce client to implementation lead, transfer discovery notes and signed docs. |

---

## 2.4 RFP Response Coordination

**Industries:** Cross-industry
**Trigger:** RFP received from prospect

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | RFP intake & details | FORM | Coordinator | Issuing organization, title, deadline, deal value, contact, requirement count, evaluation criteria, known competitors. |
| 2 | RFP document upload | FILE_REQUEST | Coordinator | Complete RFP package: requirements, evaluation criteria, submission instructions, addenda. |
| 3 | Go/No-Go evaluation | DECISION | Coordinator | Evaluate against: solution fit, win probability, resource availability, strategic value. Pursue or decline. |
| 4 | AI analyzes RFP requirements | AI_AUTOMATION | AI | Parses RFP, extracts all requirements, categorizes by department (product, security, legal, pricing), identifies gaps, creates response assignment matrix. |
| 5 | Response kickoff & assignments | FORM | Coordinator | Response sections assigned (section name, owner, due date), writing/review/design deadlines, submission method, compliance checklist. |
| 6 | Technical response upload | FILE_REQUEST | Coordinator | Architecture, integrations, security, scalability, infrastructure sections. |
| 7 | Security & compliance response upload | FILE_REQUEST | Coordinator | Certifications, data handling, incident response, audit reports. |
| 8 | Pricing & commercial terms | FILE_REQUEST | Coordinator | Cost breakdown, licensing model, payment terms, volume discounts. |
| 9 | Legal terms & exceptions | FILE_REQUEST | Coordinator | Redlines, proposed contract modifications, term exceptions. |
| 10 | AI assembles & reviews draft | AI_AUTOMATION | AI | Compiles all sections, checks consistency, identifies gaps/contradictions, generates executive summary. |
| 11 | Internal review & quality check | APPROVAL | Coordinator | Completeness, accuracy, formatting, compliance with submission requirements. |
| 12 | Executive sign-off | APPROVAL | Coordinator | Final approval of complete RFP response before submission. |
| 13 | RFP submission confirmation | TODO | Coordinator | Submit via specified channel. Confirm receipt with prospect's procurement team. |
| 14 | Post-submission debrief | FORM | Coordinator | Submission confirmed, sections completed, known weaknesses, competitive intel, next expected milestone, lessons learned. |

---

# 3. Account Management

> **Buyer intent:** "I need to manage an ongoing client relationship."

## 3.1 Quarterly Business Review (QBR)

**Industries:** SaaS, Professional Services, B2B
**Trigger:** Quarterly cadence (first 10 business days of quarter)

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Pre-QBR data collection | FORM | Coordinator | Account name, renewal date, current ARR, products in use, support tickets this quarter, NPS score, key wins, open issues. |
| 2 | AI generates QBR content | AI_AUTOMATION | AI | Usage analytics summary, ROI calculations, support trends, feature adoption heatmap, industry benchmarks comparison. |
| 3 | QBR presentation upload | FILE_REQUEST | Coordinator | QBR deck with AI insights, customized recommendations, proposed next-quarter objectives. |
| 4 | Internal prep review | APPROVAL | Coordinator | Strategic alignment check, expansion opportunities identified. Approved before client meeting. |
| 5 | Client pre-QBR survey | FORM | Assignee | Overall satisfaction (1–10), areas meeting/not meeting expectations, top 3 priorities next quarter, feature requests, reference willingness. |
| 6 | AI summarizes client feedback | AI_AUTOMATION | AI | Sentiment patterns, at-risk areas, suggested discussion points. |
| 7 | QBR meeting completion | TODO | Coordinator | Present performance data, discuss feedback, review roadmap, align on next-quarter goals. |
| 8 | Meeting notes & action items | FORM | Coordinator | Date, attendees, discussion points, client feedback themes, action items, expansion opportunities, risk items. |
| 9 | Action items acknowledgement | ACKNOWLEDGEMENT | Assignee | Acknowledges QBR summary, action items, owners, and deadlines. |
| 10 | Signed QBR summary upload | FILE_REQUEST | Coordinator | Finalized summary with action items, owners, deadlines, commitments. |
| 11 | Internal debrief | TODO | Coordinator | Log outcomes in CRM, update health score, create follow-up tasks, flag escalations. |

---

## 3.2 Annual Renewal

**Industries:** SaaS, Professional Services, any subscription/contract business
**Trigger:** 90 days before contract expiration

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Renewal kickoff details | FORM | Coordinator | Account name, contract end date, current ARR, license count, products, auto-renewal clause (Y/N), known risks, upsell opportunities. |
| 2 | AI renewal health analysis | AI_AUTOMATION | AI | Analyzes usage data, support history, NPS trends, engagement metrics → renewal risk assessment with health score and strategy recommendation. |
| 3 | Usage & value report upload | FILE_REQUEST | Coordinator | Feature adoption, active users, value delivered, actual vs. contracted usage. |
| 4 | Client renewal survey | FORM | Assignee | Product satisfaction (1–10), support satisfaction (1–10), most/least used features, interest in additional products, budget changes expected, decision timeline, other vendors being evaluated. |
| 5 | AI drafts renewal proposal | AI_AUTOMATION | AI | Personalized proposal: usage-based right-sizing, pricing options (flat/expansion/multi-year), value summary tailored to survey responses. |
| 6 | Internal pricing approval | APPROVAL | Coordinator | Proposed pricing, discounts, concessions, overall strategy approved before client presentation. |
| 7 | Renewal proposal upload | FILE_REQUEST | Coordinator | Formal proposal: pricing, terms, new scope additions. |
| 8 | Client proposal review | DECISION | Assignee | Accept as-is / negotiate terms / downgrade-reduce / will not renew. |
| 9 | Negotiation notes & revised terms | FORM | Coordinator | Client's requested changes, revised pricing, modifications, concessions, final agreed pricing. |
| 10 | Final renewal approval | APPROVAL | Assignee | Approves final terms after negotiation. |
| 11 | Renewal contract e-signature | ESIGN | Assignee | Signs renewal contract or order form. |
| 12 | Renewal confirmation | ACKNOWLEDGEMENT | Assignee | Acknowledges renewal complete, confirms any changes to terms/pricing/scope. |
| 13 | Post-renewal CRM update | TODO | Coordinator | Update contract dates, ARR, license count, committed deliverables. Set next renewal reminders (90 days out). |

---

## 3.3 Client Health Check

**Industries:** SaaS, Professional Services
**Trigger:** Health score drop / key contact change / scheduled pulse check

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Health check trigger details | FORM | Coordinator | Account name, trigger reason (scheduled/score drop/contact change/escalation/low usage/renewal approaching), current health (R/Y/G), last QBR date, days to renewal. |
| 2 | AI account health summary | AI_AUTOMATION | AI | Usage trends, support ticket history, NPS, login frequency, feature adoption → comprehensive health dashboard with risk indicators. |
| 3 | Client satisfaction survey | FORM | Assignee | Overall satisfaction (1–10), NPS (0–10), product meeting expectations, support responsiveness, areas for improvement, upcoming business changes, interest in new features. |
| 4 | AI analyzes survey & generates insights | AI_AUTOMATION | AI | Cross-references survey with historical data → churn risk level, root causes, prioritized action plan with specific recommendations. |
| 5 | Internal risk assessment | FORM | Coordinator | Risk level (H/M/L), primary risk factors (low usage, poor support, budget, champion loss, competitive threat, missing features), recommended intervention, executive escalation needed (Y/N). |
| 6 | Executive escalation review | APPROVAL | Coordinator | (High-risk accounts) Reviews risk assessment, approves intervention plan including concessions, dedicated resources, executive involvement. |
| 7 | Health check meeting | TODO | Coordinator | Address concerns, gather qualitative feedback, discuss roadmap, build relationship. |
| 8 | Meeting outcomes & action plan | FORM | Coordinator | Date, attendees, concerns raised, positive feedback, action items with owners, follow-up commitments, updated risk level. |
| 9 | Action plan acknowledgement | ACKNOWLEDGEMENT | Assignee | Acknowledges action plan, timeline for addressing concerns, next check-in date. |
| 10 | Action plan documentation upload | FILE_REQUEST | Coordinator | Formalized plan with deliverables, owners, timelines, success metrics. |
| 11 | Follow-up completion | TODO | Coordinator | Confirm all items complete or on track. Update health score. Schedule next proactive check-in. |

---

## 3.4 Billing Dispute Resolution

**Industries:** Cross-industry
**Trigger:** Client raises billing dispute

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Dispute intake form | FORM | Assignee | Invoice number(s), dispute amount, category (overcharge/duplicate/incorrect rate/unauthorized service/service not delivered/tax discrepancy), description, expected correct amount, preferred resolution (credit/refund/adjustment). |
| 2 | Supporting documentation upload | FILE_REQUEST | Assignee | Contract excerpts, previous invoices, correspondence, screenshots, evidence. |
| 3 | AI pre-analyzes dispute | AI_AUTOMATION | AI | Analyzes dispute against uploaded docs, cross-references contract terms → preliminary assessment: validity likelihood, relevant contract clauses, suggested resolution path. |
| 4 | Internal investigation | TODO | Coordinator | Review dispute, pull billing records, verify against contract, check system logs. Determine valid/partially valid/invalid. |
| 5 | Investigation findings | FORM | Coordinator | Valid (Y/Partial/N), root cause (system error/rate change not applied/contract misinterpretation/duplicate/provisioning error/misunderstanding), confirmed dispute amount, recommended resolution, credit/refund amount. |
| 6 | Investigation evidence upload | FILE_REQUEST | Coordinator | Billing system screenshots, contract terms, audit logs, calculation worksheets. |
| 7 | Resolution approval | APPROVAL | Coordinator | Finance manager reviews findings and proposed resolution. Approves credit/refund or requests more investigation. |
| 8 | Resolution notification | SYSTEM_EMAIL | System | Communicates outcome: investigation result, approved resolution, processing timeline. |
| 9 | Resolution acceptance | DECISION | Assignee | Accept resolution / escalate dispute / provide additional information. |
| 10 | Credit memo / adjustment processing | TODO | Coordinator | Process credit memo, refund, or invoice adjustment. Generate corrected invoice or credit note. |
| 11 | Corrected invoice upload | FILE_REQUEST | Coordinator | Corrected invoice, credit memo, or refund confirmation. |
| 12 | Resolution acknowledgement | ACKNOWLEDGEMENT | Assignee | Confirms dispute resolved, receipt of credit/corrected invoice. |
| 13 | Root cause log | TODO | Coordinator | Document root cause, update processes to prevent recurrence, close case. |

---

# 4. Service Delivery

> **Buyer intent:** "I need to deliver work to a client."

## 4.1 Implementation Kickoff

**Industries:** SaaS, Professional Services
**Trigger:** New customer contract signed / sales handoff

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Sales-to-CS handoff form | FORM | Coordinator | Deal summary, contract terms, licensed modules, ARR, CSM assignment, implementation tier (Standard/Premium/Enterprise), key stakeholders, custom commitments, target go-live. |
| 2 | AI implementation brief | AI_AUTOMATION | AI | Parses handoff and SOW → implementation brief: modules purchased, integration requirements, complexity score (L/M/H), suggested timeline, risk flags, recommended playbook. |
| 3 | Resource assignment | FORM | Coordinator | Implementation consultant, technical lead, solutions architect, training specialist. Estimated hours per role, availability, scheduling constraints. |
| 4 | Customer stakeholder identification | FORM | Assignee | Executive sponsor, project lead, IT/technical lead, department leads per module, third-party vendors. Each with role: Decision Maker / Influencer / End User Champion / Technical Resource. |
| 5 | Pre-kickoff requirements questionnaire | FORM | Assignee | Current systems, data migration scope, integration endpoints, business process docs, compliance requirements, user count by role, known blockers. |
| 6 | AI-generated project plan | AI_AUTOMATION | AI | Phased timeline (Discovery → Configuration → Migration → Integration → UAT → Training → Go-Live), milestone dates, RACI matrix draft, risk register with mitigations. |
| 7 | Environment provisioning | TODO | Coordinator | Tenant creation, SSO/SAML config, sandbox setup, API keys, IP whitelisting, admin accounts, license activation. |
| 8 | Project plan review & approval | APPROVAL | Assignee | Executive sponsor reviews plan, timeline, RACI, resource commitments. Approves or requests modifications. |
| 9 | Kickoff meeting notification | SYSTEM_EMAIL | System | Calendar invite + agenda to all stakeholders: introductions, scope confirmation, timeline, communication cadence, escalation path, next steps. |
| 10 | Kickoff acknowledgement | ACKNOWLEDGEMENT | Assignee | Confirms: scope/timeline understood, resource commitments confirmed, communication plan accepted, data/access prerequisites and due dates understood. |
| 11 | Access & credentials distribution | TODO | Coordinator | Distribute environment logins, project tool invites, shared doc repos, communication channels, knowledge base access. |
| 12 | Post-kickoff internal debrief | FORM | Coordinator | Engagement level (1–5), risks identified, scope clarifications needed, resource adjustments, confidence score for on-time delivery, immediate action items. |

---

## 4.2 Project Milestone Review

**Industries:** Professional Services, Consulting, Agencies
**Trigger:** Milestone deliverable ready for review

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Milestone deliverable submission | FORM | Coordinator | Milestone name/number, deliverable description, acceptance criteria (from SOW), completion evidence, deviations from scope, hours consumed vs. budgeted. |
| 2 | Deliverable artifact upload | FILE_REQUEST | Coordinator | Configuration docs, test results, migration validation reports, screenshots/recordings, updated project plan. |
| 3 | AI quality assurance check | AI_AUTOMATION | AI | Reviews deliverables against SOW acceptance criteria → compliance checklist, gaps identified, completeness score, flagged items. |
| 4 | Internal QA review | APPROVAL | Coordinator | All acceptance criteria met, docs client-ready, test coverage adequate, no defects above threshold. |
| 5 | Client milestone review package | SYSTEM_EMAIL | System | Executive summary, deliverable inventory, acceptance criteria checklist, metrics (timeline/budget adherence), review instructions with 5 business day review period. |
| 6 | Client review & feedback | FORM | Assignee | Per-criterion assessment (Accepted / Accepted with Comments / Rejected), specific feedback, change requests, overall assessment. |
| 7 | Milestone disposition | SINGLE_CHOICE_BRANCH | Assignee | Approved → sign-off. Conditionally Approved → remediation plan (minor items, doesn't block next milestone). Rejected → remediation & resubmission. |
| 8 | Milestone sign-off | ACKNOWLEDGEMENT | Assignee | (Approved path) Formal acceptance per SOW. Triggers billing milestone and next phase. |
| 9 | Remediation plan | FORM | Coordinator | (Conditional/Rejected path) Each item: description, severity, owner, target date, downstream impact. Change request reference if scope creep. |
| 10 | Change request processing | FORM | Coordinator | (If out-of-scope items) CR number, description, impact assessment (timeline/cost/resources), SOW amendment language. |
| 11 | Change request approval | APPROVAL | Assignee | Reviews and approves/rejects CR including cost and timeline adjustments. |
| 12 | Milestone completion report | AI_AUTOMATION | AI | Actual vs. planned timeline, budget consumed, lessons learned, risk register updates, forecast for remaining milestones, project health score with trend. |

---

## 4.3 Go-Live / Launch Readiness

**Industries:** SaaS, Technology
**Trigger:** All implementation milestones complete

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Go-live readiness assessment | FORM | Coordinator | All milestones signed off (Y/N with dates), open defect count by severity, data migration validation, integration testing status, performance/load test results, security review, training completion %, rollback plan documented, cutover window confirmed. |
| 2 | Go/No-Go criteria validation | AI_AUTOMATION | AI | Evaluates against criteria: zero P1/P2 defects, migration reconciliation balanced, integrations passing, >95% training completion, rollback tested, support briefed, monitoring configured. Readiness scorecard with R/Y/G per criterion. |
| 3 | UAT sign-off upload | FILE_REQUEST | Assignee | Signed UAT completion certificate, test execution summary, accepted known issues with workarounds, business-critical scenario validation. |
| 4 | Technical readiness certification | APPROVAL | Coordinator | Infrastructure, SSL, DNS, backup/DR tested, monitoring, security hardening, audit logging, env-specific configs. |
| 5 | Operational readiness confirmation | FORM | Coordinator | Support runbook documented, L1/L2/L3 escalation path, on-call rotation for hypercare, known issue database, customer comms templates, SLA monitoring configured. |
| 6 | Go/No-Go decision | DECISION | Coordinator | Go / Go with Conditions / No-Go (postpone with new target). |
| 7 | Client go-live authorization | APPROVAL | Assignee | Executive sponsor authorizes cutover. Acknowledges: cutover window, rollback criteria, hypercare terms, "Go with Conditions" items. |
| 8 | Production cutover execution | TODO | Coordinator | Execute cutover plan: data migration, DNS cutover, legacy decommission, SSO activation, integration switch, smoke tests, critical flow verification. |
| 9 | Post-cutover smoke test verification | FORM | Coordinator | Each critical flow: tested, pass/fail, issues and resolution, performance baseline, integration data flow confirmed. |
| 10 | Go-live confirmation | SYSTEM_EMAIL | System | Production URL, timestamp, hypercare contacts, known issues/workarounds, support channels, escalation procedures, check-in cadence. |
| 11 | Go-live acknowledgement | ACKNOWLEDGEMENT | Assignee | System accessible and operational. Hypercare period (2–4 weeks), SLAs, issue vs. enhancement reporting, review meeting schedule. |
| 12 | Hypercare monitoring | FORM | Coordinator | (Daily → twice-weekly) New issues, issues resolved, uptime %, adoption metrics, performance vs. baseline, training gaps. |
| 13 | Hypercare exit review | AI_AUTOMATION | AI | Issue volume trend, open inventory, stability metrics, adoption vs. targets, ticket categorization (defect/training/enhancement), exit or extend recommendation. |
| 14 | Hypercare exit & steady-state transition | APPROVAL | Assignee | Standard SLA now applies, implementation team rolling off, ongoing support channel, CSM transition, first Business Review scheduled. |
| 15 | Project closure | FORM | Coordinator | Final metrics, client satisfaction score, lessons learned, reusable assets, reference/case study willingness, project archive. |

---

## 4.4 Insurance Claims Processing

**Industries:** Insurance (P&C)
**Trigger:** Loss event reported

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | First Notice of Loss (FNOL) | FORM | Assignee | Policy number, insured name/contact, date/time/location of loss, loss type (auto collision/property damage/theft/liability/weather-CAT), incident description, injured parties, police/fire report number, other carriers, witnesses, initial damage estimate. |
| 2 | FNOL triage & coverage verification | AI_AUTOMATION | AI | Validates policy active on date of loss, confirms coverage matches loss type, checks exclusions/endorsements, identifies deductible, flags fraud indicators (recently bound, prior similar claims), assigns severity (Minor/Moderate/Major/CAT), routes to claims unit. |
| 3 | Claim acknowledgement & assignment | SYSTEM_EMAIL | System | Claim number, adjuster name/contact, next steps, documentation requirements, state fair claims settlement act timelines, estimated adjuster contact timeline. |
| 4 | Adjuster assignment & initial review | FORM | Coordinator | Assigns adjuster by loss type/severity/geography/workload. Reviews FNOL, declarations, endorsements, AI triage report. Initial reserve recommendation (indemnity + expense + rationale). |
| 5 | Loss documentation & evidence | FILE_REQUEST | Assignee | Photos/video of damage, police/incident report, medical records (if injury), repair estimates, receipts/proof of ownership, witness statements, other carrier info. |
| 6 | Investigation & damage assessment | FORM | Coordinator | Scene inspection notes, recorded statement summary, liability assessment (% fault per party), IME referral (if applicable), expert report findings, subrogation potential, fraud referral recommendation. |
| 7 | Fraud / SIU referral decision | SINGLE_CHOICE_BRANCH | Coordinator | No SIU → coverage determination. SIU referral → investigation before proceeding. Deny for misrepresentation → denial path. |
| 8 | Coverage determination | FORM | Coordinator | Covered perils confirmed, exclusions reviewed, conditions met (timely notice, cooperation, proof of loss), sublimits, other insurance/coordination, determination: Full coverage / Partial / Denial (with basis). |
| 9 | AI damage valuation | AI_AUTOMATION | AI | Property: photos + estimates vs. historical comparables, material/labor cost databases, local rates. Auto: vehicle valuation (CCC/Mitchell comparable). Injury: medical docs vs. treatment guidelines. Output: settlement range (low/mid/high), reserve adjustment, valuation discrepancies. |
| 10 | Settlement recommendation | FORM | Coordinator | Itemized damage breakdown, applicable deductible, depreciation (ACV vs. replacement cost), prior damage deductions, total recommended settlement, authority level required. |
| 11 | Settlement authority approval | APPROVAL | Coordinator | Reviews coverage analysis, investigation, valuation, recommendation. Approves, modifies, or requests more investigation. Above-threshold → director/committee. |
| 12 | Claimant settlement acceptance | DECISION | Assignee | Accept (sign release → payment) / Counter (with documentation) / Invoke appraisal (property) / Dispute-retain counsel. |
| 13 | Release & payment processing | ACKNOWLEDGEMENT | Assignee | E-signs settlement release: amount, releases carrier, payment method (check/ACH/directed to provider), payee info. |
| 14 | Payment & subrogation | AI_AUTOMATION | AI | Processes payment, evaluates subrogation potential, calculates recovery amount if third-party liability, generates demand letter draft, creates subrogation case file. Triggers accounting system payment and 1099 if applicable. |
| 15 | Claim closure & compliance audit | TODO | Coordinator | All payments cleared, reserves released/adjusted, documentation filed per retention requirements, state regulatory obligations met, subrogation transferred (if applicable), satisfaction survey triggered. Closed or Closed-Subrogation Pending. |

---

## 4.5 Residential Purchase Transaction

**Industries:** Real Estate
**Trigger:** Purchase agreement executed

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Executed purchase agreement intake | FORM | Coordinator | Property address/APN, buyer/seller names, purchase price, EMD amount/due date, loan type/amount, contingency periods (inspection/appraisal/loan — typically 17/17/21 days), COE date, inclusions/exclusions, seller concessions, addenda. |
| 2 | Escrow opening & EMD tracking | TODO | Coordinator | Send RPA to escrow/title, confirm escrow number, verify EMD delivered (3 business days), obtain receipt, order preliminary title report, distribute escrow instructions. |
| 3 | Preliminary title report review | FILE_REQUEST | Coordinator | Title delivers prelim: vesting, legal description, tax status, liens/encumbrances, easements, CC&Rs, title exceptions, clearance requirements. Buyer reviews for unacceptable conditions. |
| 4 | Inspection scheduling | TODO | Coordinator | Coordinate within contingency period: general home, termite/pest, sewer lateral, roof, chimney, pool/spa, well/septic, specialized (mold/asbestos/lead for pre-1978). |
| 5 | Inspection reports & disclosures | FILE_REQUEST | Assignee | Seller provides: TDS (Transfer Disclosure Statement), SPQ, NHD (Natural Hazard Disclosure), lead-based paint (pre-1978), HOA docs. All inspection reports uploaded. |
| 6 | Buyer inspection review & repair request | FORM | Assignee | Items accepted as-is, Request for Repair items, deal-breakers. Disposition: proceed with repair negotiation / accept as-is / cancel under contingency. |
| 7 | Repair negotiation outcome | SINGLE_CHOICE_BRANCH | Coordinator | Agreement reached (Repair Addendum) / Buyer removes contingency as-is / Buyer cancels (EMD returned). |
| 8 | Contingency removal — inspection | ACKNOWLEDGEMENT | Assignee | Signs CR form. Accepts property condition, waives right to cancel on physical condition. Typically Day 17. |
| 9 | Appraisal & loan processing | FORM | Coordinator | Tracks: application complete, appraisal ordered/scheduled/completed (value), underwriting submission, conditions issued/cleared, approval status. Appraised value, condition count, estimated clear-to-close. |
| 10 | Appraisal contingency decision | SINGLE_CHOICE_BRANCH | Assignee | If below purchase price: Proceed at contract price (cover gap) / Renegotiate price / Request credit / Cancel under appraisal contingency. If meets/exceeds: remove contingency. |
| 11 | Contingency removal — appraisal & loan | ACKNOWLEDGEMENT | Assignee | Signs CR for appraisal and loan. EMD now at risk (non-refundable absent seller default). Typically Day 21. |
| 12 | Title clearance & closing prep | TODO | Coordinator | Title exceptions cleared, payoff demands obtained, HOA transfer fees ordered, termite clearance obtained, repairs verified, Closing Disclosure reviewed (3-day TRID wait), grant deed prepared, closing docs ordered. |
| 13 | Final walkthrough | TODO | Assignee | Verify repairs complete, property condition unchanged, fixtures/inclusions present, seller's property removed, systems operational. |
| 14 | Closing signing & funding | FORM | Coordinator | Buyer signs loan docs, seller signs grant deed, buyer wires remaining funds, lender funds loan, escrow confirms all funds/docs, clear to record. |
| 15 | Recording & key transfer | TODO | Coordinator | Grant deed recorded with county. Disbursements (seller proceeds, commissions, fees, prorated taxes/HOA), keys/remotes/codes transferred, utility transfer instructions, settlement statements distributed. CLOSED. |

---

## 4.6 Construction Project Closeout

**Industries:** Construction
**Trigger:** Substantial completion claimed

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Substantial completion notification | FORM | Coordinator | AIA G704 request: project name/number, contract date, original completion date, claimed substantial completion date, remaining items, estimated incomplete work value, confirmation per AIA A201 Section 9.8. |
| 2 | Architect substantial completion inspection | FORM | Assignee | Inspection findings: spaces inspected, systems tested, non-conforming items, life safety deficiencies, items preventing occupancy, recommended SC date, punch list items. |
| 3 | AI punch list compilation | AI_AUTOMATION | AI | Compiles from architect notes, owner walkthrough, GC self-identified items. Organizes by CSI division, location, responsible sub, severity (life safety/functional/cosmetic), estimated time, priority sequencing. |
| 4 | Punch list acknowledgement | ACKNOWLEDGEMENT | Assignee | GC accepts listed items, commits to completion schedule, confirms sub assignments, punch list period (typically 30–60 days). May dispute items with rationale. |
| 5 | Certificate of Occupancy & regulatory closeout | FILE_REQUEST | Coordinator | CO or TCO from AHJ, final building inspection, fire marshal approval, elevator cert, health dept approvals, environmental clearances, conditional approvals with requirements. |
| 6 | Punch list completion report | FORM | Coordinator | Each item: completion date, before/after photos, sub sign-off. Outstanding items: explanation, revised date, impact. Architect re-inspection results. |
| 7 | Punch list final approval | APPROVAL | Assignee | Architect + Owner: All complete → final closeout. Remaining acceptable with holdback (150–200% of incomplete value) → proceed with substantial closeout. Not acceptable → remediate and resubmit. |
| 8 | O&M documentation submittal | FILE_REQUEST | Coordinator | O&M manuals (HVAC, electrical, plumbing, fire, BAS), equipment cut sheets, warranty certificates by CSI division, as-built drawings, attic stock inventory, keying schedule, LEED docs. |
| 9 | Contractual & financial closeout docs | FILE_REQUEST | Coordinator | Lien waivers (conditional/unconditional, progress/final — AIA G706A), consent of surety, final change order log, final Application for Payment (AIA G702/G703), sub/supplier final lien waivers. |
| 10 | AI document completeness verification | AI_AUTOMATION | AI | Audits against Division 01 Section 01 77 00 requirements: all O&M manuals present, warranties meet duration requirements, lien waivers properly executed, as-builts complete. Compliance matrix with gaps. |
| 11 | Owner training & orientation | TODO | Coordinator | Training on all systems: HVAC, BAS, fire alarm/suppression, electrical/emergency power, plumbing, security/access, elevator, specialty. Sign-in sheets, materials, follow-up items. |
| 12 | Final payment & retainage release request | FORM | Coordinator | AIA G702/G703: total contract sum (with COs), previous payments, current due (final retainage), retainage held, to be released, backcharges/credits, final balance. Certifies work complete, subs paid, closeout satisfied. |
| 13 | Architect's final certificate for payment | APPROVAL | Assignee | AIA G706 + Certificate for Payment per A201 Section 9.10. Certifies: work complete, closeout docs received, punch list resolved. Recommends final payment + retainage release. |
| 14 | Owner final payment approval | APPROVAL | Assignee | Reviews architect certification. Verifies: all lien waivers received, warranty starts confirmed, maintenance bonds in place, letter of completion from surety. Approves retainage release per state statutes (30–60 days). |
| 15 | Project closure & warranty commencement | SYSTEM_EMAIL | System | Final notification: payment processed, project closed, warranty commencement/expiration dates (1 year general, longer for roofing/envelope/mechanical), warranty claim procedures, 11-month walkthrough reminder (auto-scheduled), record retention, archive location. |

---

# 5. Order & Fulfillment

> **Buyer intent:** "I need to process and fulfill an order."

## 5.1 Order Fulfillment

**Industries:** Manufacturing, Distribution
**Trigger:** Purchase order received from customer

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Purchase order submission | FORM | Assignee | PO number, customer account number, ship-to address, requested delivery date, line items and quantities, special shipping instructions. |
| 2 | PO acknowledgement & validation | TODO | Coordinator | Verify against price list and inventory. Confirm lead time, validate credit terms (NET 30/60/90), check credit limit. Flag backorder or pricing discrepancies. |
| 3 | Order confirmation | ACKNOWLEDGEMENT | Assignee | Acknowledges confirmed line items, unit prices, estimated ship date, total value. Notes substitutions or partial fills. |
| 4 | Pick, pack & quality check | TODO | Coordinator | Pick per ticket, lot/serial recording, quality check against PO spec, pack per customer requirements, generate packing slip. |
| 5 | Shipping documentation | FORM | Coordinator | Carrier (UPS/FedEx/LTL/Truckload/Customer Pickup), tracking number, BOL number, pallets/cartons, total weight, freight class. |
| 6 | Bill of lading upload | FILE_REQUEST | Coordinator | Signed BOL, packing slip, certificates of conformance (COC) or material test reports (MTR) if required. |
| 7 | Shipment notification | SYSTEM_EMAIL | System | Tracking number, carrier, estimated delivery, POD tracking link. |
| 8 | Delivery confirmation | ACKNOWLEDGEMENT | Assignee | Confirms receipt, quantities match packing slip, no visible damage. Notes shortages or damage for claims. |
| 9 | Delivery exception handling | DECISION | Coordinator | If shortages/damage/wrong items: reship/replacement OR proceed to invoicing. |
| 10 | Invoice generation | FORM | Coordinator | Invoice number, date, payment terms (NET 30/60/90/Due on Receipt), total amount, tax, freight charges. |
| 11 | Invoice & supporting docs | FILE_REQUEST | Coordinator | Commercial invoice, signed BOL (POD), packing slip, tax exemption certificates. Supports 3-way match. |
| 12 | Payment confirmation | ACKNOWLEDGEMENT | Coordinator | Payment received and applied. Order closed. Overdue → escalate per collections policy. |

---

## 5.2 Purchase Order Processing

**Industries:** Manufacturing, Cross-industry
**Trigger:** Purchase requisition submitted

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Purchase requisition | FORM | Coordinator | Requisitioner, department, GL account, item description, estimated unit cost, quantity, total cost, justification, preferred vendor, needed-by date. |
| 2 | Budget & policy compliance check | AI_AUTOMATION | AI | Validates budget availability, checks for existing blanket PO/contract, flags if competitive bidding required (typically >$10K). |
| 3 | Manager approval | APPROVAL | Coordinator | Reviews business necessity, budget alignment, GL coding. Above threshold auto-escalates to VP/Director. |
| 4 | Vendor selection & PO creation | TODO | Coordinator | Select from approved vendors or initiate new setup. Negotiate pricing/terms. Create PO with number, payment terms, FOB, delivery schedule. |
| 5 | Purchase order dispatch | FILE_REQUEST | Coordinator | Signed PO (PDF) with T&Cs, specs, drawings. |
| 6 | Vendor order acknowledgement | ACKNOWLEDGEMENT | Assignee | Confirms PO, agrees to pricing/delivery/terms. Notes exceptions or lead time changes. |
| 7 | Goods receipt / receiving report | FORM | Coordinator | PO number, date received, carrier/BOL, quantity, condition (Good/Damaged/Partial), receiver name, discrepancy notes. |
| 8 | Receiving documentation upload | FILE_REQUEST | Coordinator | Signed delivery receipt, receiving report, damage photos, incoming inspection report or COC. |
| 9 | Vendor invoice submission | FILE_REQUEST | Assignee | Invoice referencing PO number, line items, quantities, prices, payment instructions. |
| 10 | 3-way match verification | AI_AUTOMATION | AI | Compares PO vs. receiving report vs. invoice. Checks: quantities, prices, overcharges, tax calculations. Flags discrepancies exceeding tolerance (1–2%). |
| 11 | Discrepancy resolution | DECISION | Coordinator | Within tolerance → approve / Price variance → contact vendor / Quantity variance → contact receiving / Reject invoice. |
| 12 | Payment authorization | APPROVAL | Coordinator | Final AP approval. 3-way match clean, GL coding correct, payment terms applied (early discount if applicable, e.g., 2/10 NET 30). |
| 13 | Payment confirmation | ACKNOWLEDGEMENT | Assignee | Vendor confirms payment receipt. PO closed. |

---

## 5.3 RMA / Return Processing

**Industries:** Manufacturing, Retail, SaaS
**Trigger:** Customer requests return or reports defect

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Return request submission | FORM | Assignee | Original order/invoice number, product/SKU, quantity, return reason (Defective/Wrong Item/Damaged in Transit/Not as Described/No Longer Needed), issue description, purchase date, desired resolution (Replacement/Refund/Repair/Credit). |
| 2 | Supporting evidence | FILE_REQUEST | Assignee | Photos of defect/damage, shipping label/packaging, packing slip, error codes/screenshots. |
| 3 | RMA eligibility review | AI_AUTOMATION | AI | Checks: within warranty/return window, purchase verified, return reason mapped to policy eligibility, RMA number generated. Flags out-of-policy for manual review. |
| 4 | RMA approval | APPROVAL | Coordinator | Reviews request, evidence, eligibility check. Approve or deny (outside window, customer damage, non-returnable). Assign RMA number. |
| 5 | Return shipping instructions | ACKNOWLEDGEMENT | Assignee | RMA number, return address, packaging instructions, prepaid label (if provided). Must write RMA number on outer box. |
| 6 | Return receipt & inspection | FORM | Coordinator | RMA number, date received, condition (Like New/Minor Defect/Major Defect/Damaged/Missing Parts), defect verified (Y/N), serial/lot number, inspector notes. |
| 7 | Inspection report upload | FILE_REQUEST | Coordinator | Inspection report, photos of returned item, functional test results. |
| 8 | Disposition decision | DECISION | Coordinator | Restock (sellable) / Repair (refurbishable) / Scrap (beyond repair) / Return to Vendor (supplier quality → SCAR). |
| 9 | Resolution execution | TODO | Coordinator | Process replacement shipment, restock, route to repair, or scrap with documentation. Update inventory. |
| 10 | Credit memo / refund processing | FORM | Coordinator | RMA number, credit memo number, refund amount, method (original payment/store credit/check), restocking fee (Y/N), net refund. |
| 11 | Resolution confirmation | ACKNOWLEDGEMENT | Assignee | Confirms receipt of replacement/refund/credit/repair. RMA closed. |

---

## 5.4 Customer Complaint Resolution

**Industries:** Manufacturing, Cross-industry
**Trigger:** Customer complaint received

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Complaint registration | FORM | Assignee | Customer name, account/order number, product/service affected, category (Product Quality/Service Issue/Delivery Problem/Billing Error/Safety Concern), severity (Critical-Safety/High/Medium/Low), detailed description, date occurred, desired resolution. |
| 2 | Supporting documentation | FILE_REQUEST | Assignee | Photos, screenshots, correspondence, damaged materials, lab results, other evidence. |
| 3 | Complaint triage & classification | AI_AUTOMATION | AI | Auto-classifies severity/category, routes to department supervisor, checks for patterns (repeat complaint, same lot, same customer), flags safety for immediate escalation, sets SLA timer. |
| 4 | Complaint acknowledgement | SYSTEM_EMAIL | System | Reference number, assigned rep, expected response timeline per SLA (Critical: 4hr, High: 24hr, Medium: 3 days, Low: 5 days). |
| 5 | Investigation & containment | TODO | Coordinator | Root cause investigation. For quality: pull retention samples, check batch/lot records, review process parameters. Containment if needed (hold lot, stop shipment, notify affected customers). |
| 6 | Root cause analysis | FORM | Coordinator | Method used (5-Why/Fishbone/8D/Fault Tree), root cause category (Design/Material/Process/Human Error/Supplier/Training), description, contributing factors, SCAR required (Y/N), corrective action, preventive action, target completion date. |
| 7 | SCAR initiation | DECISION | Coordinator | Supplier-related root cause? Yes → SCAR/8D with supplier. No → internal corrective action. |
| 8 | Corrective action evidence | FILE_REQUEST | Coordinator | Updated procedures, training records, revised work instructions, process changes, supplier SCAR response. |
| 9 | Corrective action verification | APPROVAL | Coordinator | Corrective actions effectively address root cause, evidence of implementation reviewed, preventive actions confirmed. Approve closure or require more. |
| 10 | Customer resolution offer | FORM | Coordinator | Resolution type (Replacement/Refund/Credit/Repair/Discount/Apology), resolution value, details, goodwill gesture. |
| 11 | Customer acceptance | APPROVAL | Assignee | Accept or reject resolution. Rejected → loops back to coordinator with feedback. |
| 12 | Complaint closure | ACKNOWLEDGEMENT | Assignee | Complaint resolved satisfactorily. Acknowledges receipt of resolution. Rates experience (optional). |

---

# 6. Document Collection

> **Buyer intent:** "I need to gather documents from someone."

## 6.1 Tax Document Package

**Industries:** Accounting, Tax
**Trigger:** Tax season / engagement letter signed (January)

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Engagement confirmation & tax year info | FORM | Assignee | Filing type (Individual/MFJ/S-Corp/C-Corp/Partnership/Trust/Estate), tax year, major life changes (Marriage/Divorce/Birth/Home Purchase-Sale/Retirement/Job Change), state(s) of residence, estimated income range, new CPA this year (Y/N). |
| 2 | Tax organizer questionnaire | FORM | Assignee | Self-employment income? Investment sales? Rental income? Charitable contributions >$250? Student loan interest? IRA/401k contributions? Foreign income/accounts? Crypto income? Health insurance type. |
| 3 | Income documents upload | FILE_REQUEST | Assignee | W-2s, 1099-NEC/MISC/INT/DIV/B/R, K-1s, SSA-1099, W-2G. |
| 4 | Deduction & credit documents upload | FILE_REQUEST | Assignee | Mortgage interest (1098), property tax, charitable receipts, medical expenses, student loan interest (1098-E), tuition (1098-T), childcare info, state/local tax payments, business expenses, home office. |
| 5 | Prior year returns & carryovers | FILE_REQUEST | Assignee | Prior returns (if new client), carryover schedules (capital losses, NOL, charitable), estimated tax payment confirmations (1040-ES), extension filing confirmation. |
| 6 | Missing document follow-up | FORM | Assignee | Which missing docs can you provide? Expected date for remaining? Items not available? Questions about items? |
| 7 | Document completeness review | TODO | Coordinator | Review all docs, verify all income sources accounted for, check for missing K-1s, late 1099s, corrected forms. Mark complete or request more. |
| 8 | AI document verification | AI_AUTOMATION | AI | Cross-references docs against organizer answers. Flags inconsistencies (self-employment reported but no Schedule C docs, prior year rental income but no Schedule E). Discrepancy report. |
| 9 | Package complete — preparation authorization | APPROVAL | Assignee | Reviews final summary. Approves as complete and authorizes return preparation. Can request extension filing if items outstanding. |
| 10 | Engagement letter & e-file authorization | FILE_REQUEST | Assignee | Signed engagement letter and IRS Form 8879 (e-file auth) or 8453 (paper). Required before filing. |

---

## 6.2 Loan Application Package

**Industries:** Banking, Lending
**Trigger:** Loan application initiated

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Borrower information & loan request | FORM | Assignee | Full legal name, SSN, DOB, marital status, current address, years at address, loan purpose (Purchase/Refi/Cash-Out/HELOC), desired amount, property type, employment type (W-2/Self-Employed/Retired). |
| 2 | URLA upload | FILE_REQUEST | Assignee | Completed Fannie Mae Form 1003 (Uniform Residential Loan Application). |
| 3 | Identity & authorization | FILE_REQUEST | Assignee | Photo ID, Social Security card, credit report authorization, information release authorization. |
| 4 | Income documentation | FILE_REQUEST | Assignee | Last 30 days pay stubs, W-2s (2 years), tax returns (2 years, all pages/schedules). Self-employed: business returns, YTD P&L, business license. Retired: pension/SS award letters. |
| 5 | Asset documentation | FILE_REQUEST | Assignee | Bank statements (2 months, all pages/accounts), investment statements, retirement statements, gift letter + donor statements (if gift funds), EMD proof. Large deposits must be sourced. |
| 6 | Property & purchase documents | FILE_REQUEST | Assignee | Purchase agreement, EMD receipt, homeowners insurance quote, HOA docs (if applicable), previous appraisal (refi), current mortgage statement (refi). |
| 7 | Employment verification | FORM | Assignee | Employer name/phone, position, start date, HR contact for VOE, previous employer (if <2 years), gap explanations. |
| 8 | AI document verification | AI_AUTOMATION | AI | Cross-references: income on stubs matches W-2 trajectory, employer consistency, asset sufficiency (down payment + closing + reserves), no undisclosed liabilities. Generates conditions list. |
| 9 | Conditions & missing items | FORM | Assignee | LOE for credit inquiries, address discrepancies, large deposits. Additional docs requested. Employment gap clarification. Must clear all conditions. |
| 10 | Processor review & certification | TODO | Coordinator | All docs present, legible, complete, not expired (stubs <30 days, statements <60 days), conditions cleared. Certify underwriter-ready. |
| 11 | Underwriting submission authorization | APPROVAL | Coordinator | Final review: DTI, LTV, credit score meet guidelines. Approve submission or return for corrections. |
| 12 | Borrower disclosures acknowledgement | ACKNOWLEDGEMENT | Assignee | Loan Estimate, TILA disclosure, appraisal copy right, ECOA notice, state-specific disclosures. Within 3 business days. |

---

## 6.3 Due Diligence Document Request

**Industries:** Legal, M&A, Investment
**Trigger:** LOI signed / DD phase initiated

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | NDA & data room access | ACKNOWLEDGEMENT | Assignee | Acknowledges NDA execution, data room credentials, document handling protocols, confidentiality obligations. |
| 2 | DD request list distribution | FILE_REQUEST | Coordinator | Comprehensive list by category: Corporate & Organization, Financial, Tax, Contracts, IP, Employment & Benefits, Litigation & Regulatory, Real Property, Environmental, Insurance, IT & Cybersecurity. Typically 200–500 items. |
| 3 | Corporate & governance documents | FILE_REQUEST | Assignee | Articles, bylaws, amendments, good standing certificates, board minutes (3 years), shareholder agreements, cap table, org chart, subsidiary list. |
| 4 | Financial documents | FILE_REQUEST | Assignee | Audited financials (3 years), interim statements, GL/trial balance, revenue by customer/product, AR/AP aging, debt schedules, CapEx, budget vs. actual, projections. |
| 5 | Tax documents | FILE_REQUEST | Assignee | Federal/state returns (3 years), tax provision workpapers, sales/use tax, property tax, transfer pricing docs, R&D credit docs, IRS audit correspondence. |
| 6 | Contracts & IP documents | FILE_REQUEST | Assignee | Top 20 customer/vendor contracts, change-of-control contracts, patent/trademark/copyright portfolio, software licenses (in/out), open source report, trade secret policies. |
| 7 | Employment & litigation documents | FILE_REQUEST | Assignee | Employee census, employment agreements (key), non-competes, benefit plans, pending litigation summary, settlements (5 years), government investigations, licenses/permits. |
| 8 | Management questionnaire | FORM | Assignee | Known off-balance-sheet liabilities, pending/threatened litigation, key customer concentration, employee flight risk, regulatory concerns, environmental liabilities, data breach history, contract disputes. |
| 9 | Financial analysis review | TODO | Coordinator | Quality of earnings, working capital analysis, customer concentration, CapEx requirements, off-balance-sheet liabilities. DD report. |
| 10 | Legal analysis review | TODO | Coordinator | Contract assignability/change-of-control, IP ownership, litigation exposure, regulatory compliance, employment agreement enforceability. DD report. |
| 11 | Tax analysis review | TODO | Coordinator | Return accuracy, open year exposure, deal structure tax implications, transfer pricing, sales tax nexus, NOL carryforwards. DD report. |
| 12 | Follow-up questions | FORM | Assignee | 50–150 supplemental questions by category with supporting document upload option. |
| 13 | AI red flag summary | AI_AUTOMATION | AI | Synthesizes across workstreams: material risks, information gaps, deal-breaker issues, items requiring purchase agreement protections (reps, warranties, indemnities). Risk heat map. |
| 14 | Go/No-Go decision | APPROVAL | Coordinator | Proceed to definitive agreement, request additional diligence, or decline transaction. |

---

## 6.4 General Document Request

**Industries:** Cross-industry
**Trigger:** Any document collection need

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Document request details | FORM | Coordinator | Request title, requesting organization, purpose, document categories needed, submission deadline, confidentiality level (Public/Internal/Confidential/Highly Confidential), special instructions. |
| 2 | Request acknowledgement | ACKNOWLEDGEMENT | Assignee | Reviews request details and deadline. Confirms ability to provide within timeline. |
| 3 | Primary documents upload | FILE_REQUEST | Assignee | Requested documents organized by category. PDF/Word/Excel/images. Max 25 files per upload. |
| 4 | Supplementary documents upload | FILE_REQUEST | Assignee | Additional supporting docs, appendices, supplementary materials. |
| 5 | Clarification questions | FORM | Assignee | Questions about the request, docs that cannot be provided (with reason), estimated date for pending items, alternative docs provided. |
| 6 | Document completeness review | TODO | Coordinator | Review against original request: completeness, legibility, correct date ranges, proper signatures/certifications. Mark complete or list missing. |
| 7 | AI completeness check | AI_AUTOMATION | AI | Cross-references submissions against request list: items not provided, outdated/expired docs, incomplete docs (missing pages). Completeness report. |
| 8 | Completion confirmation | ACKNOWLEDGEMENT | Coordinator | All required docs received. Notes outstanding items and whether critical or deferrable. |

---

# 7. Approvals & Agreements

> **Buyer intent:** "I need someone to review and sign something."

## 7.1 Contract Review & Execution

**Industries:** Cross-industry
**Trigger:** Contract drafted or received

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Contract intake | FORM | Coordinator | Contract type (MSA/SOW/SaaS/Vendor/Consulting/License), counterparty legal name, contact email, value, term, auto-renewal (Y/N), department, justification, desired effective date. |
| 2 | Draft contract upload | FILE_REQUEST | Coordinator | Draft contract (Word/PDF). Our template or counterparty's. Exhibits, schedules, appendices. |
| 3 | AI contract risk analysis | AI_AUTOMATION | AI | Scans for: non-standard/missing clauses vs. playbook (indemnification, liability cap, IP, data protection, termination), unusual terms, auto-renewal traps, unlimited liability, non-compete/exclusivity. Risk summary with clause-by-clause flags. |
| 4 | Legal review & redline | TODO | Coordinator | Focus: liability cap and indemnification (mutual, capped), IP ownership, data protection, termination/cure periods, governing law, insurance requirements. Prepare redline markup. |
| 5 | Financial terms review | TODO | Coordinator | Payment terms, pricing/escalation, penalty/LD provisions, expense reimbursement, tax provisions, currency/FX. Verify budget and cost center. |
| 6 | Redline document upload | FILE_REQUEST | Coordinator | Redlined contract with tracked changes + summary of key negotiation points and non-negotiable positions. |
| 7 | Counterparty negotiation | FILE_REQUEST | Assignee | Response with accepted changes, counter-proposals, new redlines, cover note on disputed terms. |
| 8 | Negotiation resolution | DECISION | Coordinator | Accept counterparty positions / further negotiation (loop to step 6) / escalate to executive / terminate — terms unacceptable. |
| 9 | Executive approval | APPROVAL | Coordinator | (Above threshold or non-standard terms) Final terms, risk summary, disputed items. Approve, conditionally approve, or reject. |
| 10 | Final contract for signature | FILE_REQUEST | Coordinator | Clean final version (all tracked changes accepted) in PDF with signature blocks. |
| 11 | Counterparty signature | ACKNOWLEDGEMENT | Assignee | Reviews final, confirms all agreed terms, executes. Uploads signed copy. |
| 12 | Internal execution | ACKNOWLEDGEMENT | Coordinator | Countersigns. Uploads fully executed version. |
| 13 | Executed contract filing | TODO | Coordinator | File in contract management system. Set reminders: renewal date, termination notice deadline, milestone obligations. Distribute to stakeholders. |

---

## 7.2 NDA Execution

**Industries:** Cross-industry
**Trigger:** Business discussion requiring confidentiality

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | NDA request | FORM | Coordinator | Counterparty company/contact/email, NDA type (Mutual/One-Way We Disclose/One-Way They Disclose), purpose of disclosure, confidentiality period (1/2/3/5 years/Perpetual), our template or theirs, urgency (Standard 3–5 days/Expedited 1–2 days/Same Day). |
| 2 | NDA template selection | DECISION | Coordinator | Our standard — no review needed / Our template with modifications — brief review / Counterparty's template — full legal review. |
| 3 | Legal review (if needed) | TODO | Coordinator | CI definition not overbroad, standard exclusions, no non-solicitation/non-compete, reasonable remedies, acceptable residuals clause, practical return/destruction obligations. |
| 4 | NDA document upload | FILE_REQUEST | Coordinator | NDA ready for signature. If counterparty's, accepted or redlined version. |
| 5 | Counterparty review & redline | FILE_REQUEST | Assignee | Review. If acceptable → sign. If changes → upload redline. Common: adjusting CI definition, term, governing law. |
| 6 | Counterparty signature | ACKNOWLEDGEMENT | Assignee | Reviews final NDA and signs. |
| 7 | Countersignature | TODO | Coordinator | Countersigns. Execution complete. |
| 8 | Executed NDA distribution | ACKNOWLEDGEMENT | Coordinator | Filed, both parties have copies. Notes confidentiality period end date and specific sharing restrictions. |

---

## 7.3 Change Order Approval

**Industries:** Construction, Project-based
**Trigger:** Scope change / design modification / unforeseen condition

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Change order request | FORM | Coordinator | CO number, project name, original contract, change category (Owner-Directed/Design Error/Unforeseen Condition/Value Engineering/Code Change/Schedule Acceleration), description, affected specs/drawings, requested by, date identified. |
| 2 | Supporting documentation | FILE_REQUEST | Coordinator | Scope narrative, sub/supplier quotes (min 2 if >$10K), material takeoffs, site photos, RFI references, marked-up drawings, T&M tickets. |
| 3 | Cost impact assessment | FORM | Coordinator | Labor/material/equipment/sub costs, overhead & profit markup %, total direct + with markup, schedule impact (calendar days), critical path impact (Y/N), LD exposure. |
| 4 | Technical/design review | APPROVAL | Assignee | Design conformance, code compliance, adjacent system impact, scope completeness, permitting triggers. |
| 5 | Cost reasonableness review | TODO | Coordinator | Sub quotes vs. cost databases, labor rates vs. schedule of values, markup vs. contract maximums, independent estimate comparison. Negotiate if needed. |
| 6 | AI budget impact summary | AI_AUTOMATION | AI | Cumulative CO value, % of original contract consumed, remaining contingency, projected final contract value, schedule impact on substantial completion. Flags if exceeding contingency threshold (5–10%). |
| 7 | Owner approval | APPROVAL | Assignee | Justification, cost breakdown, schedule impact, cumulative budget impact, PM + architect recommendation. Approve, reject, or modify. Above authority → board/committee. |
| 8 | Change order execution | FILE_REQUEST | Coordinator | Executed CO document (AIA G701 or equivalent): revised contract sum, revised completion date, description, supporting docs. |
| 9 | Owner countersignature | ACKNOWLEDGEMENT | Assignee | Signs. Confirms revised value and completion date. Authorizes changed work. |
| 10 | Change log update | TODO | Coordinator | Update CO log, project budget, schedule. Notify affected subs and stakeholders. |

---

## 7.4 Policy Acknowledgement Rollout

**Industries:** Cross-industry
**Trigger:** New/updated policy approved or annual re-acknowledgement cycle

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Policy publication details | FORM | Coordinator | Title, policy number, category (HR/IT Security/Compliance/Safety/Code of Conduct/Data Privacy/Anti-Corruption/Whistleblower), effective date, version, what changed, target audience (All/Departments/Roles/Contractors), acknowledgement deadline, knowledge check required (Y/N). |
| 2 | Policy document upload | FILE_REQUEST | Coordinator | Final approved policy PDF, appendices, referenced forms, key changes summary, FAQ. |
| 3 | Compliance review | APPROVAL | Coordinator | Regulatory alignment, consistency with other policies, appropriate language, proper approval chain, adequate notice period. |
| 4 | Distribution notification | SYSTEM_EMAIL | System | To target audience: title, summary, full policy link, deadline, mandatory acknowledgement notice. To managers: responsible for team compliance. |
| 5 | Policy review & acknowledgement | ACKNOWLEDGEMENT | Assignee | "I have read, understood, and agree to comply with [Policy] effective [date]. I understand violation may result in disciplinary action." |
| 6 | Knowledge verification | FORM | Assignee | (If required) 3–5 questions testing key provisions. Must score 80%+. |
| 7 | First reminder — non-respondents | SYSTEM_EMAIL | System | At 50% of window. Days remaining, direct link, manager notification warning. |
| 8 | Escalation to managers | SYSTEM_EMAIL | System | At 75% of window. Lists non-compliant direct reports. Requests intervention. |
| 9 | Manager follow-up | TODO | Coordinator | Follow up with non-compliant team members. Schedule meeting if needed. Document accessibility issues. Report persistent non-compliance. |
| 10 | AI compliance report | AI_AUTOMATION | AI | Total in scope, acknowledged by deadline, rate %, non-compliant list by department, knowledge check pass/fail rates. Flags departments below 95%. |
| 11 | Rollout closure | ACKNOWLEDGEMENT | Coordinator | Reviews compliance report. Documents exceptions. Files acknowledgement records for audit (retain 3–7 years). |

---

# 8. Compliance & Risk

> **Buyer intent:** "I need to verify or certify something."

## 8.1 KYC / AML Verification

**Industries:** Financial Services, Banking
**Trigger:** New customer or periodic review (annual high-risk, biennial medium, triennial low)

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Customer information collection | FORM | Assignee | Full legal name, DOB, nationality, TIN/SSN, address, occupation, employer, purpose of relationship (Personal Banking/Business/Investment/Trade Finance), expected monthly volume (<$10K / $10K–$50K / $50K–$250K / $250K–$1M / >$1M), source of funds (Salary/Business Revenue/Investment/Inheritance/Property Sale). |
| 2 | Identity documentation (CIP) | FILE_REQUEST | Assignee | Primary ID (passport/national ID/driver's license), secondary ID or proof of address (<3 months). Businesses: certificate of incorporation, articles, operating agreement. |
| 3 | CDD questionnaire | FORM | Assignee | International wires (Y/N), countries transacted with, other FI accounts, PEP status (Y/N), regulatory action history, crypto usage, third-party account access (Y/N), sources of incoming funds. |
| 4 | Sanctions & PEP screening | AI_AUTOMATION | AI | OFAC SDN, EU/UN Consolidated, HMT, PEP databases, adverse media, law enforcement databases. Match/no-match/potential-match report. |
| 5 | Risk scoring | AI_AUTOMATION | AI | Weighted factors: customer type, geographic risk, product risk, transaction volume, industry risk, PEP status, source of wealth complexity. Assigns Low/Medium/High. |
| 6 | CDD verification | TODO | Coordinator | Verify document authenticity, address against independent sources, screening results, PEP results, source of funds consistency. Document all steps. |
| 7 | EDD required? | DECISION | Coordinator | Standard CDD sufficient → approval / EDD required → additional docs / Decline → unacceptable risk. |
| 8 | EDD additional documentation | FILE_REQUEST | Assignee | (EDD path) Certified source of wealth, transaction pattern explanation, FI references, corporate structure with UBO, third-party DD reports. |
| 9 | EDD analysis | TODO | Coordinator | Enhanced background, source of wealth verification, transaction plausibility, beneficial ownership research. Detailed EDD memo with risk mitigation. |
| 10 | Compliance approval | APPROVAL | Coordinator | Complete KYC file review. Approve (with/without conditions/enhanced monitoring), request more info, or decline. |
| 11 | SAR determination | DECISION | Coordinator | Suspicious activity? No SAR required / SAR filed / Defensive SAR filed. Do NOT notify customer (tipping-off prohibition). |
| 12 | Customer acknowledgement | ACKNOWLEDGEMENT | Assignee | T&Cs including ongoing info update obligation, consent to periodic reviews, institution may request additional info. |
| 13 | KYC file closure & scheduling | TODO | Coordinator | Close file. Set periodic review: High 12mo, Medium 24mo, Low 36mo. Retain per BSA/AML (min 5 years after relationship ends). |

---

## 8.2 Vendor Risk Assessment

**Industries:** Cross-industry
**Trigger:** New vendor / annual review / contract renewal

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Vendor profile & categorization | FORM | Coordinator | Vendor name/contact, service description, data access level (None/Non-Sensitive/Sensitive/PII/PHI/Financial/Critical Infrastructure), integration type (None/API/Network/On-Premise/Cloud), annual spend, contract term, business criticality (Critical/High/Medium/Low). |
| 2 | Vendor self-assessment | FORM | Assignee | Headquarters, year established, employees, revenue, industry, subcontractors used (Y/N), prior security incidents (Y/N), data processing countries, compliance frameworks (SOC 2/ISO 27001/PCI/HIPAA/GDPR/FedRAMP). |
| 3 | Security questionnaire | FORM | Assignee | Access Control (MFA, RBAC, PAM), Data Protection (encryption, key management), Network Security (firewalls, IDS/IPS), Incident Response (plan, breach notification SLA, last test), BC/DR (RPO/RTO, last test), Vulnerability Management (scan frequency, patch SLA, pen test), Employee Security (background checks, training), Physical Security (DC certifications), Privacy (DPA, subprocessor management). |
| 4 | Certification & evidence upload | FILE_REQUEST | Assignee | SOC 2 Type II, ISO 27001 cert, PCI AOC, pen test summary (last 12 months), BC/DR test results, cyber liability insurance ($5M min), general liability, DPA, subprocessor list. |
| 5 | AI risk pre-scoring | AI_AUTOMATION | AI | Analyzes responses and docs. Calculates initial score: data sensitivity, questionnaire gaps, certification coverage, insurance adequacy, geographic risk. Flags: missing SOC 2 with data access, no MFA with system access, restricted-jurisdiction subprocessors, below-threshold insurance. |
| 6 | Security deep-dive review | TODO | Coordinator | SOC 2 findings and management responses, pen test results and remediation, questionnaire accuracy, architecture review (high-risk integrations), residual risks and compensating controls. |
| 7 | Risk rating & recommendation | FORM | Coordinator | Overall rating (Critical/High/Medium/Low), score (1–100), key findings, required remediation, compensating controls accepted, monitoring frequency (Quarterly/Semi-Annual/Annual), recommendation (Approve/Approve with Conditions/Reject). |
| 8 | Risk committee decision | APPROVAL | Coordinator | Reviews assessment, findings, recommendation. Approve (unconditionally or with conditions), defer, or reject. |
| 9 | Vendor notification & conditions | ACKNOWLEDGEMENT | Assignee | Acknowledges outcome and conditions: remediation items/deadlines, monitoring obligations, data handling restrictions, incident notification requirements, right-to-audit. |
| 10 | Risk register update | TODO | Coordinator | Update register: vendor, rating, findings, conditions, next review, risk owner. Set calendar reminders. File all docs per retention policy. |

---

## 8.3 Periodic Compliance Certification

**Industries:** Financial Services, any regulated industry
**Trigger:** Quarterly/annual compliance cycle

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Certification cycle initiation | FORM | Coordinator | Period (e.g., "Q4 2025"), type (SOX 302/SOX 404/Regulatory/Internal Policy/Code of Conduct/Data Privacy), applicable regulation, deadline, certifier list, escalation contact. |
| 2 | Pre-certification materials | FILE_REQUEST | Coordinator | Control testing results, exception/deficiency reports, remediation updates, policy updates, regulatory change summaries, prior period results. |
| 3 | Certification notification | SYSTEM_EMAIL | System | Period, deadline, materials link, instructions, legal/regulatory significance, escalation contact. |
| 4 | Compliance self-assessment | FORM | Assignee | Each certifier attests: reviewed internal controls (Y/N), all material exceptions reported (Y/N), corrective actions complete/on track (Y/N), no known fraud (Y/N), no significant control changes (Y/N), exceptions/qualifications, changes to report. |
| 5 | Supporting evidence upload | FILE_REQUEST | Assignee | Control testing evidence, remediation completion, exception docs, management override justifications, new control implementation. |
| 6 | AI certification aggregation | AI_AUTOMATION | AI | Aggregates responses. Flags: "No" responses, material exceptions, non-respondents, inconsistencies across business units, trends from prior periods. Consolidated summary report. |
| 7 | Exception investigation | TODO | Coordinator | Investigate flagged exceptions: materiality, significant deficiency or material weakness, root cause, remediation plan, impact on overall certification. |
| 8 | Compliance officer review | APPROVAL | Coordinator | Reviews consolidated results, exception findings, evidence. Determines if org can certify. Approves package or requires more investigation. |
| 9 | Executive certification | FORM | Assignee | SOX 302: "I certify the financial statements fairly present the financial condition. I am responsible for internal controls and have evaluated effectiveness within 90 days." Name, title, acknowledgement, qualifications. |
| 10 | Certification filing & retention | TODO | Coordinator | File with regulatory body or internal system. Archive all docs, responses, exceptions, investigations. Retain per requirements (SOX: 7 years, general: 5–7 years). Set next cycle date. |
| 11 | Cycle closure | ACKNOWLEDGEMENT | Coordinator | All certifications filed, exceptions documented, remediation plans in place. |

---

## 8.4 Audit Evidence Collection

**Industries:** Accounting, Financial Services, any audited organization
**Trigger:** Audit engagement initiated

| # | Step Name | Type | Assigned To | Description |
|---|-----------|------|-------------|-------------|
| 1 | Audit scope & request list | FORM | Coordinator | Audit type (Internal/External Financial/SOC 1/SOC 2/Regulatory/ISO/Custom), period, audit firm/team, total evidence items, submission deadline, fieldwork dates, report target, special instructions. |
| 2 | PBC list distribution | FILE_REQUEST | Coordinator | Detailed request list by area: financial statements/trial balance, revenue cycle, expense cycle, payroll, IT general controls, access control, compliance. Each item: description, sample period, sample size, format. |
| 3 | Request list acknowledgement | ACKNOWLEDGEMENT | Assignee | Acknowledges assigned items, format/specs, deadline, contact for questions. Flags items that cannot be provided. |
| 4 | Financial evidence upload | FILE_REQUEST | Assignee | GL export, trial balance, bank recs, revenue recognition support, journal entry support, AR confirmations, inventory count, fixed asset schedules, debt compliance certs. |
| 5 | IT & access control evidence upload | FILE_REQUEST | Assignee | User access listings, terminated access removal, privileged access reviews, change management tickets, config baselines, backup/recovery tests, vuln scans, patch evidence, vendor SOC reports. |
| 6 | Process & compliance evidence upload | FILE_REQUEST | Assignee | Approval documentation, SOD matrix, policy docs, training records, regulatory filings, licenses/certs, insurance certs, vendor management docs, incident logs. |
| 7 | AI completeness tracking | AI_AUTOMATION | AI | Tracks against PBC list: % received by category, items outstanding with days overdue, items unavailable, items potentially incomplete (missing pages, wrong period, wrong format). Status dashboard + gap report. |
| 8 | Evidence gap follow-up | FORM | Assignee | Item reference, reason for delay (gathering/system limitation/doesn't exist/third-party dependency/need clarification), expected date, alternative evidence, questions. |
| 9 | Audit findings & observations | FORM | Coordinator | Per finding: reference, title, severity (Material Weakness/Significant Deficiency/Deficiency/Observation), criteria (what should happen), condition (what was found), cause, effect, recommendation. |
| 10 | Management response | FORM | Assignee | Per finding: agree/disagree, management response, corrective action plan, responsible person, target date. If disagree: basis. |
| 11 | Draft report review | FILE_REQUEST | Coordinator | Draft audit report: executive summary, scope/methodology, findings with responses, opinion/conclusion, appendices. |
| 12 | Management review of draft | APPROVAL | Assignee | Factual accuracy, correct representation of responses, appropriate severity, fair/balanced reporting. |
| 13 | Final report sign-off | APPROVAL | Coordinator | Partner (external) or CAE/audit committee (internal) approval. Report ready for distribution. |
| 14 | Report distribution & remediation tracking | ACKNOWLEDGEMENT | Coordinator | Report distributed, findings communicated, action plans documented, remediation tracking set up, follow-up audit scheduled. Workpapers filed per retention requirements. |

---

## Summary

| # | Category | Templates | Total Steps |
|---|----------|-----------|-------------|
| 1 | Onboarding | 9 | 122 |
| 2 | Sales & Evaluation | 4 | 54 |
| 3 | Account Management | 4 | 48 |
| 4 | Service Delivery | 6 | 81 |
| 5 | Order & Fulfillment | 4 | 48 |
| 6 | Document Collection | 4 | 44 |
| 7 | Approvals & Agreements | 4 | 42 |
| 8 | Compliance & Risk | 4 | 48 |
| **Total** | **8 categories** | **39 templates** | **487 steps** |

### Step Type Distribution

| Step Type | Count | Usage Pattern |
|-----------|-------|---------------|
| FORM | ~130 | Data collection at intake, questionnaires, investigation findings |
| TODO | ~65 | Internal tasks: reviews, configurations, investigations |
| FILE_REQUEST | ~95 | Document uploads: evidence, reports, signed docs |
| ACKNOWLEDGEMENT | ~55 | Confirmations, sign-offs, policy acceptance |
| APPROVAL | ~45 | Review gates: compliance, executive, client sign-off |
| AI_AUTOMATION | ~50 | Risk scoring, document analysis, content generation, triage |
| SYSTEM_EMAIL | ~20 | Automated notifications at key milestones |
| DECISION | ~15 | Branch points: accept/reject, go/no-go, disposition |
| SINGLE_CHOICE_BRANCH | ~10 | Conditional routing: risk level, client type, exception handling |
| ESIGN | ~4 | Contract execution, formal agreements |
