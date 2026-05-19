# Applying Compliance Agent to Project

This guide explains how to use the **generic Compliance Officer agent** (`.agents/agents/compliance/`) in the context of Project's specific architecture and workflows.

## 🎯 What is the Compliance Officer Agent?

The agent at [`.agents/agents/compliance/AGENT.md`](../../.agents/agents/compliance/AGENT.md) is **framework-agnostic**. It:

- Validates code against 5 French regulatory frameworks
- Delegates to specialized SKILLs for deep expertise
- Conducts comprehensive compliance reviews
- Works with any project (not just Project)

## 🚀 How to Use in Project

### When to Invoke

**During Code Review** (before merging to main):

```bash
@agent Compliance Officer
Review this PR for compliance with RGAA, RGPD, RGS, RGESN, and RGI.
```

**For Specific Domains** (if you need deep expertise):

```bash
@skill compliance-rgaa
Review this React form for accessibility issues.
```

**For Architecture Decisions**:

```bash
@agent Compliance Officer
We're redesigning user authentication. Ensure it meets French security standards.
```

### Project-Specific Code Review Scenarios

#### 1️⃣ **Adding a New API Endpoint** (`apps/api`)

```bash
@agent Compliance Officer
Review this NestJS endpoint for:
- Authentication & authorization (JWT validation)
- Input validation & SQL injection prevention
- Audit logging
- Error handling
- API documentation for accessibility
```

**What the agent checks**:

- ✅ `@skill compliance-rgs` — Security (JWT, rate limiting, input validation)
- ✅ `@skill compliance-rgi` — API design (RESTful, OpenAPI docs, standard error codes)
- ✅ `@skill compliance-rgpd` — Data handling (does it collect/process user data?)
- ✅ `@skill compliance-rgesn` — Performance (efficient queries, caching)

#### 2️⃣ **Building a React Component** (`apps/web`, `libs/web/*`)

```bash
@agent Compliance Officer
Review this Material-UI form component for:
- Keyboard navigation
- ARIA labels and semantic HTML
- Color contrast ratios
- Form validation & error handling
- Personally identifiable information (PII) handling
```

**What the agent checks**:

- ✅ `@skill compliance-rgaa` — Accessibility (WCAG 2.1 Level AA)
- ✅ `@skill compliance-rgpd` — Data protection (is it collecting personal data?)
- ✅ `@skill compliance-rgs` — Security (input validation, XSS prevention)

#### 3️⃣ **Handling User Data** (any layer)

```bash
@agent Compliance Officer
Review this feature for personal data handling:
- User registration with email/profile
- Data export capability
- User deletion ("right to be forgotten")
```

**What the agent checks**:

- ✅ `@skill compliance-rgpd` — Consent, encryption, retention, user rights
- ✅ `@skill compliance-rgs` — Encryption at rest (database), in transit (TLS)
- ✅ `@skill compliance-rgi` — Data portability (export format)

#### 4️⃣ **Database Schema Change** (`libs/server/entities`)

```bash
@agent Compliance Officer
Review this new TypeORM entity for:
- Personal data fields (email, phone, SSN, etc.)
- Sensitive field handling & encryption
- Retention policies
- Export/import capability
```

**What the agent checks**:

- ✅ `@skill compliance-rgpd` — Data minimization, encryption, retention
- ✅ `@skill compliance-rgs` — Encryption strategy (field-level, at-rest)

#### 5️⃣ **Authentication Change** (`apps/api/src/modules/auth`)

```bash
@agent Compliance Officer
Review this authentication flow for:
- Password policy enforcement
- MFA/2FA during login
- Session management
- Failed login attempt tracking
```

**What the agent checks**:

- ✅ `@skill compliance-rgs` — Password hashing, MFA, rate limiting
- ✅ `@skill compliance-rgpd` — Login audit logging (don't log passwords!)
- ✅ `@skill compliance-rgesn` — API performance (efficient auth checks)

#### 6️⃣ **External Integration** (Degreed, Azure Graph, etc.)

```bash
@agent Compliance Officer
Review this Degreed integration for:
- Data exchange security (is it encrypted?)
- User consent (are we sharing user data?)
- Error handling & logging
```

**What the agent checks**:

- ✅ `@skill compliance-rgs` — TLS, certificate validation, API key management
- ✅ `@skill compliance-rgpd` — User consent, data sharing agreements
- ✅ `@skill compliance-rgi` — Interoperability (standard formats)

---

## 📋 Project Architecture by Compliance Domain

### Frontend (`apps/web`, `libs/web/`)

| Framework | Checklist                                                                                |
| --------- | ---------------------------------------------------------------------------------------- |
| **RGAA**  | Semantic React components, ARIA labels, keyboard nav, color contrast, form accessibility |
| **RGPD**  | Never store PII in localStorage/sessionStorage without encryption; handle consent UI     |
| **RGS**   | XSS prevention (sanitize user input), CSRF protection on forms                           |
| **RGESN** | Lazy load components, code splitting, minification, avoid re-renders                     |
| **RGI**   | REST API calls via axios, standard error handling                                        |

### Backend (`apps/api`, `libs/server/`)

| Framework | Checklist                                                                               |
| --------- | --------------------------------------------------------------------------------------- |
| **RGAA**  | Swagger/OpenAPI documentation accessible; error messages clear                          |
| **RGPD**  | Encryption at rest, audit logging, user data export endpoint, deletion handler          |
| **RGS**   | JWT validation, role-based guards, input validation with class-validator, rate limiting |
| **RGESN** | Database query optimization, caching with Redis, pagination                             |
| **RGI**   | RESTful endpoints, standard HTTP status codes, JSON responses                           |

### Database (`libs/server/entities`, `ormconfig.ts`)

| Framework | Checklist                                                                   |
| --------- | --------------------------------------------------------------------------- |
| **RGAA**  | Exported data is structured (CSV headers, JSON keys)                        |
| **RGPD**  | Encrypt sensitive fields (email, phone); retention timestamps; soft deletes |
| **RGS**   | No credentials in database; encryption keys from env vars                   |
| **RGESN** | Efficient indexing on common queries                                        |
| **RGI**   | Standard data types (string, integer, date, enum)                           |

### Infrastructure (Docker, config)

| Framework | Checklist                                       |
| --------- | ----------------------------------------------- |
| **RGAA**  | logs are human-readable                         |
| **RGPD**  | Secrets in `.env`, not in code; TLS enabled     |
| **RGS**   | Secrets never logged; audit logs immutable      |
| **RGESN** | Container images optimized (multi-stage builds) |
| **RGI**   | Services expose OpenAPI/health endpoints        |

---

## ✅ Pre-Merge Compliance Checklist

Before approving a PR, run:

```bash
@agent Compliance Officer
Final check before merge. Review this PR for:
- Accessibility ✓
- Data protection ✓
- Security ✓
- Sustainability ✓
- Interoperability ✓
```

Then go through the checklist:

- [ ] **RGAA** — Component is keyboard accessible, has ARIA labels, meets color contrast
- [ ] **RGPD** — Personal data is handled correctly, encrypted, logged, user rights respected
- [ ] **RGS** — Input validated, no auth bypass, secrets not exposed, rate limiting applied
- [ ] **RGESN** — Queries optimized, unnecessary computation removed, files minified
- [ ] **RGI** — API follows REST patterns, errors are standard, responses are JSON

---

## 🔗 Related Documentation

- **Generic Agent**: [`.agents/agents/compliance/AGENT.md`](../../.agents/agents/compliance/)
- **Generic Skills**:
  - RGAA: [`.agents/skills/compliance-rgaa/`](../../.agents/skills/compliance-rgaa/)
  - RGPD: [`.agents/skills/compliance-rgpd/`](../../.agents/skills/compliance-rgpd/)
  - RGESN: [`.agents/skills/compliance-rgesn/`](../../.agents/skills/compliance-rgesn/)
  - RGS: [`.agents/skills/compliance-rgs/`](../../.agents/skills/compliance-rgs/)
  - RGI: [`.agents/skills/compliance-rgi/`](../../.agents/skills/compliance-rgi/)
  - W3C WSG: [`.agents/skills/compliance-w3c-wsg/`](../../.agents/skills/compliance-w3c-wsg/)
- **Project Implementation Guides**: (coming soon)
  - [`RGAA-IMPLEMENTATION.md`](./RGAA-IMPLEMENTATION.md)
  - [`RGPD-IMPLEMENTATION.md`](./RGPD-IMPLEMENTATION.md)
  - [`RGESN-IMPLEMENTATION.md`](./RGESN-IMPLEMENTATION.md)
  - [`RGS-IMPLEMENTATION.md`](./RGS-IMPLEMENTATION.md)
  - [`RGI-IMPLEMENTATION.md`](./RGI-IMPLEMENTATION.md)
  - [`W3C-WSG-IMPLEMENTATION.md`](./W3C-WSG-IMPLEMENTATION.md)

---

**Last Updated**: March 18, 2026
