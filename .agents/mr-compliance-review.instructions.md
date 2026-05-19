---
applyTo: '**/.gitea/MERGE_REQ*'
---

# GitLab Merge Request Compliance Review Instructions

When working on Merge Requests, GitHub Copilot should automatically help ensure regulatory compliance across six regulatory frameworks (5 French + 1 International).

## Automatic Compliance Check

When a developer creates or comments on a Merge Request, Copilot should suggest:

```
@agent Compliance Officer
Review this MR for compliance with RGAA, RGPD, RGESN, RGS, RGI, and W3C WSG. Flag any issues before merging.
```

## Framework-Specific Guidance

Based on the type of change, Copilot should recommend:

### 📱 For UI/Frontend Changes

```
@skill compliance-rgaa
Verify keyboard navigation, ARIA labels, color contrast, and screen reader compatibility.
```

### 🔐 For Authentication/Authorization Changes

```
@skill compliance-rgs
Ensure proper authentication, authorization, rate limiting, and audit logging.
```

### 📊 For Data Handling Changes

```
@skill compliance-rgpd
Review consent mechanisms, data minimization, encryption, and user rights (export/deletion).
```

### 🌍 For API Design/Integration Changes

```
@skill compliance-rgi
Validate RESTful design, OpenAPI documentation, standard formats, and error handling.
```

### ⚡ For Performance/Optimization Changes

```
@skill compliance-rgesn
Check query optimization, caching strategy, data transfer efficiency, and resource usage.
```

### 🌍 For Web Sustainability & User Experience

````
@skill compliance-w3c-wsg
Verify sustainable web design: perception, energy efficiency, network optimization, offline support, inclusive design.

## Definition of Done Template

Add this to your Merge Request description:

```markdown
## Compliance Checklist

- [ ] **RGAA**: UI components are accessible (keyboard nav, ARIA labels, contrast)
- [ ] **RGPD**: Data handling is privacy-compliant (consent, encryption, deletion rights)
- [ ] **RGESN**: Code is optimized (queries, caching, API payloads)
- [ ] **RGS**: Security measures applied (auth, validation, audit logs)
- [ ] **RGI**: APIs are interoperable (REST, OpenAPI, standard formats)
- [ ] **W3C WSG**: Sustainable web design (perception, energy, network, offline, inclusive)

## Compliance Review

@agent Compliance Officer
Please review this MR.
````

## When Compliance Issues Are Found

If Copilot identifies compliance gaps:

1. **Acknowledge** the finding
2. **Discuss** with the team if necessary
3. **Fix** the issue before merging
4. **Document** the resolution

## Quick Links

- [Compliance Officer Agent](.agents/agents/compliance/AGENT.md)
- [RGAA Skill](.agents/skills/compliance-rgaa/SKILL.md) | [Project Implementation](docs/compliance/RGAA-IMPLEMENTATION.md)
- [RGPD Skill](.agents/skills/compliance-rgpd/SKILL.md) ([Reference](.agents/skills/compliance-rgpd/RGPD-REFERENCE.md)) | [Project Implementation](docs/compliance/RGPD-IMPLEMENTATION.md)
- [RGESN Skill](.agents/skills/compliance-rgesn/SKILL.md) | [Project Implementation](docs/compliance/RGESN-IMPLEMENTATION.md)
- [RGS Skill](.agents/skills/compliance-rgs/SKILL.md) | [Project Implementation](docs/compliance/RGS-IMPLEMENTATION.md)
- [RGI Skill](.agents/skills/compliance-rgi/SKILL.md) | [Project Implementation](docs/compliance/RGI-IMPLEMENTATION.md)
- [W3C WSG Skill](.agents/skills/compliance-w3c-wsg/SKILL.md) | [Project Implementation](docs/compliance/W3C-WSG-IMPLEMENTATION.md)
- [Compliance Framework Overview](docs/compliance/README.md)
- [Contributing Guide](CONTRIBUTING.md#regulatory-compliance)
