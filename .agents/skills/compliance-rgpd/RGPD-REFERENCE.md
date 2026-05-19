# RGPD REFERENCE — Complete Regulatory Documentation

**For regulatory research, compliance audits, and legal reference. For practical implementation, see SKILL.md.**

---

## 📖 What is RGPD?

**Règlement Général sur la Protection des Données** (General Data Protection Regulation)

- **Regulation**: EU Regulation 2016/679 (27 April 2016)
- **Scope**: Any processing of personal data of natural persons in the EU/EEA
- **Impact**: Protects fundamental rights (privacy, dignity, autonomy)
- **Enforcement**: European Data Protection Board + National supervisory authorities
- **Penalties**:
  - **Tier 1**: Up to €10,000,000 or 2% global annual turnover (whichever is higher)
    - Articles 8, 11, 25-39, 42-43
  - **Tier 2**: Up to €20,000,000 or 4% global annual turnover (whichever is higher)
    - Articles 5, 6, 7, 9 (principles, consent, special categories)
    - Articles 12-22 (data subject rights)
    - Articles 44-49 (international transfers)
    - Non-compliance with supervisory authority orders
- **Entry into Force**: 25 May 2018
- **Reference**: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02016R0679-20160504

---

## 📋 Complete Core Definitions (Article 4)

### Personal Data

**Definition**: Any information relating to an identified or identifiable natural person

- **Identified person**: Directly named (name, national ID number, online username)
- **Identifiable person**: Can be identified indirectly by reference to:
  - Identity numbers
  - Location data
  - Online identifiers
  - Factors specific to physical identity (appearance, fingerprints)
  - Factors specific to physiological identity (genetic data, health markers)
  - Factors specific to mental identity (psychological profile)
  - Factors specific to economic identity (income, employment)
  - Factors specific to cultural identity (nationality, ethnicity)
  - Factors specific to social identity (relationships, memberships)

**Note**: Anonymized data = NOT personal data. Pseudonymized data = still personal data.

### Processing

**Definition**: Any operation or set of operations on personal data, whether automated or not

Examples include:

- Collection
- Recording
- Organization
- Structuring
- Storage
- Adaptation or alteration
- Retrieval
- Consultation
- Use
- Disclosure by transmission
- Dissemination or otherwise making available
- Alignment or combination
- Restriction
- Erasure
- Destruction

### Key Entities

- **Data Subject**: The natural person to whom personal data relates
- **Controller**: Person/entity determining purposes AND means of processing
- **Processor**: Person/entity processing data on behalf of controller (but NOT determining purposes/means)
- **Recipient**: Person/entity to whom personal data is disclosed
- **Third Party**: Any entity other than data subject, controller, processor, or authorized staff

### Special Data Categories (Article 9)

**Personal Data Revealing:**

- Racial or ethnic origin
- Political opinions
- Religious or philosophical beliefs
- Trade union membership
- **Genetic data**: Information inherited/acquired resulting from analysis of biological sample giving unique info on physiology/health
- **Biometric data**: Technical processing of physical, physiological, or behavioral characteristics allowing/confirming unique identification (facial images, fingerprints)
- **Health data**: Physical or mental health information including healthcare provision revealing health status
- **Sex life or sexual orientation data**

### Additional Concepts

- **Personal Data Breach**: Security breach causing accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to personal data
- **Profiling**: Automated processing to evaluate personal aspects (performance, economic situation, health, preferences, interests, reliability, behavior, location, movements)
- **Pseudonymization**: Processing so data cannot be attributed to specific person without additional information (kept separately, secured)
- **Restriction of Processing**: Marking stored personal data limiting future processing
- **Data Protection Impact Assessment (DPIA)**: Systematic evaluation of processing activities, particularly those using new technologies, likely to result in high risk
- **Binding Corporate Rules (BCRs)**: Data protection policies for intra-group transfers to third countries
- **Consent**: Freely given, specific, informed, unambiguous indication of wishes (statement or clear affirmative action)

---

## 🎯 GDPR Principles (Article 5) — Complete Explanation

### 1. Lawfulness, Fairness, Transparency

- Processing must comply with lawful basis (Article 6)
- Fair = not deceiving data subjects
- Transparent = open, understandable disclosure
- Data subjects must understand what is happening

### 2. Purpose Limitation

- Collected for specified, explicit, legitimate purpose
- Cannot be further processed in incompatible ways
- **Compatible purposes** (no further consent needed):
  - Archiving for public interest
  - Scientific or historical research
  - Statistical purposes
- Any OTHER further processing requires reassessment

### 3. Data Minimization

- Adequate, relevant, LIMITED to what is necessary
- Not only the purpose but actual necessity
- Cannot collect "just in case"

### 4. Accuracy

- Data must be accurate (correct)
- Where necessary, kept up-to-date
- Every reasonable step taken to erase/rectify inaccurate data
- Proportionate to purposes

### 5. Storage Limitation

- Kept in form permitting identification ONLY as long as necessary
- Exceptions for archiving/research/statistics with appropriate safeguards
- Pseudonymization/encryption may permit longer storage

### 6. Integrity & Confidentiality

- Processed securely with appropriate technical/organizational measures
- Protection against:
  - Unauthorized processing
  - Unlawful processing
  - Accidental loss
  - Accidental destruction
  - Accidental damage
- Measures reviewed regularly

### 7. Accountability (Principle of Responsibility)

- Controller MUST be able to demonstrate compliance
- NOT "we tried our best" — must PROVE measures in place
- Documentation essential

---

## 📌 Lawful Basis Detailed (Article 6)

**Processing is lawful ONLY if at least ONE applies:**

### 1. Consent (Article 6(1)(a))

- Data subject has given consent for specific purpose(s)
- Requirements:
  - **Freely given**: Not forced, no pressure, no negative consequences for refusal
  - **Specific**: For clearly defined purpose(s)
  - **Informed**: Data subject knows what they're consenting to
  - **Unambiguous**: Clear indication of wishes (not silence, inactivity, or pre-checked boxes)
- Limitations:
  - Cannot be condition for service UNLESS processing is necessary
  - Can be withdrawn at ANY time as easily as given
  - Past processing remains lawful even after withdrawal
- Contract condition test (Article 7(4)): If consent is condition for non-necessary processing = unlawful

### 2. Contract (Article 6(1)(b))

- Processing necessary for:
  - Entering into contract with data subject, OR
  - Performance of contract with data subject, OR
  - Pre-contractual measures at data subject's request
- "Necessary" = objectively required, not just convenient

### 3. Legal Obligation (Article 6(1)(c))

- Processing necessary to comply with legal obligation:
  - EU law, OR
  - Member State law
- Controller must be subject to that obligation
- Basis must be laid down in law

### 4. Vital Interests (Article 6(1)(d))

- Processing necessary to protect vital interests:
  - Life, OR
  - Physical/mental health
- Of data subject OR another person
- Only when data subject physically/legally incapable of consent
- Rarely applicable in normal business

### 5. Public Task (Article 6(1)(e))

- Processing necessary for:
  - Task carried out in public interest, OR
  - Exercise of official authority
- Vested in controller
- Basis must be laid down in EU/Member State law
- Must be proportionate to legitimate aim

### 6. Legitimate Interests (Article 6(1)(f))

- Processing necessary for legitimate interests:
  - Pursued by controller, OR
  - Pursued by third party
- **EXCEPT** where overridden by:
  - Data subject's interests
  - Data subject's fundamental rights/freedoms
  - Particularly for children
- Does NOT apply to public authorities performing tasks
- Requires **Legitimate Interest Assessment (LIA)** balancing:
  - Purpose and necessity
  - Data subject expectations
  - Impact on data subject
  - Technical/organizational safeguards

---

## 🔐 Special Categories Exceptions (Article 9) — Complete Reference

**General Rule**: Processing of special categories is PROHIBITED

**MUST have ONE exception:**

1. **Explicit Consent** (Article 9(2)(a))

   - Data subject explicitly consents
   - Consent must meet strict requirements
   - Cannot be processing condition unless necessary

2. **Employment/Social Protection** (Article 9(2)(b))

   - Processing necessary for:
     - Recruitment
     - Employment contract
     - Social security obligations
     - Social protection
   - Must be within authorized legal framework
   - Subject to appropriate safeguards

3. **Vital Interests** (Article 9(2)(c))

   - Data subject physically/legally incapable of consent
   - Processing necessary to protect vital interests

4. **Not-for-Profit Organizations** (Article 9(2)(d))

   - Processing by foundation, association, or not-for-profit body
   - With political, philosophical, religious, or trade union aim
   - Legitimate activities with appropriate safeguards
   - Relates ONLY to members/ex-members/persons with regular contact
   - Data NOT disclosed externally without subject consent

5. **Manifestly Public Data** (Article 9(2)(e))

   - Data manifestly made public BY THE DATA SUBJECT
   - Not just publicly available elsewhere

6. **Legal Claims** (Article 9(2)(f))

   - Establishment, exercise, or defense of legal claims
   - In court or legal proceedings

7. **Substantial Public Interest** (Article 9(2)(g))

   - Processing necessary for reasons of substantial public interest
   - Based on EU/Member State law
   - Proportionate to aim
   - Respects essence of right to data protection
   - Suitable and specific safeguards in place

8. **Occupational Medicine** (Article 9(2)(h))

   - Occupational health and safety
   - Health assessment of employee
   - Diagnosis
   - Health/social care provision
   - By health professional under professional secrecy
   - OR person under secrecy obligation

9. **Public Health** (Article 9(2)(i))

   - Protection against serious cross-border health threats
   - Ensuring quality/safety of healthcare/medicinal products/devices
   - Based on EU/Member State law
   - Suitable and specific safeguards
   - Professional secrecy obligations

10. **Archiving/Research/Statistics** (Article 9(2)(j))
    - Archiving purposes in public interest
    - Scientific or historical research
    - Statistical purposes
    - Based on EU/Member State law
    - Proportionate to aim
    - Respects essence of data protection
    - Suitable and specific safeguards

---

## 👥 Data Subject Rights — Complete Reference (Articles 12-22)

### Timelines (Article 12)

- **Response deadline**: 1 month from request
- **Extension**: +2 months for complex/multiple requests (must notify within 1st month)
- **Format**: Concise, transparent, intelligible, easily accessible, clear and plain language
- **Cost**: Free of charge (reasonable fee allowed for manifestly unfounded/excessive requests)

### 1. Right of Access (Article 15)

**Request**: Confirmation of processing + copy of personal data

**Information Required**:

- Purposes of processing
- Categories of personal data
- Recipients/categories of recipients (especially third countries)
- Retention period (or criteria for determining it)
- Rights available (access, rectification, erasure, restriction, portability, objection)
- Withdrawal of consent right (if applicable)
- Complaint right with supervisory authority
- Source of data (if not from subject)
- Existence of automated decision-making and meaningful info about logic/consequences

### 2. Right to Rectification (Article 16)

**Request**: Correct inaccurate data or complete incomplete data

**Timeline**: Without undue delay

### 3. Right to Erasure/Right to be Forgotten (Article 17)

**Grounds for erasure**:

- No longer necessary for original purposes
- Consent withdrawn (no other legal basis)
- Data subject opposes (no overriding legitimate interests)
- Processed unlawfully
- Legal obligation requires erasure
- Collected from child in information society services

**Exceptions** (erasure NOT required):

- Freedom of expression and information
- Legal obligation requires retention
- Public interest in area of public health
- Archiving/research/statistics (appropriate safeguards)
- Establishment, exercise, defense of legal claims

**Obligations**:

- Publication erasure: Take reasonable steps to inform others processing the data
- Notify recipients of erasure request (unless impossible/disproportionate)

### 4. Right to Restrict Processing (Article 18)

**Grounds for restriction**:

- Accuracy contested (for verification period)
- Processing unlawful, subject opposes erasure
- Controller no longer needs data, subject needs it for legal claims
- Subject objected pending verification of overriding interests

**Effect** of restriction:

- Only storage allowed (except with consent)
- Results not processed/disclosed
- Subject informed before restriction lifted

### 5. Right to Data Portability (Article 20)

**Conditions**:

- Processing is consent-based OR contract-based
- Processing is automated

**Rights**:

- Receive data in structured, commonly used, machine-readable format (JSON, CSV, etc.)
- Transmit to another controller without hindrance
- Direct transmission between controllers (if technically feasible)

**Exclusions**:

- Processing necessary for public task
- Processing necessary for official authority

### 6. Right to Object (Article 21)

**Grounds for objection**:

- Processing based on public task/legitimate interests (Article 6(1)(e-f))
- Direct marketing purposes (MUST be honored)
- Profiling related to marketing
- Scientific/historical research (subject can still object on particular situation grounds)

**Effect**:

- Controller must stop processing
- Unless compelling legitimate grounds override subject's interests/rights
- OR processing necessary for legal claims

### 7. Right NOT to be Subject to Automated Decision-Making (Article 22)

**Prohibition**: Decisions based SOLELY on automated processing producing legal effects

**Exceptions** (automated decisions allowed):

- Necessary for entering/performing contract
- Authorized by EU/Member State law with safeguards
- Based on explicit consent

**Required Safeguards**:

- Right to human intervention
- Right to express point of view
- Right to contest decision

**Forbidden**: Special category data in automated decisions (except consent or explicit legal basis)

---

## 🛡️ Controller & Processor Obligations — Complete

### Data Protection by Design & Default (Article 25)

**Requirement**: Both at determination of means AND during processing itself

**Measures must include**:

- Pseudonymization
- Encryption
- Data minimization
- Ability to ensure confidentiality, integrity, availability, resilience
- Timely recovery capability
- Regular testing of effectiveness

**Proportionality factors**:

- State of the art
- Cost of implementation
- Nature, scope, context, purposes
- Risks of varying likelihood/severity
- Controller's resources

### Processing Records (Article 30)

**Controller must maintain**:

- Name and contact details of controller, joint controller, representative, DPO
- Purposes of processing
- Categories of data subjects
- Categories of personal data
- Categories of recipients (including third countries)
- Transfers to third countries (mechanism: adequacy, SCC, BCR)
- Envisaged deletion timelines
- Technical and organizational security measures

**Processor must maintain**:

- Name/contact details of processor and controller(s)
- Categories of processing for each controller
- Transfers to third countries (with mechanism)
- Technical/organizational security measures

**Format**: Written (including electronic)
**Availability**: For supervisory authority inspection
**Exemption**: Enterprises <250 persons (unless high-risk)

### Data Protection Impact Assessment (DPIA) (Article 35)

**Required when** processing likely to result in high risk:

- Systematic and extensive evaluation (profiling, automated decisions with legal effects)
- Large-scale processing of special categories
- Systematic monitoring of publicly accessible area on large scale
- Use of new technologies

**Assessment must include**:

- Systematic description of processing and purposes
- Necessity and proportionality assessment
- Risk assessment to rights/freedoms
- Measures to address risks (safeguards, security, compliance demonstration)

**Consultation**: Prior consultation with DPO (if designated)
**Prior Consultation**: Supervisory authority if high risk without mitigation

### Processor Agreement (Article 28)

**Must include**:

- Subject-matter, duration, nature, purpose
- Type of personal data and data subject categories
- Obligations and rights of controller
- Processor confidentiality obligations
- Article 32 (security) compliance
- Sub-processor approval process
- Data subject rights assistance obligations
- Post-contract data deletion/return obligations
- Audit and inspection access rights
- Assistance with DPIAs and prior consultation

**Legal basis**: Contract or other legal act binding processor
**Sub-processors**: Same obligations cascaded

---

## 🔐 Security of Processing (Article 32) — Complete Requirements

**Obligation**: Appropriate level of security based on risk assessment

**Risk factors** (Article 32(2)):

- Accidental destruction
- Accidental loss
- Alteration
- Unauthorized disclosure
- Unauthorized access

**Measures may include** (Article 32(1)):

- **Pseudonymization**: Rendering data unable to be attributed to subject without additional info (kept separately)
- **Encryption**: TLS 1.3+ in transit, AES-256+ at rest
- **Ongoing confidentiality**: Access controls, authentication, monitoring
- **Ongoing integrity**: Data validation, versioning, checksums
- **Ongoing availability**: Redundancy, backups, disaster recovery
- **Ongoing resilience**: Architecture designed for security
- **Timely recovery**: RTO, RPO targets, recovery procedures
- **Testing effectiveness**: Penetration testing, vulnerability scans, security audits, incident drills

**Proportionality**: State of the art, implementation costs, processing nature/scope/context/purposes, risk likelihood/severity

---

## 🚨 Personal Data Breach (Articles 33-34)

### Definition (Article 4(12))

**Breach**: Security breach leading to accidental/unlawful destruction, loss, alteration, unauthorized disclosure/access

### Notification to Authority (Article 33)

**Deadline**: 72 hours after becoming aware (or earlier if feasible)
**To whom**: Supervisory authority competent under Article 55
**Exception**: No notification if unlikely to result in risk to rights/freedoms

**Must include**:

- Nature of breach
- Categories and approximate number of data subjects affected
- Categories and approximate number of personal data records affected
- Data Protection Officer contact
- Likely consequences
- Measures taken/proposed to address breach

**Timing flexibility**:

- Information can be provided in phases
- Complete info within reasonable timeline

### Documentation (Article 33(5))

**Must document**:

- Facts of breach
- Effects of breach
- Remedial action taken
  **Purpose**: Enable supervisory authority verification

### Notification to Data Subjects (Article 34)

**Required when**: Breach likely to result in high risk to rights/freedoms

**Content** (in clear, plain language):

- Nature of breach
- Data Protection Officer contact
- Likely consequences
- Measures taken/proposed

**NOT required if**:

- Encryption/pseudonymization applied (unintelligible to unauthorized persons)
- Subsequent measures reduce risk to non-high level
- Disproportionate effort (then public communication instead)

**ALWAYS required for data subjects IF high risk** (supervisory authority can require notification or override exemptions)

---

## 🌍 International Data Transfers (Articles 44-49)

### General Principle (Article 44)

**Rule**: Transfer only if appropriate safeguards maintained
**Objective**: Level of protection NOT undermined

### Adequacy Decision (Article 45)

**Route 1 — Simplest**: Commission decides country has adequate protection

**Assessment factors**:

- Rule of law, human rights, fundamental freedoms
- General and sectoral legislation
- Data protection rules
- Professional rules
- Security measures
- Implementation and effective enforcement
- Data subject rights and remedies
- Independent supervisory authorities
- International commitments
- Multilateral/regional system participation

**Current adequate countries** (examples):

- Switzerland
- Canada
- Japan
- South Korea
- UK (post-Brexit)
- Israel
- Various other determinations

**Mechanism**: Regular review (minimum every 4 years)
**Suspension**: Can be repealed/amended/suspended if adequacy no longer ensured

### Appropriate Safeguards (Article 46)

**Route 2 — No adequacy decision exists**

**Permissible safeguards**:

- Legally binding and enforceable instruments between public authorities
- Binding Corporate Rules (BCRs) — approved multi-entity policies
- Standard Contractual Clauses (SCCs) — EU-adopted
- Standard Contractual Clauses — supervisory authority-adopted
- Approved codes of conduct + binding commitments
- Approved certifications + binding commitments

**Requires controller/processor authorization** (some):

- Bespoke contractual clauses (needs supervisory authority approval)
- Administrative arrangements (needs supervisory authority approval)

### Binding Corporate Rules (BCRs) (Article 47)

**What**: Policies binding all group members for intra-group transfers

**Requirements**:

- Legally binding internally and externally
- Apply to all group members and employees
- Expressly confer enforceable rights on data subjects
- Specify:
  - Group structure and contacts
  - Transfers and categories
  - Legal binding nature
  - General data protection principles (purpose limitation, minimization, limitation, quality, design, basis, special categories, security, onward transfers)
  - Data subject rights (access, rectification, erasure, restriction, portability, objection, automated decisions, complaints, redress)
  - Liability for non-EU group members
  - DPO/monitoring role and complaints procedures
  - Verification mechanisms (audits, corrective actions)
  - Reporting and recording mechanism
  - Cooperation mechanism with supervisory authority
  - Reporting of legal requirements in third countries with adverse effect
  - Data protection training

**Approval**: By competent supervisory authority via consistency mechanism

### Derogations (Article 49)

**Route 3 — One-off transfers without adequacy/safeguards**

**Permitted for**:

- Explicit data subject consent (informed of risks)
- Contract performance/entry (necessary with subject OR pre-contractual measures)
- Legal claim establishment/exercise/defense
- Vital interests (subject incapable of consent)
- Important public interest
- Register consultation (open to public, legitimate interest disclosure only)

**Limited transfers** (non-repetitive, limited persons, compelling legitimate interests, assessment documented):

- Must inform supervisory authority
- Must inform data subject

**Non-applicable to** public authorities performing public powers

---

## 💰 Penalties & Enforcement (Article 83)

### Supervisory Authority Powers (Article 58)

**Investigative**:

- Demand information from controller/processor
- Data protection audits
- Review certifications
- Access all personal data and processing info
- Access to premises and equipment

**Corrective**:

- Issue warnings
- Issue reprimands
- Order compliance with subject requests
- Order processing brought into compliance
- Order breach notification
- Ban on processing (temporary or permanent)
- Order rectification/erasure/restriction
- Withdraw certifications
- Impose administrative fines
- Order data flow suspension

**Authorisation/Advisory**:

- Prior consultation advice
- Issue opinions on legislative measures
- Authorize specific processing
- Approve codes of conduct
- Accredit certification bodies
- Issue/approve certifications
- Adopt standard contractual clauses
- Authorize contractual clauses
- Authorize administrative arrangements
- Approve BCRs

### Administrative Fines (Article 83)

**Principles**:

- Effective, proportionate, dissuasive
- Imposed in addition to OR instead of other measures
- Consider circumstances of each case

**Aggravating factors**:

- Nature, gravity, duration of breach
- Number of subjects affected
- Level of damage
- Intentional vs negligent
- Previous violations
- Financial benefits gained
- Failure to notify/cooperate

**Mitigating factors**:

- Prompt discovery and remediation
- Cooperation with authority
- Approved compliance programs
- Lack of previous violations
- Inadvertent/negligent

**Tier 1 Fines — Up to €10,000,000 or 2% annual turnover**:

- Articles 8, 11, 25-39, 42-43 (obligations of controller/processor, certification bodies, monitoring bodies)

**Tier 2 Fines — Up to €20,000,000 or 4% annual turnover**:

- Articles 5, 6, 7, 9 (principles, lawful basis, consent, special categories)
- Articles 12-22 (data subject rights)
- Articles 44-49 (third country transfers)
- Non-compliance with supervisory authority orders

**Special**: Non-compliance with orders under Article 58(2) subject to 4% fine

---

## 📋 Full Regulatory Checklist

**Scope & Governance**:

- [ ] Determine GDPR applicability (EU/EEA data subjects)
- [ ] Identify controller/processor roles
- [ ] Appoint DPO if required (public body, systematic monitoring, special categories on large scale)
- [ ] Document data processing activities (Article 30 records)
- [ ] Conduct DPIA for high-risk processing

**Lawful Basis**:

- [ ] Document lawful basis for each processing activity (Article 6)
- [ ] Assess legitimate interests (if using Article 6(1)(f))
- [ ] If consent-based: Implement withdrawal mechanism

**Special Categories**:

- [ ] If processing Article 9 data: Document exception (Article 9(2))
- [ ] Implement confidentiality for professional processing

**Transparency**:

- [ ] Create privacy notices (Articles 13-14)
- [ ] Plain language, concise, transparent
- [ ] Information about all required disclosures

**Data Subject Rights**:

- [ ] Implement access request process (Article 15, 1-month response)
- [ ] Implement rectification process (Article 16)
- [ ] Implement erasure process (Article 17)
- [ ] Implement restriction process (Article 18)
- [ ] Implement portability process (Article 20, machine-readable format)
- [ ] Implement objection process (Article 21)
- [ ] Review automated decision-making (Article 22, human oversight)

**Security**:

- [ ] Encrypt data in transit (TLS 1.3+)
- [ ] Encrypt data at rest (AES-256+)
- [ ] Implement access controls (role-based, least privilege)
- [ ] Regular backups and disaster recovery
- [ ] Annual penetration testing
- [ ] Annual vulnerability assessments
- [ ] Incident response plan
- [ ] Staff training on GDPR

**Processor Agreements**:

- [ ] Include all Article 28 requirements in contracts
- [ ] Sub-processor approval mechanism
- [ ] Audit rights specified
- [ ] Data deletion/return obligations

**Breach Procedure**:

- [ ] Define breach discovery process
- [ ] 72-hour notification timeline to authority
- [ ] High-risk assessment process
- [ ] Data subject notification if high-risk
- [ ] Documentation of all breaches

**International Transfers**:

- [ ] Identify transfers to third countries
- [ ] Check for adequacy decision
- [ ] If no adequacy: Execute Standard Contractual Clauses (SCCs) or BCRs
- [ ] Document transfer mechanism in Article 30 records

**Audit & Review**:

- [ ] Periodic compliance reviews
- [ ] Update measures based on state of the art
- [ ] Review data retention policies
- [ ] Monitor supervisory authority guidance
