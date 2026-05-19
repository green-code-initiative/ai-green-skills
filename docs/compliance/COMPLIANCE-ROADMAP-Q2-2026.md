# 🎯 Project Compliance Alignment - Actionable Roadmap

**Date**: 2 avril 2026  
**Status**: Analysis Complete — Ready for Implementation  
**Owner**: Compliance Lead + CTO

---

## 📋 Key Findings from Cross-Alignment Audit

### ✅ What's Aligned

| Element                   | Status                 | Evidence                                                    |
| ------------------------- | ---------------------- | ----------------------------------------------------------- |
| **Three ADRs**            | ✅ Mutually referenced | ADR-011 ↔️ ADR-009 ↔️ ADR-010 linked                        |
| **Three IMPLEMENTATIONS** | ✅ Cross-linked        | RGS ↔️ RGPD ↔️ RGI prerequisites clear                      |
| **Master Timeline**       | ✅ Consolidated        | COMPLIANCE-MATRIX.md shows Q2-Q4 roadmap unified            |
| **OAuth 2.0 Status**      | ✅ Clarified           | oauth2-proxy v7.14.2 deployed → RGI ✅ recognized           |
| **Phase Dependencies**    | ✅ Documented          | RGS Phase 4 blocks RGI Issue #1; ADR-009 Phase 1 blocks DPA |

### 🔴 What Was Missing (Now Fixed)

| Gap                             | Was Hidden In        | Now Visible In                     | Impact                                              |
| ------------------------------- | -------------------- | ---------------------------------- | --------------------------------------------------- |
| **RGPD Governance Documents**   | ADR-009 only         | RGPD-IMPLEMENTATION.md **Phase 0** | CRITICAL: No Privacy Policy = 0% GDPR compliant     |
| **Security-API Cross-Concerns** | Separate ADRs        | COMPLIANCE-MATRIX.md + ADR links   | CSP header affects BOTH RGS Phase 4 + RGI Technical |
| **RGS Phase 4 Details**         | ADR-011 Phase 4 only | Linked in all docs                 | CSP, CSRF, Rate Limit (3 gaps, 1 deadline)          |
| **Cross-Standard Ordering**     | None                 | COMPLIANCE-MATRIX.md diagram       | Show Phase 1 of RGPD blocks Phase 2 of RGPD + RGI   |

---

## 🚨 Critical Path for Q2 2026 (Next 4 Weeks)

### Must Complete by May 15, 2026 (3 docs due)

#### 1️⃣ **RGPD Governance Documents** (LEGAL TEAM)

**Owner**: Legal/Compliance Officer  
**Deliverables**: Privacy Policy, Lawful Basis Matrix, Data Retention Schedule  
**Action**: Create `docs/PRIVACY-POLICY.md`, `docs/compliance/Project-LAWFUL-BASIS-MATRIX.md`, `docs/compliance/Project-DATA-RETENTION-SCHEDULE.md`  
**Why**: Without these, Project has **zero GDPR compliance** despite perfect encryption code  
**Blocker**: Blocks DPIA (due May 30), DPA signatures (due May 31), all RGI user rights endpoints  
**Reference**: RGPD-IMPLEMENTATION.md "Phase 0" section

#### 2️⃣ **DPA Signature Requests** (LEGAL + PROCUREMENT)

**Owner**: Legal Officer  
**Deliverables**: Execute DPA with Microsoft (Azure Graph API), DPA with Degreed  
**Action**: Send DPA templates to vendors, track signatures  
**Why**: Third-party data sharing = shared GDPR liability. Current: contracts missing.  
**Blocker**: Blocks go-live in GDPR-regulated environments (EU)  
**Reference**: ADR-009 Phase 2

---

### Must Complete by June 30, 2026 (3 code gaps + docs)

#### 3️⃣ **RGS Phase 4 Security Headers & Protection** (BACKEND + FRONTEND)

**Owner**: Security Lead + Backend Tech Lead  
**Deliverables**:

- [ ] **Content-Security-Policy (CSP) header** in `apps/api/src/main.ts`
  - Blocks XSS (RGS Phase 4)
  - Improves RGI Technical score
  - **Why**: Prevents XSS + data exfiltration
- [ ] **CSRF Protection middleware** (`@nestjs/csrf`)
  - RGS Phase 4 requirement
  - **Why**: Prevents unauthorized state-changing actions
- [ ] **Global Rate Limiting** (`@nestjs/throttle`)
  - RGS Phase 4 requirement
  - **Why**: DDoS + brute force mitigation

**Action**:

```bash
# 1. Add CSP header in main.ts:
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // tighten after asset migration
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", "https://api.Project.fr"],
  }
}))

# 2. Add CSRF middleware:
npm install --save @nestjs/csrf
@UseGuards(CsrfGuard)

# 3. Add rate limiting:
npm install --save @nestjs/throttle
app.use(ThrottleGuard({ limit: 100, ttl: 60 }))
```

**Why**:

- Blocks RGI Issue #1 (error standardization) which depends on secure API
- Completes RGS Phase 4 prerequisite for ADR-009 Phase 2 DPA compliance
- Required by GDPR Article 32 (encryption + security)

**Reference**: ADR-011 Phase 4, RGS-IMPLEMENTATION.md Section 4, RGI-IMPLEMENTATION.md Section 5.2

#### 4️⃣ **RGI Technical: Error Response Standardization** (BACKEND)

**Owner**: Backend Tech Lead  
**Deliverables**: Implement global `ErrorDto` + exception filter  
**Action**: Create `apps/api/src/core/filters/global-exception.filter.ts`, apply to all controllers  
**Code Pattern**:

```typescript
// libs/shared/dto/src/lib/error.dto.ts
export class ErrorDto {
  code: string // 'SESSION_NOT_FOUND', 'INVALID_EMAIL'
  message: string
  httpStatus: number
  timestamp: string // ISO 8601
  traceId: string // req-id for debugging
  path?: string
}

// apps/api/src/core/filters/global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: HttpArgumentsCollection) {
    // Return consistent ErrorDto format
  }
}
```

**Why**: Resolves ADR-010 Issue #1 (CRITICAL) — Partners need consistent error parsing  
**Reference**: ADR-010 Issue #1, RGI-IMPLEMENTATION.md Section 5.3

#### 5️⃣ **RGPD Document: DPIA Report** (LEGAL + SECURITY)

**Owner**: DPO + Security Lead  
**Deliverables**: Create `docs/compliance/Project-DPIA-REPORT.md`  
**Action**: Follow template in RGPD-IMPLEMENTATION.md "Phase 0" section  
**Why**:

- Demonstrates accountability (Article 35)
- Identifies remaining gaps (MFA, incident response)
- Supervisory authority may request compliance check

**Reference**: RGPD-IMPLEMENTATION.md "Phase 0", GDPR Article 35

---

## Q3 2026 (Dependent Phase)

Only start after Q2 complete:

### 6️⃣ **RGPD Phase 2: Right to Restrict + Right to Object** (BACKEND)

**Owner**: Backend Team  
**Depends On**: Q2 Privacy Policy + Lawful Basis Matrix  
**Deliverables**:

- [ ] AddDB columns: `Profile.processingRestricted`, `Profile.hasObjectedToProcessing`
- [ ] Endpoints: `POST /api/v1/profiles/me/restrict`, `POST /api/v1/profiles/me/object`
- [ ] Service logic: Check flags before recommendations, syncing, analytics

(See RGPD-IMPLEMENTATION.md Phase 3 for code examples)

### 7️⃣ **RGS Phase 6-8: Risk Registry, Incident Response** (SECURITY + CTO)

**Owner**: Security Lead + CTO  
**Depends On**: Q2 RGS Phase 4 complete  
**Deliverables**:

- [ ] ADR-011 Phase 6: Risk Register + vulnerability scanning
- [ ] ADR-011 Phase 7: Third-party risk audit (vendor assessment)
- [ ] ADR-011 Phase 8: Incident Response Playbook

---

## 📊 Timeline Summary (Consolidated)

```
┌─────────────────────────────────────────┐
│      APRIL 2026 (NOW)                   │
├──────────────────┬──────────────────────┤
│ Week 1 (Apr 2-6) │ Analysis Done ✅     │
│ Week 2 (Apr 8-15)│ Privacy Policy Due   │
│ Week 3 (Apr 15)  │ DPA Requests Sent    │
│ Week 4 (Apr 22)  │ CSP Header Impl.     │
├─────────────────────────────────────────┤
│      MAY 2026                           │
├──────────────────┬──────────────────────┤
│ Week 1 (May 6)   │ CSRF Protection Done │
│ Week 2 (May 13)  │ Rate Limit Done      │
│ Week 3 (May 20)  │ ErrorDto Due         │
│ Week 4 (May 27)  │ DPA Signatures Due   │
├─────────────────────────────────────────┤
│      JUNE 2026                          │
├──────────────────┬──────────────────────┤
│ Week 4 (Jun 30)  │ Q2 COMPLETE ✅       │
└─────────────────────────────────────────┘

Q3 2026: User rights, Risk registry, Incident response
Q4 2026: Third-party audits, Accreditation
```

---

## ✅ Files Created/Updated

| File                                                           | Change                                           | Status     |
| -------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| [`COMPLIANCE-MATRIX.md`](COMPLIANCE-MATRIX.md)                 | NEW                                              | ✅ Created |
| [`RGPD-IMPLEMENTATION.md`](RGPD-IMPLEMENTATION.md)             | Added Phase 0 section (Governance required)      | ✅ Updated |
| [`RGS-IMPLEMENTATION.md`](RGS-IMPLEMENTATION.md)               | Added cross-refs to COMPLIANCE-MATRIX, RGI, RGPD | ✅ Updated |
| [`RGI-IMPLEMENTATION.md`](RGI-IMPLEMENTATION.md)               | Added cross-refs, clarified OAuth status         | ✅ Updated |
| [`ADR-009`](../adr/ADR-009-RGPD-compliance-infrastructure.md)  | Added Related Docs + Critical Blockers           | ✅ Updated |
| [`ADR-010`](../adr/ADR-010-rgi-interoperability-compliance.md) | Added Related Docs + Critical Blockers           | ✅ Updated |
| [`ADR-011`](../adr/ADR-011-rgs-compliance-roadmap.md)          | Added Related Docs + Critical Blockers           | ✅ Updated |

---

## 🎯 Next Steps

### For Compliance Lead (Today)

1. Review this roadmap with Legal, Security, Tech Lead
2. Assign owners to Q2 tasks (7 items above)
3. Add calendar reminders for May 15 (3 docs), May 31 (DPA), Jun 30 (code)
4. Create sub-tickets in project management tool

### For Tech Lead (This Week)

1. Assess CSP, CSRF, Rate Limit implementation effort
2. Budget Q2 sprints: ~10-15 story points for RGS Phase 4
3. Coordinate with RGI/RGPD teams for dependencies
4. Review ErrorDto implementation pattern (1-2 SP)

### For Legal/Compliance (This Week)

1. Create Privacy Policy template (use CNIL reference)
2. Draft DPA signature request emails to Azure + Degreed
3. Schedule DPIA workshop with Security team
4. Timeline check: May 15 achievable?

---

**Status**: ✅ All Standards **Aligned** with clear dependencies + timeline  
**Next Review**: April 15, 2026  
**Contact**: Compliance Team
