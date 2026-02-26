# Audit & Compliance (10 Templates)

> Coordinate audit evidence collection, compliance certifications, and regulatory responses. From SOC 2 and ISO 27001 audits to HIPAA attestations and internal control assessments, these templates ensure structured, trackable compliance processes.

---

## 1. SOC 2 Evidence Collection (PBC)

**Tags**: All Industries | **Complexity**: Complex | **Trigger**: Annual audit cycle begins

**Description**: Coordinate SOC 2 audit evidence collection from control owners through a structured PBC (Provided by Client) process. Manages the full cycle from scoping through auditor follow-up and closeout.

**Use Cases**:
- Collecting SOC 2 Type II evidence across engineering, HR, and operations teams
- Coordinating first-time SOC 2 evidence collection for a SaaS company
- Managing annual SOC 2 recertification with minimal disruption to control owners
- Running parallel SOC 2 and SOC 3 evidence collection for multiple stakeholders

**Recommendations**:
- Integrate with your GRC platform (Vanta, Drata, ServiceNow GRC) to auto-pull evidence from connected systems and map submissions to SOC 2 trust service criteria
- Connect to Jira or Asana to auto-assign evidence collection tasks to control owners with deadlines aligned to the audit timeline
- Set up Slack or Teams notifications for control owners when evidence requests are assigned, deadlines approach, or auditor follow-ups are posted
- Sync completed evidence packages to a shared drive (SharePoint, Google Drive) with automated folder structure by trust service criteria and control area

**Roles**: Control Owner, Compliance Coordinator, External Auditor

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Audit scope & period confirmation | Form | Compliance Coordinator | Define the audit scope, reporting period, and trust service criteria for this SOC 2 engagement. |
| 2 | Evidence request list (PBC) | File Request | Control Owner | Review the PBC request list and upload all requested evidence for the controls you own. Ensure evidence covers the full audit period. |
| 3 | Clarification Q&A | Form | Control Owner | Answer any clarification questions about the evidence you have submitted. Provide additional context where needed. |
| 4 | Evidence review | To-Do | Compliance Coordinator | Review all submitted evidence for completeness, relevance, and proper coverage of the audit period. Identify any gaps or insufficient evidence. |
| 5 | Follow-up evidence request | File Request | Control Owner | Upload additional evidence to address any gaps identified during the initial review. Ensure all follow-up items are fully addressed. |
| 6 | Evidence package approved | Approval | Compliance Coordinator | Review the complete evidence package for all controls. Approve the package as ready for external auditor review. |
| 7 | Share with external auditor | File Request | External Auditor | Access the evidence package prepared for your review. Upload any additional documentation you may need for the audit. |
| 8 | Auditor follow-up questions | Form | External Auditor | Submit any follow-up questions or additional evidence requests based on your review of the evidence package. |
| 9 | Final evidence uploads | File Request | Control Owner | Upload any final evidence requested by the external auditor. Ensure all auditor follow-up items are fully resolved. |
| 10 | Audit closeout acknowledgement | Acknowledgement | Compliance Coordinator | Confirm that the SOC 2 evidence collection process is complete. All evidence has been reviewed, follow-up items resolved, and the audit is ready for report issuance. |

#### Step 1: Audit scope & period confirmation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Audit Type | Dropdown | Yes |
| Reporting Period Start | Date | Yes |
| Reporting Period End | Date | Yes |
| Trust Service Criteria | Checkbox | Yes |
| Systems in Scope | Text (Multi Line) | Yes |

#### Step 3: Clarification Q&A — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Responses | Text (Multi Line) | Yes |
| Additional Notes | Text (Multi Line) | No |

#### Step 8: Auditor follow-up questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Follow-up Questions | Text (Multi Line) | Yes |
| Additional Evidence Needed | Text (Multi Line) | No |

---

## 2. ISO 27001 Evidence Collection

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Surveillance audit / Certification audit

**Description**: Coordinate ISO 27001 evidence collection for surveillance or certification audits. Ensures systematic collection by control area, gap remediation, and proper packaging for external auditors.

**Use Cases**:
- Preparing evidence for annual ISO 27001 surveillance audits
- Collecting comprehensive evidence for initial ISO 27001 certification
- Coordinating evidence across multiple office locations for recertification
- Managing control owner evidence submissions for integrated ISO 27001/27701 audits

**Recommendations**:
- Integrate with your ISMS tool (OneTrust, Vanta, Tugboat Logic) to auto-map evidence submissions to Annex A controls and track Statement of Applicability coverage
- Connect to your ticketing system (Jira, ServiceNow) to auto-create remediation tickets for nonconformities identified during evidence review
- Set up automated email reminders for control owners as surveillance audit dates approach and evidence submission deadlines near

**Roles**: Control Owner, ISO Program Owner, External Auditor

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | ISMS scope & sites confirmation | Form | ISO Program Owner | Confirm the Information Security Management System scope, sites included, and audit type for this evidence collection cycle. |
| 2 | Statement of Applicability mapping | File Request | ISO Program Owner | Upload the current Statement of Applicability (SoA) mapping all Annex A controls to their implementation status and evidence sources. |
| 3 | Evidence by control area | File Request | Control Owner | Upload evidence for all controls assigned to you. Organize evidence by control area and ensure it demonstrates effective operation of each control. |
| 4 | Control owner clarifications | Form | Control Owner | Provide any additional context or clarifications about the evidence you submitted. Explain any changes to control implementation since the last audit. |
| 5 | Evidence completeness review | To-Do | ISO Program Owner | Review all submitted evidence against the Statement of Applicability. Verify completeness for every applicable control and identify any gaps requiring remediation. |
| 6 | Gap remediation evidence | File Request | Control Owner | Upload evidence to address any gaps identified during the completeness review. This may include new documentation, updated procedures, or corrective actions. |
| 7 | Evidence accepted | Approval | ISO Program Owner | Review the complete evidence package including any remediation items. Approve the package as ready for external auditor review. |
| 8 | External auditor package | File Request | External Auditor | Access the complete evidence package prepared for your ISO 27001 audit. Upload any additional requests or clarifications. |
| 9 | Finding acknowledgement | Acknowledgement | ISO Program Owner | Acknowledge the audit findings and confirm understanding of any nonconformities, observations, or opportunities for improvement identified by the auditor. |

#### Step 1: ISMS scope & sites confirmation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Audit Type | Dropdown | Yes |
| ISMS Scope Description | Text (Multi Line) | Yes |
| Sites in Scope | Text (Multi Line) | Yes |
| Audit Date | Date | Yes |

#### Step 4: Control owner clarifications — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarifications | Text (Multi Line) | Yes |
| Changes Since Last Audit | Text (Multi Line) | No |

---

## 3. External Financial Audit Coordination

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Fiscal year end / Auditor engagement confirmed

**Description**: Coordinate the external financial audit process from planning through report issuance. Manages PBC list distribution, department-level evidence collection, auditor clarifications, and management response to findings.

**Use Cases**:
- Coordinating year-end financial audit evidence collection across departments
- Managing first-year audit transitions with a new audit firm
- Facilitating interim and year-end audit fieldwork for public companies
- Coordinating multi-entity consolidation audit evidence requests

**Recommendations**:
- Integrate with your ERP (NetSuite, SAP, QuickBooks) to auto-export trial balances, reconciliations, and supporting schedules for the PBC list
- Connect to your audit management portal (Suralink, AuditBoard) to share evidence packages with external auditors and track their review status
- Set up Slack or Teams notifications for department heads when PBC items are assigned and when auditor clarification questions are posted

**Roles**: External Auditor, Controller/CFO, Department Heads

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Audit planning & timeline | Form | External Auditor | Provide the audit planning details including scope, timeline, and key dates for fieldwork and report issuance. |
| 2 | PBC list distribution | File Request | Controller/CFO | Upload the Provided by Client (PBC) list to departments. Include all requested schedules, reconciliations, and supporting documentation. |
| 3 | Department evidence collection | File Request | Department Heads | Upload all requested audit evidence for your department. Ensure schedules reconcile to the general ledger and supporting documentation is complete. |
| 4 | Auditor clarifications | Form | Controller/CFO | Respond to auditor clarification questions about the submitted evidence. Provide additional context or calculations as needed. |
| 5 | Follow-up documentation | File Request | Department Heads | Upload any additional documentation requested by the auditors during fieldwork. Address all open items promptly to avoid audit delays. |
| 6 | Draft findings review | To-Do | Controller/CFO | Review the draft audit findings and proposed adjustments. Assess the impact of any identified misstatements and evaluate proposed management letter comments. |
| 7 | Management response | File Request | Controller/CFO | Upload the management response to audit findings, including corrective action plans and timelines for any identified control deficiencies. |
| 8 | Final report acknowledgement | Acknowledgement | Controller/CFO | Acknowledge receipt of the final audit report. Confirm understanding of the audit opinion, significant findings, and management letter recommendations. |

#### Step 1: Audit planning & timeline — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Fiscal Year End Date | Date | Yes |
| Fieldwork Start Date | Date | Yes |
| Fieldwork End Date | Date | Yes |
| Target Report Issuance Date | Date | Yes |
| Key Focus Areas | Text (Multi Line) | Yes |

#### Step 4: Auditor clarifications — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Responses | Text (Multi Line) | Yes |
| Additional Notes | Text (Multi Line) | No |

---

## 4. PCI DSS SAQ + AOC Collection

**Tags**: Retail, E-commerce, Financial Services | **Complexity**: Standard | **Trigger**: Annual PCI cycle / New merchant onboarding

**Description**: Guide merchants through PCI DSS self-assessment questionnaire completion and attestation of compliance. Ensures proper SAQ type determination, evidence collection, security review, and executive sign-off.

**Use Cases**:
- Completing annual PCI DSS self-assessment for e-commerce merchants
- Onboarding new retail merchants with PCI compliance documentation
- Managing PCI compliance across multiple merchant locations
- Coordinating PCI recertification after a payment environment change

**Requirements**:
- [ ] Upload your Attestation of Compliance document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your ASV (Approved Scanning Vendor) to auto-import quarterly vulnerability scan results and attach them as evidence
- Connect to your payment gateway (Stripe, Braintree, Adyen) to auto-populate transaction volume and cardholder data environment details
- Set up automated calendar reminders for annual PCI recertification deadlines and quarterly scan schedules

**Roles**: Merchant Contact, Security Lead, Executive Signer

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Determine SAQ type | Form | Merchant Contact | Answer the following questions to determine which Self-Assessment Questionnaire (SAQ) type applies to your payment processing environment. |
| 2 | Supporting evidence collection | File Request | Merchant Contact | Upload supporting evidence for your PCI compliance including network diagrams, vulnerability scan reports, and penetration test results. |
| 3 | IT environment documentation | File Request | Merchant Contact | Upload documentation of your IT environment including cardholder data flow diagrams, system inventory, and third-party service provider list. |
| 4 | Complete SAQ questionnaire | Form | Merchant Contact | Complete the self-assessment questionnaire for your determined SAQ type. Answer each requirement honestly based on your current environment. |
| 5 | Security review | To-Do | Security Lead | Review the completed SAQ responses and supporting evidence. Verify that all requirements are properly addressed and evidence is sufficient. |
| 6 | Remediation tasks (if required) | To-Do | Merchant Contact | Complete any remediation tasks identified during the security review. Address all gaps before the attestation can be finalized. |
| 7 | SAQ approval | Approval | Security Lead | Approve the completed SAQ and supporting evidence as meeting PCI DSS requirements for the applicable SAQ type. |
| 8 | Executive attestation of compliance | E-Sign | Executive Signer | Review and sign the Attestation of Compliance (AOC), certifying that the organization meets all applicable PCI DSS requirements. |

#### Step 1: Determine SAQ type — Form Fields

| Field | Type | Required |
|-------|------|----------|
| How do you accept card payments? | Dropdown | Yes |
| Do you store cardholder data? | Dropdown | Yes |
| Payment processing method | Dropdown | Yes |
| Annual transaction volume | Number | Yes |

#### Step 4: Complete SAQ questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| SAQ Type | Text (Single Line) | Yes |
| Are all requirements met? | Dropdown | Yes |
| Compensating controls (if any) | Text (Multi Line) | No |
| Remediation plan for gaps | Text (Multi Line) | No |

---

## 5. HIPAA Business Associate Attestation

**Tags**: Healthcare, Providers, Payers, Health Tech | **Complexity**: Simple | **Trigger**: New BA relationship / Annual renewal

**Description**: Collect and verify HIPAA business associate attestations for organizations handling protected health information. Ensures proper safeguard acknowledgement, sub-processor disclosure, and compliance review.

**Use Cases**:
- Onboarding new SaaS vendors that will handle patient data
- Conducting annual HIPAA attestation renewals for existing business associates
- Verifying compliance of health IT subcontractors handling PHI
- Documenting BA compliance for health plan third-party administrators

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your vendor risk management platform (OneTrust Vendorpedia, ProcessUnity, Prevalent) to auto-track BA attestation status across all third-party relationships
- Connect to your HIPAA compliance platform (Compliancy Group, HIPAA One) to sync attestation results with your overall compliance posture dashboard
- Set up automated email reminders for annual BA attestation renewal deadlines and escalation alerts for non-responsive business associates

**Roles**: Business Associate Contact, Compliance Lead

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | BA attestation questionnaire | Form | Business Associate Contact | Complete the business associate attestation questionnaire covering your HIPAA safeguards, policies, and practices. |
| 2 | Safeguard acknowledgement | Acknowledgement | Business Associate Contact | Acknowledge that your organization has implemented the required administrative, physical, and technical safeguards for protecting PHI as required by the HIPAA Security Rule. |
| 3 | Sub-processor disclosure | File Request | Business Associate Contact | Upload a list of all sub-processors or subcontractors who may access, process, or store PHI on your behalf. Include their role and data handling scope. |
| 4 | Security documentation | File Request | Business Associate Contact | Upload relevant security documentation such as your HIPAA policies, risk assessment summary, incident response plan, or SOC 2 report. |
| 5 | Compliance review | To-Do | Compliance Lead | Review the attestation responses, safeguard acknowledgement, and supporting documentation. Assess the business associate's HIPAA compliance posture. |
| 6 | Attestation accepted | Approval | Compliance Lead | Approve or reject the business associate attestation based on the compliance review. Document any conditions or follow-up requirements. |
| 7 | Completion acknowledgement | Acknowledgement | Business Associate Contact | Acknowledge the outcome of the attestation review. If approved, confirm your ongoing commitment to maintaining HIPAA compliance. |

#### Step 1: BA attestation questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Organization Name | Text (Single Line) | Yes |
| Primary Contact Name | Text (Single Line) | Yes |
| Contact Email | Email | Yes |
| Do you have a HIPAA compliance program? | Dropdown | Yes |
| Date of last HIPAA risk assessment | Date | Yes |
| Do you use sub-processors for PHI? | Dropdown | Yes |
| Have you had a breach in the last 3 years? | Dropdown | Yes |

---

## 6. Internal Audit Evidence Request

**Tags**: All Industries | **Complexity**: Standard | **Trigger**: Internal audit plan / Risk-based trigger

**Description**: Manage internal audit evidence collection from kickoff through closeout. Provides a structured process for requesting, reviewing, and following up on audit evidence with control owners and department managers.

**Use Cases**:
- Conducting scheduled internal audits per the annual audit plan
- Running risk-based audits triggered by control incidents or process changes
- Collecting evidence for compliance-focused internal audits (SOX, regulatory)
- Managing cross-departmental audit evidence requests for operational audits

**Recommendations**:
- Integrate with your audit management platform (AuditBoard, TeamMate+, Galvanize) to auto-create audit engagements, track findings, and maintain the annual audit plan
- Connect to your GRC platform (ServiceNow GRC, Archer, LogicGate) to sync audit findings with the risk register and link to corrective action tracking
- Set up Slack or Teams notifications for control owners when evidence requests are assigned and for audit leads when follow-up items are overdue

**Roles**: Audit Lead, Control Owner, Department Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Audit kickoff & scope | Form | Audit Lead | Define the internal audit scope, objectives, and timeline. Identify the control areas and departments under review. |
| 2 | Evidence request | File Request | Control Owner | Upload all requested audit evidence for the controls you own. Ensure documentation covers the full audit period and demonstrates control effectiveness. |
| 3 | Clarification questions | Form | Control Owner | Respond to any clarification questions from the audit team about the evidence you submitted. |
| 4 | Evidence review | To-Do | Audit Lead | Review all submitted evidence against the audit program. Document findings, note any control deficiencies, and identify areas requiring follow-up. |
| 5 | Follow-up request | File Request | Control Owner | Upload additional evidence to address gaps or findings identified during the audit review. Provide any requested supplementary documentation. |
| 6 | Department manager sign-off | Approval | Department Manager | Review the audit findings for your department. Approve the findings and confirm that the management responses and corrective action plans are accurate. |
| 7 | Finding response | File Request | Department Manager | Upload the formal management response to audit findings including corrective action plans, responsible parties, and target completion dates. |
| 8 | Audit closeout | Acknowledgement | Audit Lead | Confirm that the internal audit engagement is complete. All evidence has been reviewed, findings documented, and management responses received. |

#### Step 1: Audit kickoff & scope — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Audit Title | Text (Single Line) | Yes |
| Audit Objective | Text (Multi Line) | Yes |
| Scope / Control Areas | Text (Multi Line) | Yes |
| Audit Period | Text (Single Line) | Yes |
| Evidence Submission Deadline | Date | Yes |

#### Step 3: Clarification questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Responses | Text (Multi Line) | Yes |
| Additional Context | Text (Multi Line) | No |

---

## 7. Periodic Compliance Certification

**Tags**: Financial Services, Regulated Industries | **Complexity**: Standard | **Trigger**: Quarterly/annual compliance cycle

**Description**: Manage quarterly or annual compliance certification cycles from initiation through executive sign-off. Automates certification distribution, self-assessment collection, and exception flagging across business units.

**Use Cases**:
- Running quarterly SOX sub-certifications across business units
- Conducting annual code of conduct certifications for all employees
- Managing regulatory compliance attestations for financial services firms
- Coordinating conflict of interest disclosures across the organization

**Requirements**:
- [ ] Upload your compliance certification document for e-signature (replaces sample)

**Recommendations**:
- Integrate with your GRC platform (ServiceNow GRC, Archer, LogicGate) to auto-distribute certifications by business unit and aggregate results into compliance dashboards
- Connect to your HRIS (Workday, BambooHR) to auto-populate certifier lists by department and role, ensuring complete coverage
- Set up automated email and Slack reminders for certifiers approaching submission deadlines with escalation to managers for non-respondents
- Sync certification results to your SOX compliance tool (AuditBoard, Workiva) for sub-certification tracking and executive roll-up reporting

**Roles**: Certifier, Compliance Officer, Executive

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Certification cycle initiation | Form | Compliance Officer | Set up the compliance certification cycle. Define the period, certification type, and list of certifiers. |
| 2 | Pre-certification materials | File Request | Compliance Officer | Upload reference materials, guidance documents, and prior period certifications for certifier review. |
| 3 | Certification notification | To-Do | Compliance Officer | Automated notification: Send certification notifications to all certifiers with instructions, reference materials, and the submission deadline. |
| 4 | Compliance self-assessment | Form | Certifier | Complete the compliance self-assessment for your area of responsibility. Answer each question based on the current state of your controls and processes. |
| 5 | Supporting evidence upload | File Request | Certifier | Upload any supporting evidence for your certification responses. Include documentation for any exceptions or process changes noted. |
| 6 | AI certification aggregation | To-Do | Compliance Officer | AI-powered: Aggregate all certification responses and flag "No" responses, exceptions, inconsistencies across business units, and patterns requiring investigation. |
| 7 | Exception investigation | To-Do | Compliance Officer | Investigate all flagged exceptions and inconsistencies from the certification responses. Document findings and required corrective actions. |
| 8 | Compliance officer review | Approval | Compliance Officer | Review the aggregated certification results, exception investigations, and overall compliance posture. Approve the certification package for executive sign-off. |
| 9 | Executive certification | E-Sign | Executive | Review the compliance certification summary and sign the executive certification confirming organizational compliance for the reporting period. |

#### Step 1: Certification cycle initiation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Certification Period | Text (Single Line) | Yes |
| Certification Type | Dropdown | Yes |
| Submission Deadline | Date | Yes |
| Certifier List / Departments | Text (Multi Line) | Yes |

#### Step 4: Compliance self-assessment — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Department / Business Unit | Text (Single Line) | Yes |
| Are all compliance requirements met? | Dropdown | Yes |
| Exceptions or Deviations | Text (Multi Line) | No |
| Process Changes Since Last Certification | Text (Multi Line) | No |
| Remediation Plans (if applicable) | Text (Multi Line) | No |

---

## 8. Policy Acknowledgement Rollout

**Tags**: All Industries | **Complexity**: Simple | **Trigger**: New/updated policy / Annual re-acknowledgement

**Description**: Distribute new or updated policies to recipients and track acknowledgement completion. Provides a structured process for policy publication, distribution, knowledge verification, and follow-up on non-respondents.

**Use Cases**:
- Rolling out updated information security policies to all employees
- Distributing annual code of conduct re-acknowledgements
- Publishing new data privacy policies in response to regulatory changes
- Tracking anti-harassment policy acknowledgements during onboarding

**Recommendations**:
- Connect to your HRIS (Workday, BambooHR) to auto-distribute policies to new hires during onboarding and maintain up-to-date employee rosters for rollouts
- Integrate with your LMS (Cornerstone, Lessonly) to pair policy acknowledgements with required training modules and track completion together
- Set up Slack or email escalation alerts for managers when their direct reports have not acknowledged policies by the deadline

**Roles**: Policy Recipient, Compliance Admin

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Policy publication details | Form | Compliance Admin | Enter the details of the policy being published or updated. This information will be used for distribution and tracking. |
| 2 | Policy document upload | File Request | Compliance Admin | Upload the final policy document for distribution to recipients. |
| 3 | Distribution notification | To-Do | Compliance Admin | Automated notification: Send policy distribution notifications to all recipients with the policy document, summary of changes, and acknowledgement deadline. |
| 4 | Policy review & acknowledgement | Acknowledgement | Policy Recipient | Read the policy document in full. Acknowledge that you have read, understood, and agree to comply with the policy. |
| 5 | Knowledge verification (if required) | Form | Policy Recipient | Complete this brief knowledge check to verify your understanding of the key policy provisions. |
| 6 | Manager follow-up for non-respondents | To-Do | Compliance Admin | Follow up with recipients who have not acknowledged the policy by the deadline. Escalate to managers if necessary and document all outreach. |
| 7 | Rollout closure | Acknowledgement | Compliance Admin | Confirm that the policy rollout is complete. Document the acknowledgement rate and any outstanding non-respondents for the compliance record. |

#### Step 1: Policy publication details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Policy Title | Text (Single Line) | Yes |
| Policy Category | Dropdown | Yes |
| Effective Date | Date | Yes |
| Target Audience | Text (Multi Line) | Yes |
| Acknowledgement Deadline | Date | Yes |

#### Step 5: Knowledge verification (if required) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| What is the main purpose of this policy? | Text (Multi Line) | Yes |
| Who should you contact with questions about this policy? | Text (Single Line) | Yes |
| Do you have any questions about the policy? | Text (Multi Line) | No |

---

## 9. Regulatory Inquiry Response Coordination

**Tags**: Financial Services, Healthcare, Regulated Industries | **Complexity**: Simple | **Trigger**: Regulatory inquiry received

**Description**: Coordinate the response to regulatory inquiries through structured evidence collection, subject matter expert input, legal review, and executive approval. Ensures timely and accurate responses to regulatory agencies.

**Use Cases**:
- Responding to SEC examination inquiries for financial services firms
- Coordinating responses to CMS audit inquiries for healthcare organizations
- Managing state regulatory inquiries about licensing or compliance
- Handling FINRA information requests for broker-dealer operations

**Recommendations**:
- Integrate with your regulatory correspondence management system (RegTech, Compliance.ai) to auto-log inquiries, track deadlines, and maintain a complete response history
- Connect to your document management system (SharePoint, iManage) to centralize evidence collection and version-control draft responses before submission
- Set up Slack or Teams deadline alerts with escalation paths for response due dates, legal review turnaround, and executive approval windows

**Roles**: Compliance Owner, Subject Matter Expert, Legal Counsel, Executive Sponsor

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Inquiry intake & scope | Form | Compliance Owner | Log the regulatory inquiry details including the issuing agency, scope, and response deadline. |
| 2 | Evidence collection from SMEs | File Request | Subject Matter Expert | Upload all relevant documentation and evidence to support the inquiry response. Include policies, procedures, logs, and any other materials requested. |
| 3 | SME clarifications | Form | Subject Matter Expert | Provide additional context and clarifications about the evidence and your area of expertise. |
| 4 | Draft response preparation | To-Do | Compliance Owner | Prepare the draft response to the regulatory inquiry. Compile all evidence, SME input, and supporting documentation into a cohesive response package. |
| 5 | Legal review | To-Do | Legal Counsel | Review the draft response for legal accuracy, completeness, and appropriate tone. Ensure the response does not inadvertently create additional liability or regulatory exposure. |
| 6 | Executive approval | Approval | Executive Sponsor | Review and approve the final regulatory inquiry response before submission to the agency. |
| 7 | Final submission confirmation | Acknowledgement | Compliance Owner | Confirm that the regulatory inquiry response has been submitted to the agency. Document the submission method, date, and any follow-up commitments. |

#### Step 1: Inquiry intake & scope — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Regulatory Agency | Text (Single Line) | Yes |
| Inquiry Reference Number | Text (Single Line) | Yes |
| Date Received | Date | Yes |
| Response Deadline | Date | Yes |
| Inquiry Scope / Questions | Text (Multi Line) | Yes |
| Applicable Regulations | Text (Multi Line) | Yes |

#### Step 3: SME clarifications — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Responses | Text (Multi Line) | Yes |
| Additional Context | Text (Multi Line) | No |

---

## 10. Internal Control Self-Assessment

**Tags**: All Industries, GRC | **Complexity**: Standard | **Trigger**: Quarterly/annual assessment cycle / Risk event

**Description**: Conduct periodic self-assessments of internal controls across the organization. Control owners evaluate effectiveness, document deviations, and submit remediation plans for department manager attestation.

**Use Cases**:
- Running quarterly internal control self-assessments for SOX compliance
- Conducting annual risk-based control assessments across departments
- Managing targeted control assessments after a process change or incident
- Coordinating organization-wide IT general controls (ITGC) self-assessments

**Recommendations**:
- Integrate with your GRC platform (ServiceNow GRC, Archer, LogicGate) to sync self-assessment results with the control inventory and risk register for real-time risk posture visibility
- Connect to your SOX compliance tool (AuditBoard, Workiva) to auto-feed self-assessment ratings into SOX testing plans and management attestation workflows
- Set up Slack or Teams notifications for control owners when assessment cycles open and for compliance coordinators when remediation plans are overdue
- Push completed assessments and remediation plans to SharePoint or Confluence for department manager review and historical trend analysis

**Roles**: Control Owner, Compliance Coordinator, Department Manager

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Assessment cycle initiation | Form | Compliance Coordinator | Set up the self-assessment cycle. Define the assessment period, scope, control areas, and assign control owners. |
| 2 | Control inventory & prior findings | File Request | Compliance Coordinator | Upload the control inventory with descriptions, expected evidence, and prior assessment results. This will guide control owners in their self-assessment. |
| 3 | Self-assessment questionnaire | Form | Control Owner | Complete the self-assessment for each control you own. Rate effectiveness, document any deviations, and report on remediation of prior findings. |
| 4 | Supporting evidence upload | File Request | Control Owner | Upload evidence supporting your self-assessment responses. Include documentation demonstrating control operation and effectiveness. |
| 5 | Compliance coordinator review | To-Do | Compliance Coordinator | Review all self-assessment responses and supporting evidence. Identify trends, common gaps, and areas requiring further investigation or remediation. |
| 6 | Clarification questions | Form | Control Owner | Respond to follow-up questions from the compliance team about your self-assessment responses. |
| 7 | Remediation plan for gaps (if any) | Form | Control Owner | If any control gaps or deficiencies were identified, submit a remediation plan with specific actions, responsible parties, and target dates. |
| 8 | Department manager attestation | Approval | Department Manager | Review the self-assessment results and remediation plans for your department. Attest that the assessment accurately reflects the state of internal controls. |
| 9 | Assessment closure | Acknowledgement | Compliance Coordinator | Confirm that the self-assessment cycle is complete. All assessments have been reviewed, remediation plans accepted, and department attestations received. |

#### Step 1: Assessment cycle initiation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Assessment Period | Text (Single Line) | Yes |
| Scope / Control Areas | Text (Multi Line) | Yes |
| Submission Deadline | Date | Yes |
| Control Owner Assignments | Text (Multi Line) | Yes |

#### Step 3: Self-assessment questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Control Effectiveness Rating | Dropdown | Yes |
| Deviations Noted | Text (Multi Line) | No |
| Process Changes Since Last Assessment | Text (Multi Line) | No |
| Remediation Status of Prior Findings | Text (Multi Line) | No |

#### Step 6: Clarification questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Clarification Responses | Text (Multi Line) | Yes |

#### Step 7: Remediation plan for gaps (if any) — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Gap Description | Text (Multi Line) | Yes |
| Remediation Actions | Text (Multi Line) | Yes |
| Responsible Party | Text (Single Line) | Yes |
| Target Completion Date | Date | Yes |
