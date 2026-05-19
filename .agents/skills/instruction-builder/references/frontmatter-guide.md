# Frontmatter Guide

Complete reference for YAML frontmatter fields in `.instructions.md` files.

## Required Fields

### description

**Purpose**: Primary mechanism for Claude to discover and trigger the instruction.

**Format**: String (single or multi-line)

**Best practices**:

- Be comprehensive - include what, when, and why
- Front-load important keywords
- Use concrete terminology
- Think "what would a user say?"
- Include file types, frameworks, or specific scenarios

**Examples**:

Good:

```yaml
description: Python code style following PEP 8, with Black formatting and type hints. Use for Python files requiring strict style compliance.
```

Good (multi-line):

```yaml
description: |
  API test patterns using pytest with fixtures, mocking, and parametrization.
  Use when writing or reviewing test files for REST APIs.
  Covers authentication, error cases, and async operations.
```

Too vague:

```yaml
description: Code style guidelines
```

Too generic:

```yaml
description: Use for Python files
```

## Optional Fields

### applyTo

**Purpose**: Automatically applies instruction to files matching the pattern(s).

**Format**: String or array of strings (glob patterns)

**When to use**:

- For files that should ALWAYS follow this instruction
- When the instruction is specific to certain file types
- For project-wide conventions on specific files

**When to omit**:

- For on-demand instructions (invoked explicitly)
- When you want selective application
- For instructions that apply broadly but contextually

**Patterns**:

Single pattern:

```yaml
applyTo: '*.py'
```

Multiple patterns:

```yaml
applyTo:
  - '*.py'
  - '*.pyi'
```

Nested patterns:

```yaml
applyTo: 'src/**/*.test.ts'
```

Multiple file types:

```yaml
applyTo:
  - '**/*_test.py'
  - '**/test_*.py'
  - 'tests/**/*.py'
```

Specific directories:

```yaml
applyTo:
  - 'docs/api/*.md'
  - 'docs/guides/*.md'
```

**Glob pattern reference**:

- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/` (recursive)
- `?` - Matches single character
- `[abc]` - Matches any character in brackets
- `{a,b}` - Matches either pattern

**Examples**:

```yaml
# All Python files
applyTo: "*.py"

# All test files in src/
applyTo: "src/**/*.test.ts"

# Multiple patterns
applyTo:
  - "**/*.test.js"
  - "**/*.spec.js"

# Specific directory structure
applyTo: "src/components/**/*.tsx"

# Multiple directories
applyTo:
  - "backend/**/*.py"
  - "api/**/*.py"
```

### name

**Purpose**: Human-readable name for the instruction (optional, for organization).

**Format**: String

**When to use**:

- For clarity in large instruction sets
- When managing many instructions
- For team documentation

**Example**:

```yaml
name: Python API Testing Standards
description: API test patterns using pytest...
applyTo: '**/*_api_test.py'
```

### priority

**Purpose**: Controls instruction precedence when multiple instructions apply.

**Format**: Number (higher = higher priority)

**Default**: 0

**When to use**:

- Multiple instructions overlap
- Need to override broader instructions
- Specific cases should override general rules

**Example**:

```yaml
# General Python style (priority 0, default)
---
description: General Python code style
applyTo: '*.py'
---
# Specific test style (priority 10, overrides above)
---
description: Python test style with specific patterns
applyTo: '**/*_test.py'
priority: 10
---
```

### disabledTools

**Purpose**: Restricts which tools Claude can use when this instruction is active.

**Format**: Array of tool names

**When to use**:

- Security-sensitive instructions
- Read-only review processes
- Controlled environments

**Available tool categories**:

- File operations: `create_file`, `replace_string_in_file`, `multi_replace_string_in_file`
- Terminal: `run_in_terminal`, `install_python_packages`
- Search: `grep_search`, `semantic_search`, `file_search`
- Code analysis: `list_code_usages`, `get_errors`
- Git: `get_changed_files`

**Example**:

```yaml
description: Code review checklist - read-only analysis
disabledTools:
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
```

### allowedTools

**Purpose**: Explicitly allows ONLY specified tools (all others disabled).

**Format**: Array of tool names

**When to use**:

- Very restrictive requirements
- Specialized workflows
- Safety-critical operations

**Example**:

```yaml
description: Read-only documentation review
allowedTools:
  - read_file
  - grep_search
  - semantic_search
```

**Note**: Use `disabledTools` (blocklist) or `allowedTools` (allowlist), not both.

### metadata

**Purpose**: Custom metadata for organization or tooling integration.

**Format**: Object with arbitrary key-value pairs

**When to use**:

- Team organization
- Custom tooling integration
- Categorization

**Example**:

```yaml
metadata:
  owner: backend-team
  category: testing
  lastReviewed: 2026-01-15
  version: 2.1
```

## Complete Examples

### Minimal (on-demand instruction)

```yaml
---
description: Security review checklist for authentication code. Invoke when reviewing auth-related changes.
---
```

### Basic (file-triggered)

```yaml
---
description: Python PEP 8 style with Black formatting and type hints
applyTo: '*.py'
---
```

### Comprehensive

```yaml
---
name: API Test Standards
description: |
  Comprehensive API testing patterns using pytest with fixtures, mocking,
  and async support. Use when writing or reviewing API test files.
  Covers authentication, error handling, and integration patterns.
applyTo:
  - 'tests/api/**/*.py'
  - '**/*_api_test.py'
priority: 10
metadata:
  owner: qa-team
  category: testing
  framework: pytest
  version: 3.0
---
```

### Security-focused (with tool restrictions)

```yaml
---
description: Security audit checklist for authentication and authorization code. Read-only review with security focus.
applyTo:
  - 'auth/**/*.py'
  - 'security/**/*.py'
disabledTools:
  - create_file
  - replace_string_in_file
  - run_in_terminal
  - install_python_packages
metadata:
  securityLevel: critical
  reviewRequired: true
---
```

### Specialized workflow

```yaml
---
name: Database Migration Review
description: |
  Database migration standards following backward-compatibility rules.
  Use when reviewing or creating Alembic migration files.
  Enforces zero-downtime deployment patterns.
applyTo: 'alembic/versions/*.py'
priority: 15
disabledTools:
  - run_in_terminal # No automatic migrations
metadata:
  owner: database-team
  requiresApproval: dba
  riskLevel: high
---
```

## Field Validation

Valid YAML frontmatter structure:

```yaml
---
[field]: [value]
[field]: [value]
---
```

**Common errors**:

Missing closing `---`:

```yaml
---
description: Test
# Missing closing --- causes parsing error
```

Invalid YAML syntax:

```yaml
---
description: Unquoted: colon causes error
---
```

Array vs string confusion:

```yaml
# Wrong - string treated as single pattern
applyTo: "*.py, *.pyi"

# Right - array of patterns
applyTo:
  - "*.py"
  - "*.pyi"
```

## Frontmatter Design Best Practices

1. **Description is critical**: Most important field for discoverability
2. **applyTo = automatic**: Use when you want automatic application
3. **No applyTo = on-demand**: User explicitly invokes
4. **Be specific**: Narrow scope = clearer behavior
5. **Test discoverability**: Would you say the description?
6. **Use priority sparingly**: Only when needed for conflicts
7. **Tool restrictions for safety**: Consider disabledTools for sensitive operations
8. **Metadata for organization**: Helpful for teams and tooling
