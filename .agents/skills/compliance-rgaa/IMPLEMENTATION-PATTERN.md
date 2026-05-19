# RGAA Compliance Scanner Implementation Pattern

**Generic framework for any project** to set up autonomous accessibility scanning.

## Overview

The scanner is **configuration-driven**, not hardcoded. Each project defines:

1. **What to scan** (pages/components and their URLs)
2. **How to detect violations** (axe-core tags, WCAG criteria mapping)
3. **What to do** (action plan templates per violation type)

## Quick Start

### 1. Create Configuration File

Create `docs/compliance/scanner-config.json` in your project:

```json
{
  "name": "My Project",
  "targets": [
    {
      "name": "Web App",
      "type": "web",
      "url": "http://localhost:3000",
      "routes": ["/", "/login", "/dashboard", "/admin"],
      "startCommand": "yarn start web"
    },
    {
      "name": "Component Library",
      "type": "components",
      "url": "http://localhost:6006",
      "startCommand": "yarn storybook"
    }
  ],
  "axeConfig": {
    "runOnly": {
      "type": "tag",
      "values": ["wcag2a", "wcag2aa", "best-practice"]
    },
    "resultTypes": ["violations", "incomplete"]
  }
}
```

### 2. Run Scanner

```bash
# From project root
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js

# With options
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js \
  --targets web \
  --verbose \
  --output-json \
  --output-dir ./reports
```

### 3. Review Results

Output includes:

- **Violations List**: Each violation mapped to RGAA criterion
- **Action Plan**: Priority + effort estimate per violation type
- **JSON Report**: Machine-readable for CI/CD integration

## Configuration Options

### target object

| Field          | Required | Type   | Description                                      |
| -------------- | -------- | ------ | ------------------------------------------------ |
| `name`         | Yes      | string | Display name (e.g., "Web App")                   |
| `type`         | Yes      | string | `web` \| `components` \| `api-docs`              |
| `url`          | Yes      | string | Base URL (e.g., `http://localhost:3000`)         |
| `routes`       | No       | array  | Specific routes to scan (if not, uses discovery) |
| `startCommand` | No       | string | Yarn command to start service (optional)         |

### axeConfig object

Configure axe-core rules:

```json
{
  "runOnly": {
    "type": "tag",
    "values": ["wcag2a", "wcag2aa"]
  },
  "resultTypes": ["violations", "incomplete"],
  "ignore": ["bypass"]
}
```

## Scanning Strategies

### Strategy 1: Route-Based Discovery

For web apps with known routes:

```json
{
  "targets": [
    {
      "type": "web",
      "routes": ["/", "/login", "/profile"]
    }
  ]
}
```

Scanner will scan `baseUrl + route` for each.

### Strategy 2: API-Based Discovery

For component libraries (Storybook):

```json
{
  "targets": [
    {
      "type": "components",
      "url": "http://localhost:6006",
      "discovery": "storybook"
    }
  ]
}
```

Scanner fetches metadata from Storybook API automatically.

### Strategy 3: Sitemap-Based

For web apps with sitemap.xml:

```json
{
  "targets": [
    {
      "type": "web",
      "url": "http://localhost:3000",
      "discovery": "sitemap"
    }
  ]
}
```

## Output Format

### Console Report

Summary of violations by priority:

```
RGAA Compliance Scan Results
Total Violations Found: 15

Action Plan (by Priority)

CRITICAL Priority (8 violations)
Estimated Effort: 20-40 hrs

  1. image-alt (Criterion 1.1.1)
     Team: Content + Frontend | Effort: 2-4 hrs
     Steps:
       • Audit all images
       • Add missing alt attributes
       • Test with screen reader

...
```

### JSON Report (`reports/compliance-report-*.json`)

```json
{
  "generated": "2026-03-24T10:30:00Z",
  "summary": {
    "pagesScanned": 5,
    "totalViolations": 15,
    "critical": 8,
    "high": 4,
    "medium": 3,
    "estimatedEffort": "20-40 hrs"
  },
  "violations": [
    {
      "id": "color-contrast",
      "criterion": "3.2.1",
      "level": "AA",
      "impact": "critical",
      "description": "Insufficient color contrast",
      "affectedElements": 5,
      "page": "Web App",
      "url": "http://localhost:3000/dashboard",
      "actionPlan": {
        "priority": "HIGH",
        "effort": "1-2 hrs",
        "team": "Design + Frontend",
        "steps": [...]
      }
    }
  ],
  "actionPlan": {
    "CRITICAL": [...],
    "HIGH": [...]
  }
}
```

## Reserved Tests

Some RGAA criteria require manual testing (keyboard navigation, screen reader compatibility, focus management). Scan output marks these as `RESERVED` with explanation:

```
Manual Test (RESERVED)
  Reason: Requires actual user testing with assistive technologies
  Workaround: Use Cypress accessibility tests + manual QA
  References: docs/compliance/IMPLEMENTATION.md
```

### Recommended Workarounds

| Test                | Manual Reason              | Automated Alternative                  |
| ------------------- | -------------------------- | -------------------------------------- |
| Keyboard navigation | JS event handling          | Cypress keyboard simulation + axe-core |
| Screen reader       | Assistive tech interaction | jest-axe + semantic HTML checks        |
| Focus management    | Runtime JS behavior        | axe-core + CSS analysis                |
| Color perception    | User vision                | WAVE + wcag-contrast-checker           |

## Customizing Action Plans

Edit `ACTION_TEMPLATES` in `scan-compliance.js` to add project-specific fixes:

```javascript
const ACTION_TEMPLATES = {
  'my-violation': {
    priority: 'MEDIUM',
    effort: '3 hrs',
    team: 'Frontend + Design',
    steps: [
      '1. Custom step 1',
      '2. Custom step 2',
      // Your specific process
    ],
  },
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Scan RGAA Compliance
  run: |
    node .agents/skills/compliance-rgaa/scripts/scan-compliance.js \
      --json \
      --output-dir ./reports

- name: Comment PR with Report
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      const fs = require('fs');
      const report = JSON.parse(fs.readFileSync('./reports/compliance-report-*.json'));
      // Post as comment
```

## Troubleshooting

**Q: Scanner can't find config**

```
Error: Cannot find scanner-config.json
```

A: Create `docs/compliance/scanner-config.json` in project root.

**Q: Port already in use**

```
Error: target service not running
```

A: Manually start services or add `startCommand` to config.

**Q: Violations not mapping to criteria**
A: Ensure violation IDs match keys in `VIOLATION_TO_CRITERION` mapping. Add custom mappings if needed.

**Q: Want to skip certain pages**
A: Use routes filtering:

```json
{
  "routes": ["/", "/login"],
  "ignore": ["/admin", "/dev/*"]
}
```

## Next Steps

1. Copy this pattern to your project
2. Customize `scanner-config.json` for your services
3. Run scanner: `node scan-compliance.js`
4. Review violations and action plan
5. Assign tasks from action plan to team
6. Integrate into CI/CD pipeline

## References

- **RGAA Framework**: `.agents/skills/compliance-rgaa/`
- **Test Registry**: `tests.json` (182 tests, queryable)
- **Tool Mapping**: `tools-mapping.json` (13 tools)
- **Example Implementation**: `docs/compliance/ROBOT-SCANNER-CONFIG.md`
