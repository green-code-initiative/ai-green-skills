---
name: Compliance Framework
description: Technology-agnostic, referential-agnostic orchestration framework for all compliance standards (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG)
---

# SKILL: Compliance Framework (Shared Infrastructure)

> **Note:** This is not a traditional "skill" with tests or criteria. It's a **shared framework** used by all compliance referential skills to orchestrate scanning across different build systems and projects.

## 🎯 Purpose

Provides **universal orchestration** for compliance scanning:

- **Technology-agnostic**: Works with Nx, Turborepo, pnpm, Maven, Gradle, or custom projects
- **Referential-agnostic**: Serves all compliance standards (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG)
- **Configuration-driven**: Projects provide minimal config; framework handles the rest
- **Agent-ready**: Enables agents to invoke multiple skills based on project context

## 📦 What's Included

### Core Infrastructure

- **`scripts/scan-affected.js`** — Universal wrapper

  - Auto-detects build system (Nx, Turborepo, etc.)
  - Finds affected projects via git/build commands
  - Maps projects to compliance targets
  - Invokes referential-specific scanners

- **`scripts/config-template.json`** — Template for projects
  - Define compliance targets (e.g., web app, component library)
  - Map projects to targets (e.g., `web → web`, `api → null`)
  - Used by ALL referential skills

### Documentation

- **`ARCHITECTURE.md`** — Design pattern (tech + referential agnostic)
- **`README.md`** — Framework usage guide & all supported build systems
- **`AGENT-INTEGRATION.md`** — How agents select and invoke skills

## 🚀 Usage

### By Referential Skills

Each compliance skill (RGAA, RGESN, etc.) can use the framework:

```bash
cd .agents/skills/compliance-rgaa
node ../compliance-framework/scripts/scan-affected.js
```

Framework auto-discovers the skill's `scan-compliance.js` and invokes it.

### Explicit Scanner Path

```bash
node .agents/skills/compliance-framework/scripts/scan-affected.js \
  --scanner .agents/skills/compliance-rgesn/scripts/scan-compliance.js \
  --base main \
  --targets web
```

### By Agents

Agents select relevant skills and invoke the framework for each:

```
@compliance-agent Review for French compliance
  ↓
Agent selects: RGAA, RGPD, RGS, RGESN, RGI
  ↓
For each skill:
  node ... --scanner .agents/skills/compliance-[skill]/scripts/scan-compliance.js
```

## 🔧 Supported Technologies

| Technology    | Detection             | Affected Projects             | Fallback |
| ------------- | --------------------- | ----------------------------- | -------- |
| **Nx**        | `nx.json`             | `nx show projects --affected` | git diff |
| **Turborepo** | `turbo.json`          | git diff                      | —        |
| **pnpm**      | `pnpm-workspace.yaml` | git diff                      | —        |
| **Maven**     | `pom.xml`             | git diff                      | —        |
| **Gradle**    | `build.gradle(*.kts)` | git diff                      | —        |
| **Custom**    | None detected         | git diff or fallback          | —        |

## 📋 All Compliance Skills Using This Framework

| Skill   | Location              | Standard           | Tests |
| ------- | --------------------- | ------------------ | ----- |
| RGAA    | `compliance-rgaa/`    | Accessibility      | 182   |
| RGESN   | `compliance-rgesn/`   | Sustainability     | TBD   |
| RGS     | `compliance-rgs/`     | Security           | TBD   |
| RGPD    | `compliance-rgpd/`    | Data Protection    | TBD   |
| RGI     | `compliance-rgi/`     | Interoperability   | TBD   |
| W3C-WSG | `compliance-w3c-wsg/` | Web Sustainability | TBD   |

## ✨ Key Features

✅ **Zero duplication** — Framework shared by all skills  
✅ **Minimal project config** — One `scanner-config.json` for all standards  
✅ **Automatic build detection** — No manual setup per project  
✅ **Agent-driven** — Agents select applicable referentials  
✅ **Extensible** — Add new technologies with 5 lines of code  
✅ **Well-documented** — See `README.md` and `ARCHITECTURE.md` for details

## 📖 Learn More

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Design pattern & responsibility separation
- **[README.md](README.md)** — Usage guide & configuration
- **[AGENT-INTEGRATION.md](AGENT-INTEGRATION.md)** — Agent selection logic

---

**Type:** Shared Framework (Standard: VS Code `.agents/skills/`)  
**Applicable To:** All compliance referential skills & projects  
**Created:** March 2026
