# Agent Patterns

Proven patterns for different types of custom agents.

## Pattern Categories

### 1. Research & Discovery Agents

Gather information, analyze codebases, and synthesize findings.

**Characteristics:**

- Read-only access (typically)
- Focus on information gathering
- Structured output reports
- Citation of sources

**Common tool restrictions:**

```yaml
allowedTools:
  - read_file
  - list_dir
  - grep_search
  - semantic_search
  - file_search
  - fetch_webpage
  - github_repo
```

**Use cases:**

- Technical research
- Codebase analysis
- Documentation discovery
- API exploration
- Dependency analysis

**Output format:**

```markdown
# Research Report

## Summary

Brief overview (2-3 sentences)

## Findings

Organized by topic or priority

## Sources

- File paths with relevance
- URLs with context

## Recommendations

Actionable insights
```

### 2. Code Generation Agents

Create new code following specific patterns or requirements.

**Characteristics:**

- Full file creation access
- Pattern-based generation
- Template utilization
- Style enforcement

**Common tools needed:**

- `create_file`
- `read_file` (for templates/patterns)
- `semantic_search` (for existing patterns)
- `list_code_usages` (for interface conformance)

**Use cases:**

- Boilerplate generation
- Test scaffolding
- API endpoint creation
- Component generation
- Migration scripts

**Structure:**

```yaml
---
name: test-generator
description: Generate comprehensive test suites following project patterns
---

## Purpose
Generate tests conforming to project standards

## Process
1. Analyze existing test patterns
2. Identify code to test
3. Generate test cases (happy path, edge cases, errors)
4. Apply project style

## Test Structure
[Template showing test organization]

## Coverage Requirements
- All public methods
- Edge cases
- Error scenarios
```

### 3. Code Review Agents

Analyze existing code for quality, security, and best practices.

**Characteristics:**

- Read-only access (critical)
- Security-focused
- Pattern recognition
- Structured feedback

**Tool restrictions:**

```yaml
disabledTools:
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
  - install_python_packages
```

**Use cases:**

- Security audits
- Code quality reviews
- Best practices validation
- Performance analysis
- Dependency audits

**Review framework:**

```markdown
## Review Categories

### Security

- Input validation
- Authentication/authorization
- Injection prevention
- Data protection

### Quality

- Code clarity
- Error handling
- Test coverage
- Documentation

### Performance

- Algorithmic complexity
- Database queries
- Resource usage
- Caching opportunities

### Maintainability

- DRY principle
- SOLID principles
- Clear naming
- Appropriate abstractions
```

### 4. Refactoring Agents

Improve existing code structure and quality.

**Characteristics:**

- File modification access
- Pattern recognition
- Incremental changes
- Safety-focused

**Common tools:**

- `replace_string_in_file`
- `multi_replace_string_in_file`
- `read_file`
- `get_errors` (validation)
- `list_code_usages` (impact analysis)

**Use cases:**

- Extract functions/classes
- Rename for clarity
- Remove duplication
- Apply design patterns
- Update deprecated APIs

**Safety workflow:**

```markdown
## Refactoring Process

1. **Analyze**: Understand current code
2. **Plan**: Determine refactoring steps
3. **Check Usage**: Find all usages with list_code_usages
4. **Refactor**: Make incremental changes
5. **Validate**: Check for errors with get_errors
6. **Test**: Ensure tests still pass

## Safety Rules

- One change at a time
- Validate after each change
- Preserve behavior
- Update all usages
```

### 5. Testing Agents

Execute tests, analyze results, and generate test reports.

**Characteristics:**

- Terminal access needed
- Test execution capability
- Result parsing
- Coverage analysis

**Common tools:**

- `run_in_terminal`
- `read_file` (for test files)
- `get_errors` (for test failures)
- `replace_string_in_file` (for fixing tests)

**Use cases:**

- Run test suites
- Analyze failures
- Generate coverage reports
- Fix failing tests
- Performance testing

**Test workflow:**

````markdown
## Testing Process

1. **Discover Tests**: Find test files
2. **Execute**: Run tests with appropriate command
3. **Parse Results**: Analyze output
4. **Report Failures**: Structure failure information
5. **Suggest Fixes**: Provide remediation

## Output Format

```markdown
# Test Results

## Summary

- Total: X tests
- Passed: Y
- Failed: Z
- Coverage: N%

## Failures

### Test: test_function_name

**Error**: [Error message]
**Location**: [File:line]
**Cause**: [Analysis]
**Fix**: [Suggested solution]
```
````

````

### 6. Documentation Agents

Generate or update documentation from code and context.

**Characteristics:**
- Code analysis capability
- File creation/modification
- Template-based generation
- Structured formatting

**Common tools:**
- `read_file`
- `create_file`
- `replace_string_in_file`
- `semantic_search`
- `list_code_usages`

**Use cases:**
- API documentation
- README generation
- Inline documentation
- Architecture docs
- Tutorial creation

**Documentation structure:**
```markdown
## Documentation Types

### API Documentation
- Endpoint descriptions
- Request/response formats
- Authentication details
- Error codes
- Usage examples

### Code Documentation
- Function/method docstrings
- Class descriptions
- Module overviews
- Type annotations

### Architecture Documentation
- System overview
- Component relationships
- Data flow
- Deployment architecture
````

### 7. Orchestrator Agents

Coordinate multiple subagents for complex workflows.

**Characteristics:**

- Subagent invocation
- Workflow management
- Result integration
- Error handling

**Key capability:**

- `runSubagent` tool

**Use cases:**

- Multi-phase feature development
- Complex analysis pipelines
- Iterative refinement workflows
- Parallel task execution

**Orchestration pattern:**

```yaml
---
name: feature-orchestrator
description: Coordinates planning, implementation, testing, and documentation for complete features
---

## Workflow

### Phase 1: Research & Planning
**Invoke**: research-agent
**Input**: Feature requirements
**Output**: Implementation plan
**Success criteria**: Clear architecture documented

### Phase 2: Implementation
**Invoke**: coding-agent
**Input**: Implementation plan
**Output**: Working code
**Success criteria**: Code passes linting

### Phase 3: Testing
**Invoke**: test-generator-agent
**Input**: Implemented code
**Output**: Test suite
**Success criteria**: Tests pass with good coverage

### Phase 4: Documentation
**Invoke**: documentation-agent
**Input**: Code + tests
**Output**: Complete docs
**Success criteria**: All sections complete

## Integration

Combine outputs:
1. Code in src/
2. Tests in tests/
3. Docs in docs/
4. Summary report

## Error Handling

If any phase fails:
1. Report failure details
2. Attempt remediation if possible
3. Escalate to user if blocked
```

### 8. Specialized Domain Agents

Expert agents for specific technical domains.

**Examples:**

#### Security Agent

```yaml
---
name: security-auditor
description: Security expert that audits code for vulnerabilities, compliance issues, and best practices
disabledTools:
  - run_in_terminal
  - create_file
  - replace_string_in_file
---

## Security Focus Areas

### OWASP Top 10
1. Injection vulnerabilities
2. Broken authentication
3. Sensitive data exposure
4. XML external entities
5. Broken access control
6. Security misconfiguration
7. XSS vulnerabilities
8. Insecure deserialization
9. Known vulnerable components
10. Insufficient logging

### Audit Process
1. Scan for common vulnerabilities
2. Review authentication/authorization
3. Check data protection
4. Verify input validation
5. Assess error handling
6. Review logging practices

## Output: Security Report
[Structured findings with severity levels]
```

#### Performance Agent

```yaml
---
name: performance-profiler
description: Performance expert that profiles code, identifies bottlenecks, and recommends optimizations
---
## Profiling Areas

### Computational Performance
- Algorithm complexity
- Loop optimizations
- Unnecessary computations

### Database Performance
- N+1 query detection
- Missing indexes
- Query optimization

### Memory Performance
- Memory leaks
- Excessive allocations
- Cache efficiency

### I/O Performance
- Async opportunities
- Batch operations
- Connection pooling
```

#### API Design Agent

```yaml
---
name: api-designer
description: API design expert that creates RESTful APIs following best practices and consistency standards
---
## API Design Principles

### RESTful Conventions
- Resource naming
- HTTP method usage
- Status codes
- Versioning strategy

### Consistency
- Naming patterns
- Error formats
- Pagination approach
- Filtering/sorting

### Documentation
- OpenAPI/Swagger specs
- Request/response examples
- Error documentation
```

### 9. Interactive Assistant Agents

Agents that guide users through complex processes.

**Characteristics:**

- Question asking capability
- Progressive disclosure
- User feedback integration
- Step-by-step guidance

**Use with:**

- `ask_questions` tool

**Use cases:**

- Setup wizards
- Configuration builders
- Troubleshooting guides
- Migration assistants

**Interactive pattern:**

```markdown
## Interactive Process

### Phase 1: Gather Requirements

Ask targeted questions:

- What is your goal?
- What constraints exist?
- What's your experience level?

### Phase 2: Generate Plan

Based on answers, create customized plan

### Phase 3: Execute

Guide through implementation with checkpoints

### Phase 4: Validate

Verify completion and success
```

### 10. Migration Agents

Transform code from one pattern/version to another.

**Characteristics:**

- Code transformation
- Version awareness
- Backward compatibility
- Validation

**Common tools:**

- `replace_string_in_file`
- `multi_replace_string_in_file`
- `list_code_usages`
- `get_errors`

**Use cases:**

- Framework upgrades
- API version migrations
- Pattern modernization
- Dependency updates

**Migration workflow:**

```markdown
## Migration Process

1. **Inventory**: Identify all code to migrate
2. **Analyze**: Understand current patterns
3. **Plan**: Determine transformation steps
4. **Transform**: Apply changes incrementally
5. **Validate**: Ensure code still works
6. **Document**: Record migration details

## Safety Measures

- Create backup/branch first
- Migrate incrementally
- Run tests after each change
- Document breaking changes
```

## Pattern Selection Guide

| Goal                   | Pattern Type  | Tools Needed            |
| ---------------------- | ------------- | ----------------------- |
| Gather information     | Research      | Read-only               |
| Create new code        | Generator     | Create files            |
| Analyze code quality   | Reviewer      | Read-only               |
| Improve code structure | Refactoring   | Modify files            |
| Run and verify tests   | Testing       | Terminal + Read         |
| Create docs            | Documentation | Create/modify files     |
| Multi-stage workflow   | Orchestrator  | Subagent invocation     |
| Domain expertise       | Specialized   | Depends on domain       |
| User guidance          | Interactive   | Questions + Read        |
| Code transformation    | Migration     | Modify files + Analysis |

## Combining Patterns

Agents often combine multiple patterns:

**Example: Full-Stack Feature Agent**

- Research (analyze existing code)
- Generation (create new code)
- Testing (generate and run tests)
- Documentation (create docs)

**Example: Security Review + Fix Agent**

- Review (identify vulnerabilities)
- Refactoring (fix issues)
- Testing (verify fixes)
- Documentation (security notes)

## Best Practices

1. **Single responsibility**: One primary purpose per agent
2. **Clear boundaries**: Know what agent does and doesn't do
3. **Appropriate tools**: Match tool access to security needs
4. **Structured output**: Consistent, parseable formats
5. **Error handling**: Graceful failure with useful messages
6. **Examples**: Show concrete usage scenarios
7. **Progressive disclosure**: Reference details, don't embed everything
