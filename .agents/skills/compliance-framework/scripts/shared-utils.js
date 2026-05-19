/**
 * Shared Utilities for All Compliance Scanners
 *
 * Provides common functionality used by all standards (RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG):
 * - Configuration loading (scanner-config.json)
 * - Logging with colors
 * - CLI argument parsing
 * - Report saving
 *
 * Usage:
 *   const { loadConfig, log, parseArgs, saveReport } = require('./shared-utils');
 */

const fs = require('fs')
const path = require('path')

// ============================================================================
// COLORS & LOGGING
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  title: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
  subtitle: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
  debug: (msg, verbose) => {
    if (verbose) console.log(`${colors.magenta}[DEBUG]${colors.reset} ${msg}`)
  },
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
}

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

/**
 * Load scanner configuration from standard search paths
 * @param {string} configPath - Optional explicit config path
 * @returns {Object} Loaded configuration
 * @throws {Error} If config cannot be found
 */
function loadConfig(configPath = null) {
  const searchPaths = configPath
    ? [configPath]
    : [
        './scanner-config.json',
        '../../../docs/compliance/scanner-config.json',
        'docs/compliance/scanner-config.json',
        '../../compliance-framework/scripts/config-template.json',
      ]

  for (const cfgPath of searchPaths) {
    if (fs.existsSync(cfgPath)) {
      log.info(`Loading config: ${cfgPath}`)
      try {
        return JSON.parse(fs.readFileSync(cfgPath, 'utf-8'))
      } catch (err) {
        throw new Error(`Failed to parse config at ${cfgPath}: ${err.message}`)
      }
    }
  }

  log.error('Scanner configuration not found')
  console.error('\nSearched in:')
  searchPaths.forEach((p) => console.error(`  • ${p}`))
  throw new Error(
    'Cannot find scanner-config.json. ' +
      'See docs/compliance/PROJECT-SETUP.md for setup instructions.'
  )
}

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

/**
 * Parse CLI arguments into structured options
 * @param {string[]} args - process.argv.slice(2)
 * @returns {Object} Parsed options
 */
function parseArgs(args) {
  const options = {
    config: null,
    targets: null,
    personas: null,
    outputDir: './reports',
    outputJson: false,
    verbose: false,
    watch: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--config' && i + 1 < args.length) {
      options.config = args[++i]
    } else if (arg === '--targets' && i + 1 < args.length) {
      options.targets = args[++i]
    } else if (arg === '--personas' && i + 1 < args.length) {
      options.personas = args[++i].split(',').map((p) => p.trim())
    } else if (arg === '--output-dir' && i + 1 < args.length) {
      options.outputDir = args[++i]
    } else if (arg === '--json' || arg === '--output-json') {
      options.outputJson = true
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    } else if (arg === '--watch' || arg === '-w') {
      options.watch = true
    }
  }

  return options
}

// ============================================================================
// REPORT SAVING
// ============================================================================

/**
 * Save JSON report to file
 * @param {Object} report - Report data to save
 * @param {string} outputDir - Directory to save to
 * @param {string} filename - Filename (without path)
 * @returns {string} Path where file was saved
 */
function saveJsonReport(report, outputDir, filename) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filepath = path.join(outputDir, filename)
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8')
  log.success(`Report saved: ${filepath}`)
  return filepath
}

/**
 * Save markdown report to file
 * @param {string} markdown - Markdown content
 * @param {string} outputDir - Directory to save to
 * @param {string} filename - Filename (without path)
 * @returns {string} Path where file was saved
 */
function saveMarkdownReport(markdown, outputDir, filename) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filepath = path.join(outputDir, filename)
  fs.writeFileSync(filepath, markdown, 'utf-8')
  log.success(`Report saved: ${filepath}`)
  return filepath
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current timestamp in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function getDateStamp() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString()
}

/**
 * Filter targets by name pattern
 * @param {Array} targets - All targets from config
 * @param {string} filter - Target name or pattern
 * @returns {Array} Filtered targets
 */
function filterTargets(targets, filter) {
  if (!filter) return targets

  return targets.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      (t.type && t.type.toLowerCase().includes(filter.toLowerCase()))
  )
}

/**
 * Get unique report name with timestamp
 * @param {string} standard - Standard name (RGAA, RGPD, etc.)
 * @param {string} extension - File extension (.json, .md)
 * @returns {string} Filename with timestamp
 */
function getReportFilename(standard, extension = '.json') {
  const timestamp = getDateStamp()
  return `compliance-${standard.toLowerCase()}-report-${timestamp}${extension}`
}

/**
 * Validate that required configuration sections exist
 * @param {Object} config - Configuration object
 * @param {Array} required - Array of required field paths (e.g., ['auth.personas', 'targets'])
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateConfig(config, required = []) {
  const errors = []

  if (!config) {
    errors.push('Configuration is null or undefined')
    return { valid: false, errors }
  }

  required.forEach((field) => {
    const parts = field.split('.')
    let current = config

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        errors.push(`Missing required field: ${field}`)
        break
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

module.exports = {
  colors,
  log,
  loadConfig,
  parseArgs,
  saveJsonReport,
  saveMarkdownReport,
  getDateStamp,
  getTimestamp,
  filterTargets,
  getReportFilename,
  validateConfig,
}
