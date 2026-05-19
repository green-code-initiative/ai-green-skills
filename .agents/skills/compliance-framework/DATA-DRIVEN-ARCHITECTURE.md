# Compliance Framework: Data-Driven Architecture

## Overview

All compliance scanners must follow a **data-driven, configuration-based approach**. Violations are **never hardcoded** in the scanner logic—they are derived dynamically from structured configuration files.

## Architecture Components

### 1. Configuration Files (Per Referential)

Each referential (RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG) must have three core files:

#### `criteria.json` - Standard Requirements

Defines all official criteria/requirements for the referential.

**Structure:**

```json
{
  "version": "X.Y.Z",
  "released": "YYYY-MM-DD",
  "official_url": "https://...",
  "total_criteria": 106,
  "themes": [
    {
      "id": "1",
      "name": "Theme Name",
      "criteria": [
        {
          "id": "1.1",
          "question": "Criterion question",
          "test_methods": ["Method 1", "Method 2"],
          "tests": ["1.1.1", "1.1.2"],
          "references": ["WCAG X.X.X Level"],
          "exceptions": "Edge cases..."
        }
      ]
    }
  ]
}
```

**Purpose:** Single source of truth for all requirements. Used by scanners to know which criteria to validate.

---

#### `tests.json` - Test Methodologies

Maps each criterion to one or more test IDs with detailed validation methodologies.

**Structure:**

```json
{
  "version": "X.Y.Z",
  "total_tests": 182,
  "tests": [
    {
      "id": "1.1.1",
      "criterion_id": "1.1",
      "criterion_title": "...",
      "description": "What to validate",
      "methodology": "How to validate (step-by-step)",
      "wcag_ref": "1.1.1 A",
      "automation_level": "automated|manual|hybrid",
      "support_tools": ["tool1", "tool2"],
      "code_example": "...",
      "common_failure": "...",
      "reference_doc": "https://..."
    }
  ]
}
```

**Purpose:** Detailed validation logic. Tells `validate-criteria.js` how to test each criterion.

---

#### `tools-mapping.json` - Tool Configuration

Maps each testing tool to the tests it supports, with setup & execution details.

**Structure:**

```json
{
  "version": "X.Y.Z",
  "tools": {
    "axe-core": {
      "description": "...",
      "category": "automated|manual|hybrid",
      "npm_package": "@axe-core/react",
      "automation_level": "fully_automated",
      "tests_supported": ["1.1.1", "1.2.1", "1.9.1"],
      "test_count": 16,
      "execution_time": "< 1 second",
      "config": { ... },
      "cost": "free",
      "github_url": "..."
    }
  }
}
```

**Purpose:** Specifies which tools can validate which tests. enables tool selection at runtime.

---

## Execution Flow

```
Scanner
  ├─ Load criteria.json
  ├─ For each criterion:
  │  ├─ Load associated tests from tests.json
  │  ├─ For each test:
  │  │  ├─ Load tools from tools-mapping.json
  │  │  ├─ Call validate-criteria(test, tool)
  │  │  └─ Collect results
  │  └─ Aggregate violations for criterion
  └─ Generate report
```

## Core Module: `validate-criteria.js`

Generic validator that:

1. **Loads configuration** (criteria, tests, tools)
2. **Routes tests** to appropriate tools
3. **Executes validation** in browser (Puppeteer)
4. **Returns structured results** (violations + passes)

```javascript
const criteria = await loadCriteria(referential)
const tests = await loadTests(referential)
const tools = await loadTools(referential)

const violations = await validateCriteria(
  pageData, // Page to validate
  criteria, // Requirements
  tests, // Test methodologies
  tools, // Available tools
  (toolSelection = {}) // Tool preferences per test
)
```

## Per-Referential Structure

```
compliance-[ref]/
├── criteria.json          # Official criteria/requirements
├── tests.json             # Test methodologies (how to validate)
├── tools-mapping.json     # Tool capabilities
├── scripts/
│  └── scan-compliance.js  # Scanner (imports framework modules)
└── README.md              # Referential-specific notes
```

## Key Principles

✅ **Configuration-Driven**: All violations derive from configuration files  
✅ **Generic Validator**: `validate-criteria.js` works for all referentials  
✅ **Tool-Agnostic**: Tests specify required tools; tools are swappable  
✅ **Methodology-Based**: All validation logic in `tests.json`, not code  
✅ **Composable**: Criteria + Tests + Tools = Complete validation

## No Hardcoded Violations

The scanner **never** contains hardcoded violation arrays like:

```javascript
// ❌ WRONG - Do not do this
const violations = [
  { id: 'no-https', description: '...', severity: 'CRITICAL' },
  { id: 'no-csrf', description: '...', severity: 'CRITICAL' },
]
```

Instead, **all violations** are derived from criteria/tests/tools:

```javascript
// ✅ CORRECT - Violations come from validation
const surveys = await validateCriteria(pageData, criteria, tests, tools)
const violations = surveys.flatMap((s) => s.violations)
```

## Example: RGAA

### Criterion 1.1: Image Alt Text

```json
// criteria.json
{ "id": "1.1", "question": "Each image has alt text?", "tests": ["1.1.1", "1.1.2"] }

// tests.json
{
  "id": "1.1.1",
  "criterion_id": "1.1",
  "description": "Verify alt attribute presence",
  "methodology": "Inspect each <img>. Check for alt or aria-label",
  "automation_level": "automated",
  "support_tools": ["axe-core", "jest-axe"]
}

// tools-mapping.json
{
  "axe-core": {
    "tests_supported": ["1.1.1", "1.2.1", ...],
    "config": { "runOnly": { "type": "tag", "values": ["wcag2aa"] } }
  }
}
```

### Scanner Execution

```javascript
// Load once
const criteria = await loadCriteria('rgaa') // 106 criteria
const tests = await loadTests('rgaa') // 182 tests
const tools = await loadTools('rgaa') // 20 tools

// For each page/persona
const violations = await validateCriteria(page, criteria, tests, tools)
// ✅ Returns real violations discovered by running tests, not hardcoded
```

## Implementation Roadmap

1. **Create `validate-criteria.js`** - Generic validator module
2. **Document per-referential structure** - criteria, tests, tools
3. **RGAA**: Already has files → just refactor scanner to use validate-criteria
4. **RGPD**: Create criteria/tests/tools for data protection
5. **RGS**: Create criteria/tests/tools for security
6. **RGESN**: Create criteria/tests/tools for sustainability
7. **RGI**: Create criteria/tests/tools for interoperability
8. **W3C-WSG**: Create criteria/tests/tools for web guidelines

Each referential inherits the same validation engine but with its own requirements & tests.
