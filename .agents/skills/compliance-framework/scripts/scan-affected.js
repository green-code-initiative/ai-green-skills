#!/usr/bin/env node

/**
 * Technology-Agnostic Compliance Scanner Wrapper
 *
 * This script is a BRIDGE between any referential-specific scanner and the project's build system.
 * It is TECHNOLOGY-AGNOSTIC and auto-detects the project's build architecture.
 * It is REFERENTIAL-AGNOSTIC and can be used by any compliance standard (RGAA, RGESN, RGS, RGPD, RGI, W3C-WSG).
 *
 * Supported technologies:
 * - Nx (monorepo, yarn/npm workspaces)
 * - Turborepo (monorepo, yarn/npm workspaces)
 * - pnpm workspaces (monorepo)
 * - Maven (Java projects)
 * - Gradle (Java projects)
 * - Vanilla projects (single repo, no monorepo)
 *
 * RESPONSIBILITY SEPARATION:
 * - Referential-specific scanner (.agents/skills/[referential]/): Tests, criteria, detection rules
 * - This wrapper (.agents/skills/compliance-framework/): Technology detection, project mapping, orchestration
 * - Scanner config (docs/compliance/scanner-config.json): Target definitions + project mappings (project-specific)
 *
 * Usage from SKILL (auto-finds scanner in same skill):
 *   node .agents/skills/compliance-rgaa/scripts/scan-affected.js
 *   node .agents/skills/compliance-rgaa/scripts/scan-affected.js --base=develop --verbose
 *   node .agents/skills/compliance-rgaa/scripts/scan-affected.js --targets=web
 *
 * Usage from framework (explicit scanner path):
 *   node .agents/skills/compliance-framework/scripts/scan-affected.js --scanner .agents/skills/compliance-rgaa/scripts/scan-compliance.js
 *   node .agents/skills/compliance-framework/scripts/scan-affected.js --scanner path/to/custom-scanner.js --verbose
 *
 * Environment:
 *   SCAN_BASE: Git ref to compare against (default: main)
 *   SCAN_CONFIG: Custom config path (searches cwd and parents by default)
 *   SCAN_SCANNER: Path to referential-specific scanner (overrides auto-detect)
 *
 * Config search paths (in order):
 *   1. ./docs/compliance/scanner-config.json (Project standard location)
 *   2. ./scanner-config.json (root level)
 *   3. Path specified in --config flag
 *
 * Scanner search paths (if not explicitly specified):
 *   1. Same directory as this script (skill location)
 *   2. ../../../skills/compliance-[referential]/scripts/scan-compliance.js (framework to skill)
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// ============================================================================
// CLI ARGUMENTS
// ============================================================================

const args = process.argv.slice(2)
const verbose = args.includes('--verbose') || args.includes('-v')

const baseIdx = args.indexOf('--base')
const scanBase =
  baseIdx >= 0 && baseIdx + 1 < args.length
    ? args[baseIdx + 1]
    : process.env.SCAN_BASE || 'main'

const configIdx = args.indexOf('--config')
const configPathExplicit =
  configIdx >= 0 && configIdx + 1 < args.length ? args[configIdx + 1] : null

const scannerIdx = args.indexOf('--scanner')
const scannerPathExplicit =
  scannerIdx >= 0 && scannerIdx + 1 < args.length
    ? args[scannerIdx + 1]
    : process.env.SCAN_SCANNER || null

const passThruArgs = args.filter(
  (arg) =>
    !arg.startsWith('--base') &&
    arg !== scanBase &&
    !arg.startsWith('--config') &&
    !arg.startsWith('--scanner')
)

// ============================================================================
// COLORS & LOGGING
// ============================================================================

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

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  debug: (msg) => {
    if (verbose) console.log(`${colors.magenta}[DEBUG]${colors.reset} ${msg}`)
  },
}

// ============================================================================
// SCANNER PATH RESOLUTION
// ============================================================================

/**
 * Resolve the path to the referential-specific scanner.
 *
 * Strategy:
 * 1. Use explicit --scanner or SCAN_SCANNER if provided
 * 2. Look in same directory (for skill-local usage)
 * 3. Look in parent directories, up to 3 levels (framework → skill)
 */
function findScannerPath() {
  if (scannerPathExplicit) {
    if (fs.existsSync(scannerPathExplicit)) {
      log.debug(`Using explicit scanner: ${scannerPathExplicit}`)
      return path.resolve(scannerPathExplicit)
    } else {
      log.error(`Explicit scanner path does not exist: ${scannerPathExplicit}`)
      process.exit(1)
    }
  }

  const pwd = process.cwd()
  const scriptDir = __dirname

  // Check in same directory (skill usage)
  const sameDir = path.join(scriptDir, 'scan-compliance.js')
  if (fs.existsSync(sameDir)) {
    log.debug(`Found scanner in skill directory: ${sameDir}`)
    return sameDir
  }

  // Check in parent directories (framework → skill navigation)
  const searchDirs = [
    path.join(
      scriptDir,
      '..',
      '..',
      '..',
      'skills',
      'compliance-rgaa',
      'scripts',
      'scan-compliance.js'
    ),
    path.join(
      scriptDir,
      '..',
      '..',
      '..',
      'skills',
      'compliance-rgesn',
      'scripts',
      'scan-compliance.js'
    ),
    path.join(
      scriptDir,
      '..',
      '..',
      '..',
      'skills',
      'compliance-rgs',
      'scripts',
      'scan-compliance.js'
    ),
    path.join(
      scriptDir,
      '..',
      '..',
      '..',
      'skills',
      'compliance-rgpd',
      'scripts',
      'scan-compliance.js'
    ),
    path.join(
      scriptDir,
      '..',
      '..',
      '..',
      'skills',
      'compliance-rgi',
      'scripts',
      'scan-compliance.js'
    ),
    path.join(
      scriptDir,
      '..',
      '..',
      '..',
      'skills',
      'compliance-w3c-wsg',
      'scripts',
      'scan-compliance.js'
    ),
  ]

  for (const scannerPath of searchDirs) {
    if (fs.existsSync(scannerPath)) {
      log.debug(`Auto-detected scanner: ${scannerPath}`)
      return scannerPath
    }
  }

  // No scanner found
  log.error(
    `Scanner not found. Provide explicit path with --scanner flag or ensure scanner is in same directory.\n` +
      `Searched paths:\n  ${searchDirs.join('\n  ')}`
  )
  process.exit(1)
}

// ============================================================================
// BUILD SYSTEM DETECTION
// ============================================================================

/**
 * Detect which build system the project uses.
 * Returns: { name: 'nx' | 'turborepo' | 'pnpm' | 'maven' | 'gradle' | 'custom', version: '...' }
 */
function detectBuildSystem() {
  const pwd = process.cwd()

  // Check for Nx
  if (
    fs.existsSync(path.join(pwd, 'nx.json')) ||
    fs.existsSync(path.join(pwd, '.nxrc'))
  ) {
    try {
      const version = execSync('nx --version', { encoding: 'utf8' }).trim()
      return { name: 'nx', version }
    } catch (e) {
      // nx installed as dependency, not CLI
    }
  }

  // Check for Turborepo
  if (fs.existsSync(path.join(pwd, 'turbo.json'))) {
    try {
      const version = execSync('turbo --version', { encoding: 'utf8' }).trim()
      return { name: 'turborepo', version }
    } catch (e) {}
  }

  // Check for pnpm monorepo
  if (
    fs.existsSync(path.join(pwd, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(pwd, 'pnpm-workspace.yml'))
  ) {
    try {
      const version = execSync('pnpm --version', { encoding: 'utf8' }).trim()
      return { name: 'pnpm-workspace', version }
    } catch (e) {}
  }

  // Check for Maven
  if (fs.existsSync(path.join(pwd, 'pom.xml'))) {
    try {
      execSync('mvn --version 2>/dev/null', { encoding: 'utf8' })
      const version = execSync(
        'mvn --quiet --version 2>/dev/null || echo "unknown"',
        { encoding: 'utf8' }
      ).split('\n')[0]
      return { name: 'maven', version }
    } catch (e) {}
  }

  // Check for Gradle
  if (
    fs.existsSync(path.join(pwd, 'build.gradle')) ||
    fs.existsSync(path.join(pwd, 'build.gradle.kts'))
  ) {
    try {
      const version = execSync('gradle --version', { encoding: 'utf8' }).split(
        '\n'
      )[0]
      return { name: 'gradle', version }
    } catch (e) {}
  }

  // Default: custom/vanilla project
  return { name: 'custom', version: 'unknown' }
}

// ============================================================================
// AFFECTED PROJECTS DETECTION (Technology-Specific)
// ============================================================================

/**
 * Get affected projects using the detected build system.
 */
function getAffectedProjects(buildSystem) {
  let command
  let parser = (output) =>
    output
      .trim()
      .split('\n')
      .filter((p) => p.trim().length > 0)

  switch (buildSystem.name) {
    case 'nx':
      // Nx 16+ uses `nx show projects --affected`
      command = `nx show projects --affected --base=${scanBase} --plain`
      break

    case 'turborepo':
      // Turborepo doesn't have native "affected" filtering; use git diff
      command = `git diff --name-only ${scanBase}...HEAD | xargs -I {} basename {} | sed 's/-.*//' | sort -u`
      parser = (output) =>
        output
          .trim()
          .split('\n')
          .filter((p) => p.trim().length > 0)
          .map((p) => p.trim())
      break

    case 'pnpm-workspace':
      // pnpm doesn't have native "affected" filtering; use git diff
      command = `git diff --name-only ${scanBase}...HEAD | grep -oE 'packages/[^/]+' | sort -u | sed 's|packages/||'`
      parser = (output) =>
        output
          .trim()
          .split('\n')
          .filter((p) => p.trim().length > 0)
      break

    case 'maven':
    case 'gradle':
      // Java builds: detect changed modules via git
      command = `git diff --name-only ${scanBase}...HEAD | grep -oE '^[^/]+' | sort -u`
      break

    case 'custom':
    default:
      log.warn('No monorepo system detected; assuming single project.')
      return ['default']
  }

  try {
    log.debug(`Running: ${command}`)
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    })
    const projects = parser(output)

    log.debug(`Detected ${projects.length} affected projects`)
    projects.forEach((p) => log.debug(`  - ${p}`))

    return projects
  } catch (error) {
    log.error(`Failed to detect affected projects: ${error.message}`)
    if (verbose) console.error(error)
    process.exit(1)
  }
}

// ============================================================================
// CONFIG LOADING & PROJECT MAPPING
// ============================================================================

/**
 * Find and load scanner config from project.
 * Searches in standard locations relative to current working directory.
 */
function findConfigPath() {
  if (configPathExplicit) {
    if (fs.existsSync(configPathExplicit)) {
      return configPathExplicit
    }
    log.error(`Config not found: ${configPathExplicit}`)
    process.exit(1)
  }

  const searchPaths = [
    path.join(process.cwd(), 'docs/compliance/scanner-config.json'),
    path.join(process.cwd(), 'scanner-config.json'),
  ]

  for (const cfgPath of searchPaths) {
    if (fs.existsSync(cfgPath)) {
      log.debug(`Found config: ${cfgPath}`)
      return cfgPath
    }
  }

  log.error(`Scanner config not found in ${process.cwd()}. Searched for:`)
  searchPaths.forEach((p) => log.error(`  - ${p}`))
  log.error(`Use --config /path/to/scanner-config.json to specify custom location.`)
  process.exit(1)
}

/**
 * Load project-to-target mapping from config file.
 * Each project defines which compliance targets it affects.
 */
function loadProjectMapping(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  return config.projectMapping || {}
}

/**
 * Map projects to compliance targets using the config mapping.
 */
function mapProjectsToTargets(affectedProjects, mapping) {
  const targetSet = new Set()
  const unmappedProjects = []

  for (const project of affectedProjects) {
    const target = mapping[project]

    if (target === null) {
      // Explicitly ignored
      log.debug(`  ✓ ${project} → (skipped, backend-only)`)
      continue
    }

    if (target) {
      log.debug(`  ✓ ${project} → ${target}`)
      targetSet.add(target)
    } else {
      log.warn(`  ? ${project} → (unmapped in scanner-config.json)`)
      unmappedProjects.push(project)
    }
  }

  return {
    targets: Array.from(targetSet).sort(),
    unmappedProjects,
  }
}

// ============================================================================
// SCANNER EXECUTION
// ============================================================================

/**
 * Run the referential-specific compliance scanner with computed targets.
 */
function runScanner(targets, buildSystemName, configPath, scannerPath) {
  const targetsArg = targets.length > 0 ? `--targets ${targets.join(',')}` : ''
  const command = `node "${scannerPath}" --config "${configPath}" ${targetsArg} ${passThruArgs.join(
    ' '
  )}`

  log.debug(`Using build system: ${colors.bright}${buildSystemName}${colors.reset}`)
  log.debug(`Using scanner: ${scannerPath}`)
  log.debug(`Running: ${command}`)

  try {
    execSync(command, { stdio: 'inherit' })
  } catch (error) {
    // Scanner exit code reflects compliance status; preserve it
    process.exit(error.status || 1)
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const buildSystem = detectBuildSystem()

  log.title(
    `Compliance Scanner (${colors.bright}${buildSystem.name}${colors.reset} ${buildSystem.version})`
  )

  log.info(`Detecting changes since: ${colors.bright}${scanBase}${colors.reset}`)

  const affectedProjects = getAffectedProjects(buildSystem)

  if (
    affectedProjects.length === 0 ||
    (affectedProjects.length === 1 && affectedProjects[0] === 'default')
  ) {
    log.success('No relevant changes detected.')
    process.exit(0)
  }

  const configPath = findConfigPath()
  const scannerPath = findScannerPath()
  const mapping = loadProjectMapping(configPath)

  log.info(`Mapping ${affectedProjects.length} project(s) to compliance targets...`)
  const { targets, unmappedProjects } = mapProjectsToTargets(
    affectedProjects,
    mapping
  )

  if (unmappedProjects.length > 0) {
    log.warn(
      `${unmappedProjects.length} project(s) unmapped. ` +
        `Update "projectMapping" in scanner-config.json to define their targets.`
    )
  }

  if (targets.length === 0) {
    log.info('No UI-related projects affected (backend-only changes).')
    process.exit(0)
  }

  log.success(
    `Running compliance scan on: ${colors.bright}${targets.join(', ')}${
      colors.reset
    }`
  )
  runScanner(targets, buildSystem.name, configPath, scannerPath)
}

if (require.main === module) {
  main()
}

module.exports = {
  detectBuildSystem,
  getAffectedProjects,
  mapProjectsToTargets,
  findConfigPath,
}

// Run if invoked directly (CLI mode)
if (require.main === module) {
  main().catch((error) => {
    log.error(error.message)
    process.exit(1)
  })
}
