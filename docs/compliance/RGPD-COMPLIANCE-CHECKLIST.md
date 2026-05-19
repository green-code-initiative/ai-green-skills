# Project RGPD Compliance Checklist & Task Breakdown

**Based on**: ADR-009 + compliance-rgpd SKILL audit  
**Last Updated**: 1 April 2026

---

## 🔴 CRITICAL — Must Implement Q2 2026

### L1: Lawful Basis Documentation

- [ ] **Task 1.1**: Create `docs/compliance/Project-LAWFUL-BASIS-MATRIX.md`

  - [ ] List all processing purposes (auth, workshops, recommendations, syncing, analytics)
  - [ ] Specify Article 6 lawful basis for each
  - [ ] Document legitimate interest assessments (LIA) if applicable
  - [ ] Effort: 8 hours | Owner: Legal + Tech Lead
  - [ ] Deadline: April 15, 2026

- [ ] **Task 1.2**: Create Privacy Policy (`docs/PRIVACY-POLICY.md`)

  - [ ] What data do we collect? (user profile, workshop attendance, behavior)
  - [ ] Why do we collect it? (lawful bases from Task 1.1)
  - [ ] How do we protect it? (encryption, access controls, retention)
  - [ ] User rights & how to exercise (access, erasure, portability, object, restrict)
  - [ ] DPO contact info
  - [ ] Effort: 12 hours | Owner: Legal + Content
  - [ ] Deadline: April 20, 2026

- [ ] **Task 1.3**: Publish DPO Contact
  - [ ] Add email to footer/support page
  - [ ] Create `dpo@Project.fr` or delegate to existing compliance email
  - [ ] Effort: 2 hours | Owner: Legal
  - [ ] Deadline: April 10, 2026

### L2: Data Retention Policies

- [ ] **Task 2.1**: Document retention schedule (`docs/compliance/Project-DATA-RETENTION-SCHEDULE.md`)

  - [ ] Profile: Keep until user deletion request (contract-based)
  - [ ] Workshops: Keep 2 years (stats/archiving)
  - [ ] Audit logs: Keep 90 days (compliance/tax)
  - [ ] Backups: Keep latest 30 days (disaster recovery)
  - [ ] Deleted user data: Keep 30 days (legal hold)
  - [ ] Effort: 6 hours | Owner: Tech Lead + Legal
  - [ ] Deadline: April 20, 2026

- [ ] **Task 2.2**: Identify orphaned data (Workshop, Feedback, Suggestion creators)

  - [ ] Review all OneToMany relations in TypeORM entities
  - [ ] Determine if cascading deletion is correct or manual cleanup needed
  - [ ] Update entities to specify `onDelete: 'CASCADE'` or alternative
  - [ ] Effort: 8 hours | Owner: Backend
  - [ ] Deadline: May 10, 2026

- [ ] **Task 2.3**: Implement auto-deletion for expired data
  - [ ] Create background job (Cron or RabbitMQ) to run nightly
  - [ ] Delete Workshop data 2 years after creation
  - [ ] Delete Audit logs 90 days after creation
  - [ ] Delete deleted user data 30 days after deletion
  - [ ] Add deletion logging for audit trail
  - [ ] Effort: 16 hours | Owner: Backend
  - [ ] Deadline: May 31, 2026

### L3: Third-Party Data Processing Agreements (DPAs)

- [ ] **Task 3.1**: Sign/obtain DPA with Microsoft (Azure Graph)

  - [ ] Review current data sharing scope (what fields synced?)
  - [ ] Obtain Microsoft Enterprise Agreement or SLA with DPA clause
  - [ ] Document: data types, purposes, retention, sub-processors, audit rights
  - [ ] Effort: 8 hours | Owner: Security + Legal
  - [ ] Deadline: May 15, 2026

- [ ] **Task 3.2**: Sign/obtain DPA with Degreed

  - [ ] Contact Degreed for Data Processing Agreement
  - [ ] Define: which data shared, purposes, retention, location
  - [ ] Assess if they're processor (following instructions) or controller (independent purposes)
  - [ ] Review standard terms or negotiate
  - [ ] Effort: 12 hours | Owner: Security + Legal
  - [ ] Deadline: May 20, 2026

- [ ] **Task 3.3**: Document third-party data flows
  - [ ] Create diagram: Project → Azure Graph, Project → Degreed
  - [ ] For each: what data, in what format, when, how long retained
  - [ ] Document in `docs/compliance/Project-THIRD-PARTY-INTEGRATIONS.md`
  - [ ] Effort: 4 hours | Owner: Tech Lead
  - [ ] Deadline: May 25, 2026

### L4: User Rights — Restrict & Object

- [ ] **Task 4.1**: Implement Right to Restrict Processing (Article 18)

  - [ ] Add `isProcessingRestricted` and `restrictionReason` to Profile entity
  - [ ] Create endpoint: `POST /api/v1/profiles/me/restrict`
  - [ ] Update services to check flag before: recommendations, syncing, analytics
  - [ ] Add test cases (verify recommendations blocked when restricted)
  - [ ] Effort: 12 hours | Owner: Backend
  - [ ] Deadline: May 31, 2026

- [ ] **Task 4.2**: Implement Right to Object to Processing (Article 21)
  - [ ] Add `hasObjectedToProcessing` and `objectionReason` to Profile
  - [ ] Create endpoint: `POST /api/v1/profiles/me/object`
  - [ ] Stop processing for legitimate interests when objection received
  - [ ] Update Privacy Policy to explain objection right
  - [ ] Add logging of objection
  - [ ] Effort: 12 hours | Owner: Backend
  - [ ] Deadline: May 31, 2026

---

## 🟡 MAJOR — Prioritize Q3 2026

### S1: Data Encryption at Rest

- [ ] **Task 5.1**: Enable PostgreSQL column-level encryption

  - [ ] Research: pgcrypto vs. full-table encryption (trade-offs)
  - [ ] Decision: Which PII fields require encryption (email, phone, firstname, lastname)
  - [ ] Implementation: Use AES-256-GCM
  - [ ] Test: Verify encrypted data is unreadable in database
  - [ ] Effort: 16 hours | Owner: Infrastructure/Backend
  - [ ] Deadline: June 30, 2026

- [ ] **Task 5.2**: Implement key management & rotation
  - [ ] Store encryption keys in secure vault (Vault, AWS KMS, etc.)
  - [ ] Never commit keys to git
  - [ ] Document key rotation procedure
  - [ ] Effort: 8 hours | Owner: Infrastructure
  - [ ] Deadline: June 30, 2026

### S2: Audit Log PII Redaction

- [ ] **Task 6.1**: Sanitize PII before shipping to Loki

  - [ ] Review Pino configuration
  - [ ] Redact email, phone, names, user IDs from logs
  - [ ] Use serializers: `logger.info({ userId: '*' }, 'User action')`
  - [ ] Test: Verify logs don't contain PII
  - [ ] Effort: 8 hours | Owner: Backend
  - [ ] Deadline: June 15, 2026

- [ ] **Task 6.2**: Encrypt audit logs in transit
  - [ ] Verify TLS is enabled for Loki connection (✅ already done)
  - [ ] Document certificate pinning if high-security environment
  - [ ] Test: Verify no plaintext logs over network
  - [ ] Effort: 4 hours | Owner: Infrastructure
  - [ ] Deadline: June 15, 2026

### S3: DPIA & Accountability Documentation

- [ ] **Task 7.1**: Conduct DPIA (Data Protection Impact Assessment)

  - [ ] Identify high-risk processing (Azure sync, Degreed sync, recommendations)
  - [ ] Assess risks: unauthorized access, data breach, unauthorized profiling
  - [ ] Mitigation measures (encryption, logging, deletion)
  - [ ] Determine if supervisory authority consultation needed (probably not)
  - [ ] Document in `docs/compliance/Project-DPIA-REPORT.md`
  - [ ] Effort: 12 hours | Owner: Legal + Security
  - [ ] Deadline: June 30, 2026

- [ ] **Task 7.2**: Create Data Processing Register (Article 30)
  - [ ] Formalize processing records (already in code, make explicit)
  - [ ] Document for each processing activity:
    - Controller, processor, DPO
    - Purposes, data categories, recipients
    - Retention, security measures
  - [ ] File in `docs/compliance/Project-PROCESSING-REGISTER.md`
  - [ ] Effort: 8 hours | Owner: Tech Lead
  - [ ] Deadline: June 30, 2026

---

## ✅ NICE-TO-HAVE — Q4 2026 or Later

- [ ] **Task 8.1**: Add CSV export format (complement to JSON)

  - [ ] Effort: 4 hours
  - [ ] Benefit: Better Excel/Google Sheets compatibility
  - [ ] Deadline: July 31, 2026

- [ ] **Task 8.2**: User-facing compliance dashboard

  - [ ] Show user: what data Project has, who accessed it, retention timeline
  - [ ] Implement buttons: download data, delete account, object/restrict
  - [ ] Effort: 20 hours
  - [ ] Benefit: Transparency, user empowerment
  - [ ] Deadline: August 31, 2026

- [ ] **Task 8.3**: Automated breach notification system
  - [ ] Create procedure to notify users within 72 hours of breach
  - [ ] Template emails already exist, formalize the process
  - [ ] Effort: 8 hours
  - [ ] Deadline: August 31, 2026

---

## 📊 Summary by Timeline

| Phase             | Quarter    | Tasks              | Total Hours   | Priority        |
| ----------------- | ---------- | ------------------ | ------------- | --------------- |
| **Governance**    | Q2 2026    | 1.1, 1.2, 1.3, 2.1 | 28            | 🔴 CRITICAL     |
| **Data & DPAs**   | Q2 2026    | 2.2, 3.1, 3.2, 3.3 | 32            | 🔴 CRITICAL     |
| **User Rights**   | Q2-Q3 2026 | 4.1, 4.2           | 24            | 🔴 CRITICAL     |
| **Security**      | Q3 2026    | 5.1, 5.2, 6.1, 6.2 | 36            | 🟡 MAJOR        |
| **Documentation** | Q3 2026    | 7.1, 7.2           | 20            | 🟡 MAJOR        |
| **Polish**        | Q4 2026    | 8.1, 8.2, 8.3      | 32            | ✅ NICE-TO-HAVE |
|                   |            | **TOTAL**          | **172 hours** |                 |

**Recommended Allocation**: 1 backend engineer + 0.5 legal = 4-5 months (comfortable pace)

---

## Success Criteria

✅ **All CRITICAL tasks done by May 31, 2026**

- Privacy Policy published
- Lawful bases documented
- DPAs signed with Azure & Degreed
- User rights (restrict, object) implemented

✅ **All MAJOR tasks done by July 31, 2026**

- Encryption at rest enabled
- Logs sanitized
- DPIA completed
- Data processing register formalized

✅ **Audit Result**: Project achieves GREEN status for all 7 GDPR principles

- ✅ Lawfulness, Fairness, Transparency
- ✅ Purpose Limitation
- ✅ Data Minimization
- ✅ Accuracy
- ✅ Storage Limitation
- ✅ Integrity & Confidentiality
- ✅ Accountability

---

## Metrics & Validation

After implementation, re-run compliance scan:

```bash
# Before (April 2026)
Compliance Status: 🟡 YELLOW (60% compliant)
  - Principles: 5/7 green, 2/7 yellow
  - User Rights: 5/7 implemented
  - Critical Gaps: Lawful basis, retention, DPAs

# After (August 2026)
Compliance Status: 🟢 GREEN (95%+ compliant)
  - Principles: 7/7 green
  - User Rights: 7/7 implemented
  - Critical Gaps: RESOLVED
  - Known Limitations: None
```

---

**Next Steps**:

1. Schedule approval meeting with Tech Lead, Legal, Security
2. Create GitHub Issues for each task with assigned owner & deadline
3. Add to Q2 2026 sprint planning
4. Begin Task 1.1 (Lawful Basis Matrix) immediately
