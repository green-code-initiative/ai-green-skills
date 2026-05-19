/**
 * Generic Persona Management Module (Standard-Agnostic)
 *
 * Provides unified persona/authentication discovery & management
 * Used by ALL compliance scanners (RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG)
 *
 * Features:
 * - Discover personas from scanner-config.json (primary)
 * - Fallback to .env parsing
 * - Fallback to README/CONTRIBUTING.md parsing
 * - Fallback to common defaults
 *
 * Usage:
 *   const { discoverPersonas, getPersona } = require('./personas');
 *   const personas = await discoverPersonas(config, projectRoot);
 *   const persona = getPersona(personas, 'Client');
 */

const fs = require('fs')
const path = require('path')

/**
 * Discover authentication configuration & personas from various sources
 * @param {Object} config - Scanner configuration (from scanner-config.json)
 * @param {string} projectRoot - Root path of project
 * @returns {Promise<Array>} Array of persona objects with credentials
 */
async function discoverPersonas(config, projectRoot = '.') {
  // 1️⃣ PRIMARY: Check if personas config exists in scanner-config.json
  if (
    config &&
    config.auth &&
    Array.isArray(config.auth.personas) &&
    config.auth.personas.length > 0
  ) {
    console.log(
      `✅ Personas found in scanner-config.json (${
        config.auth.personas.length
      } persona${config.auth.personas.length !== 1 ? 's' : ''})`
    )
    return config.auth.personas
  }

  console.log(`ℹ  Discovering personas from environment...`)

  // 2️⃣ FALLBACK 1: Parse .env file
  const envPath = path.join(projectRoot, '.env')
  const envPersonas = parseEnvForPersonas(envPath)
  if (envPersonas.length > 0) {
    console.log(
      `✅ Found ${envPersonas.length} persona${
        envPersonas.length !== 1 ? 's' : ''
      } in .env`
    )
    return envPersonas
  }

  // 3️⃣ FALLBACK 2: Parse README.md
  const readmePath = path.join(projectRoot, 'README.md')
  const readmePersonas = parseDocumentForPersonas(readmePath)
  if (readmePersonas.length > 0) {
    console.log(
      `✅ Found ${readmePersonas.length} persona${
        readmePersonas.length !== 1 ? 's' : ''
      } in README.md`
    )
    return readmePersonas
  }

  // 4️⃣ FALLBACK 3: Parse CONTRIBUTING.md
  const contributingPath = path.join(projectRoot, 'CONTRIBUTING.md')
  const contributingPersonas = parseDocumentForPersonas(contributingPath)
  if (contributingPersonas.length > 0) {
    console.log(
      `✅ Found ${contributingPersonas.length} persona${
        contributingPersonas.length !== 1 ? 's' : ''
      } in CONTRIBUTING.md`
    )
    return contributingPersonas
  }

  // 5️⃣ FALLBACK 4: Use safe defaults
  console.log(`⚠️  No personas discovered - using generic defaults`)
  return buildDefaultPersonas()
}

/**
 * Parse .env file for persona credentials
 * Patterns: TEST_USER_*, DEMO_USER_*, AUTH_*, etc.
 * @param {string} envPath - Path to .env file
 * @returns {Array} Discovered personas
 */
function parseEnvForPersonas(envPath) {
  const personas = []

  if (!fs.existsSync(envPath)) {
    return personas
  }

  try {
    const content = fs.readFileSync(envPath, 'utf-8')
    const lines = content.split('\n')

    // Match patterns like: TEST_USER_ADMIN=user@test.com, TEST_PASSWORD_ADMIN=pwd123
    const credentialPattern =
      /^(?:TEST_|DEMO_|AUTH_)?([A-Z_]+)_(USERNAME|USER|EMAIL|LOGIN|PASSWORD|PWD|PASS)=(.+)$/i
    const personaMap = new Map()

    lines.forEach((line) => {
      const match = line.match(credentialPattern)
      if (match) {
        const [, personaKey, fieldType, value] = match
        const cleanValue = value.replace(/^["']|["']$/g, '').trim()

        if (!personaMap.has(personaKey)) {
          personaMap.set(personaKey, {
            name: personaKey,
            description: `Test account (${personaKey})`,
          })
        }

        const persona = personaMap.get(personaKey)
        if (fieldType.match(/USERNAME|USER|EMAIL|LOGIN/i)) {
          persona.username = cleanValue
        } else if (fieldType.match(/PASSWORD|PWD|PASS/i)) {
          persona.password = cleanValue
        }
      }
    })

    return Array.from(personaMap.values()).filter((p) => p.username && p.password)
  } catch (err) {
    console.warn(`⚠️  Error parsing .env: ${err.message}`)
    return personas
  }
}

/**
 * Parse README/CONTRIBUTING.md for persona credentials
 * Looks for documented test accounts
 * @param {string} docPath - Path to documentation file
 * @returns {Array} Discovered personas
 */
function parseDocumentForPersonas(docPath) {
  const personas = []

  if (!fs.existsSync(docPath)) {
    return personas
  }

  try {
    const content = fs.readFileSync(docPath, 'utf-8')

    // Pattern: "Test account: username@example.com / password" or similar
    const credentialPattern =
      /(?:Test|Demo|Example).*?(?:account|user|persona)[\s:]*([a-zA-Z0-9._@-]+)\s*(?:\/|:|\|)\s*([a-zA-Z0-9!@#$%^&*_-]+)/gi

    let match
    const foundPersonas = []

    while ((match = credentialPattern.exec(content)) !== null) {
      const [, username, password] = match
      if (username && password && username.length > 2) {
        foundPersonas.push({
          name: username.split('@')[0], // Extract name from email if applicable
          username,
          password,
          description: 'Discovered from documentation',
        })
      }
    }

    // Deduplicate by username
    const uniquePersonas = new Map()
    foundPersonas.forEach((p) => {
      if (!uniquePersonas.has(p.username)) {
        uniquePersonas.set(p.username, p)
      }
    })

    return Array.from(uniquePersonas.values())
  } catch (err) {
    console.warn(`⚠️  Error parsing ${path.basename(docPath)}: ${err.message}`)
    return personas
  }
}

/**
 * Build default personas (generic, safe defaults)
 * @returns {Array} Default personas
 */
function buildDefaultPersonas() {
  return [
    {
      name: 'User',
      username: 'user@example.com',
      password: 'Password123!',
      description: 'Generic user account',
    },
    {
      name: 'Admin',
      username: 'admin@example.com',
      password: 'AdminPassword123!',
      description: 'Generic admin account',
    },
  ]
}

/**
 * Get a specific persona by name
 * @param {Array} personas - Array of persona objects
 * @param {string} personaName - Name of persona to retrieve
 * @returns {Object|null} Persona object or null if not found
 */
function getPersona(personas, personaName) {
  if (!Array.isArray(personas)) {
    return null
  }

  return (
    personas.find((p) => p.name.toLowerCase() === personaName.toLowerCase()) || null
  )
}

/**
 * Get personas accessible for a given route
 * @param {Array} personas - All personas
 * @param {Array} allowedPersonas - Array of persona names (or ["*"] for all)
 * @returns {Array} Filtered personas
 */
function getPersonasForRoute(personas, allowedPersonas) {
  if (!Array.isArray(personas) || !Array.isArray(allowedPersonas)) {
    return []
  }

  if (allowedPersonas.includes('*')) {
    return personas
  }

  return personas.filter((p) =>
    allowedPersonas.some((allowed) => allowed.toLowerCase() === p.name.toLowerCase())
  )
}

/**
 * Build auth headers for a persona (for API authentication)
 * Supports both Basic Auth and Bearer tokens
 * @param {Object} persona - Persona object
 * @param {string} authType - 'basic' | 'bearer' (default: 'basic')
 * @returns {Object} Headers object for HTTP requests
 */
function buildAuthHeaders(persona, authType = 'basic') {
  if (!persona || !persona.username || !persona.password) {
    return {}
  }

  if (authType === 'bearer') {
    // If persona has a token field, use it
    return {
      Authorization: `Bearer ${persona.token || persona.password}`,
    }
  }

  // Default: Basic Auth
  const credentials = Buffer.from(
    `${persona.username}:${persona.password}`
  ).toString('base64')
  return {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json',
  }
}

module.exports = {
  discoverPersonas,
  getPersona,
  getPersonasForRoute,
  buildAuthHeaders,
  parseEnvForPersonas,
  parseDocumentForPersonas,
  buildDefaultPersonas,
}
