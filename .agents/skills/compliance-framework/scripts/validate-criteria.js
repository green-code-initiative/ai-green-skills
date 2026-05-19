#!/usr/bin/env node

/**
 * validate-criteria.js
 *
 * Generic validator for all compliance referentials.
 *
 * This module:
 * 1. Loads criteria, tests, and tools configuration from JSON files
 * 2. For each criterion, executes associated tests
 * 3. Routes tests to appropriate tools (axe-core, custom validators, etc.)
 * 4. Aggregates results into violations
 *
 * Usage:
 * const result = await validateCriteria(pageData, criteria, tests, tools, toolSelection)
 */

const fs = require('fs')
const path = require('path')

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

/**
 * Load criteria.json from a referential directory
 * @param {string} referentialPath - Path to compliance-[ref] directory
 * @returns {Promise<Object>} Parsed criteria.json
 */
async function loadCriteria(referentialPath) {
  const filePath = path.join(referentialPath, 'criteria.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`criteria.json not found at ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/**
 * Load tests.json from a referential directory
 * @param {string} referentialPath - Path to compliance-[ref] directory
 * @returns {Promise<Object>} Parsed tests.json
 */
async function loadTests(referentialPath) {
  const filePath = path.join(referentialPath, 'tests.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`tests.json not found at ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/**
 * Load tools-mapping.json from a referential directory
 * @param {string} referentialPath - Path to compliance-[ref] directory
 * @returns {Promise<Object>} Parsed tools-mapping.json
 */
async function loadTools(referentialPath) {
  const filePath = path.join(referentialPath, 'tools-mapping.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`tools-mapping.json not found at ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

// ============================================================================
// TEST EXECUTION & VALIDATION
// ============================================================================

/**
 * Get tests for a specific criterion
 * @param {Object} test - Test object from tests.json
 * @param {Object} tests - Complete tests.json structure
 * @returns {Array<Object>} All test objects (one criterion may have multiple tests)
 */
function getTestsForCriterion(criterionId, tests) {
  if (!tests.tests) return []
  return tests.tests.filter((t) => t.criterion_id === criterionId)
}

/**
 * Get tools that support a specific test
 * @param {Object} test - Test object from tests.json
 * @param {Object} tools - Complete tools-mapping.json structure
 * @returns {Array<Object>} Tool configurations that support this test
 */
function getToolsForTest(test, tools) {
  if (!test.support_tools || !tools.tools) return []

  return test.support_tools
    .map((toolName) => {
      const tool = tools.tools[toolName]
      if (!tool) return null

      // Check if tool supports this test
      if (tool.tests_supported && !tool.tests_supported.includes(test.id)) {
        return null
      }

      return { name: toolName, ...tool }
    })
    .filter((t) => t !== null)
}

/**
 * Execute validation for a single test
 * Routes to appropriate tool and executes validation logic
 *
 * @param {Object} test - Test from tests.json
 * @param {Object} pageData - Page data { path, url, title, content, headers }
 * @param {Object} tools - tools-mapping.json
 * @param {string} toolPreference - Prefer which tool? 'automated' | 'manual' | toolName
 * @returns {Promise<Object>} Validation result { passed: boolean, violations: [], message }
 */
async function executeTest(test, pageData, tools, toolPreference = 'automated') {
  const supportedTools = getToolsForTest(test, tools)

  if (supportedTools.length === 0) {
    return {
      passed: null,
      violations: [],
      message: `No tools available for test ${test.id}`,
      skipped: true,
    }
  }

  // Select tool based on preference
  let selectedTool = null
  if (toolPreference === 'automated') {
    selectedTool = supportedTools.find(
      (t) => t.automation_level === 'fully_automated'
    )
  } else if (toolPreference === 'manual') {
    selectedTool = supportedTools.find((t) => t.automation_level === 'manual')
  } else {
    selectedTool = supportedTools.find((t) => t.name === toolPreference)
  }

  if (!selectedTool) {
    selectedTool = supportedTools[0]
  }

  // Execute test based on automation level
  if (
    selectedTool.automation_level === 'automated' ||
    selectedTool.automation_level === 'fully_automated'
  ) {
    return await executeAutomatedTest(test, pageData, selectedTool)
  } else if (selectedTool.automation_level === 'manual') {
    return {
      passed: null,
      violations: [],
      message: `Test ${test.id} requires manual review`,
      requiresManualReview: true,
    }
  } else {
    return {
      passed: null,
      violations: [],
      message: `Test ${test.id} has hybrid automation level`,
      requiresManualReview: true,
    }
  }
}

/**
 * Execute automated test
 * Driven by tool configuration - reads validation logic from tools-mapping.json
 *
 * @param {Object} test - Test from tests.json
 * @param {Object} pageData - Page data
 * @param {Object} tool - Tool configuration from tools-mapping.json (defines HOW to validate)
 * @returns {Promise<Object>} Validation result
 */
async function executeAutomatedTest(test, pageData, tool) {
  const violations = []
  let passed = true

  const { content = '', headers = {}, url = '' } = pageData

  // ========================================================================
  // TOOL-DRIVEN VALIDATION
  // Reads validation method from tool configuration instead of hardcoded if/else
  // ========================================================================

  // If tool has validation_patterns defined, use them
  if (tool.validation_patterns && Array.isArray(tool.validation_patterns)) {
    for (const pattern of tool.validation_patterns) {
      // Match pattern applies to this test?
      if (pattern.applies_to_tests && !pattern.applies_to_tests.includes(test.id)) {
        continue
      }

      // Execute pattern-based validation
      const result = executeValidationPattern(
        pattern,
        test,
        pageData,
        content,
        headers,
        url
      )
      if (!result.passed) {
        passed = false
      }
      violations.push(...result.violations)
    }
  }

  // If tool has custom validation function name, route to it
  if (tool.validation_function_name) {
    const customFunction = getValidationFunction(tool.validation_function_name)
    if (customFunction) {
      const result = customFunction(test, pageData, content, headers, url)
      if (!result.passed) {
        passed = false
      }
      violations.push(...result.violations)
      return {
        test_id: test.id,
        passed,
        violations,
        tool_used: tool.name,
        execution_time: '< 100ms',
      }
    }
  }

  // Fallback: If tool definition doesn't specify validation, check test's methodology
  if (test.methodology && test.validation_implementation) {
    const result = executeMethodology(test, pageData, content, headers, url)
    if (!result.passed) {
      passed = false
    }
    violations.push(...result.violations)
  }

  return {
    test_id: test.id,
    passed,
    violations,
    tool_used: tool.name,
    execution_time: '< 100ms',
  }
}

/**
 * Execute validation based on pattern configuration from tools-mapping.json
 * @param {Object} pattern - Validation pattern from tool config
 * @param {Object} test - Test definition
 * @param {Object} pageData - Page data
 * @param {string} content - Page HTML content
 * @param {Object} headers - Response headers
 * @param {string} url - Page URL
 * @returns {Object} { passed: boolean, violations: [] }
 */
function executeValidationPattern(pattern, test, pageData, content, headers, url) {
  const violations = []
  let passed = true

  try {
    // Pattern specifies a regex to match against content
    if (pattern.type === 'regex_match') {
      const regex = new RegExp(pattern.pattern, pattern.flags || 'gi')
      const matches = content.match(regex) || []

      if (pattern.expect === 'present' && matches.length === 0) {
        passed = false
        violations.push({
          test_id: test.id,
          description:
            pattern.error_message || test.error_message || 'Validation failed',
          severity: pattern.severity || 'MEDIUM',
        })
      } else if (pattern.expect === 'absent' && matches.length > 0) {
        passed = false
        violations.push({
          test_id: test.id,
          description:
            pattern.error_message || test.error_message || 'Validation failed',
          severity: pattern.severity || 'MEDIUM',
        })
      }
    }

    // Pattern specifies checking for presence of DOM elements
    if (pattern.type === 'dom_element_check') {
      const selector = pattern.selector || ''
      const regex = new RegExp(`<${selector}[^>]*>`, 'gi')
      const elements = content.match(regex) || []

      if (pattern.expect === 'present' && elements.length === 0) {
        passed = false
        violations.push({
          test_id: test.id,
          description:
            pattern.error_message ||
            test.error_message ||
            `No ${selector} elements found`,
          severity: pattern.severity || 'MEDIUM',
        })
      }

      // Check element attributes if specified
      if (pattern.required_attributes) {
        elements.forEach((element) => {
          const missingAttrs = []
          for (const attr of pattern.required_attributes) {
            const regex = new RegExp(`${attr}\\s*=\\s*["']`, 'i')
            if (!regex.test(element)) {
              missingAttrs.push(attr)
            }
          }

          if (missingAttrs.length > 0) {
            passed = false
            violations.push({
              test_id: test.id,
              element: element.substring(0, 60) + '...',
              description:
                pattern.error_message ||
                `Missing required attributes: ${missingAttrs.join(', ')}`,
              severity: pattern.severity || 'CRITICAL',
            })
          }
        })
      }
    }

    // Pattern specifies checking HTTP headers
    if (pattern.type === 'header_check') {
      const headerName = pattern.header_name?.toLowerCase()
      const headerValue = headers[headerName]

      if (pattern.expect === 'present' && !headerValue) {
        passed = false
        violations.push({
          test_id: test.id,
          description:
            pattern.error_message || `Header ${pattern.header_name} not found`,
          severity: pattern.severity || 'MEDIUM',
        })
      }

      if (pattern.expect_value && headerValue !== pattern.expect_value) {
        passed = false
        violations.push({
          test_id: test.id,
          description:
            pattern.error_message ||
            `Header ${pattern.header_name} has unexpected value`,
          severity: pattern.severity || 'MEDIUM',
        })
      }
    }

    // Pattern specifies checking URL properties
    if (pattern.type === 'url_check') {
      if (pattern.must_start_with && !url.startsWith(pattern.must_start_with)) {
        passed = false
        violations.push({
          test_id: test.id,
          description:
            pattern.error_message ||
            `URL must start with ${pattern.must_start_with}`,
          severity: pattern.severity || 'CRITICAL',
        })
      }
    }
  } catch (error) {
    // If pattern execution fails, treat as failed validation
    violations.push({
      test_id: test.id,
      description: `Validation pattern error: ${error.message}`,
      severity: 'MEDIUM',
    })
    passed = false
  }

  return { passed, violations }
}

/**
 * Get validation function by name (for custom tool validation)
 * Maps tool validation_function_name to actual implementation
 */
function getValidationFunction(functionName) {
  const functions = {
    validateImageAccessibility: (test, pageData, content, headers, url) => {
      // Custom implementation for image accessibility
      const violations = []
      const imgMatches = content.match(/<img[^>]*>/gi) || []

      imgMatches.forEach((img) => {
        const hasAlt = /alt\s*=\s*["']/i.test(img)
        const hasAriaLabel = /aria-label\s*=\s*["']/i.test(img)

        if (!hasAlt && !hasAriaLabel) {
          violations.push({
            test_id: test.id,
            element: img.substring(0, 60) + '...',
            description: 'Image missing alternative text',
            severity: 'CRITICAL',
          })
        }
      })

      return {
        passed: violations.length === 0,
        violations,
      }
    },

    validateLinkLabels: (test, pageData, content, headers, url) => {
      // Custom implementation for link labels
      const violations = []
      const linkMatches = content.match(/<a[^>]*href[^>]*>.*?<\/a>/gi) || []

      linkMatches.forEach((link) => {
        const hasAriaLabel = /aria-label\s*=\s*["']/i.test(link)
        const hasTextContent = />([^<]+)</i.test(link)

        if (!hasAriaLabel && !hasTextContent) {
          violations.push({
            test_id: test.id,
            element: link.substring(0, 60) + '...',
            description: 'Link missing accessible label',
            severity: 'CRITICAL',
          })
        }
      })

      return {
        passed: violations.length === 0,
        violations,
      }
    },

    validateFormFields: (test, pageData, content, headers, url) => {
      // Custom implementation for form fields
      const violations = []
      const inputs = content.match(/<(?:input|textarea|select)[^>]*>/gi) || []

      inputs.forEach((input) => {
        const hasLabel = /id\s*=\s*["']|aria-label/i.test(input)

        if (!hasLabel) {
          violations.push({
            test_id: test.id,
            element: input.substring(0, 60) + '...',
            description: 'Form field missing label',
            severity: 'CRITICAL',
          })
        }
      })

      return {
        passed: violations.length === 0,
        violations,
      }
    },
  }

  return functions[functionName] || null
}

/**
 * Execute validation based on test's methodology field
 * Falls back when tool doesn't specify validation details
 */
function executeMethodology(test, pageData, content, headers, url) {
  const violations = []
  let passed = true

  // If test.validation_implementation is a string, use it as instructions for validation
  if (typeof test.validation_implementation === 'string') {
    // This would normally dispatch to a tool, but for now treat as requiring manual review
    return {
      passed: null,
      violations: [
        {
          test_id: test.id,
          description:
            'Test requires implementation via tool: ' +
            test.validation_implementation,
          severity: 'MEDIUM',
        },
      ],
    }
  }

  return { passed, violations }
}

// ============================================================================
// MAIN VALIDATION ORCHESTRATOR
// ============================================================================

/**
 * Main validator: Execute all criteria validation
 *
 * @param {Object} pageData - { path, url, title, content, headers }
 * @param {Object} criteria - criteria.json
 * @param {Object} tests - tests.json
 * @param {Object} tools - tools-mapping.json
 * @param {Object} toolSelection - Per-test tool preferences (optional)
 * @returns {Promise<Object>} Validation survey with violations
 */
async function validateCriteria(
  pageData,
  criteria,
  tests,
  tools,
  toolSelection = {}
) {
  const results = {
    page: pageData.path,
    url: pageData.url,
    timestamp: new Date().toISOString(),
    criteria_survey: [],
    total_criteria_tested: 0,
    total_tests_executed: 0,
    violations: [],
    passed_tests: [],
  }

  if (!criteria.themes) {
    throw new Error('Invalid criteria.json: missing themes')
  }

  // Iterate all criteria
  for (const theme of criteria.themes) {
    for (const criterion of theme.criteria) {
      // Get tests for this criterion
      const criterionTests = getTestsForCriterion(criterion.id, tests)
      if (criterionTests.length === 0) continue

      results.total_criteria_tested++

      const criterionResult = {
        criterion_id: criterion.id,
        question: criterion.question,
        tests_executed: 0,
        violations: [],
        passed: true,
      }

      // Execute each test for this criterion
      for (const test of criterionTests) {
        results.total_tests_executed++
        criterionResult.tests_executed++

        const preference = toolSelection[test.id] || 'automated'
        const testResult = await executeTest(test, pageData, tools, preference)

        if (testResult.skipped) {
          criterionResult.skipped = true
          continue
        }

        if (testResult.requiresManualReview) {
          criterionResult.requires_manual_review = true
          continue
        }

        if (!testResult.passed) {
          criterionResult.passed = false
        }

        criterionResult.violations.push(...testResult.violations)
        if (testResult.passed) {
          results.passed_tests.push(test.id)
        }
      }

      // Aggregate violations
      if (criterionResult.violations.length > 0) {
        results.violations.push(...criterionResult.violations)
      }

      results.criteria_survey.push(criterionResult)
    }
  }

  return results
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  loadCriteria,
  loadTests,
  loadTools,
  getTestsForCriterion,
  getToolsForTest,
  executeTest,
  executeAutomatedTest,
  validateCriteria,
}
