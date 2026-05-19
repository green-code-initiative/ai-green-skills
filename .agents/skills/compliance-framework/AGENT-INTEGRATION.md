# Agent-Driven Compliance Framework

## Overview

This framework enables **agents** to intelligently select and apply appropriate compliance standards (referentials) based on project context.

## Agent Selection Logic

When a user asks for compliance review, the agent:

1. **Analyzes project context**

   - Geographic location (France, EU, Global)
   - Industry/domain (e-learning, HR, healthcare, public sector)
   - Data handling (personal data, sensitive info)
   - Technology stack and deployment model

2. **Selects applicable referentials**

   ```
   France + e-learning + public sector
     ↓
   ✅ RGAA (accessibility, French requirement)
   ✅ RGPD (personal data, French requirement)
   ✅ RGESN (sustainability, French requirement)
   ✅ RGI (APIs, interoperability)
   ✅ RGS (security, French requirement)
   ⚠️ W3C-WSG (optional, sustainability metrics)
   ```

3. **Invokes framework for each skill**

   ```bash
   For RGAA:
   node .agents/skills/compliance-framework/scripts/scan-affected.js \
     --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js

   For RGESN:
   node .agents/skills/compliance-framework/scripts/scan-affected.js \
     --scanner .agents/skills/compliance-rgesn/scripts/scan-compliance.js

   # ... (one per selected referential)
   ```

4. **Aggregates results**
   - Consolidates violations across all referentials
   - Generates unified action plan
   - Provides context-specific guidance per referential

## Compliance Standards Available

| Referential | Domain               | Geography | Req Type    | Skill Location                       |
| ----------- | -------------------- | --------- | ----------- | ------------------------------------ |
| **RGAA**    | Accessibility        | France    | Mandatory   | `.agents/skills/compliance-rgaa/`    |
| **RGPD**    | Data Protection      | EU/France | Mandatory   | `.agents/skills/compliance-rgpd/`    |
| **RGS**     | Information Security | France    | Mandatory   | `.agents/skills/compliance-rgs/`     |
| **RGESN**   | Eco-Responsibility   | France    | Mandatory   | `.agents/skills/compliance-rgesn/`   |
| **RGI**     | Interoperability     | France    | Recommended | `.agents/skills/compliance-rgi/`     |
| **W3C-WSG** | Web Sustainability   | Global    | Optional    | `.agents/skills/compliance-w3c-wsg/` |

## Agent Decision Tree

```
Is the project public-facing or government?
├─ YES → RGAA (accessibility mandatory)
└─ NO  → RGAA (accessibility recommended)

Does the project process personal data?
├─ YES → RGPD (data protection mandatory)
└─ NO  → skip RGPD

Is it a French government or public sector project?
├─ YES → RGS (information security mandatory)
└─ NO  → RGS (security recommended)

Is it a web application?
├─ YES → RGESN (eco-responsibility)
└─ NO  → skip RGESN

Does it expose APIs?
├─ YES → RGI (interoperability)
└─ NO  → skip RGI

Is there focus on environmental impact?
├─ YES → W3C-WSG (web sustainability metrics)
└─ NO  → W3C-WSG (optional)
```

## User Flows

### Flow 1: "Review for French Compliance" 

```
User: @compliance-agent Review this PR for French compliance
            ↓
Agent detects: France-based, government (DINUM), processes user data
            ↓
Selects: RGAA, RGPD, RGS, RGESN, RGI
            ↓
For each skill:
  node .agents/skills/compliance-framework/scripts/scan-affected.js --scanner [skill]
  → Identifies affected frontend projects
  skill scanner → Runs compliance tests
  Generates violations + action plan
            ↓
Aggregates and presents consolidated results
```

### Flow 2: "Review Sustainability Only"

```
User: @compliance-agent Audit for environmental impact
            ↓
Agent detects: Focus on sustainability metrics
            ↓
Selects: RGESN, W3C-WSG
            ↓
Scans performance, data transfer, resource usage
            ↓
Provides optimization recommendations
```

### Flow 3: "Interoperability Check" (API Project)

```
User: @compliance-agent Check API interoperability
            ↓
Agent detects: API-first project, multiple consumers
            ↓
Selects: RGI (primary), RGS (secondary)
            ↓
Validates:
  - API design (REST/OpenAPI)
  - Data formats (JSON, XML, standard formats)
  - Authentication & security
  - Documentation completeness
```

## Implementation Pattern

### Agent Template

```python
@agent
class ComplianceFrameworkAgent:

    def select_referentials(self, project_context):
        """Determine which compliance standards apply."""
        selected = []

        if project_context.is_france_based:
            selected.extend(['rgaa', 'rgpd', 'rgs', 'rgesn', 'rgi'])

        if project_context.is_public_sector:
            selected.extend(['rgaa', 'rgs'])

        if project_context.has_personal_data:
            selected.append('rgpd')

        if project_context.focus_sustainability:
            selected.extend(['rgesn', 'w3c-wsg'])

        return list(set(selected))

    def scan_referential(self, referential, project_path):
        """Run compliance check for one standard."""
        scanner_path = f".agents/skills/compliance-{referential}/scripts/scan-compliance.js"

        cmd = f"node .agents/frameworks/compliance/scripts/scan-affected.js \
                  --scanner {scanner_path} \
                  --config {project_path}/docs/compliance/scanner-config.json"

        return execute(cmd)

    def run(self, project_context, project_path):
        """Main compliance audit."""
        referentials = self.select_referentials(project_context)

        results = {}
        for ref in referentials:
            results[ref] = self.scan_referential(ref, project_path)

        return self.aggregate_results(results)
```

## Adding New Referentials

To add a new compliance standard:

1. **Create skill in `.agents/skills/`**

   ```
   .agents/skills/compliance-[new-standard]/
   ├── scripts/scan-compliance.js     (Referential-specific scanner)
   ├── tests.json                     (Tests for this standard)
   ├── criteria.json                  (Criteria definitions)
   └── SKILL.md                       (Documentation)
   ```

2. **Create implementation guide in `docs/compliance/`**

   ```
   docs/compliance/[NEW-STANDARD]-IMPLEMENTATION.md
   ```

3. **Update agent's decision tree** in this file

4. **Framework automatically supports it** (no changes needed to framework code)

## Benefits of Framework + Agent Approach

| Aspect            | Benefit                                                  |
| ----------------- | -------------------------------------------------------- |
| **Flexibility**   | Agent selects relevant standards per project             |
| **Automation**    | No manual skill selection (agent decides)                |
| **Extensibility** | Add new standards without modifying framework            |
| **Reusability**   | Same framework/skills across all projects                |
| **Compliance**    | Contextual compliance review (not over/under-compliance) |
| **Efficiency**    | Run only applicable standards                            |

## Next Steps

1. ✅ Framework supports all referentials
2. ✅ Each skill can be invoked independently
3. ⏳ **Create agent with referential selection logic**
4. ⏳ **Implement context detection for projects**
5. ⏳ **Test agent on the project (multiple referentials)**

---

---

**Created:** March 2026  
**Framework Version:** 1.0 (Referential-Agnostic, Agent-Ready)  
**Agent Integration Status:** Ready for implementation  
**Location:** `.agents/skills/compliance-framework/` (Standard VS Code location)
