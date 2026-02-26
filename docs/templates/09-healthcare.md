# Healthcare (5 Templates)

> Workflow templates for healthcare organizations including prior authorization, patient intake, medical records release, provider credentialing, and clinical trial enrollment.

---

## 1. Prior Authorization Coordination

**Tags**: Healthcare, Providers, Payers | **Complexity**: Standard | **Trigger**: Treatment/procedure requires prior auth

**Description**: Coordinate prior authorization requests between provider staff, payers, and physicians from initial submission through clinical review and decision. Reduces authorization delays and keeps all parties informed.

**Use Cases**:
- Surgical procedure requiring insurance pre-authorization
- Specialty medication prior authorization for a chronic condition
- Advanced imaging study requiring payer approval before scheduling
- Durable medical equipment authorization for a post-surgical patient

**Requirements**:
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your EHR (Epic, Cerner, athenahealth) to auto-pull patient demographics, insurance details, and clinical history into the authorization request
- Connect to payer prior auth portals (Availity, CoverMyMeds) to auto-submit requests and receive real-time status updates
- Use AI to cross-reference prior authorization criteria against patient records and auto-draft the clinical justification narrative, reducing provider staff documentation time
- Chain with the Patient Intake & Medical Records Collection template when the authorized procedure requires intake at a new facility or specialist office

**Roles**: Patient, Provider Staff, Payer Contact, Physician

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Submission** | | | |
| 1 | Treatment request details | Form | Provider Staff | Submit the treatment or procedure request details for prior authorization review by the payer. |
| 2 | Clinical documentation | File Request | Provider Staff | Upload supporting clinical documentation including relevant medical records, test results, treatment history, and clinical notes that support the authorization request. |
| 3 | Patient consent | Acknowledgement | Patient | Acknowledge that a prior authorization request has been submitted on your behalf and confirm your understanding that the treatment is pending payer approval. |
| | **📌 Clinical Review** | | | |
| 4 | Payer review | To-Do | Payer Contact | Review the prior authorization request, clinical documentation, and medical necessity criteria. Determine if additional information is needed or if a decision can be rendered. |
| 5 | Payer questions | Form | Provider Staff | Respond to additional questions from the payer regarding the authorization request. |
| 6 | Physician peer-to-peer (if needed) | To-Do | Physician | Participate in a peer-to-peer review call with the payer medical director to discuss the clinical necessity of the requested treatment or procedure. |
| 7 | Additional clinical information | File Request | Provider Staff | Upload any additional clinical information requested by the payer to support the authorization determination. |
| | **📌 Determination** | | | |
| 8 | Authorization determination | Decision | Payer Contact | Determine authorization outcome: approve the requested service, request additional clinical documentation, or deny with rationale. |
| 9 | Authorization decision | Approval | Payer Contact | Render the authorization decision: Approve, Deny, or Approve with Modifications. Include the authorization number, effective dates, and any conditions. |
| 10 | Decision acknowledgement | Acknowledgement | Provider Staff | Acknowledge receipt of the authorization decision. If approved, proceed with scheduling. If denied, review appeal options with the patient and physician. |

#### Step 1: Treatment request details — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Patient Name | TEXT_SINGLE_LINE | Yes |
| Insurance ID Number | TEXT_SINGLE_LINE | Yes |
| Requested Procedure / Treatment | TEXT_MULTI_LINE | Yes |
| CPT / HCPCS Code(s) | TEXT_SINGLE_LINE | Yes |
| Clinical Justification | TEXT_MULTI_LINE | Yes |
| Ordering Physician | TEXT_SINGLE_LINE | Yes |

#### Step 5: Payer questions — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Response to Payer Questions | TEXT_MULTI_LINE | Yes |
| Alternative Treatments Considered | TEXT_MULTI_LINE | No |
| Additional Clinical Notes | TEXT_MULTI_LINE | No |

---

## 2. Patient Intake & Medical Records Collection

**Tags**: Healthcare, Providers | **Complexity**: Standard | **Trigger**: New patient scheduled

**Description**: Streamline new patient intake with structured demographics collection, insurance verification, medical history, and prior records transfer. Ensures complete patient files before the first appointment.

**Use Cases**:
- New patient onboarding at a primary care practice
- Specialist referral requiring prior records and insurance verification
- Patient transfer between healthcare systems with medical records exchange
- New patient intake for a multi-specialty clinic

**Requirements**:
- [ ] Upload your consent forms document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Integrate with your EHR (Epic, Cerner, athenahealth) to auto-create the patient chart and push demographics, medical history, and insurance data directly into the system
- Connect to your insurance eligibility verification service (Availity, Waystar) to auto-verify coverage and benefits in real time
- Use AI to auto-review the completed medical history questionnaire and flag potential drug interactions, allergy concerns, or care gaps that the provider should address at the first visit
- Chain with the Prior Authorization Coordination template when the intake reveals a scheduled procedure or specialty referral that requires payer pre-approval

**Roles**: Patient, Intake Coordinator, Prior Provider, Insurance Verifier

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Registration & Insurance** | | | |
| 1 | Patient demographics | Form | Patient | Complete your patient demographics form with your personal and contact information. |
| 2 | Insurance information | File Request | Patient | Upload a copy of your insurance card (front and back) along with any secondary insurance information. |
| 3 | Insurance verification | To-Do | Insurance Verifier | Verify the patient insurance coverage including eligibility, benefits, copay amounts, deductible status, and any referral or authorization requirements. |
| | **📌 Medical History & Records** | | | |
| 4 | Medical history questionnaire | Form | Patient | Complete the medical history questionnaire to help your care team understand your health background. |
| 5 | Prior medical records request | File Request | Prior Provider | Upload the requested medical records for the patient including clinical notes, lab results, imaging reports, and treatment history. |
| 6 | Prior records delivery | File Request | Prior Provider | Upload any additional records or documentation that were not included in the initial records transfer. |
| | **📌 Consent & Completion** | | | |
| 7 | Consent forms | E-Sign | Patient | Review and sign the patient consent forms including consent to treat, financial responsibility, HIPAA privacy practices, and communication preferences. |
| 8 | Intake complete | Acknowledgement | Intake Coordinator | Confirm that all patient intake materials have been received, insurance has been verified, and the patient file is complete and ready for the provider. |

#### Step 1: Patient demographics — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | TEXT_SINGLE_LINE | Yes |
| Date of Birth | DATE | Yes |
| Address | TEXT_MULTI_LINE | Yes |
| Phone Number | TEXT_SINGLE_LINE | Yes |
| Email Address | EMAIL | Yes |
| Emergency Contact Name | TEXT_SINGLE_LINE | Yes |
| Emergency Contact Phone | TEXT_SINGLE_LINE | Yes |

#### Step 4: Medical history questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Current Medications | TEXT_MULTI_LINE | No |
| Known Allergies | TEXT_MULTI_LINE | No |
| Previous Surgeries | TEXT_MULTI_LINE | No |
| Chronic Conditions | TEXT_MULTI_LINE | No |
| Family Medical History | TEXT_MULTI_LINE | No |
| Current Symptoms or Concerns | TEXT_MULTI_LINE | Yes |

---

## 3. Medical Records Release Authorization

**Tags**: Healthcare, Providers | **Complexity**: Simple | **Trigger**: Records release requested

**Description**: Process medical records release requests with HIPAA-compliant authorization, identity verification, and secure delivery. Ensures patient privacy while facilitating timely records transfer.

**Use Cases**:
- Patient requesting records transfer to a new healthcare provider
- Attorney requesting medical records with patient authorization
- Insurance company requesting records for claims processing
- Patient requesting personal copies of their medical records

**Requirements**:
- [ ] Upload your HIPAA authorization document for e-signature (replaces sample)

**Recommendations**:
- Connect to your EHR (Epic, Cerner) to auto-compile requested medical records and verify the release authorization against the patient chart
- Integrate with a secure file exchange platform (Virtru, Kiteworks) for HIPAA-compliant encrypted delivery of medical records to receiving parties
- Use AI to auto-validate the HIPAA authorization form for completeness (valid date range, specific records identified, proper signatures) and flag deficiencies before records preparation begins
- Chain with the Insurance Claim Coordination template when the records release purpose is insurance claims processing, so the carrier receives records and the claim moves forward in parallel

**Roles**: Patient, Records Coordinator, Receiving Party

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| 1 | Release request | Form | Patient | Submit your records release request specifying which records you want released and to whom. |
| 2 | HIPAA authorization | E-Sign | Patient | Review and sign the HIPAA authorization form granting permission to release your protected health information to the designated receiving party. |
| 3 | Identity verification | File Request | Patient | Upload a copy of your government-issued photo ID for identity verification before records can be released. |
| 4 | Receiving party confirmation | Acknowledgement | Receiving Party | Confirm your identity as the designated receiving party and acknowledge your obligation to handle the medical records in compliance with applicable privacy regulations. |
| 5 | Records preparation | To-Do | Records Coordinator | Compile the requested medical records, verify the HIPAA authorization is valid and complete, and prepare the records package for secure delivery. |
| 6 | Records delivery | File Request | Records Coordinator | Upload the compiled medical records for secure delivery to the authorized receiving party. |
| 7 | Receipt acknowledgement | Acknowledgement | Receiving Party | Acknowledge receipt of the medical records and confirm the records received match what was requested. |

#### Step 1: Release request — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Patient Name | TEXT_SINGLE_LINE | Yes |
| Date of Birth | DATE | Yes |
| Records Requested | TEXT_MULTI_LINE | Yes |
| Date Range of Records | TEXT_SINGLE_LINE | No |
| Receiving Party Name | TEXT_SINGLE_LINE | Yes |
| Receiving Party Contact | EMAIL | Yes |
| Purpose of Release | DROPDOWN | Yes |

---

## 4. Provider Credentialing

**Tags**: Healthcare, Providers, Payers, Health Systems | **Complexity**: Standard | **Trigger**: New provider hire / Recredentialing due

**Description**: Manage the full provider credentialing lifecycle from application through primary source verification, committee review, and privileging. Ensures compliance with NCQA and Joint Commission standards.

**Use Cases**:
- New physician credentialing for hospital medical staff privileges
- Health plan provider network credentialing and enrollment
- Triennial re-credentialing of existing medical staff members
- Locum tenens provider temporary credentialing

**Requirements**:
- [ ] Upload your provider agreement document for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your credentialing verification organization (CVO) or CAQH ProView to auto-pull provider application data and primary source verification results
- Integrate with NPDB, OIG/SAM exclusion lists, and state license boards for automated sanctions screening and continuous monitoring alerts
- Use AI to auto-scan uploaded credentials (license images, board certificates, DEA registrations) to extract expiration dates, verify document authenticity markers, and flag any that are expired or expiring within 90 days
- Schedule auto-launch of the re-credentialing flow 120 days before each provider's 36-month expiration date to ensure NCQA-compliant timelines

**Roles**: Provider, Credentialing Coordinator, Medical Director, Credentialing Committee

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Application** | | | |
| 1 | Credentialing application & attestation | Form | Provider | Complete the credentialing application with your professional background, training, and practice information. Your attestation of accuracy is required. |
| 2 | Supporting credentials upload | File Request | Provider | Upload copies of your professional credentials including medical license, DEA certificate, board certification, malpractice insurance face sheet, CV, peer reference contacts, and government-issued ID. |
| | **📌 Verification** | | | |
| 3 | Primary source verification & sanctions screening | To-Do | Credentialing Coordinator | Perform primary source verification including state license board verification, NPDB query, education and training verification, board certification with ABMS, DEA status check, OIG/SAM exclusion list screening, peer reference calls, and work history verification. |
| 4 | Credentialing file assembly | To-Do | Credentialing Coordinator | Compile all documents, primary source verification results, and reference responses into the credentialing file. Verify completeness and prepare the recommendation for committee review. |
| | **📌 Committee Review & Decision** | | | |
| 5 | Medical Director review | Approval | Medical Director | Review the compiled credentialing file. Evaluate any flags, gaps in practice history, or malpractice claims. Approve for committee review or escalate concerns. |
| 6 | Committee credentialing decision | Decision | Credentialing Committee | Committee renders credentialing decision: approve full privileges, approve with restrictions, defer pending additional information, or deny. |
| 7 | Credentialing Committee approval | Approval | Credentialing Committee | Review the credentialing file and Medical Director recommendation. Approve with full privileges, approve with restrictions, or deny with documented rationale. |
| | **📌 Onboarding** | | | |
| 8 | Provider notification | To-Do | Credentialing Coordinator | Automated notification: Send the provider notification of the credentialing decision including effective date, approved privileges, and appeal process information if denied. |
| 9 | Provider agreement | E-Sign | Provider | Review and sign the provider agreement acknowledging your approved privileges, organizational policies, and re-credentialing obligations. |
| 10 | Re-credentialing schedule | To-Do | Credentialing Coordinator | Set up the 36-month re-credentialing trigger, enroll the provider in continuous NPDB monitoring, and configure license expiration alerts in the credentialing system. |

#### Step 1: Credentialing application & attestation — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Legal Name | TEXT_SINGLE_LINE | Yes |
| NPI Number | TEXT_SINGLE_LINE | Yes |
| Medical School & Graduation Year | TEXT_SINGLE_LINE | Yes |
| Residency / Fellowship Training | TEXT_MULTI_LINE | Yes |
| Work History (Past 5 Years) | TEXT_MULTI_LINE | Yes |
| State License Number(s) | TEXT_MULTI_LINE | Yes |
| DEA Number | TEXT_SINGLE_LINE | Yes |
| Board Certification(s) | TEXT_MULTI_LINE | No |
| Hospital Affiliations | TEXT_MULTI_LINE | No |
| Malpractice History | TEXT_MULTI_LINE | Yes |
| Privilege Delineation Requested | TEXT_MULTI_LINE | Yes |
| Attestation of Accuracy | CHECKBOX | Yes |

---

## 5. Clinical Trial Participant Enrollment

**Tags**: Healthcare, Life Sciences, Research | **Complexity**: Standard | **Trigger**: Potential participant identified

**Description**: Manage clinical trial participant enrollment from informed consent through eligibility screening, baseline assessments, and randomization. Ensures FDA and HIPAA compliance throughout the enrollment process.

**Use Cases**:
- Phase III clinical trial recruiting participants for a new therapeutic
- Investigator-initiated study enrolling patients at a single site
- Multi-site clinical trial with centralized eligibility screening
- Rare disease clinical trial with complex inclusion/exclusion criteria

**Requirements**:
- [ ] Upload your informed consent form (ICF) with HIPAA authorization for e-signature (replaces sample)
- [ ] Customize form fields to match your organization

**Recommendations**:
- Connect to your electronic data capture (EDC) system (Medidata Rave, Oracle Clinical One, REDCap) to auto-push enrollment CRFs and baseline assessment data
- Integrate with your clinical trial management system (CTMS) to auto-update enrollment counts, site metrics, and participant status in real time
- Use AI to auto-screen participant questionnaire responses against the protocol inclusion/exclusion criteria and generate a preliminary eligibility summary with flagged criteria for the Study Coordinator
- Chain with the Medical Records Release Authorization template to obtain prior medical records from the participant's treating physician when the protocol requires historical clinical data for eligibility verification

**Roles**: Participant, Study Coordinator, Principal Investigator

### Steps

| # | Step | Type | Assigned To | Description |
|---|------|------|-------------|-------------|
| | **📌 Consent & Screening** | | | |
| 1 | Informed consent & HIPAA authorization | E-Sign | Participant | Review and sign the IRB-approved informed consent form covering the study purpose, procedures, risks, benefits, alternatives, confidentiality, and voluntary participation. The HIPAA authorization permits use of your protected health information for research purposes. |
| 2 | Pre-screening questionnaire | Form | Participant | Complete the pre-screening questionnaire to help the study team determine your preliminary eligibility for the trial. |
| 3 | Medical history & eligibility assessment | Form | Participant | Provide your detailed medical history and condition-specific information required by the study protocol for eligibility assessment. |
| | **📌 Eligibility Determination** | | | |
| 4 | Inclusion/exclusion criteria verification | To-Do | Study Coordinator | Review participant responses against the protocol inclusion and exclusion criteria. Document which criteria are met or unmet and prepare the eligibility summary for the Principal Investigator. |
| 5 | Eligibility determination | Decision | Principal Investigator | Review the eligibility summary and make the final determination: Eligible for enrollment, Screen Failure, or Rescreening Required. |
| | **📌 Enrollment & Randomization** | | | |
| 6 | Baseline assessments & enrollment | To-Do | Study Coordinator | Complete the protocol-required baseline assessments and enter the enrollment case report form (CRF) in the electronic data capture (EDC) system. |
| 7 | Enrollment confirmation & study materials | Acknowledgement | Participant | Acknowledge your enrollment in the study and confirm receipt of the study schedule, visit calendar, site contact information, and participant instructions. |
| 8 | Randomization & treatment assignment | To-Do | Study Coordinator | Automated notification: Complete randomization per the protocol scheme and notify relevant parties of the treatment arm assignment. Blinding rules apply per the study protocol. |

#### Step 2: Pre-screening questionnaire — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Date of Birth | DATE | Yes |
| Gender | DROPDOWN | Yes |
| Medical History Summary | TEXT_MULTI_LINE | Yes |
| Preliminary Eligibility Questions | TEXT_MULTI_LINE | Yes |

#### Step 3: Medical history & eligibility assessment — Form Fields

| Field | Type | Required |
|-------|------|----------|
| Detailed Medical History | TEXT_MULTI_LINE | Yes |
| Current Medications | TEXT_MULTI_LINE | Yes |
| Recent Lab Results | TEXT_MULTI_LINE | No |
| Condition-Specific Information | TEXT_MULTI_LINE | Yes |
