#!/usr/bin/env node

/**
 * RGAA 4.1.2 Criteria, Tests & Tools Explorer
 *
 * Explores RGAA 4.1.2 criteria, individual tests, and tools for compliance validation.
 * Provides comprehensive CLI for auditing and validation.
 *
 * Usage:
 *   node validate-criteria.js --validate       # Full validation report (default)
 *   node validate-criteria.js --theme 1        # Show theme criteria
 *   node validate-criteria.js --id 3.2         # Show criterion + tests
 *   node validate-criteria.js --test 1.1.1     # Show test details
 *   node validate-criteria.js --tool jest-axe  # Show tool info
 *   node validate-criteria.js --tools           # List all tools
 *   node validate-criteria.js --json            # Export JSON
 */

const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

// Load all data files
const basePath = path.join(__dirname, '..')

const criteriaData = (() => {
  const p = path.join(basePath, 'criteria.json')
  if (!fs.existsSync(p)) {
    console.error(`${colors.red}Error: criteria.json not found${colors.reset}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
})()

const testsData = (() => {
  const p = path.join(basePath, 'tests.json')
  if (!fs.existsSync(p)) {
    console.error(`${colors.red}Error: tests.json not found${colors.reset}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
})()

const toolsData = (() => {
  const p = path.join(basePath, 'tools-mapping.json')
  if (!fs.existsSync(p)) {
    console.error(`${colors.red}Error: tools-mapping.json not found${colors.reset}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
})()

// Helper: Get test by ID
function getTest(testId) {
  return testsData.tests.find((t) => t.id === testId)
}

// Helper: Get tests for criterion
function getTestsForCriterion(criterionId) {
  return testsData.tests.filter((t) => t.criterion_id === criterionId)
}

// Helper: Get tool by name
function getTool(toolName) {
  return toolsData.tools[toolName]
}

// Validate criteria structure
function validateCriteria() {
  const errors = []

  if (!criteriaData.version) errors.push('Missing "version"')
  if (!criteriaData.themes || !Array.isArray(criteriaData.themes)) {
    errors.push('Missing/invalid "themes" array')
    return { errors, valid: false }
  }

  let totalCriteria = 0
  let totalTests = 0

  criteriaData.themes.forEach((theme, idx) => {
    if (!theme.id) errors.push(`Theme ${idx}: missing "id"`)
    if (!theme.criteria || !Array.isArray(theme.criteria)) {
      errors.push(`Theme ${idx}: missing/invalid "criteria"`)
      return
    }
    theme.criteria.forEach((crit) => {
      if (!crit.id) errors.push(`Criterion missing id in theme ${theme.id}`)
      totalCriteria++

      // Check if tests exist for this criterion
      const tests = getTestsForCriterion(crit.id)
      totalTests += tests.length
    })
  })

  return {
    errors,
    warnings: [],
    valid: errors.length === 0,
    totalCriteria,
    totalTests,
  }
}

// Display validation report
function displayValidationReport() {
  const result = validateCriteria()

  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  )
  console.log(
    `${colors.bright}RGAA 4.1.2 Compliance Referential Validation${colors.reset}`
  )
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  )

  console.log(`${colors.cyan}Summary:${colors.reset}`)
  console.log(`  Version: ${criteriaData.version}`)
  console.log(`  Released: ${criteriaData.released}`)
  console.log(`  Themes: ${criteriaData.themes.length}`)
  console.log(`  Criteria: ${result.totalCriteria}`)
  console.log(`  Tests: ${result.totalTests}\n`)

  console.log(`${colors.cyan}Themes Overview:${colors.reset}`)
  criteriaData.themes.forEach((theme) => {
    const testCount = getTestsForCriterion(theme.id).length
    console.log(
      `  ${colors.bright}${theme.id}. ${theme.name}${colors.reset}: ${theme.criteria.length} criteria, ${testCount} tests`
    )
  })

  console.log()

  if (result.valid) {
    console.log(
      `${colors.green}${colors.bright}✓ Validation Passed${colors.reset}\n`
    )
  } else {
    console.log(`${colors.red}${colors.bright}✗ Validation Failed${colors.reset}`)
    result.errors.forEach((err) => console.log(`  • ${err}`))
    console.log()
  }

  return result.valid
}

// Display criterion with tests
function displayCriterion(criterionId) {
  let found = null
  let foundTheme = null

  criteriaData.themes.forEach((theme) => {
    const c = theme.criteria.find((c) => c.id === criterionId)
    if (c) {
      found = c
      foundTheme = theme
    }
  })

  if (!found) {
    console.error(`${colors.red}Criterion ${criterionId} not found${colors.reset}`)
    process.exit(1)
  }

  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  )
  console.log(`${colors.bright}Criterion ${found.id}${colors.reset}`)
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  )

  console.log(
    `${colors.cyan}Theme:${colors.reset} ${foundTheme.id}. ${foundTheme.name}`
  )
  console.log(`${colors.cyan}Question:${colors.reset}`)
  console.log(`  ${found.question}\n`)

  const tests = getTestsForCriterion(criterionId)
  if (tests.length > 0) {
    console.log(`${colors.magenta}Tests (${tests.length}):${colors.reset}`)
    tests.forEach((test) => {
      console.log(
        `\n  ${colors.bright}${test.id}${colors.reset} - ${test.description}`
      )
      console.log(`    Methodology: ${test.methodology}`)
      console.log(`    Automation: ${test.automation_level}`)
      console.log(`    Tools: ${test.support_tools.join(', ')}`)
      console.log(`    WCAG: ${test.wcag_ref}`)
    })
    console.log()
  }
}

// Display test details
function displayTest(testId) {
  const test = getTest(testId)
  if (!test) {
    console.error(`${colors.red}Test ${testId} not found${colors.reset}`)
    process.exit(1)
  }

  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  )
  console.log(`${colors.bright}Test ${test.id}${colors.reset}`)
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  )

  console.log(
    `${colors.cyan}Criterion:${colors.reset} ${test.criterion_id} - ${test.criterion_title}`
  )
  console.log(`${colors.cyan}Description:${colors.reset}\n  ${test.description}`)
  console.log(`${colors.cyan}Methodology:${colors.reset}\n  ${test.methodology}`)
  console.log(`${colors.cyan}WCAG Reference:${colors.reset} ${test.wcag_ref}`)
  console.log(
    `${colors.cyan}Automation Level:${colors.reset} ${test.automation_level}`
  )
  console.log(`${colors.cyan}Support Tools:${colors.reset}`)
  test.support_tools.forEach((t) => console.log(`  • ${t}`))

  if (test.code_example) {
    console.log(`${colors.cyan}Code Example:${colors.reset}\n  ${test.code_example}`)
  }

  console.log()
}

// Display tool info
function displayTool(toolName) {
  const tool = getTool(toolName)
  if (!tool) {
    console.error(`${colors.red}Tool '${toolName}' not found${colors.reset}`)
    process.exit(1)
  }

  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  )
  console.log(`${colors.bright}${tool.description}${colors.reset}`)
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  )

  console.log(`${colors.cyan}Tool:${colors.reset} ${toolName}`)
  console.log(`${colors.cyan}Category:${colors.reset} ${tool.category}`)
  console.log(`${colors.cyan}Automation:${colors.reset} ${tool.automation_level}`)
  console.log(`${colors.cyan}Cost:${colors.reset} ${tool.cost || 'N/A'}`)

  if (tool.npm_package) {
    console.log(`${colors.cyan}Package:${colors.reset} ${tool.npm_package}`)
    console.log(`${colors.cyan}Install:${colors.reset} ${tool.installation}`)
  }

  if (tool.tests_supported && tool.tests_supported.length > 0) {
    console.log(`${colors.cyan}Tests Covered (${tool.test_count}):${colors.reset}`)
    const testStr = tool.tests_supported.join(', ')
    console.log(`  ${testStr}`)
  }

  console.log()
}

// List all tools
function listTools() {
  console.log(
    `\n${colors.bright}Available Accessibility Testing Tools${colors.reset}\n`
  )

  Object.keys(toolsData.tools).forEach((toolName) => {
    const tool = toolsData.tools[toolName]
    console.log(`${colors.bright}${toolName}${colors.reset}`)
    console.log(`  ${tool.description}`)
    console.log(
      `  Automation: ${tool.automation_level} | Cost: ${tool.cost || 'N/A'}`
    )
    if (tool.tests_supported) {
      console.log(`  Tests: ${tool.test_count || tool.tests_supported.length}`)
    }
    console.log()
  })
}

// Display theme
function displayTheme(themeId) {
  const theme = criteriaData.themes.find(
    (t) => t.id.toString() === themeId.toString()
  )

  if (!theme) {
    console.error(`${colors.red}Theme ${themeId} not found${colors.reset}`)
    process.exit(1)
  }

  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  )
  console.log(`${colors.bright}Theme ${theme.id}: ${theme.name}${colors.reset}`)
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  )

  theme.criteria.forEach((criterion) => {
    const tests = getTestsForCriterion(criterion.id)
    console.log(
      `${colors.bright}${criterion.id}${colors.reset} - ${criterion.question}`
    )
    if (tests.length > 0) {
      console.log(`  Tests: ${tests.map((t) => t.id).join(', ')}`)
    }
    console.log()
  })
}

// Show help
function showHelp() {
  console.log(`
${colors.bright}RGAA 4.1.2 Criteria, Tests & Tools Explorer${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node validate-criteria.js [OPTIONS]

${colors.cyan}Options:${colors.reset}
  --help              Show this help message
  --validate          Full validation report (default)
  --themes            List all 13 themes
  --theme <id>        Show all criteria in a theme
  --id <criterion>    Show criterion with tests
  --test <test-id>    Show specific test details
  --tool <tool-name>  Show tool information
  --tools             List all available tools
  --count             Show criteria/test count by theme
  --json              Export criteria as JSON

${colors.cyan}Examples:${colors.reset}
  node validate-criteria.js
  node validate-criteria.js --theme 1
  node validate-criteria.js --id 11.5
  node validate-criteria.js --test 1.1.1
  node validate-criteria.js --tool jest-axe
  node validate-criteria.js --tools

${colors.cyan}Resources:${colors.reset}
  Official RGAA: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
  Version: 4.1.2 (September 20, 2019)
  Criteria: 106 | Tests: 182
`)
}

// Main
function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  if (args.length === 0 || args.includes('--validate')) {
    displayValidationReport()
  } else if (args.includes('--themes')) {
    console.log(`\n${colors.bright}RGAA 4.1.2 Themes\n${colors.reset}`)
    criteriaData.themes.forEach((t) => {
      console.log(
        `  ${colors.bright}${t.id}. ${t.name}${colors.reset} (${t.criteria.length} criteria)`
      )
    })
    console.log()
  } else if (args.includes('--theme')) {
    const idx = args.indexOf('--theme')
    displayTheme(args[idx + 1])
  } else if (args.includes('--id')) {
    const idx = args.indexOf('--id')
    displayCriterion(args[idx + 1])
  } else if (args.includes('--test')) {
    const idx = args.indexOf('--test')
    displayTest(args[idx + 1])
  } else if (args.includes('--tool')) {
    const idx = args.indexOf('--tool')
    displayTool(args[idx + 1])
  } else if (args.includes('--tools')) {
    listTools()
  } else if (args.includes('--json')) {
    console.log(JSON.stringify(criteriaData, null, 2))
  } else if (args.includes('--count')) {
    console.log(`\n${colors.bright}Criteria & Tests Count\n${colors.reset}`)
    criteriaData.themes.forEach((t) => {
      const testCount = getTestsForCriterion(t.id).length
      console.log(
        `  Theme ${t.id} (${t.name}): ${t.criteria.length} criteria, ${testCount} tests`
      )
    })
    console.log(
      `\n  ${colors.bright}Total: ${criteriaData.total_criteria} criteria | ${testsData.total_tests} tests${colors.reset}\n`
    )
  } else {
    console.error(`${colors.red}Unknown option: ${args[0]}${colors.reset}`)
    process.exit(1)
  }
}

// Run
if (require.main === module) {
  main()
}

module.exports = { getTest, getTestsForCriterion, getTool }
