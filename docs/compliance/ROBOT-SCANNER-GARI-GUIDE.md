# Project: Robot Scanner Implementation - OBSOLETE

**Project-specific configuration and running guide for autonomous RGAA compliance scanning**

## Quick Start

### 1. Prerequisites

- Yarn dependencies installed: `yarn install`
- Services available (optional, scanner can auto-start):
  - Web app: `http://localhost:3000`
  - Storybook: `http://localhost:4400`

### 2. Run Full Scan

```bash
# From monorepo root
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --verbose --json
```

### 3. Run Specific Target

```bash
# Scan only web app
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets web

# Scan only components
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets components

# With verbose output
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets web --verbose
```

## Scan Coverage

### Target 1: Web App (`http://localhost:3000`)

**Pages to scan** (from `scanner-config.json`):

- `/` — Landing page
- `/login` — Login form
- `/profile` — User profile page
- `/dashboard` — Main app dashboard
- `/workshops` — Workshop list
- `/sessions` — Session management
- `/requests` — Request management
- `/recommendations` — Recommendation engine
- `/keywords` — Keyword management
- `/users` — User list (admin)
- `/admin` — Admin panel

**Tools available**:

- axe-core via Cypress (`.args/web-e2e/`) for automated scanning
- jest-axe for unit tests (optional integration)

**Manual tests**:

- Keyboard navigation (requires Cypress keyboard simulation)
- Screen reader compatibility (requires manual QA and NVDA/JAWS)
- Focus management (inspected via axe-core + Manual Review)

### Target 2: Component Library (Storybook on port 4400)

**Components to scan**:

- All components in `libs/ui/src/lib/` (atoms + molecules)
- ~25 components exported

**Tools available**:

- axe-core via Storybook iframe (`@storybook/addon-a11y` already installed)
- Jest-axe in unit tests (libs/ui)

**Manual tests**:

- Focus order within components
- Keyboard interaction (tabbing, arrow keys, Enter/Space)
- Color contrast in different themes

## Scanning Strategy

### Phase 1: Component Library (Fastest)

```bash
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets components
```

**Expected**: 15-25 components scanned in ~2 minutes
**Output**: Violations in component isolation (easiest to fix)

### Phase 2: Web App (Comprehensive)

```bash
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --targets web
```

**Expected**: 11 pages scanned in ~5 minutes
**Output**: Real-world violations including page-level issues

### Phase 3: Hybrid (Recommended)

```bash
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --json --verbose
```

**What it does**:

1. Scans Storybook (auto-discovers components)
2. Scans web app (follows configured routes)
3. Attempts manual test heuristics (heading hierarchy, etc.)
4. Generates unified report with action plan

**Expected duration**: ~7-10 minutes
**Output**: `reports/compliance-report-YYYY-MM-DD.json`

## Report Interpretation

### Violations List

```json
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
    "steps": [
      "1. Use WCAG color contrast checker...",
      "2. Update CSS color values...",
      ...
    ]
  }
}
```

### Action Plan Grouping

Violations are grouped by **Priority** for sprint planning:

| Priority     | Meaning               | Examples                           |
| ------------ | --------------------- | ---------------------------------- |
| **CRITICAL** | Blocks user access    | Missing alt text, no form labels   |
| **HIGH**     | Significant UX impact | Poor color contrast, missing focus |
| **MEDIUM**   | Standard compliance   | Link purpose ambiguous             |
| **LOW**      | Best practice         | ARIA attributes missing            |

**Estimated Effort**: Combined effort for all violations in each priority level.

### Next Steps After Scan

1. **Export violations** to project issue tracker (Jira, GitHub Issues)
2. **Assign by team**:
   - Color contrast → Design team
   - Alt text → Content team
   - Form labels → Frontend team
3. **Prioritize**: CRITICAL first, then HIGH by deadline
4. **Implements fixes** + re-run scanner to verify
5. **Integrate into CI**: Run scan on each PR

## Custom Configuration

### Adding Pages to Web App Scan

Edit `docs/compliance/scanner-config.json`:

```json
{
  "targets": [{
    "type": "web",
    "routes": [
      "/new-page",
      "/feature/beta",
      ...
    ]
  }]
}
```

### Excluding Pages/Components

```json
{
  "targets": [
    {
      "type": "web",
      "ignore": ["/admin*", "/dev/*"]
    }
  ]
}
```

### Changing Report Output

```bash
# Save to custom directory
node scan-compliance.js --output-dir ./my-reports

# Generate only to console (no JSON)
node scan-compliance.js  # (use --json flag to include JSON)
```

## Integration with CI/CD

### GitHub Actions

Create `.github/workflows/compliance-scan.yml`:

```yaml
name: RGAA Compliance Scan

on:
  pull_request:
  schedule:
    - cron: '0 2 * * 0' # Weekly scan

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Start services
        run: |
          yarn services:up &
          sleep 10

      - name: Run compliance scan
        run: node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --json

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: compliance-reports
          path: reports/

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const files = fs.readdirSync('./reports');
            const report = JSON.parse(fs.readFileSync(`./reports/${files[0]}`));

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## RGAA Compliance Scan\n\n**Violations**: ${report.summary.totalViolations}\n**Critical**: ${report.summary.critical}\n\n[Full Report](...)`,
            });
```

## Troubleshooting

### Q: "Cannot find scanner-config.json"

A: Make sure config exists at:

```bash
ls docs/compliance/scanner-config.json
```

If not, run from monorepo root directory.

### Q: Services don't start

A: Manually start in separate terminals:

```bash
# Terminal 1: Docker services
yarn services:up

# Terminal 2: Web app
yarn start web

# Terminal 3: Storybook
yarn start ui:storybook

# Terminal 4: Run scanner
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js --verbose
```

### Q: Some violations seem false positives

A: Violations are axe-core findings. Verify:

1. Is it truly compliant? (may need exception review)
2. Is config correct? (check selector rules in axe)
3. Add to ignore list if needed:

```json
{
  "axeConfig": {
    "ignore": ["violation-rule-id"]
  }
}
```

### Q: Want to modify action plans

A: Edit `ACTION_TEMPLATES` in `.agents/skills/compliance-rgaa/scripts/scan-compliance.js`:

```javascript
const ACTION_TEMPLATES = {
  'color-contrast': {
    priority: 'HIGH',
    effort: '1-2 hrs',
    team: 'Design + Frontend',
    steps: [
      '1. Your custom step...',
      // Project-specific workflow
    ],
  },
}
```

## Related Documentation

- **Generic Framework**: `.agents/skills/compliance-rgaa/IMPLEMENTATION-PATTERN.md`
- **RGAA Test Registry**: `.agents/skills/compliance-rgaa/tests.json` (182 tests)
- **Tool Selection Guide**: `.agents/skills/compliance-rgaa/tools-mapping.json`
- **Compliance Validator**: `.agents/skills/compliance-rgaa/scripts/validate-criteria.js`
- **Project Compliance Strategy**: `docs/compliance/Project-COMPLIANCE-STRATEGY.md`

## Success Criteria

After first scan:

- ✅ Scan completes without errors
- ✅ Generates violations list with RGAA criteria mapping
- ✅ Action plan identifies priority and team responsible
- ✅ JSON report useful for tracking progress
- ✅ <10 minutes total scan time

## Next Steps

1. **Run baseline scan** → `node scan-compliance.js --json`
2. **Review violations** → Open `reports/` JSON file
3. **Create sprint tasks** → Export violations to issue tracker
4. **Assign fixes** → By priority and team
5. **Verify compliance** → Re-run after implementing fixes
6. **Integrate CI/CD** → Auto-run on PRs
