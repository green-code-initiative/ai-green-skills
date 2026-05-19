---
name: compliance-scanner
type: specification
purpose: Autonomous multi-standard compliance scanning (RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG) for any project
version: 2.0
---

# Compliance Scanner Agent

**Autonomous multi-standard compliance orchestrator that invokes appropriate scanners for RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG and generates unified action plans.**

## Purpose

This agent is **referential-agnostic** and works with any compliance standard:

1. **Discovery**: Auto-detect projects/components from configuration
2. **Scanner Invocation**: Run the appropriate standard-specific scanner via framework
3. **Planning**: Generate violations list + prioritized action plan per standard

## Available Standards

This agent can orchestrate scanning for:

| Standard    | Domain               | Automation                      | Invocation                                                     |
| ----------- | -------------------- | ------------------------------- | -------------------------------------------------------------- |
| **RGAA**    | Accessibility        | Axe-core + WCAG tests           | `.agents/skills/compliance-rgaa/scripts/scan-compliance.js`    |
| **RGPD**    | Data Protection      | Code analysis + config review   | `.agents/skills/compliance-rgpd/scripts/scan-compliance.js`    |
| **RGS**     | Information Security | Static analysis + policy checks | `.agents/skills/compliance-rgs/scripts/scan-compliance.js`     |
| **RGESN**   | Eco-Responsibility   | Performance + resource analysis | `.agents/skills/compliance-rgesn/scripts/scan-compliance.js`   |
| **RGI**     | Interoperability     | API schema validation           | `.agents/skills/compliance-rgi/scripts/scan-compliance.js`     |
| **W3C-WSG** | Web Sustainability   | Web Vitals + energy footprint   | `.agents/skills/compliance-w3c-wsg/scripts/scan-compliance.js` |

## Capabilities

### Generic (All Standards)

- ✅ Auto-detect configuration (`docs/compliance/scanner-config.json`)
- ✅ Route/component discovery (dynamic or static)
- ✅ Invoke standard-specific scanner via framework
- ✅ Generate violations list with criteria mapping
- ✅ Generate action plans with priority, effort, responsible team
- ✅ Export JSON reports for CI/CD integration
- ✅ Support project mapping (Nx, Turborepo, etc.)

### Standard-Specific (Varies per Referential)

**RGAA**: Axe-core accessibility tests, WCAG 2.1 AA compliance, heading hierarchy
**RGPD**: Data flow analysis, consent verification, encryption checks
**RGS**: Authentication & authorization, audit logging, encryption
**RGESN**: Query optimization, caching strategies, resource efficiency
**RGI**: API schema validation, OpenAPI conformance, data format standards
**W3C-WSG**: Web Vitals (LCP, FID, CLS), carbon footprint, perception optimization

## Workflow

### Generic Scanner Workflow

Regardless of which standard is being scanned:

1. **Load Configuration** → `docs/compliance/scanner-config.json`
2. **Discover Scope** → Identify projects/pages/components
3. **Invoke Standard-Specific Scanner** → Run `.agents/skills/compliance-*/scripts/scan-compliance.js`
4. **Generate Violations List** → Standard-specific criteria mapping
5. **Create Action Plan** → Violations grouped by priority + effort
6. **Export Reports** → JSON for CI/CD, console for humans

### Step-by-Step Execution

**Step 1: Load Configuration**

Agent reads `docs/compliance/scanner-config.json`:

- Target services (web app, API, component library, backend service)
- Project mapping (which projects correspond to which targets)
- Standard-specific configuration

**Success Criteria:**

- Config file found and valid
- All target URLs/services are accessible
- Configuration parsed without errors

**Exit if:** Config malformed or targets unreachable

---

**Step 2: Discover Scope**

Based on target type:

**For web applications:**

- Static: Read `routes` array from config
- Dynamic: Fetch `sitemap.xml` or use route discovery

**For component libraries:**

- API-based: Fetch Storybook docs.json metadata
- File-based: Scan story files in source tree

**For backend services:**

- OpenAPI/Swagger: Extract endpoints from schema
- Code analysis: Identify exposure points from source code

**For APIs:**

- Schema-based: Extract operations from OpenAPI/AsyncAPI/GraphQL

**Output:** List of URLs/endpoints to scan

---

**Step 3: Invoke Standard-Specific Scanner**

Call the appropriate scanner via the framework:

```bash
# RGAA example
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js

# RGPD example
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgpd/scripts/scan-compliance.js

# RGS example
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgs/scripts/scan-compliance.js
```

Each scanner performs its domain-specific checks:

- **RGAA**: Axe-core accessibility scans
- **RGPD**: Data flow analysis + consent verification
- **RGS**: Authentication/authorization + encryption checks
- **RGESN**: Performance + resource optimization analysis
- **RGI**: API schema compliance validation
- **W3C-WSG**: Web Vitals + sustainability metrics

---

**Step 4: Collect Violations**

For each violation found:

```
Violation ID (e.g., "color-contrast" for RGAA, "missing-consent" for RGPD)
│
├─ Standard-specific criteria mapping
├─ Impact (critical, serious, moderate, minor)
├─ Affected locations (URLs, code lines, elements)
└─ Remediation context
```

---

**Step 5: Generate Action Plan**

For each unique violation class:

```
Map violation ID → ACTION_TEMPLATE
│
├─ Priority: CRITICAL / HIGH / MEDIUM / LOW
├─ Effort estimate: X hours
├─ Responsible team: Backend / Frontend / Security / Data / etc.
└─ Remediation steps: [Detailed action items]
```

**Example for RGAA:**

```json
{
  "violation": "color-contrast",
  "pages": ["/dashboard", "/profile"],
  "priority": "HIGH",
  "effort": "2-4 hrs",
  "team": "Design + Frontend",
  "steps": [
    "1. Use axe DevTools to identify all low-contrast pairs",
    "2. Update design system color variables",
    "3. Test WCAG AA (4.5:1 for normal text, 3:1 for large text)",
    "4. Document any approved exceptions"
  ]
}
```

**Example for RGPD:**

```json
{
  "violation": "missing-consent-banner",
  "services": ["web", "mobile-app"],
  "priority": "CRITICAL",
  "effort": "4-8 hrs",
  "team": "Legal + Frontend",
  "steps": [
    "1. Review consent banner requirements",
    "2. Implement consent preference center",
    "3. Verify cookies/tracking respect consent",
    "4. Document consent audit trail"
  ]
}
```

---

**Step 6: Generate Reports**

**Console Output:**

- Summary: Total violations, count by priority
- Grouped action plan (CRITICAL first, then HIGH, etc.)
- Compliance metrics per standard
- Next steps and responsible teams

**JSON Report:** (`reports/compliance-report-[STANDARD]-YYYY-MM-DD.json`)

```json
{
  "generated": "2026-03-25T10:30:00Z",
  "standard": "RGAA",
  "summary": {
    "pagesScanned": 15,
    "totalViolations": 42,
    "critical": 8,
    "high": 12,
    "medium": 15,
    "low": 7,
    "estimatedEffort": "40-60 hrs"
  },
  "violations": [...],
  "actionPlan": {...},
  "metrics": {...}
}
```

**CI/CD Integration:**

- Exit code 0 if no violations, 1 if violations found
- JSON report path printed for artifact capture
- Violations grouped for GitHub issue auto-creation (optional)

## Configuration Reference

Configuration is specified in `docs/compliance/scanner-config.json` and applies to **all standards**.

### Required Fields

```json
{
  "name": "Project Name",
  "targets": [
    {
      "name": "Web App",
      "type": "web|components|api|backend",
      "url": "http://localhost:3000",
      "routes": ["/", "/login", "/api/v1/users"]
      // OR use discovery strategy:
      // "discovery": "sitemap" | "storybook" | "openapi"
    }
  ],
  "projectMapping": {
    "web": ["apps/web"],
    "api": ["apps/api"],
    "components": ["libs/ui"]
  }
}
```

### Optional: Standard-Specific Config

Each scanner can have its own configuration:

```json
{
  "rgaaConfig": {
    "wcagLevel": "AA",
    "runOnly": ["wcag2a", "wcag2aa"]
  },
  "rgpdConfig": {
    "checkConsent": true,
    "checkEncryption": true
  },
  "rgsConfig": {
    "checkAuthentication": true,
    "checkAuditLogging": true
  },
  "timeout": 30000,
  "reportSettings": {
    "outputDir": "./reports",
    "saveJson": true
  }
}
```

## Error Handling

| Scenario               | Handling                        | Recovery                                     |
| ---------------------- | ------------------------------- | -------------------------------------------- |
| Config not found       | Throw error + show search paths | Create `docs/compliance/scanner-config.json` |
| Target unreachable     | Warn + skip target              | Ensure service running on configured port    |
| Standard scanner fails | Warn + mark target RESERVED     | Re-run with `--verbose`                      |
| Scanning timeout       | Skip target + log warning       | Increase `timeout` in config                 |
| No violations          | Report No violation found       | Manual audit recommended                     |

## Success Criteria

A successful scan run meets:

- ✅ Discovers targets automatically (pages, endpoints, code sections)
- ✅ Scans complete in reasonable time (< 10 mins per standard per project)
- ✅ Generates violations list with standard-specific criteria IDs
- ✅ Action plan includes priority and effort estimates
- ✅ JSON report is machine-readable and importable to issue trackers
- ✅ Console output is actionable (not just raw findings)

## Integration Points

### Input

- `docs/compliance/scanner-config.json` (unified project configuration)
- Standard-specific test registry (per `.agents/skills/compliance-*/`)
- Framework orchestrator (`.agents/skills/compliance-framework/`)

### Output

- Console report (violations by priority, per standard)
- `reports/compliance-report-[STANDARD]-YYYY-MM-DD.json` (detailed, machine-readable)
- Exit code (0 = compliant, 1 = violations found)

### External Triggers

- CLI: Direct script invocation or framework orchestrator
- CI/CD: GitHub Actions, GitLab CI, Jenkins pipeline
- Manual: Developer runs to check status
- Scheduled: Nightly/weekly compliance checks

## Usage Examples

### RGAA (Accessibility) — Direct Invocation

```bash
# Scan against WCAG 2.1/RGAA standards
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js

# Target specific services only
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets web

# Verbose output
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --verbose --json
```

### RGPD (Data Protection) — Direct Invocation

```bash
# Scan data handling compliance
node .agents/skills/compliance-rgpd/scripts/scan-compliance.js

# Check encryption + consent only
node .agents/skills/compliance-rgpd/scripts/scan-compliance.js --filters encryption,consent
```

### RGS (Security) — Direct Invocation

```bash
# Scan authentication/authorization
node .agents/skills/compliance-rgs/scripts/scan-compliance.js

# Check backend service only
node .agents/skills/compliance-rgs/scripts/scan-compliance.js --targets api
```

### RGESN (Eco-Responsibility) — Direct Invocation

```bash
# Scan performance + resource optimization
node .agents/skills/compliance-rgesn/scripts/scan-compliance.js
```

### RGI (Interoperability) — Direct Invocation

```bash
# Scan API schema compliance
node .agents/skills/compliance-rgi/scripts/scan-compliance.js --targets api
```

### W3C-WSG (Web Sustainability) — Direct Invocation

```bash
# Scan Web Vitals + sustainability metrics
node .agents/skills/compliance-w3c-wsg/scripts/scan-compliance.js --targets web
```

---

### Using Framework Orchestrator (Multi-Standard)

For **automated scanning via framework** (recommended for CI/CD):

```bash
# RGAA accessibility scan via framework
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js \
  --base main

# RGPD data protection scan via framework
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgpd/scripts/scan-compliance.js \
  --base main

# Run all standards in sequence (from CI/CD)
for standard in rgaa rgpd rgs rgesn rgi w3c-wsg; do
  node .agents/skills/compliance-framework/scripts/scan-affected.js \
    --scanner ".agents/skills/compliance-${standard}/scripts/scan-compliance.js" \
    --base main
done
```

### Programmatic Invocation

```javascript
// Invoke any standard-specific scanner programmatically
const scanner = require('./.agents/skills/compliance-[rgaa|rgpd|rgs|rgesn|rgi|w3c-wsg]/scripts/scan-compliance.js')

const results = await scanner.run({
  configPath: 'docs/compliance/scanner-config.json',
  standard: 'rgaa', // or 'rgpd', 'rgs', etc.
  verbose: true,
  targets: ['web', 'components'],
})

console.log(`Found ${results.violations.length} violations`)
results.actionPlan.CRITICAL.forEach((item) => {
  console.log(`- ${item.violation}: ${item.effort}`)
})
```

## Framework Orchestration

This compliance scanner agent is **generic and referential-agnostic**. It delegates to any standard-specific scanner while providing:

- Configuration management
- Project mapping logic
- Report generation
- CI/CD integration

The **framework orchestrator** adds intelligent automation for affected project detection:

### What the Framework Does

Frame orchestrator (`.agents/skills/compliance-framework/scripts/scan-affected.js`):

1. **Auto-detects** build system (Nx, Turborepo, pnpm, Maven, Gradle)
2. **Finds affected projects** (files changed vs. base branch)
3. **Maps projects** to compliance targets (via `docs/compliance/scanner-config.json`)
4. **Invokes scanner** for each affected target
5. **Aggregates results** across all standards
6. **Exits** with status code (0 = pass, 1 = violations)

### Choosing Between Direct & Framework Invocation

| Scenario                    | Use Direct CLI             | Use Framework                |
| --------------------------- | -------------------------- | ---------------------------- |
| **One-time audit**          | ✅ Full scan of everything | ❌                           |
| **Developer local check**   | ✅ Quick single standard   | ✅ Quick affected projects   |
| **CI/CD pre-merge**         | ❌                         | ✅ Efficient (affected only) |
| **Compliance gates**        | ❌                         | ✅ Smart filtering           |
| **Multi-standard scan**     | ✅ Run each separately     | ✅ Run orchestrated batch    |
| **Scheduled nightly audit** | ✅ Full scan recommended   | ✅ Also works                |

**Recommendation**: Use **framework for CI/CD**, **direct for local development**.

---

## Future Enhancements

Possible improvements across all standards:

- **Baseline Tracking**: Trend violations over time, regression detection
- **Auto-Fix Suggestions**: AI-powered remediation hints per violation
- **Custom Rules**: Allow projects to define domain-specific checks
- **Team Notifications**: Slack/email alerts for CRITICAL violations
- **Dashboard**: Historical compliance metrics per standard
- **Integration**: Jira/Linear issue creation from violations
- **Parallel Scanning**: Multi-core scanning for faster results

## References

**Compliance Standards:**

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **RGAA 4.1.2**: https://www.numerique.gouv.fr/publications/rgaa-4-1-2/
- **RGPD**: https://gdpr-info.eu/
- **RGS**: https://www.ssi.gouv.fr/
- **RGESN**: https://www.numerique.gouv.fr/
- **RGI**: https://www.numerique.gouv.fr/
- **W3C WSG**: https://www.w3.org/standards/webdesign/

**Tools & Frameworks:**

- **Framework**: [`.agents/skills/compliance-framework/`](../../skills/compliance-framework/)
- **Skills**: Each standard has a dedicated skill in `.agents/skills/compliance-*/`

---

**For project-specific implementation**: See `docs/compliance/*-IMPLEMENTATION.md` for each standard.
