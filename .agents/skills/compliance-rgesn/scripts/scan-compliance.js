#!/usr/bin/env node

/**
 * RGESN Compliance Scanner (Data-Driven)
 *
 * This scanner uses the generic data-driven template.
 * All violations are discovered from configuration files, never hardcoded.
 *
 * Configuration files:
 * - criteria.json: rgesn requirement definitions
 * - tests.json: test methodologies for each criterion
 * - tools-mapping.json: tools capable of executing each test
 *
 * Execution flow:
 *   Load config → Load criteria/tests/tools → Crawl pages → Validate each page → Generate report
 *
 * Usage:
 *   node scan-compliance.js --config scanner-config.json --json
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
// CONFIGURATION
// ============================================================================

const args = process.argv.slice(2)
const options = parseArgs(args)
const { verbose, outputDir, outputJson, config: configPath } = options

let config = null
let criteria = null
let tests = null
let tools = null

const REFERENTIAL_PATH = path.join(__dirname, '..')
const REFERENTIAL_NAME = 'RGESN'

// ============================================================================
// VALIDATION FUNCTIONS (Generic & Data-Driven)
// ============================================================================

/**
 * Review a page for RGESN compliance
 * Delegates to validateCriteria() which executes tests from configuration
 */
async function reviewPageForCompliance(pageData) {
  log.debug(
    `Reviewing ${pageData.path} as ${pageData.persona} for ${REFERENTIAL_NAME} compliance`
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
// REPORT GENERATION (All from Validation, Never Hardcoded)
// ============================================================================

/**
 * Extract violations from validation results
 * These are real violations discovered by running tests, not hardcoded
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

function printReport(violations, report) {
  log.title(`${REFERENTIAL_NAME} Compliance Scan Results`)

  if (violations.length === 0) {
    log.success('✨ No violations found!')
    console.log()
    return
  }

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

function saveJsonReportData(scanResults, violations, report) {
  const filename = `compliance-${REFERENTIAL_NAME.toLowerCase()}-report-${getDateStamp()}.json`

  const reportData = {
    generated: new Date().toISOString(),
    standard: REFERENTIAL_NAME,
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
// MAIN: Orchestrate Compliance Scan (Generic)
// ============================================================================

async function main() {
  try {
    log.title(`${REFERENTIAL_NAME} Compliance Scanner (Data-Driven)`)

    // 1. Load scanner configuration
    config = loadConfig(configPath)
    log.success('Configuration loaded')

    // 2. Load criteria, tests, and tools from config files
    log.info(`Loading ${REFERENTIAL_NAME} configuration files...`)
    criteria = await loadCriteria(REFERENTIAL_PATH)
    tests = await loadTests(REFERENTIAL_PATH)
    tools = await loadTools(REFERENTIAL_PATH)

    log.success(
      `Loaded ${criteria.total_criteria || '?'} criteria, ${
        tests.total_tests || '?'
      } tests, ${Object.keys(tools.tools).length} tools`
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
          reviewPageForCompliance,
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

    // 9. Detailed analysis in verbose mode
    if (verbose) {
      console.log('\n')
      log.section('Violations by Test')
      const byTest = {}
      violations.forEach((v) => {
        const testId = v.test_id
        if (!byTest[testId]) byTest[testId] = []
        byTest[testId].push(v)
      })

      Object.keys(byTest)
        .sort()
        .forEach((testId) => {
          console.log(`  [${testId}]: ${byTest[testId].length} violation(s)`)
        })
    }

    log.success(
      `${REFERENTIAL_NAME} scan complete! Found ${violations.length} violations.`
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
