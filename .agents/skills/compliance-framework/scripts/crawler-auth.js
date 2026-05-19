/**
 * Crawler Authentication Utility (Standard-Agnostic)
 *
 * Handles Puppeteer-based + API authentication for compliance scanning
 *
 * Uses generic persona discovery from personas.js
 * Supports:
 * 1. Puppeteer-based browser automation (for UI testing)
 * 2. API authentication (for API-level scans)
 * 3. Multi-persona crawling (different roles/permissions)
 *
 * Used by ALL compliance scanners (RGAA, RGPD, RGS, etc.)
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {
  discoverPersonas,
  getPersona,
  getPersonasForRoute,
  buildAuthHeaders,
} = require('./personas')
const { log } = require('./shared-utils')

/**
 * Discover and normalize personas from config
 * Delegates to personas.js discovery
 * @param {Object} config - Scanner configuration
 * @param {string} projectRoot - Root path of the project
 * @returns {Promise<Array>} Array of persona objects
 */
async function discoverPersonasFromConfig(config, projectRoot = '.') {
  return discoverPersonas(config, projectRoot)
}

/**
 * Discover auth configuration (returns normalized auth object)
 * Kept for backward compatibility; primarily uses personas module
 * @param {Object} config - Scanner configuration
 * @param {string} projectRoot - Root path of the project
 * @returns {Promise<Object>} Auth configuration with personas
 */
async function discoverAuthConfig(config, projectRoot = '.') {
  const personas = await discoverPersonasFromConfig(config, projectRoot)

  // Return auth config in expected format
  return {
    type: config?.auth?.type || 'local',
    loginUrl: config?.auth?.loginUrl || 'http://localhost:3000/login',
    usernameSelector:
      config?.auth?.usernameSelector || 'input[type="text"], input[name*="user"]',
    passwordSelector: config?.auth?.passwordSelector || 'input[type="password"]',
    submitSelector: config?.auth?.submitSelector || 'button[type="submit"]',
    personas: personas,
  }
}

/**
 * Authenticate a browser session with a specific persona
 * Uses getPersona from personas.js to retrieve credentials
 * @param {Object} browser - Puppeteer browser instance
 * @param {Array} personas - Array of persona objects (from discoverPersonas)
 * @param {Object} authConfig - Auth configuration (selectors, login URL)
 * @param {string} personaName - Name of the persona to authenticate as
 * @returns {Promise<Page>} Authenticated browser page
 */
async function authenticateWithPersona(browser, personas, authConfig, personaName) {
  // Use personas.js to get persona
  const persona = getPersona(personas, personaName)
  if (!persona) {
    log.warn(`Persona "${personaName}" not found in discovered personas`)
    return null
  }

  try {
    const page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 720 })

    // Navigate to login page
    log.info(`🔐 Authenticating as ${personaName} (${persona.username})`)
    await page.goto(authConfig.loginUrl || 'http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Wait for form fields - use fallback selectors
    const usernameSelectors = (authConfig.usernameSelector || 'input[type="text"]')
      .split(',')
      .map((s) => s.trim())
    const passwordSelectors = (
      authConfig.passwordSelector || 'input[type="password"]'
    )
      .split(',')
      .map((s) => s.trim())
    const submitSelectors = (authConfig.submitSelector || 'button[type="submit"]')
      .split(',')
      .map((s) => s.trim())

    let usernameField = null
    let selectedUsernameSelector = null
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.waitForSelector(selector, { timeout: 5000 })
        selectedUsernameSelector = selector
        if (usernameField) break
      } catch (e) {
        continue
      }
    }

    if (!usernameField) {
      throw new Error(
        `Could not find username field with selectors: ${usernameSelectors.join(
          ', '
        )}`
      )
    }

    // Fill in credentials
    await page.type(selectedUsernameSelector, persona.username)
    await page.type(passwordSelectors[0], persona.password)

    // Submit form and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click(submitSelectors[0]),
    ])

    log.success(`Authenticated as ${personaName}`)
    return page
  } catch (error) {
    log.error(`Authentication failed for ${personaName}: ${error.message}`)
    return null
  }
}

/**
 * Get list of routes for a specific persona
 * @param {Object} config - Scanner configuration
 * @param {string} personaName - Name of the persona
 * @param {string} targetName - Name of the target (Web App, etc.)
 * @returns {Array} Filtered routes for the persona
 */
function getRoutesForPersona(config, personaName, targetName) {
  const target = config.targets.find((t) => t.name === targetName)
  if (!target) {
    return []
  }

  // Handle new format (routes with persona mapping)
  if (
    Array.isArray(target.routes) &&
    target.routes.length > 0 &&
    typeof target.routes[0] === 'object'
  ) {
    return target.routes
      .filter(
        (route) =>
          route.personas &&
          (route.personas.includes('*') || route.personas.includes(personaName))
      )
      .map((route) => route.path)
  }

  // Handle legacy format (simple array of strings)
  if (Array.isArray(target.routes) && typeof target.routes[0] === 'string') {
    return target.routes
  }

  return []
}

/**
 * Navigate to a route and wait for it to load
 * @param {Page} page - Puppeteer page instance
 * @param {string} baseUrl - Base URL of the application
 * @param {string} route - Route path to navigate to
 * @returns {Promise<Response>} Response from navigation
 */
async function navigateToRoute(page, baseUrl, route) {
  const fullUrl = `${baseUrl}${route}`
  try {
    const response = await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    })
    return response
  } catch (error) {
    console.warn(`   ⚠️  Failed to navigate to ${route}: ${error.message}`)
    return null
  }
}

/**
 * Crawl all routes for multiple personas with authentication
 * @param {string} targetUrl - Base URL of the target
 * @param {Object} config - Scanner configuration
 * @param {Array} personas - Discovered personas (from discoverPersonas)
 * @param {string} targetName - Name of the target (Web App, etc.)
 * @param {Function} reviewPageFn - Function to call for each page review
 * @param {Array} personasToTest - Optional: specific personas to test (default: all)
 * @returns {Promise<Array>} Results from page reviews
 */
async function crawlRoutesWithAuth(
  targetUrl,
  config,
  personas,
  targetName,
  reviewPageFn,
  personasToTest = null
) {
  let browser
  const results = []

  // Determine which personas to test
  const personsToTestList = personasToTest || personas.map((p) => p.name)

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    // Get auth config from scanner config
    const authConfig = config.auth || {}

    // Test each persona
    for (const personaName of personsToTestList) {
      log.section(`Testing as ${personaName}`)

      // Authenticate
      const page = await authenticateWithPersona(
        browser,
        personas,
        authConfig,
        personaName
      )
      if (!page) {
        log.warn(`Skipping routes for ${personaName} - authentication failed`)
        continue
      }

      // Get routes for this persona
      const routes = getRoutesForPersona(config, personaName, targetName)
      log.info(`📍 Crawling ${routes.length} route(s) for ${personaName}`)

      // Navigate to each route and review
      for (const route of routes) {
        try {
          const response = await navigateToRoute(page, targetUrl, route)
          if (!response || !response.ok()) {
            log.warn(`Route ${route} returned ${response?.status()}`)
          }

          // Get page content for analysis
          const content = await page.content()
          const pageTitle = await page.title()
          const pageUrl = page.url()

          // Call review function
          const result = await reviewPageFn({
            path: route,
            url: pageUrl,
            title: pageTitle,
            content: content,
            persona: personaName,
            statusCode: response?.status(),
          })

          if (result) {
            results.push(result)
          }
        } catch (error) {
          log.warn(`Error reviewing route ${route}: ${error.message}`)
        }
      }

      await page.close()
    }
  } catch (error) {
    log.error(`Crawler error: ${error.message}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  return results
}

module.exports = {
  // Persona discovery (delegates to personas.js)
  discoverPersonasFromConfig,
  discoverAuthConfig,

  // Puppeteer-based crawling
  authenticateWithPersona,
  getRoutesForPersona,
  navigateToRoute,
  crawlRoutesWithAuth,

  // Re-export persona utilities for convenience
  ...require('./personas'),
}
