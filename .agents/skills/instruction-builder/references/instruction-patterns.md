# Instruction Patterns

This document provides proven patterns for different types of `.instructions.md` files.

## Pattern Categories

### 1. Code Style and Formatting

For enforcing consistent code style, formatting rules, and conventions.

**Structure:**

```yaml
---
description: [Language] code style following [standard/guide] with [tools]. Use for [file pattern] requiring [specific approach].
applyTo: "[file pattern]"
---

## Style Requirements

1. [Formatting rule with tool]
2. [Naming convention]
3. [Documentation standard]
4. [Import/organization rule]

## Examples

### Good
[Code example showing correct style]

### Avoid
[Code example showing what not to do]
```

**Key elements:**

- Concrete tool names (Black, Prettier, ESLint)
- Specific line lengths, indent sizes
- Import ordering rules
- Documentation format (JSDoc, docstrings, etc.)

### 2. Testing Standards

For defining test structure, naming, coverage, and quality standards.

**Structure:**

```yaml
---
description: [Framework] test patterns for [component type] using [approach]. Use when writing or reviewing test files.
applyTo: ["[test pattern 1]", "[test pattern 2]"]
---

## Test Structure

### File Organization
[How to organize test files]

### Naming Conventions
- Test files: [pattern]
- Test cases: [pattern]
- Fixtures: [pattern]

## Patterns

### [Pattern Name 1]
[When to use and example]

### [Pattern Name 2]
[When to use and example]

## Coverage Requirements
[What must be tested]
```

**Key elements:**

- Clear AAA (Arrange-Act-Assert) or equivalent structure
- Fixture usage patterns
- Mocking strategies
- Assertion specificity
- Coverage expectations

### 3. Documentation Standards

For API docs, technical documentation, and inline code comments.

**Structure:**

````yaml
---
description: Documentation standards for [type] with [required sections]. Use when creating or updating [doc type].
applyTo: "[doc file pattern]"
---

## Required Sections

1. **[Section 1]**
   - What to include
   - Format requirements

2. **[Section 2]**
   - Content guidelines
   - Examples

## Templates

### [Doc Type 1]
```markdown
[Template content]
````

### [Doc Type 2]

```markdown
[Template content]
```

## Quality Checklist

- [ ] [Requirement 1]
- [ ] [Requirement 2]

````

**Key elements:**
- Required vs optional sections
- Formatting standards
- Code example requirements
- Link to related docs
- Audience-appropriate language

### 4. Architecture and Design Patterns

For enforcing architectural decisions, design patterns, and code organization.

**Structure:**
```yaml
---
description: [Architecture pattern] for [component type] following [principles]. Use when implementing [specific features].
applyTo: "[file pattern]"
---

## Core Principles

1. **[Principle 1]**: [Explanation]
2. **[Principle 2]**: [Explanation]

## Structure

### Directory Organization
[Expected structure]

### Component Responsibilities
- **[Component Type 1]**: [Responsibility]
- **[Component Type 2]**: [Responsibility]

## Patterns

### [Pattern Name]
**When**: [Usage scenario]
**How**: [Implementation approach]
**Example**:
[Code example]

## Anti-Patterns
[What to avoid and why]
````

**Key elements:**

- Clear separation of concerns
- Dependency direction rules
- Interface definitions
- Error handling approaches
- State management patterns

### 5. Security Guidelines

For security requirements, vulnerability prevention, and secure coding practices.

**Structure:**

```yaml
---
description: Security guidelines for [component type] covering [security aspects]. Invoke when reviewing security-sensitive code.
---

## Security Checklist

### Input Validation
- [ ] [Specific validation requirement]
- [ ] [Another requirement]

### Authentication & Authorization
- [ ] [Auth requirement]
- [ ] [Permission check]

### Data Protection
- [ ] [Data handling rule]
- [ ] [Encryption requirement]

## Common Vulnerabilities

### [Vulnerability Type]
**Risk**: [Description]
**Prevention**: [How to avoid]
**Example**:
[Secure code example]

## Security Testing
[How to verify security]
```

**Key elements:**

- Specific rather than general advice
- OWASP Top 10 coverage (where applicable)
- Input validation rules
- Output encoding requirements
- Authentication/authorization checks
- Secrets management

### 6. API Design Standards

For REST API, GraphQL, or internal API design consistency.

**Structure:**

```yaml
---
description: API design standards for [API type] following [conventions]. Use when designing or implementing API endpoints.
applyTo: "[API file pattern]"
---

## Endpoint Design

### Naming
- Pattern: [URL pattern]
- Verbs: [HTTP methods usage]
- Resources: [Naming conventions]

### Request/Response

**Request Format**:
[Structure and requirements]

**Response Format**:
[Standard structure]

**Error Format**:
[Error response structure]

## Versioning
[Versioning approach]

## Examples

### [Endpoint Type 1]
[Complete example with request/response]

### [Endpoint Type 2]
[Complete example with request/response]
```

**Key elements:**

- RESTful conventions or GraphQL patterns
- Naming consistency
- Error handling standardization
- Pagination approach
- Filtering and sorting
- Authentication method

### 7. Database Patterns

For database schema, query patterns, and data access standards.

**Structure:**

```yaml
---
description: Database patterns for [database type] using [ORM/approach]. Use when implementing data access or schema changes.
applyTo: "[db file pattern]"
---

## Schema Standards

### Naming Conventions
- Tables: [convention]
- Columns: [convention]
- Indexes: [convention]

### Required Fields
[Common fields all tables should have]

## Query Patterns

### [Pattern Name 1]
**Use for**: [Scenario]
**Pattern**:
[Query example]

### [Pattern Name 2]
**Use for**: [Scenario]
**Pattern**:
[Query example]

## Migrations
[How to handle schema changes]

## Performance
[Indexing, query optimization guidelines]
```

**Key elements:**

- Naming conventions
- Index strategies
- Join patterns
- Transaction handling
- Migration approach
- Performance considerations

### 8. Error Handling Standards

For consistent error handling, logging, and debugging approaches.

**Structure:**

```yaml
---
description: Error handling standards for [language/framework] with [approach]. Use when implementing error handling logic.
applyTo: "[file pattern]"
---

## Error Categories

### [Category 1]
- When: [Scenario]
- Handle by: [Approach]
- Log level: [Level]

### [Category 2]
- When: [Scenario]
- Handle by: [Approach]
- Log level: [Level]

## Logging Standards

### Format
[Log message format]

### Context
[What to include in logs]

### Levels
- ERROR: [When to use]
- WARN: [When to use]
- INFO: [When to use]
- DEBUG: [When to use]

## Examples

### [Scenario 1]
[Error handling example]

### [Scenario 2]
[Error handling example]
```

**Key elements:**

- When to catch vs propagate
- Error message standards
- Logging levels and content
- Stack trace handling
- User-facing error messages
- Recovery strategies

### 9. Performance Optimization

For performance requirements, optimization guidelines, and benchmarking standards.

**Structure:**

```yaml
---
description: Performance optimization guidelines for [component type] with [requirements]. Use when optimizing performance-critical code.
applyTo: "[file pattern]"
---

## Performance Targets

- [Metric 1]: [Target value]
- [Metric 2]: [Target value]

## Optimization Strategies

### [Strategy 1]
**When**: [Scenario]
**Approach**: [How to optimize]
**Measurement**: [How to verify]

### [Strategy 2]
**When**: [Scenario]
**Approach**: [How to optimize]
**Measurement**: [How to verify]

## Anti-Patterns
[Premature optimizations to avoid]

## Profiling
[How to measure and benchmark]
```

**Key elements:**

- Specific performance targets
- Profiling techniques
- Common bottlenecks
- Caching strategies
- Query optimization
- Resource management

### 10. Code Review Checklist

For guiding code review processes and ensuring consistent review quality.

**Structure:**

```yaml
---
description: Code review checklist for [language/framework] covering [aspects]. Invoke when reviewing code changes.
---

## Review Checklist

### Functionality
- [ ] [Functional requirement check]
- [ ] [Edge case consideration]
- [ ] [Error handling verification]

### Code Quality
- [ ] [Readability check]
- [ ] [DRY principle]
- [ ] [Naming conventions]

### Testing
- [ ] [Test coverage]
- [ ] [Test quality]

### Performance
- [ ] [Performance consideration]

### Security
- [ ] [Security check]

## Review Process

1. **First Pass**: [What to check]
2. **Detailed Review**: [What to check]
3. **Final Check**: [What to verify]

## Feedback Guidelines
[How to provide constructive feedback]
```

**Key elements:**

- Categorized checklist items
- Clear acceptance criteria
- Constructive feedback approach
- Priority levels (blocking vs non-blocking)
- Review turnaround expectations

## Combining Patterns

Instructions can combine multiple patterns. For example:

**Testing + Security**:

```yaml
---
description: Security test patterns for API authentication with penetration testing approaches. Use when testing auth-related code.
applyTo: ["**/test_auth*.py", "**/security/*_test.py"]
---

## Test Structure
[Testing pattern content]

## Security Test Cases
[Security pattern content]
```

**Style + Performance**:

```yaml
---
description: React component patterns with performance optimization and style guidelines. Use for React components.
applyTo: "src/components/**/*.tsx"
---

## Component Structure
[Style/architecture content]

## Performance Requirements
[Performance pattern content]
```

## Pattern Selection Guide

Choose pattern based on primary goal:

| Goal                       | Pattern                  |
| -------------------------- | ------------------------ |
| Enforce formatting/linting | Code Style               |
| Define test approaches     | Testing Standards        |
| Standardize docs           | Documentation Standards  |
| Guide architecture         | Architecture Patterns    |
| Prevent vulnerabilities    | Security Guidelines      |
| Consistent API design      | API Design Standards     |
| Data access patterns       | Database Patterns        |
| Error consistency          | Error Handling           |
| Optimize performance       | Performance Optimization |
| Review quality             | Code Review Checklist    |

Combine patterns when multiple goals apply to the same files.
