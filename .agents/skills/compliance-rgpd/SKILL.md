---
name: compliance-rgpd
description: Ensures personal data protection and privacy rights according to GDPR/RGPD
category: Privacy & Data Protection
keywords: GDPR, RGPD, data protection, privacy, consent, DPIA, data subject rights
license: MIT
---

# SKILL: RGPD — Personal Data Protection & Privacy

## 📖 What is RGPD?

**Règlement Général sur la Protection des Données** (Regulation (EU) 2016/679)

- **Scope**: Any processing of personal data (name, ID, online identifier, location, etc.) of EU/EEA residents
- **Impact**: Fundamental rights protection (privacy, dignity, autonomy)
- **Reference**: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02016R0679-20160504
- **Details**: See `RGPD-REFERENCE.md` for complete definitions, penalties, and regulatory context

## 📋 Essential Definitions

- **Personal Data**: Any info identifying/identifiable natural person (name, ID, online identifier, location, genetic/biometric/health/economic/cultural/social factors)
- **Processing**: Any operation on personal data (collection, storage, disclosure, erasure, etc.)
- **Controller**: Determines purposes and means of processing
- **Processor**: Processes data per controller's instructions
- **Data Subject**: Person the data is about
- **Breach**: Unauthorized/unlawful destruction, loss, alteration, disclosure, access
- **Consent**: Freely given, specific, informed, unambiguous indication of wishes
- **Profiling**: Automated processing to evaluate personal aspects

**For exhaustive definitions, see `RGPD-REFERENCE.md`**

## 🎯 7 Processing Principles (Article 5)

1. **Lawfulness, Fairness, Transparency** — Processed lawfully, fairly, transparently
2. **Purpose Limitation** — Collected for specific purpose; can't be further processed incompatibly (except archiving, research, statistics)
3. **Data Minimization** — Only adequate, relevant data necessary for purpose
4. **Accuracy** — Accurate and up-to-date; false data must be rectified/deleted
5. **Storage Limitation** — Kept only as long as necessary
6. **Integrity & Confidentiality** — Processed securely; protected from loss, destruction, unauthorized access
7. **Accountability** — Controller must DEMONSTRATE compliance (not just "tried our best")

## 📌 Lawful Basis for Processing (Article 6)

**Processing is ONLY lawful if ONE of these applies:**

### 1. **Consent** — Data subject has given freely, specific, informed, unambiguous consent

- ✅ Can be withdrawn, must be as easy as giving
- ❌ Cannot be condition for non-necessary services
- ❌ Cannot be pre-checked boxes

### 2. **Contract** — Processing necessary for entering/performing contract with data subject

### 3. **Legal Obligation** — Processing required by EU/Member State law

### 4. **Vital Interests** — Necessary to protect life/health of data subject or another person

### 5. **Public Task** — Necessary for public interest or official authority (basis in law required)

### 6. **Legitimate Interests** — Necessary for legitimate interests (controller or third party)

- ❌ NOT if data subject's rights override (especially children)
- ❌ Cannot apply to public authorities performing tasks
- ✅ Requires Legitimate Interest Assessment (LIA)

```typescript
// Decision tree: Which lawful basis applies?
const determineLawfulBasis = (context: ProcessingContext): LawfulBasis => {
  if (context.hasExplicitConsent) return 'consent'
  if (context.isContractRequired) return 'contract'
  if (context.hasLegalObligation) return 'legal-obligation'
  if (context.protectsVitalInterests) return 'vital-interests'
  if (context.isPublicTask) return 'public-task'
  if (context.hasLegitimateInterest && !context.dataSubjectRightsOverride) {
    return 'legitimate-interest'
  }
  throw new Error('NO LAWFUL BASIS — PROCESSING ILLEGAL')
}
```

## 🔐 Special Categories of Data (Article 9)

**PROHIBITED**: Processing of racial/ethnic origin, political opinions, religious beliefs, trade union membership, genetic, biometric, health, or sex life data

**Exceptions (ONE must apply)**:

1. Explicit consent
2. Employment/social protection (with legal framework)
3. Vital interests (subject incapable of consent)
4. Not-for-profit organizations (members/contacts only, no external disclosure)
5. Manifestly public data (made public BY the data subject)
6. Legal claims (establishment, exercise, defense)
7. Substantial public interest (proportionate, with safeguards)
8. Occupational medicine (by health professional under confidentiality)
9. Public health (serious health threat, quality of healthcare)
10. Archiving/research/statistics (with appropriate safeguards)

```typescript
// ✅ Correct: Process special category with exception
const processHealthData = (userId: string, context: SpecialCategoryContext) => {
  if (!context.hasException) {
    throw new Error('Cannot process special category data without valid exception')
  }

  const encrypted = encrypt(userData, encryptionKey)
  auditLog.record('special-data-access', userId, new Date())
}

// ❌ Avoid: Processing without exception
const illegalProfiling = (userData: User) => {
  // Using health data to price insurance without exception = ILLEGAL
  const riskScore = model.predict(userData.healthData)
}
```

## 📋 Lawful Basis for Special Categories (Article 9(3))

If using exceptions (h) above, personal data **must** be processed:

- By/under responsibility of professional with confidentiality obligation
- OR another person with secrecy obligation under EU/Member State law
- Examples: Doctors, lawyers, accountants

## ✅ Consent Requirements (Articles 7-8)

**Consent MUST be:**

- [ ] Freely given (not forced, not condition for service unless necessary)
- [ ] Specific (for defined purpose(s))
- [ ] Informed (user knows what they're consenting to)
- [ ] Unambiguous (clear action, NOT silence or pre-checked boxes)
- [ ] Withdrawable (anytime, as easily as given)

**Child Consent (Article 8)**: Age 16+ can consent (or lower per Member State, min 13); below requires parental consent

```typescript
// ✅ Correct: Explicit opt-in with withdrawal
@Post('api/v1/consent')
async setConsent(@Body() data: ConsentRequest, @Request() req) {
  const record = {
    userId: req.user.id,
    type: data.consentType,
    given: true,
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }
  await this.consentService.save(record)
  return { success: true, consentId: record.id }
}

@Delete('api/v1/consent/:consentId')
@UseGuards(JwtAuthGuard)
async withdrawConsent(@Param('consentId') id: string, @Request() req) {
  const consent = await this.consentService.findById(id)
  if (consent.userId !== req.user.id) throw new ForbiddenException()

  consent.given = false
  consent.withdrawnAt = new Date()
  await this.consentService.save(consent)
  await this.processingService.stopForConsent(id) // STOP processing
  return { success: true }
}

// ❌ Avoid: Pre-checked (not freely given)
<input type="checkbox" defaultChecked={true} />
```

## 👥 Seven Data Subject Rights (Articles 12-22)

**Response deadline: 1 month** (extendable +2 months if complex). Format: Electronic if requested electronically. Cost: Free

### 1. **Right of Access** (Article 15)

Request copy of personal data + info about processing (purposes, recipients, retention, source, automated decisions)

### 2. **Right to Rectification** (Article 16)

Correct inaccurate or incomplete data (without undue delay)

### 3. **Right to Erasure** (Article 17) — "Right to be Forgotten"

**Must erase if**: No longer necessary, consent withdrawn, data processed unlawfully, legal obligation requires it, collected from child
**Exceptions**: Freedom of expression, legal obligation to retain, public health, archiving/research/statistics, legal claims

### 4. **Right to Restrict Processing** (Article 18)

When: Accuracy contested, processing unlawful, no longer needed but needed for legal claims, objection pending
**Effect**: Only storage allowed; no processing without consent

### 5. **Right to Data Portability** (Article 20)

Get data in structured, commonly used, machine-readable format (JSON/CSV); transmit to another controller
**Applies if**: Consent-based OR contract-based processing; automated processing

### 6. **Right to Object** (Article 21)

Object to processing based on public task/legitimate interests or direct marketing (must be honored)

### 7. **Right NOT to be Subject to Automated Decision-Making** (Article 22)

**Prohibition**: Decisions based SOLELY on automated processing with legal effects
**Exceptions**: Contract-necessary, legal basis, explicit consent
**When allowed**: Must provide human intervention right, ability to express viewpoint, right to contest

```typescript
// 1️⃣ Right of Access (Article 15)
@Get('api/v1/users/me/personal-data')
@UseGuards(JwtAuthGuard)
async getMyPersonalData(@Request() req) {
  const userData = await this.userService.getFullProfile(req.user.id)
  return {
    personalData: userData,
    accessedAt: new Date().toISOString(),
    article: 'Article 15 - Right of Access'
  }
}

// 3️⃣ Right to Erasure (Article 17)
@Delete('api/v1/users/me')
@UseGuards(JwtAuthGuard)
async deleteMyAccount(@Request() req) {
  const userId = req.user.id

  // Erase all personal data
  await this.userService.erase(userId)

  // Notify recipients who received the data
  const recipients = await this.auditService.getRecipients(userId)
  for (const recipient of recipients) {
    await this.notificationService.notifyErasure(recipient, userId)
  }

  // Immutable audit log
  await this.auditService.logErasure(userId)
  return { success: true }
}

// 5️⃣ Right to Data Portability (Article 20)
@Get('api/v1/users/me/export')
@UseGuards(JwtAuthGuard)
async exportMyData(@Request() req) {
  const userData = await this.userService.findById(req.user.id)
  const csvData = this.dataFormatter.toCSV(userData)

  return {
    filename: `user-${req.user.id}-${new Date().toISOString()}.csv`,
    data: csvData,
    contentType: 'text/csv'
  }
}

// 7️⃣ Right NOT to Automated Decision-Making (Article 22)
// ❌ ILLEGAL: Pure automated credit decision
const decideLoanApproval = (userData: User): boolean => {
  return model.predict(userData) > 0.7 // No human review = VIOLATION
}

// ✅ CORRECT: Automated assistance + human oversight
const reviewLoanApplication = (userData: User) => {
  return {
    automatedScore: model.predict(userData), // Assistance only
    requiresHumanReview: true,
    applicantCanObject: true,
    applicantCanRequestHumanReview: true,
    finalDecision: null // Pending human decision
  }
}
```

## � Security of Processing (Article 32)

- [ ] **Encryption**: TLS 1.3+ in transit; AES-256+ at rest
- [ ] **Access Controls**: Role-based, principle of least privilege
- [ ] **Backups & Recovery**: Disaster recovery procedures, RTO, RPO targets
- [ ] **Testing**: Annual penetration testing, vulnerability assessments, security audits

```typescript
class DataSecurityService {
  encryptAtRest(data: string, key: string): string {
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv)
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  }

  async getPersonalData(userId: string, requester: User) {
    if (!requester.hasPermission('read-personal-data')) {
      throw new ForbiddenException('Insufficient permissions')
    }
    await this.auditLog.record({
      action: 'data-access',
      dataId: userId,
      requester: requester.id,
      timestamp: new Date(),
    })
  }
}
```

## 🚨 Personal Data Breach (Articles 33-34)

**Notification to Authority**: Within **72 hours** of discovering breach

- Nature of breach (categories and number of subjects affected)
- Likely consequences
- Measures taken/proposed

**Notification to Data Subjects**: Required if **high risk** to rights/freedoms

- Nature of breach
- Contact information for DPO
- Mitigation steps taken

```typescript
@Post('api/v1/security/notify-breach')
async notifyBreach(@Body() breach: DataBreach) {
  const riskAssessment = breach.assessRisk()

  // Notify supervisory authority (72-hour deadline)
  await this.supervisoryAuthority.notifyBreach({
    description: breach.description,
    affectedSubjects: breach.estimateAffected(),
    consequences: riskAssessment,
    measures: breach.responseMeasures
  })

  // Notify data subjects if high risk
  if (riskAssessment.highRisk) {
    const affectedUsers = await this.getUsersAffected(breach)
    for (const user of affectedUsers) {
      await this.emailService.sendBreachNotification(user.email, {
        description: breach.description,
        dpoContact: this.dpo.email,
        actions: ['Monitor account', 'Change password', 'Review activity']
      })
    }
  }
}
```

## 🌍 Cross-Border Data Transfers (Articles 44-49)

**Lawful transfer mechanisms:**

1. **Adequacy Decision** — Country ensures adequate protection (Switzerland, Canada, Japan, South Korea)
2. **Standard Contractual Clauses (SCCs)** — EU-approved contract safeguards
3. **Binding Corporate Rules (BCRs)** — Multi-entity data protection policies
4. **Derogations** (limited) — Explicit consent, contract necessary, vital interests, legal claims, public interest

```typescript
class DataTransferAssessment {
  assessTransfer(targetCountry: string): TransferMechanism {
    if (this.hasAdequacyDecision(targetCountry)) {
      return { mechanism: 'adequacy', country: targetCountry }
    }
    // Default to SCCs
    return { mechanism: 'scc', country: targetCountry, mustSign: true }
  }
}
```

## ✅ When to Apply This SKILL

- ✅ Determining lawful basis for data collection
- ✅ Collecting/processing special category data
- ✅ Implementing user rights (access, erasure, portability)
- ✅ Designing security measures (encryption, access controls)
- ✅ Handling data breaches (notification procedures)
- ✅ Managing processor contracts
- ✅ Planning cross-border transfers
- ✅ Audit compliance checklist

## 📋 Quick Compliance Checklist

- [ ] **Lawful Basis**: Identify Article 6 or Article 9 exception
- [ ] **Marketing**: Implement opt-in (Article 7) not opt-out
- [ ] **User Rights**: 1-month response SLA for access/erasure/portability requests
- [ ] **Security**: Encrypt in transit + at rest; annual penetration testing
- [ ] **Breach SLA**: 72-hour notification to authority if discovered
- [ ] **Processor Agreement**: All Article 28 terms in contract
- [ ] **Retention**: Document deletion policy; auto-delete when period expires
- [ ] **DPO**: Appoint if public authority or large-scale systematic monitoring
- [ ] **DPIA**: Conduct for high-risk processing (auto-decisions, special categories)
- [ ] **Third-Country**: Use adequacy decision or execute SCCs if transferring data

---

**For complete regulatory definitions, penalties, and references, see `RGPD-REFERENCE.md`**
