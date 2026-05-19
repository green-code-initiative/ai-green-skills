# Project Compliance & Regulatory Guidance

**Compliance framework and Project-specific implementation**

## 🔄 Architecture: Generic Framework + Project Implementation

### Generic Framework (Generic = Reusable for Any Project)

**Location**: `.agents/` folder (standard VS Code location)

The framework provides **reusable, project-agnostic tools**:

| Component                    | File                                   | Purpose                                               |
| ---------------------------- | -------------------------------------- | ----------------------------------------------------- |
| **Framework Infrastructure** | `.agents/skills/compliance-framework/` | Universal orchestration (tech + referential agnostic) |
| **Other Skills**.            | `.agents/skills/compliance-rg*/`       | RGPD, RGS, RGESN, RGI, W3C WSG (similar structure)    |
| **Compliance Agent**         | `.agents/agents/compliance/`           | Apply Regulatory Referential skills                   |
| **Scanner Agent**.           | `.agents/agents/compliance-scanner/`   | Autonomous crawler                                    |

**Key**: These are **generic** — no Project-specific code, applicable to any project.

### Project Implementation (Specific = Project-Only)

**Location**: `docs/compliance/` folder (this directory)

Project-specific configurations and guides:

| File                        | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| **scanner-config.json**     | Project's web app + Storybook scanning configuration             |
| **ROBOT-SCANNER-GUIDE.md**  | How to run the robot scanner for Project (ports, routes, phases) |
| **COMPLIANCE-STRATEGY.md**  | Project's 3-tier validation approach (components, pages, API)    |
| **RGAA-IMPLEMENTATION.md**  | Accessibility fixes for Project's React + NestJS                 |
| **RGPD-IMPLEMENTATION.md**  | Data protection for Project user management                      |
| **RGS-IMPLEMENTATION.md**   | Security hardening                                            |
| **RGESN-IMPLEMENTATION.md** | Performance optimization                                      |
| **RGI-IMPLEMENTATION.md**   | API interoperability                                          |
| **reports/**                | Scan results (JSON, HTML)                                     |

**Key**: These are **Project-specific** — cannot be reused in other projects.

## 🚀 How the Robot Scanner Works

### Hybrid Implementation (Recommended)

The scanner uses a **Hybrid approach**:

**Phase 1: Jest-axe (Fast Unit Tests)**

- ✅ Run against component library (Storybook)
- ✅ Test individual components in isolation
- ✅ Duration: ~2 minutes

**Phase 2: Cypress (Browser Testing)**

- ✅ Run against web app pages
- ✅ Test real-world user flows
- ✅ Duration: ~5 minutes

**Phase 3: Manual Checks (Reserved)**

- ⚠️ Keyboard navigation (requires user interaction)
- ⚠️ Screen reader compat (requires NVDA/JAWS)
- ⚠️ Focus management (requires JS debugging)

### Output: Violations + Action Plan

For each violation found:

```json
{
  "violation": "color-contrast",
  "criterion": "3.2.1", // RGAA criterion ID
  "priority": "HIGH",
  "effort": "1-2 hrs",
  "team": "Design + Frontend",
  "steps": [
    "1. Identify low-contrast pairs using axe DevTools",
    "2. Update CSS to meet WCAG AA (4.5:1)",
    "3. Re-run scanner to verify"
  ]
}
```

## 📋 Quick Start

### Run Project's Compliance Scan

```bash
# Full scan (web app + components)
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js

# Verbose output with JSON report
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --verbose --json

# Scan specific target
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets web

# See detailed guide
cat docs/compliance/ROBOT-SCANNER-Project-GUIDE.md
```

### Review Violations & Action Plan

After scan completes:

```bash
# View JSON report
cat reports/compliance-report-*.json | jq '.summary'

# See violations grouped by priority
cat reports/compliance-report-*.json | jq '.actionPlan | keys'

# See specific violations
cat reports/compliance-report-*.json | jq '.violations[] | select(.priority == "CRITICAL")'
```

### Typical Workflow to Fix Violations

1. **Run scan** → Get violations list + action plan
2. **Create issues** → Export violations to GitHub/Jira with priorities
3. **Assign tasks** → By team (Design, Content, Frontend)
4. **Implement fixes** → Follow steps in action plan
5. **Re-run scan** → Verify fixes reduce violation count
6. **Integrate CI/CD** → Auto-run on PRs (see ROBOT-SCANNER-Project-GUIDE.md)

## 📚 Documentation

### For Running the Scanner

- **Detailed Guide**: [`ROBOT-SCANNER-Project-GUIDE.md`](./ROBOT-SCANNER-Project-GUIDE.md) — How to use the robot scanner for Project
- **Generic Pattern**: [`.agents/skills/compliance-rgaa/IMPLEMENTATION-PATTERN.md`](../../.agents/skills/compliance-rgaa/IMPLEMENTATION-PATTERN.md) — How any project implements this

### For Implementing Fixes

Use these for Project-specific code examples:

- [`RGAA-IMPLEMENTATION.md`](./RGAA-IMPLEMENTATION.md) — Accessibility in React + NestJS components
- [`RGPD-IMPLEMENTATION.md`](./RGPD-IMPLEMENTATION.md) — Privacy, consent, data rights in user management
- [`RGS-IMPLEMENTATION.md`](./RGS-IMPLEMENTATION.md) — Authentication, authorization, security hardening
- [`RGESN-IMPLEMENTATION.md`](./RGESN-IMPLEMENTATION.md) — Performance optimization & energy efficiency
- [`RGI-IMPLEMENTATION.md`](./RGI-IMPLEMENTATION.md) — RESTful API design & interoperability
- [`W3C-WSG-IMPLEMENTATION.md`](./W3C-WSG-IMPLEMENTATION.md) — Web sustainability (perception, energy, network, offline)

### For Learning Frameworks

Use generic skills to understand regulatory requirements:

```bash
@skill compliance-rgaa              # 182 WCAG 2.1 AA tests + tools
@skill compliance-rgpd              # GDPR/RGPD data protection principles
@skill compliance-rgs               # French RGS security standards
@skill compliance-rgesn             # Eco-responsible IT (French standard)
@skill compliance-rgi               # System interoperability
@skill compliance-w3c-wsg           # W3C Web Sustainability Guidelines
```

## 🗂️ File Organization

```
.agents/                                 ← GENERIC FRAMEWORK
├─ skills/
│  └─ compliance-rgaa/
│     ├─ tests.json               ← 182 RGAA/WCAG tests
│     ├─ tools-mapping.json       ← 13 tools + coverage
│     ├─ criteria.json            ← 106 RGAA criteria
│     ├─ IMPLEMENTATION-PATTERN.md ← How to implement (ANY project)
│     ├─ scripts/
│     │  ├─ scan-compliance.js    ← Generic robot scanner
│     │  └─ validate-criteria.js  ← Framework validator
│     └─ package.json

└─ agents/
   └─ compliance-scanner/         ← Workflow specification
      └─ agent.md                 ← How scanner executes

docs/compliance/                  ← Project IMPLEMENTATION
├─ README.md                      ← This file
├─ scanner-config.json            ← Project's scanner configuration
├─ ROBOT-SCANNER-Project-GUIDE.md    ← How to run for Project
├─ COMPLIANCE-STRATEGY.md         ← 3-tier validation approach
├─ RGAA-IMPLEMENTATION.md         ← Accessibility fixes
├─ RGPD-IMPLEMENTATION.md         ← Privacy fixes
├─ RGS-IMPLEMENTATION.md          ← Security fixes
├─ RGESN-IMPLEMENTATION.md        ← Performance fixes
├─ RGI-IMPLEMENTATION.md          ← API design fixes
├─ W3C-WSG-IMPLEMENTATION.md      ← Sustainability fixes
└─ reports/                       ← Scan results (generated)
```

## ✅ Key Principles

### Generic Framework

- **100% Reusable** across projects (no Project hardcoding)
- **Configuration-Driven** (each project defines scope)
- **Documented Patterns** (applicable to any stack)
- **Extensible** (add custom violation types, action plans)

### Project Implementation

- **100% Specific** to Project's architecture
- **Code Examples** for React/NestJS components
- **Tracked** in `docs/compliance/` (project workspace)
- **Versioned** with project (same repo)

## 🎯 Success Checklist

After running robot scanner:

- ✅ Scan completes without errors
- ✅ Violations mapped to RGAA criteria IDs
- ✅ Action plan includes priority (CRITICAL > HIGH > MEDIUM > LOW)
- ✅ Effort estimates provided per violation type
- ✅ Team assignments suggested (Design, Frontend, Content)
- ✅ Remediation steps specific to violation type
- ✅ JSON report generated for tracking
- ✅ Reserved tests marked with manual review notes

## 🔗 References

### Project Documentation

- [Project Monorepo Architecture](./../ARCHITECTURE.md)
- [Project Compliance Strategy](./Project-COMPLIANCE-STRATEGY.md)

### Compliance Standards

- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [French RGAA 4.1.2](https://www.numerique.gouv.fr/publications/rgaa-4-1-2/)
- [GDPR/RGPD](https://eur-lex.europa.eu/eli/reg/2016/679/)
- [RGS 2.0](https://www.ssi.gouv.fr/)
- [RGESN](https://www.numerique.gouv.fr/publications/rgesn/)
- [W3C Web Sustainability Guidelines](https://w3c.github.io/sustyweb/)

### Tools Used

- **axe-core**: Automated accessibility testing
- **jest-axe**: Jest integration for unit tests
- **Lighthouse**: Performance + accessibility
- **WAVE**: WebAIM accessibility checker
- **Cypress**: E2E browser testing

## 🚀 Next Steps

1. **Run baseline scan**: `node scan-compliance.js --json`
2. **Review violations**: Check `reports/compliance-report-*.json`
3. **Create sprint tasks**: Export violations to issue tracker
4. **Implement fixes**: Use Project-\*-IMPLEMENTATION.md guides
5. **Re-scan**: Verify violations decline
6. **Integrate CI/CD**: Add scan to GitHub Actions (see guide)

### Use Generic Skills to Learn Frameworks

```bash
@skill compliance-rgaa              # Learn WCAG 2.1 accessibility tests
@skill compliance-rgpd              # Learn GDPR/RGPD data protection
@skill compliance-rgs               # Learn French security standards
@skill compliance-rgesn             # Learn eco-responsible IT
@skill compliance-rgi               # Learn API interoperability
@skill compliance-w3c-wsg           # Learn W3C Web Sustainability
```

### Implement Fixes Based on Project Guides

See these for **code examples and architecture decisions**:

- [`RGAA-IMPLEMENTATION.md`](./RGAA-IMPLEMENTATION.md) — Accessibility in React + NestJS
- [`RGPD-IMPLEMENTATION.md`](./RGPD-IMPLEMENTATION.md) — Privacy & user rights
- [`RGS-IMPLEMENTATION.md`](./RGS-IMPLEMENTATION.md) — Security hardening
- [`RGESN-IMPLEMENTATION.md`](./RGESN-IMPLEMENTATION.md) — Performance & sustainability
- [`RGI-IMPLEMENTATION.md`](./RGI-IMPLEMENTATION.md) — API design
- [`W3C-WSG-IMPLEMENTATION.md`](./W3C-WSG-IMPLEMENTATION.md) — Web sustainability

## 🔍 Typical Workflow

### For Autonomous Compliance Scanning

1. **Invoke the agent**: `@agent Compliance Officer`
2. **Review findings**: Check across all 6 frameworks
3. **See Project-specific examples**: [`APPLYING-COMPLIANCE-AGENT-TO-Project.md`](./APPLYING-COMPLIANCE-AGENT-TO-Project.md)
4. **Fix issues** using implementation guides

### For Feature Development

1. **Learn the framework**: `@skill compliance-rgaa` (generic expertise)
2. **Implement in Project**: Read [`RGAA-IMPLEMENTATION.md`](./RGAA-IMPLEMENTATION.md) (with code examples)
3. **Review code**: `@agent Compliance Officer`
4. **Check off**: Developer checklist in implementation guide

## 📖 How to Use These Resources

**For Developers**:

1. Building a feature → Check relevant `Project-*-IMPLEMENTATION.md`
2. Code review → Use `@agent Compliance Officer`
3. Architecture decisions → Combination of generic `@skill` + implementation guide

**For AI Agents**:

```bash
# Generic expertise
@skill compliance-rgaa

# Project-specific guidance
Read: docs/compliance/RGAA-IMPLEMENTATION.md

# Full compliance review
@agent Compliance Officer
Review this code for compliance with all frameworks.
```

**Comprehensive Review**:

```bash
@agent Compliance Officer
Review this code for compliance with all regulatory frameworks (French standards + W3C).
```

## 📋 Regulatory Frameworks Overview

### RGAA (Digital Accessibility)

**French: Règles pour l'Accessibilité de l'Administration** | WCAG 2.1 Level AA

- **Focus**: Ensure digital services accessible to all users, including those with disabilities
- **Standard Basis**: WCAG 2.1 Level AA certification
- **Key Areas**: Semantic HTML, ARIA labels, keyboard navigation, color contrast, form accessibility
- **When to Apply**: UI design, form creation, code review
- **Learn**: [`@skill compliance-rgaa`](../../.agents/skills/compliance-rgaa/)
- **Implement**: [`RGAA-IMPLEMENTATION.md`](./RGAA-IMPLEMENTATION.md)

### RGPD (Data Protection)

**French: Règlement Général sur la Protection des Données** | EU Regulation 2016/679

- **Focus**: Protect personal data and privacy rights
- **Standard Basis**: EU Regulation 2016/679 (GDPR)
- **Key Areas**: Consent, data minimization, encryption, right to access/erasure, DPIA, breach notification
- **When to Apply**: User registration, data handling, feature planning
- **Learn**: [`@skill compliance-rgpd`](../../.agents/skills/compliance-rgpd/)
- **Implement**: [`RGPD-IMPLEMENTATION.md`](./RGPD-IMPLEMENTATION.md)

### RGESN (Environmental Sustainability)

**French: Règles de Gouvernance Environnementale du Système Numérique** | 2022 Standard

- **Focus**: Minimize environmental impact and carbon footprint
- **Standard Basis**: French government green IT initiative (2022)
- **Key Areas**: Code efficiency, database optimization, data transfer minimization, green hosting, measurement
- **When to Apply**: Performance optimization, infrastructure decisions, query optimization
- **Learn**: [`@skill compliance-rgesn`](../../.agents/skills/compliance-rgesn/)
- **Implement**: [`RGESN-IMPLEMENTATION.md`](./RGESN-IMPLEMENTATION.md)

### RGS (Information Security)

**French: Règles de Gouvernance de Sécurité** | v2.0 Standard

- **Focus**: Protect against cyber threats and breaches
- **Standard Basis**: French government security framework (v2.0)
- **Key Areas**: Authentication, authorization, encryption, incident response, audit logging, vulnerability management
- **When to Apply**: API design, authentication flows, incident response, dependency management
- **Learn**: [`@skill compliance-rgs`](../../.agents/skills/compliance-rgs/)
- **Implement**: [`RGS-IMPLEMENTATION.md`](./RGS-IMPLEMENTATION.md)

### RGI (Interoperability)

**French: Règles de Gouvernance d'Interopérabilité** | v2.0 Standard

- **Focus**: Enable seamless data exchange between systems
- **Standard Basis**: French government interoperability standards (v2.0)
- **Key Areas**: RESTful APIs, standard data formats (JSON/ISO 8601), OpenAPI documentation, data export, webhooks
- **When to Apply**: API endpoint design, endpoint documentation, data export features, external integrations
- **Learn**: [`@skill compliance-rgi`](../../.agents/skills/compliance-rgi/)
- **Implement**: [`RGI-IMPLEMENTATION.md`](./RGI-IMPLEMENTATION.md)

### W3C Web Sustainability Guidelines (WSG)

**International: W3C Standard** | v1.0

- **Focus**: Sustainable web design and minimized environmental impact
- **Standard Basis**: W3C Web Sustainability Guidelines 1.0
- **Key Areas**: Perceived performance, energy efficiency, network optimization, offline support, inclusive design, hardware longevity, measurement
- **When to Apply**: All features, especially performance-critical paths, image optimization, caching strategies
- **Learn**: [`@skill compliance-w3c-wsg`](../../.agents/skills/compliance-w3c-wsg/)
- **Implement**: [`W3C-WSG-IMPLEMENTATION.md`](./W3C-WSG-IMPLEMENTATION.md)

## ✅ Definition of Done Checklist

Before marking a feature as complete, verify:

- [ ] **Accessibility** — RGAA principles followed (see `RGAA-IMPLEMENTATION.md`)
- [ ] **Data Protection** — RGPD requirements met (see `RGPD-IMPLEMENTATION.md`)
- [ ] **Security** — RGS standards applied (see `RGS-IMPLEMENTATION.md`)
- [ ] **Interoperability** — RGI patterns implemented (see `RGI-IMPLEMENTATION.md`)
- [ ] **Sustainability** — RGESN practices considered (see `RGESN-IMPLEMENTATION.md`)
- [ ] **Web Sustainability** — W3C guidelines applied (see `W3C-WSG-IMPLEMENTATION.md`)

## 💬 Code Review Comments

In code review comments, reference the relevant compliance guidance:

```bash
@skill compliance-rgpd
This endpoint handles user data. Ensure we have consent logged
and data is encrypted per the checklist in RGPD-IMPLEMENTATION.md.
```

Or invite the Compliance Officer agent:

```bash
@agent Compliance Officer
Review this code for compliance across all frameworks.
```

## 📊 Compliance Dashboard

Track compliance across the codebase:

| Framework                    | Status  | Last Review | Next Review |
| ---------------------------- | ------- | ----------- | ----------- |
| Accessibility (RGAA)         | ✅ 95%  | 2026-03-01  | 2026-06-01  |
| Data Protection (RGPD)       | ✅ 100% | 2026-02-15  | 2026-05-15  |
| Security (RGS)               | ✅ 98%  | 2026-01-20  | 2026-04-20  |
| Interoperability (RGI)       | ✅ 100% | 2026-02-28  | 2026-05-28  |
| Sustainability (RGESN)       | ⚠️ 75%  | 2026-02-01  | 2026-05-01  |
| Web Sustainability (W3C WSG) | ⚠️ 70%  | 2026-02-10  | 2026-05-10  |

**Action Items**:

- **RGESN**: Implement caching layer to improve query efficiency (Target: +15% improvement)
- **W3C WSG**: Add Web Vitals monitoring to admin dashboard (Target: Complete by 2026-05-01)
- **W3C WSG**: Implement Service Worker for offline support (Target: +10% coverage by Q2)
- **W3C WSG**: Create carbon footprint tracking dashboard (Target: Complete by Q2)

## 🔗 Related Documentation

- **[docs/ARCHITECTURE.md](../ARCHITECTURE.md)** — System architecture with compliance principles
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** — Contribution guidelines (references compliance)
- **[.github/copilot-instructions.md](../../.github/copilot-instructions.md)** — AI agent configuration

## 📞 Questions & Support

- **Accessibility questions?** → See [`@skill compliance-rgaa`](../../.agents/skills/compliance-rgaa/) or [`Project-RGAA-IMPLEMENTATION.md`](./Project-RGAA-IMPLEMENTATION.md)
- **Data protection concerns?** → See [`@skill compliance-rgpd`](../../.agents/skills/compliance-rgpd/) or [`Project-RGPD-IMPLEMENTATION.md`](./Project-RGPD-IMPLEMENTATION.md)
- **Security review?** → See [`@skill compliance-rgs`](../../.agents/skills/compliance-rgs/) or [`Project-RGS-IMPLEMENTATION.md`](./Project-RGS-IMPLEMENTATION.md)
- **API design?** → See [`@skill compliance-rgi`](../../.agents/skills/compliance-rgi/) or [`RGI-IMPLEMENTATION.md`](./RGI-IMPLEMENTATION.md)
- **Performance optimization?** → See [`@skill compliance-rgesn`](../../.agents/skills/compliance-rgesn/) or [`Project-RGESN-IMPLEMENTATION.md`](./Project-RGESN-IMPLEMENTATION.md)
- **Sustainability (W3C)?** → See [`@skill compliance-w3c-wsg`](../../.agents/skills/compliance-w3c-wsg/) or [`Project-W3C-WSG-IMPLEMENTATION.md`](./Project-W3C-WSG-IMPLEMENTATION.md)
- **Comprehensive review?** → Invoke `@agent Compliance Officer`

## 📜 Regulatory Framework Versions

| Framework | Version  | Basis             | Last Updated | Next Review |
| --------- | -------- | ----------------- | ------------ | ----------- |
| RGAA      | 4.1      | WCAG 2.1 Level AA | March 2026   | Q2 2027     |
| RGPD      | 2016/679 | EU GDPR           | March 2026   | Q2 2027     |
| RGESN     | 2022     | French Government | March 2026   | Q2 2027     |
| RGS       | v2.0     | French Government | March 2026   | Q2 2027     |
| RGI       | 2.0      | French Government | March 2026   | Q2 2027     |
| W3C WSG   | 1.0      | W3C Standard      | March 2026   | Q2 2027     |

---

**Last Updated**: 12 March 2026  
**Maintained By**: Project Team  
**Review Frequency**: Quarterly
