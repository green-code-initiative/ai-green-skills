# Generic Compliance Framework Architecture

**This architecture is referential-agnostic and applies to ALL compliance standards** (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG). Substitute `compliance-rgaa` with any other compliance skill.

## 🏗️ Overview

The architecture enforces **strict separation of concerns** between a generic framework, referential-specific skills, and project-specific configuration:

```
┌─────────────────────────────────────────────────────────────────────┐
│                 COMPLIANCE FRAMEWORK (Transverse)                   │
│              (Technology-Agnostic, Referential-Agnostic)            │
│  .agents/skills/compliance-framework/                                     │
│  ├── scripts/scan-affected.js        (Universal wrapper)            │
│  ├── ARCHITECTURE.md                 (This doc)                     │
│  └── README.md                       (Framework overview)           │
└─────────────────────────────────────────────────────────────────────┘
                            ▲
                            │ (orchestrates)
┌─────────────────────────────────────────────────────────────────────┐
│            REFERENTIAL-SPECIFIC SKILLS (Multiple)                   │
│                  (Rules, Criteria, Tests)                           │
│  .agents/skills/compliance-[referential]/                          │
│  ├── scripts/scan-compliance.js      (Referential scanner)          │
│  ├── tests.json                      (All tests for this standard)  │
│  ├── criteria.json                   (Mapped criteria)              │
│  ├── tools-mapping.json              (Tools per test)               │
│  └── SKILL.md                        (Documentation)                │
│                                                                      │
│  Examples:                                                           │
│  - compliance-rgaa/                  (Accessibility)                │
│  - compliance-rgesn/                 (Eco-Responsibility)           │
│  - compliance-rgs/                   (Information Security)         │
│  - compliance-rgpd/                  (Data Protection)              │
│  - compliance-rgi/                   (Interoperability)             │
│  - compliance-w3c-wsg/               (Web Sustainability)           │
└─────────────────────────────────────────────────────────────────────┘
                            ▲
                            │ (configures)
┌─────────────────────────────────────────────────────────────────────┐
│                  PROJECT CONFIGURATION                              │
│                   (Project-Specific)                                │
│  docs/compliance/scanner-config.json                                │
│  ├── targets: ["web", "components"]   (Scan targets)               │
│  └── projectMapping: {...}            (Project → Target mapping)    │
│                                                                      │
│  Also in docs/compliance/:                                         │
│  ├── RGAA-IMPLEMENTATION.md                                    │
│  ├── RGESN-IMPLEMENTATION.md                                   │
│  ├── RGS-IMPLEMENTATION.md                                     │
│  └── ... (one per referential)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📋 Responsibilities

### 1. **Framework** (`.agents/skills/compliance-framework/`)

**Responsible for:**

- ✅ Auto-detect project's build system (Nx, Turborepo, pnpm, Maven, Gradle, custom)
- ✅ Launch correct affected-projects command per technology
- ✅ Load `scanner-config.json` (searches multiple locations)
- ✅ Map affected projects → compliance targets
- ✅ Orchestrate launching referential-specific scanners
- ✅ Technology and referential agnostic

**NOT responsible for:**

- ❌ Compliance rules (rules live in skills)
- ❌ Criteria definitions (criteria live in skills)
- ❌ Test frameworks (tests live in skills)

**Used by:**

- All compliance skills (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG)
- Any project with referential-specific compliance requirements

### 2. **Referential-Specific Skills** (`.agents/skills/compliance-[referential]/`)

**Responsible for:**

- ✅ Define rules specific to ONE standard (e.g., WCAG 2.1 AA for RGAA)
- ✅ Provide tests that validate against those rules
- ✅ Define criteria and their mapping to tests
- ✅ Define tools needed to run tests
- ✅ Generate violations + action plans
- ✅ Output reports (console + JSON)

**Uses:**

- Framework's `scan-affected.js` to find which projects to scan
- Project's config to know WHAT to scan (targets)
- Own tests/criteria/tools to HOW to scan

**Example: RGAA Skill**

```
.agents/skills/compliance-rgaa/
├── scripts/
│   ├── scan-compliance.js        (RGAA tester)
│   └── validate-criteria.js      (RGAA criteria validator)
├── tests.json                    (182 WCAG tests)
├── criteria.json                 (106 mapped criteria)
├── tools-mapping.json            (13 tools per test)
└── SKILL.md                      (RGAA documentation)
```

The skill gets called by framework with:

```bash
node scan-compliance.js --config docs/compliance/scanner-config.json --targets web
```

### 3. **Project Configuration** (`docs/compliance/`)

**Responsible for:**

- ✅ Define compliance targets (what to scan)
- ✅ Map projects to targets (git project → compliance target)
- ✅ Provide implementation guides per referential
- ✅ Team assignments, priority levels, effort estimates

**Structure:**

- `scanner-config.json` — Universal config used by all referentials
  - `targets`: Frontend apps, component libraries, etc.
  - `projectMapping`: git project → target mapping
- `[REFERENTIAL]-IMPLEMENTATION.md` — Project-specific guidance per standard
  - Code examples for Project stack (NestJS, React, Material-UI)
  - Project-specific architecture decisions

**Reusable:**

- Same `scanner-config.json` for ALL referentials
- All skills read from one config file
- Agent selects which skills to invoke based on context

## 🔄 Execution Flow

### Case 1: Manual scan (from skill)

```bash
cd .agents/skills/compliance-rgaa
node ../../frameworks/compliance/scripts/scan-affected.js
↓
scan-affected.js
 ├─ Detects: Nx v16.3
 ├─ Runs: nx show projects --affected --base=main
 ├─ Gets: [web, ui, api]
 ├─ Loads: scanner-config.json
 ├─ Maps: web→web, ui→components, api→null
 └─ Scans: web + components
```

### Case 2: CI/CD (GitHub Actions)

```yaml
- name: Compliance check
  run: node .agents/skills/compliance-framework/scripts/scan-affected.js --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js --base=${{ github.base_ref }} --json
```

Auto-detects the host (Nx) and uses local config.

### Case 3: Multi-referential scanning (agent-driven)

```bash
# Agent selects applicable skills based on project context
@compliance-agent Review for RGAA + RGESN
↓ Agent calls framework for each referential
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgesn/scripts/scan-compliance.js
↓
scan-affected.js
 ├─ Detects: Turborepo
 ├─ Runs: git diff --name-only develop...HEAD
 ├─ Maps via local config
 └─ Scans
```

## 🛠️ Adding a New Technology

To support Maven, Gradle, or other build systems:

**1. Add in `detectBuildSystem()`:**

```javascript
if (fs.existsSync(path.join(pwd, 'pom.xml'))) {
  return { name: 'maven', version: '...' }
}
```

**2. Add in `getAffectedProjects()`:**

```javascript
case 'maven':
  command = `mvn dependency:tree | grep -oE 'pom.xml|[^:]+(?=:)' | sort -u`
  break
```

**3. Adapt `scanner-config.json` for the project.**

Zero changes to the generic skill! 🚀

## 📊 Benefits

| Aspect            | Generic           | Wrapper                   | Config                 |
| ----------------- | ----------------- | ------------------------- | ---------------------- |
| **Portability**   | ✅ Universal      | ✅ Auto-adaptive          | 🔄 Project-specific    |
| **Coupling**      | ❌ Zero           | ✅ Minimal                | ✅ Minimal             |
| **Maintenance**   | 🎯 Once for all   | 🎯 Generic, few changes   | 🎯 Each project        |
| **Extensibility** | 📚 New RGAA tests | ➕ New build technologies | 🔧 New targets         |
| **Reusability**   | 🌍 All projects   | 🌍 All build systems      | 🏢 Other projects |

## 🧪 Testing the Architecture

```bash
# Test 1: Generic scanner (no wrapper)o
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --config docs/compliance/scanner-config.json

# Test 2: Wrapper with auto-detection
node .agents/skills/compliance-rgaa/scripts/scan-affected.js --verbose

# Test 3: Target a subset
node .agents/skills/compliance-rgaa/scripts/scan-affected.js --targets=components --json

# Test 4: Port to another project
# (Copy .agents/skills/compliance-rgaa + docs + wrapper
#  Adapt scanner-config.json to new project)
```

## 📝 References

- **Generic skill**: `.agents/skills/compliance-rgaa/SKILL.md`
- **Implementation pattern**: `.agents/skills/compliance-rgaa/IMPLEMENTATION-PATTERN.md`
- **Technology-agnostic wrapper**: `.agents/skills/compliance-rgaa/scripts/scan-affected.js`
- **Project config**: `docs/compliance/scanner-config.json`
