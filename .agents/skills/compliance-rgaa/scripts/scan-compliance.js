#!/usr/bin/env node

/**
 * RGAA (Référentiel Général d'Amélioration de l'Accessibilité) Compliance Scanner
 *
 * DATA-DRIVEN SCANNER
 * This scanner:
 * 1. Loads criteria.json, tests.json, tools-mapping.json
 * 2. For each page/persona, calls validateCriteria()
 * 3. validateCriteria() executes tests from tests.json using tools from tools-mapping.json
 * 4. Violations are discovered dynamically, never hardcoded
 *
 * See: compliance-framework/DATA-DRIVEN-ARCHITECTURE.md
 */

const fs = require('fs')
const path = require('path')

// ============================================================================
// IMPORTS - Generic Modules
// ============================================================================

const {
  loadConfig,
  parseArgs,
  log,
  saveJsonReport,
  getDateStamp,
} = require('../../compliance-framework/scripts/shared-utils')
const { discoverPersonas } = require('../../compliance-framework/scripts/personas')
const {
  crawlRoutesWithAuth,
} = require('../../compliance-framework/scripts/crawler-auth')
const {
  validateCriteria,
  loadCriteria,
  loadTests,
  loadTools,
} = require('../../compliance-framework/scripts/validate-criteria')

// ============================================================================
// CLI PARSING
// ============================================================================

const args = process.argv.slice(2)
const options = parseArgs(args)
const { verbose, outputDir, outputJson, config: configPath } = options

let config = null
let criteria = null
let tests = null
let tools = null

const REFERENTIAL_PATH = path.join(__dirname, '..')

// ============================================================================
// SCANNING FUNCTIONS (Data-Driven)
// ============================================================================

/**
 * Review a page for RGAA accessibility compliance
 * This function delegates to validateCriteria() which uses criteria/tests/tools
 */
async function reviewPageForAccessibility(pageData) {
  log.debug(
    `Reviewing ${pageData.path} as ${pageData.persona} for RGAA accessibility`
  )

  // Validate against all criteria using configured tests & tools
  const validationResult = await validateCriteria(pageData, criteria, tests, tools)

  return {
    persona: pageData.persona,
    path: pageData.path,
    url: pageData.url,
    title: pageData.title,
    validation: validationResult,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// REPORT GENERATION (Data-Driven Violations)
// ============================================================================

/**
 * Generate comprehensive violations list from validation results
 * All violations come from validation results, never hardcoded
 */
function generateViolationsList(scanResults) {
  const violations = []

  scanResults.forEach((result) => {
    if (!result.validation || !result.validation.violations) return

    result.validation.violations.forEach((violation) => {
      violations.push({
        ...violation,
        page: result.path,
        url: result.url,
        persona: result.persona,
        title: result.title,
      })
    })
  })

  return violations
}

/**
 * Map violations to severity for reporting
 */
function generateReport(violations) {
  const bySeverity = {}
  ;['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach((level) => {
    bySeverity[level] = violations.filter((v) => v.severity === level)
  })

  return {
    summary: {
      totalViolations: violations.length,
      critical: bySeverity.CRITICAL.length,
      high: bySeverity.HIGH.length,
      medium: bySeverity.MEDIUM.length,
      low: bySeverity.LOW.length,
    },
    bySeverity,
  }
}

/**
 * Print human-readable report
 */
function printReport(violations, report) {
  log.title('RGAA Accessibility Compliance Scan Results')

  console.log(`Total Violations: ${violations.length}\n`)
  ;['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach((level) => {
    const items = report.bySeverity[level]
    if (items.length === 0) return

    log.section(`${level} Severity (${items.length})`)
    items.forEach((item) => {
      console.log(`  • [${item.test_id}] ${item.description}`)
      console.log(`    Page: ${item.page} | Persona: ${item.persona}`)
      if (item.element) console.log(`    Element: ${item.element}`)
    })
  })

  console.log()
}

/**
 * Save JSON report with full validation data
 */
function saveJsonReportData(scanResults, violations, report) {
  const filename = `compliance-rgaa-report-${getDateStamp()}.json`

  // Include full validation results for debugging
  const reportData = {
    generated: new Date().toISOString(),
    standard: 'RGAA',
    version: criteria.version,
    summary: report.summary,
    violations,
    detailed_scan_results: scanResults.map((r) => ({
      page: r.path,
      persona: r.persona,
      validation: r.validation,
    })),
  }

  saveJsonReport(reportData, outputDir, filename)
}

// ============================================================================
// MAIN: Orchestrate RGAA scan with multi-persona crawling
// ============================================================================

async function main() {
  try {
    log.title('RGAA Accessibility Compliance Scanner (Data-Driven)')

    // 1. Load configuration
    config = loadConfig(configPath)
    log.success('Configuration loaded')

    // 2. Load criteria, tests, and tools
    log.info('Loading RGAA criteria, tests, and tools...')
    criteria = await loadCriteria(REFERENTIAL_PATH)
    tests = await loadTests(REFERENTIAL_PATH)
    tools = await loadTools(REFERENTIAL_PATH)

    log.success(
      `Loaded ${criteria.total_criteria} criteria, ${tests.total_tests} tests, ${
        Object.keys(tools.tools).length
      } tools`
    )

    // 3. Get targets
    let targets = config.targets || []
    if (options.targets) {
      targets = targets.filter((t) =>
        t.name.toLowerCase().includes(options.targets.toLowerCase())
      )
    }

    if (targets.length === 0) {
      log.error('No targets found in config')
      process.exit(1)
    }

    log.info(`Found ${targets.length} target(s)`)

    // 4. Discover personas
    const personas = await discoverPersonas(config, process.cwd())
    log.success(`Discovered ${personas.length} persona(s)`)

    // 5. Crawl each target with all personas
    const allResults = []
    for (const target of targets) {
      log.section(`Scanning: ${target.name}`)

      if (target.type === 'web') {
        const results = await crawlRoutesWithAuth(
          target.url,
          config,
          personas,
          target.name,
          reviewPageForAccessibility,
          options.personas
        )
        allResults.push(...results)
      }
    }

    if (allResults.length === 0) {
      log.error('No pages scanned successfully')
      process.exit(1)
    }

    log.success(
      `Scanned ${allResults.length} page(s) across ${personas.length} persona(s)`
    )

    // 6. Generate violations report
    const violations = generateViolationsList(allResults)
    const report = generateReport(violations)

    // 7. Print console report
    printReport(violations, report)

    // 8. Save JSON report if requested
    if (outputJson) {
      saveJsonReportData(allResults, violations, report)
    }

    // 9. Print analysis by criterion
    if (verbose) {
      console.log('\n')
      log.section('Violations by Criterion')
      const byCriterion = {}
      violations.forEach((v) => {
        const testId = v.test_id
        if (!byCriterion[testId]) byCriterion[testId] = []
        byCriterion[testId].push(v)
      })

      Object.keys(byCriterion)
        .sort()
        .forEach((testId) => {
          console.log(`  [${testId}]: ${byCriterion[testId].length} violation(s)`)
        })
    }

    log.success(`RGAA scan complete! Found ${violations.length} violations.`)
    log.info(
      'See docs/compliance/RGAA-IMPLEMENTATION.md for remediation guidance.'
    )

    process.exit(violations.length === 0 ? 0 : 1)
  } catch (error) {
    log.error(`Fatal error: ${error.message}`)
    if (verbose) console.error(error.stack)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
