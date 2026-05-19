# Compliance Framework (Data-Driven)

A **data-driven, configuration-based** compliance validation system for French regulatory standards (RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG).

## ✨ Quick Start

### Run Compliance Audits

```bash
cd .agents/skills/

# Scan for RGAA accessibility compliance
node compliance-rgaa/scripts/scan-compliance.js --config scanner-config.json --json

# Scan for RGPD data protection compliance
node compliance-rgpd/scripts/scan-compliance.js --config scanner-config.json --json

# Scan for RGS security compliance
node compliance-rgs/scripts/scan-compliance.js --config scanner-config.json --json

# Scan for RGESN sustainability compliance
node compliance-rgesn/scripts/scan-compliance.js --config scanner-config.json --json

# Scan for RGI interoperability compliance
node compliance-rgi/scripts/scan-compliance.js --config scanner-config.json --json

# Scan for W3C-WSG web sustainability compliance
node compliance-w3c-wsg/scripts/scan-compliance.js --config scanner-config.json --json
```

### Verify Framework

```bash
cd compliance-framework/scripts
node integration-test.js  # Should output: 87/87 tests passing ✓
```

## 🏗️ Architecture

- Intelligently maps affected projects → compliance targets
- Orchestrates launching referential-specific scanners
- Used by: ALL compliance skills (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG)

- **Skills** (`.agents/skills/compliance-[referential]/`): Referential-specific

  - Defines tests, criteria, detection rules for one standard
  - Provides `scan-compliance.js` that validates against its rules
  - Uses framework's `scan-affected.js` to find affected projects first

- **Projects** (`docs/compliance/`): Project-specific configuration
  - Defines which projects/libraries are "compliance targets"
  - Maps project names (from git) → target names (for scanning)
  - Same `scanner-config.json` used by ALL referentials

## Usage

### From a Skill (Auto-Discovery)

Skill calls framework wrapper, which auto-discovers the skill's scanner:

```bash
cd .agents/skills/compliance-rgaa
node ../compliance-framework/scripts/scan-affected.js
```

Framework automatically finds `scan-compliance.js` in current skill directory.

### From Framework (Explicit Scanner)

Call framework wrapper with explicit `--scanner` path:

```bash
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js \
  --base=develop \
  --verbose
```

### Standard Flags (All Referentials)

```bash
--base <ref>              # Git ref to compare against (default: main)
--config <path>           # Path to scanner-config.json (auto-searched by default)
--scanner <path>          # Path to referential's scan-compliance.js
--targets <list>          # Comma-separated targets (e.g., web,components)
--verbose                 # Enable debug output
--json                     # JSON output (passed to referential scanner)
```

## Configuration (scanner-config.json)

Create `docs/compliance/scanner-config.json` in your project (template available in `scripts/config-template.json`):

```json
{
  "targets": [
    {
      "name": "web",
      "path": "apps/web",
      "description": "React SPA - compliance scan runs against component library"
    }
  ],
  "projectMapping": {
    "web": "web",
    "api": null
  }
}
```

**Structure:**

- `targets`: List of compliance scanning targets (frontend apps, component libraries)

  - `name`: Target identifier (used in `--targets` flag)
  - `path`: Physical path in repo
  - `description`: Context for scanning

- `projectMapping`: Map git project → target
  - `"projectName": "targetName"` → This project's changes trigger scanning of that target
  - `"projectName": null` → This project is explicitly skipped (backend-only, no compliance impact)
  - Missing → WARNING logged, user prompted to update config

## How Agent Uses Framework

**Agent Selection Logic:**

```
User asks for compliance review
    ↓
Agent inspects project context (country, industry, scope)
    ↓
Agent selects applicable skills:
  - RGAA (France, accessibility required?)
  - RGESN (France, sustainability focus?)
  - RGPD (EU/France, personal data involved?)
  - RGI (APIs, interoperability needed?)
  - RGS (sensitive data, security focus?)
  - W3C-WSG (sustainability metrics, any region)
    ↓
For each skill:
  Agent calls framework's scan-affected.js with --scanner=<skill's scanner>
    ↓
Framework:
  1. Auto-detects build system
  2. Finds affected projects (via git/nx/turborepo/etc.)
  3. Maps to targets using scanner-config.json
  4. Launches skill's scanner with filtered targets
    ↓
Skill (referential-specific):
  1. Loads its tests, criteria, tools
  2. Scans targets
  3. Generates violations + action plan
```

## Supported Build Systems

| Build System       | Detection             | Affected Detection             | Fallback |
| ------------------ | --------------------- | ------------------------------ | -------- |
| **Nx**             | `nx.json`             | `nx show projects --affected`  | git diff |
| **Turborepo**      | `turbo.json`          | git diff                       | —        |
| **pnpm**           | `pnpm-workspace.yaml` | git diff                       | —        |
| **Maven**          | `pom.xml`             | git diff                       | —        |
| **Gradle**         | `build.gradle(*.kts)` | git diff                       | —        |
| **Custom/Vanilla** | None                  | git diff or fallback "default" | —        |

## Referential Skills

Each compliance standard has a skill that uses this framework:

| Skill                  | Domain                         | Scanner Location                                               |
| ---------------------- | ------------------------------ | -------------------------------------------------------------- |
| **compliance-rgaa**    | Accessibility (WCAG 2.1 AA)    | `.agents/skills/compliance-rgaa/scripts/scan-compliance.js`    |
| **compliance-rgesn**   | Eco-Responsibility (French)    | `.agents/skills/compliance-rgesn/scripts/scan-compliance.js`   |
| **compliance-rgs**     | Information Security (French)  | `.agents/skills/compliance-rgs/scripts/scan-compliance.js`     |
| **compliance-rgpd**    | Data Protection (GDPR/French)  | `.agents/skills/compliance-rgpd/scripts/scan-compliance.js`    |
| **compliance-rgi**     | Interoperability (French APIs) | `.agents/skills/compliance-rgi/scripts/scan-compliance.js`     |
| **compliance-w3c-wsg** | Web Sustainability (W3C)       | `.agents/skills/compliance-w3c-wsg/scripts/scan-compliance.js` |

All use the same framework infrastructure, but implement different rules & tests.

## Extending to New Projects

1. **Create `docs/compliance/scanner-config.json`** (or your project's equivalent)

   - Copy template from `.agents/frameworks/compliance/scripts/config-template.json`
   - Define your targets (what gets scanned)
   - Define projectMapping (which git projects trigger which targets)

2. **Call Agent for Compliance Review**

   - Agent auto-selects skills based on project context
   - Framework + Skills handle the rest

3. **View Results**
   - JSON + console output from each skill
   - Action plans auto-generated
   - Links to implementation guides per referential

## Implementation Pattern

For projects that want to scan against a specific skill:

```bash
# Explicit usage (for automation/CI)
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --config docs/compliance/scanner-config.json \
  --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js \
  --base main \
  --targets web

# Via GitHub Copilot Agent (recommended)
@compliance-agent Review this PR for RGAA + RGESN compliance
```

The framework handles all the orchestration — projects just provide config.

---

**Created:** March 2026  
**Framework Version:** 1.0 (Referential-Agnostic)  
**Applicable To:** All compliance skills (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG)
