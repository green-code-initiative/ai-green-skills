# Project Compliance Cross-Matrix

**Purpose**: Single source of truth mapping IMPLEMENTATIONS → ADRs → Gaps → Timeline  
**Last Updated**: 2 avril 2026  
**Owner**: Compliance Team

---

## 📋 Executive Summary

| Framework | IMPLEMENTATION         | ADR     | Status                         | Coverage                                               | Critical Gaps                                              | Timeline   |
| --------- | ---------------------- | ------- | ------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- | ---------- |
| **RGPD**  | RGPD-IMPLEMENTATION.md | ADR-009 | 🟡 Proposed (pending approval) | 🔴 **40%** (Tech only, no Governance)                  | Privacy Policy, DPA, Lawful Basis, DPIA                    | Q2-Q4 2026 |
| **RGS**   | RGS-IMPLEMENTATION.md  | ADR-011 | 🟡 Proposed (pending approval) | 🟡 **60%** (Phase 2,3,5 done; 1,4,6,7,8 missing)       | Risk Registry, CSP/CSRF/Rate Limit, MFA, Incident Response | Q2-Q4 2026 |
| **RGI**   | RGI-IMPLEMENTATION.md  | ADR-007 | ✅ Approved                    | 🟡 **74%** (Technical, Semantic OK; Legal/Org partial) | Error standardization, User rights consistency             | Q2-Q3 2026 |

---

## 🔗 Dependencies & Relationships

```
ADR-009 (RGPD)
├─ Phase 1: Governance (Q2 2026) ← BLOCKS Phase 2
│   ├─ Privacy Policy
│   ├─ Lawful Basis Matrix
│   ├─ Data Retention Schedule
│   └─ DPIA
└─ Phase 2: Third-party DPAs (Q2-Q3 2026) ← DEPENDS ON Phase 1 + ADR-011 Phase 2

ADR-011 (RGS)
├─ Phase 2: Auth & Authorization ✅ (blocked by: MFA requirement from RGPD sec review)
├─ Phase 3: Encryption ✅ (blocked by: Key rotation automation)
├─ Phase 4: Input Validation ⚠️ (blocks: RGI Technical compliance)
│   ├─ CSP Header (CRITICAL) ← affects RGI Technical + RGI Political
│   ├─ CSRF Protection ← affects RGI API Design
│   └─ Rate Limiting ← affects RGI API Reliability
├─ Phase 6: Vulnerability Management (depends on Phase 4)
├─ Phase 7: Third-party Risk (blocks: ADR-009 Phase 2 DPA review)
└─ Phase 8: Incident Response (depends on Phases 1-7)

ADR-010 (RGI)
├─ Technical Level: Error standardization (blocked by RGS Phase 4)
├─ Legal Level: GDPR export (depends on ADR-009 Phase 1 - Privacy Policy)
└─ Organizational: Data Dictionary (depends on ADR-009 Phase 1)
```

---

## 📊 Detailed Gap Analysis by Standard

### RGPD (ADR-009) — 🔴 40% Coverage (GOVERNANCE MISSING)

**Current State of RGPD-IMPLEMENTATION.md**:

- ✅ Technical: Field encryption, deletion cascade, consent tracking (100%)
- ❌ Governance: Privacy Policy, Lawful Basis, DPIA, DPA (0%)

| Component                   | IMPLEMENTATION.md         | ADR Phase       | Status      | Gap                                                                               | Timeline       | Owner             |
| --------------------------- | ------------------------- | --------------- | ----------- | --------------------------------------------------------------------------------- | -------------- | ----------------- |
| **Field Encryption**        | ✅ Documented             | Phase 4 (Q3)    | ✅ Done     | None                                                                              | N/A            | Security          |
| **User Deletion (RTBF)**    | ✅ Documented recursively | Phase 1 (Q2)    | ✅ Done     | None                                                                              | N/A            | Backend           |
| **Data Export (Access)**    | ✅ Implemented            | Phase 1 (Q2)    | ✅ Done     | Need CSV format                                                                   | Q2 2026        | Backend           |
| **Consent Forms**           | ✅ Documented             | Phase 1 (Q2)    | ✅ Done     | Add withdrawal audit                                                              | Q2 2026        | Frontend          |
| **Privacy Policy**          | ❌ MISSING                | Phase 1 (Q2)    | 🔴 CRITICAL | Doc not created                                                                   | Q2 (by May 31) | Legal             |
| **Lawful Basis Matrix**     | ❌ MISSING                | Phase 1 (Q2)    | 🔴 CRITICAL | Doc not created                                                                   | Q2 (by May 31) | Legal/Tech        |
| **Data Retention Schedule** | ❌ MISSING                | Phase 1 (Q2)    | 🔴 CRITICAL | Doc not created                                                                   | Q2 (by May 31) | Legal/Tech        |
| **DPIA**                    | ❌ MISSING                | Phase 1 (Q2)    | 🔴 CRITICAL | Doc not created                                                                   | Q2 (by May 31) | Legal/Security    |
| **DPA (Microsoft/Degreed)** | ❌ MISSING                | Phase 2 (Q2-Q3) | 🔴 CRITICAL | Contracts not signed                                                              | Q2 (by May 15) | Legal/Procurement |
| **Right to Restrict**       | ❌ NOT CODED              | Phase 3 (Q3)    | 🟡 HIGH     | `processingRestricted` flag defined in IMPLEMENTATION but not implemented in code | Q3 2026        | Backend           |
| **Right to Object**         | ❌ NOT CODED              | Phase 3 (Q3)    | 🟡 HIGH     | Similar to Restrict, code missing                                                 | Q3 2026        | Backend           |

**Recommended Action**:

1. **Immediate (Q2)**: Create PRIVACY-POLICY.md, LAWFUL-BASIS-MATRIX.md, DATA-RETENTION-SCHEDULE.md, DPIA-REPORT.md
2. **Augment RGPD-IMPLEMENTATION.md** with section "0. Governance & Documentation Requirements" pointing to ADR-009 Phase 1

---

### RGS (ADR-011) — 🟡 60% Coverage (Phases 1, 4, 6, 7, 8 MISSING)

**Current State**:

- ✅ Phase 2 (Auth): JWT, bcrypt, brute force protection
- ✅ Phase 3 (Encryption): TLS 1.3, AES-256, key management
- ✅ Phase 5 (Logging): Pino structured logs, audit trail
- ❌ Phase 1 (Risk Management): Ad-hoc, no formal Risk Register
- ❌ Phase 4 (Input Validation): 50% → CSP, CSRF missing
- ❌ Phase 6 (Vulnerability Management): Ad-hoc patching
- ❌ Phase 7 (Third-party Risk): Not started (blocks ADR-009 Phase 2)
- ❌ Phase 8 (Incident Response): No playbook

| Phase | Focus                    | IMPLEMENTATION.md Ref | ADR Status  | Code Status | Gap                                                | Timeline       | Owner            |
| ----- | ------------------------ | --------------------- | ----------- | ----------- | -------------------------------------------------- | -------------- | ---------------- |
| **1** | Risk Management          | ⚠️ "Ad-hoc"           | ⚠️ Proposed | 🔴 NO CODE  | Need Risk Register + Risk Matrix                   | Q2 (by May 31) | Security Lead    |
| **2** | Auth & Authorization     | ✅ Documented         | ✅ Proposed | ✅ 95% DONE | +MFA for admin (future)                            | Q3 2026        | Backend          |
| **3** | Encryption               | ✅ Documented         | ✅ Proposed | ✅ 90% DONE | +Key rotation automation                           | Q2 2026        | Infra            |
| **4** | Input Validation         | ⚠️ "50% Complete"     | ⚠️ Proposed | 🔴 PARTIAL  | **CSP header, CSRF token, Rate Limit**—all missing | Q2 (by Jun 30) | Backend/Frontend |
| **5** | Audit Logging            | ✅ Documented         | ✅ Proposed | ✅ 85% DONE | +Sanitization of PII in logs                       | Q2 2026        | Infra            |
| **6** | Vulnerability Management | ❌ MISSING            | ❌ Proposed | 🔴 NO CODE  | Dependency scanning, patch policy                  | Q3 2026        | Security/DevOps  |
| **7** | Third-party Risk         | ❌ MISSING            | ❌ Proposed | 🔴 NO CODE  | DPA audit (blocks ADR-009 Phase 2)                 | Q2-Q3 2026     | Security/Legal   |
| **8** | Incident Response        | ❌ MISSING            | ❌ Proposed | 🔴 NO CODE  | IR playbook, communication plan, INCIDENT-LOG.md   | Q3-Q4 2026     | CTO/Security     |

**Critical Path - RGS Phase 4 blocks RGI**:

- CSP header (RGS Phase 4) → Fix in `apps/api/src/main.ts` + `apps/web/webpack.config.js`
- CSRF protection (RGS Phase 4) → Add `@nestjs/csrf` middleware
- Rate limiting (RGS Phase 4) → Add `@nestjs/throttle` guard

---

### RGI (ADR-007) — 🟡 74% Coverage (Technical + Legal gaps)

**Current State**:

- ✅ Political (85%): Strategy documented in copilot-instructions.md
- 🟡 Legal (60%): GDPR export partial (depends on ADR-009 Privacy Policy for completeness)
- 🟡 Organizational (75%): Data owners defined, processes informal
- ✅ Semantic (80%): Entity model well-defined
- 🟡 Technical (70%): REST API good, error responses inconsistent

| Level              | Component         | IMPLEMENTATION.md                          | ADR-007 Status         | Code Status                              | Gap                                            | Timeline       |
| ------------------ | ----------------- | ------------------------------------------ | ---------------------- | ---------------------------------------- | ---------------------------------------------- | -------------- |
| **Political**      | Public commitment | ✅ README + copilot-instructions           | ✅ Addressed           | ✅ Done                                  | Publish formal RGI statement                   | Q2 2026        |
| **Legal**          | GDPR Data Export  | ✅ Endpoint designed `/profiles/me/export` | 🟡 Issue #2 (HIGH)     | 🟡 Partial (JSON only, missing metadata) | CSV format + audit trail                       | Q2 2026        |
| **Organizational** | Data Dictionary   | ❌ MISSING                                 | 🟡 HIGH                | 🔴 NO DOC                                | Create `docs/DATA-DICTIONARY.md`               | Q2 2026        |
| **Semantic**       | Entity Model      | ✅ TypeORM entities                        | ✅ Well-defined        | ✅ Consistent UUIDs, ISO 8601 dates      | None                                           | N/A            |
| **Technical**      | REST API          | ✅ NestJS endpoints                        | ✅ Compliant           | ✅ Full CRUD                             | Error format consistency                       | Q2 2026        |
| **Technical**      | Error Response    | ⚠️ Proposed `ErrorDto` in section 5.3      | 🔴 Issue #1 (CRITICAL) | 🔴 INCONSISTENT                          | Implement `ErrorDto` + global exception filter | Q2 (by Jun 30) |
| **Technical**      | OpenAPI/Swagger   | ✅ Auto-generated                          | ✅ Compliant           | ✅ at `/api/docs`                        | Ensure all endpoints documented                | Q2 2026        |
| **Technical**      | API Versioning    | ✅ `/api/v1/`                              | ✅ Compliant           | ✅ Consistent                            | Maintain for v2 when released                  | Ongoing        |
| **Technical**      | Security          | ⚠️ TLS 1.3, JWT, OAuth                     | 🟡 Partial             | 🟡 INCOMPLETE                            | Add CSP header (blocks RGS Phase 4)            | Q2 2026        |

---

## ⚡ Implementation Order (Recommended Critical Path)

### Q2 2026 (IMMEDIATE — Next 4 weeks)

**RGPD (ADR-009 Phase 1 — CRITICAL)**:

- [ ] Create `PRIVACY-POLICY.md` (by May 15)
- [ ] Create `LAWFUL-BASIS-MATRIX.md` (by May 15)
- [ ] Create `DATA-RETENTION-SCHEDULE.md` (by May 15)
- [ ] Create `DPIA-REPORT.md` (by May 30)
- [ ] Augment `RGPD-IMPLEMENTATION.md` with Governance section referencing ADR-009

**RGS (ADR-011 Phase 4 — Shared with RGI)**:

- [ ] Implement **Content-Security-Policy** header (CSP) in `main.ts` (by Jun 15)
  - Blocks XSS attacks (RGS Phase 4)
  - Improves RGI Technical compliance (ADR-007)
- [ ] Implement **CSRF protection** middleware `@nestjs/csrf` (by Jun 15)
  - RGS Phase 4 requirement
- [ ] Implement **Global Rate Limiting** with `@nestjs/throttle` (by Jun 30)
  - RGS Phase 4 requirement
  - Improves RGI API Reliability

**RGI (ADR-007 Technical)**:

- [ ] Implement **Global ErrorDto + Exception Filter** (by Jun 30)
  - Resolves ADR-007 Issue #1 (CRITICAL)
  - Unblocks partner integrations
- [ ] Create `DATA-DICTIONARY.md` (by Jun 15)
  - Cross-reference ADR-009 Phase 1

**Update IMPLEMENTATIONS**:

- [ ] Add cross-references: RGPD-IMPLEMENTATION.md → ADR-009 sections
- [ ] Add cross-references: RGI-IMPLEMENTATION.md → ADR-010 issues
- [ ] Add cross-references: RGS-IMPLEMENTATION.md → ADR-011 phases
- [ ] Create this COMPLIANCE-MATRIX.md (DONE ✅)

---

### Q3 2026 (Following Phase)

**RGPD (ADR-009 Phase 2-3)**:

- [ ] Sign DPAs with Microsoft + Degreed (by Jun 30)
- [ ] Implement Right to Restrict + Right to Object (by Jul 31)

**RGS (ADR-011 Phase 6-7-8)**:

- [ ] Build Risk Register + assess third-party vendors (Phase 7)
- [ ] Draft Incident Response playbook (Phase 8)

**RGI (ADR-007 Completion)**:

- [ ] Add CSV export option to data export endpoint
- [ ] Formalize API versioning policy

---

## 🔄 Document Cross-References (To Add)

### In RGS-IMPLEMENTATION.md

```markdown
> **Link to related standards**:
>
> - Data Protection: See [`RGPD-IMPLEMENTATION.md`](RGPD-IMPLEMENTATION.md) + [`ADR-009`](adr/ADR-009-RGPD-compliance-infrastructure.md)
> - API Design: See [`RGI-IMPLEMENTATION.md`](RGI-IMPLEMENTATION.md) + [`ADR-010`](adr/ADR-010-rgi-interoperability-compliance.md)
> - Current assessment by phase: [`ADR-011`](adr/ADR-011-rgs-compliance-roadmap.md)
```

### In RGPD-IMPLEMENTATION.md

```markdown
> **Link to governance checklist**:
>
> - Legal framework: [`ADR-009`](adr/ADR-009-RGPD-compliance-infrastructure.md) Phase 1-4 (Q2-Q4 2026)
> - Security controls required: [`RGS-IMPLEMENTATION.md`](RGS-IMPLEMENTATION.md) Phase 2-3 (already done ✅)
```

### In RGI-IMPLEMENTATION.md

```markdown
> **Link to related standards**:
>
> - Current assessment & technical gaps: [`ADR-010`](adr/ADR-010-rgi-interoperability-compliance.md)
> - Error handling (Issue #1): Also covered in [`RGS-IMPLEMENTATION.md`](RGS-IMPLEMENTATION.md) Phase 4
> - API Security: See [`RGS-IMPLEMENTATION.md`](RGS-IMPLEMENTATION.md) Phases 2-5
```

---

## 📈 Progress Tracking

| Standard | Governance         | Tech                | Timeline   | Owner        | Status                                                      |
| -------- | ------------------ | ------------------- | ---------- | ------------ | ----------------------------------------------------------- |
| **RGPD** | ADR-009 Phase 1    | RGPD-IMPLEMENTATION | Q2 2026    | Legal + Tech | 🔴 **BLOCKED** (Privacy Policy missing)                     |
| **RGS**  | ADR-011 Phases 1,4 | RGS-IMPLEMENTATION  | Q2-Q3 2026 | Security     | 🟡 **IN PROGRESS** (Phase 4 CSP/CSRF/Rate Limit due Jun 30) |
| **RGI**  | ADR-007 Technical  | RGI-IMPLEMENTATION  | Q2-Q3 2026 | Tech Lead    | 🟡 **IN PROGRESS** (ErrorDto due Jun 30)                    |

---

**Last Updated**: 2 avril 2026 by Compliance Agent  
**Next Review**: 15 avril 2026
