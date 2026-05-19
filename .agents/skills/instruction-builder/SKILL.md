---
name: instruction-builder
description: Guide users through creating custom .instructions.md files for VS Code agent customization. Use when users want to create file-based instructions, save coding preferences, define workflows for specific file types, or establish project-specific patterns. Provides structured interview process to gather requirements and generate comprehensive instructions.
---

# Instruction Builder

## Overview

This skill guides users through an interactive interview process to create high-quality `.instructions.md` files for VS Code agent customization. It asks targeted questions to understand the context, scope, and requirements, then generates comprehensive instruction files.

## Interview Process

Follow this workflow when helping users create custom instructions:

### 1. Understand the Goal

Ask clarifying questions to understand what the user wants to achieve:

- **What behavior or workflow are you trying to define?** (e.g., "Code review guidelines", "API testing patterns", "Documentation standards")
- **What triggers this instruction?** (file types, file patterns, specific scenarios)
- **Who will use this?** (just you, or shared across a team)

### 2. Determine Scope and Location

Based on user responses, determine the appropriate scope:

**File-based instructions** (`.instructions.md`) when:

- Applies to specific file types or patterns (`applyTo` field)
- User requests on-demand via description
- Needs to be selectively applied

**Workspace instructions** (`copilot-instructions.md` or `AGENTS.md`) when:

- Always-on for the entire project
- Project-wide conventions
- Team-shared standards

Ask: **"Should this apply automatically to specific files, or only when you explicitly request it?"**

If file-based, determine location:

- **Workspace**: `.github/instructions/` (for team-shared)
- **User profile**: `~/Library/Application Support/Code - Insiders/User/prompts/` (personal, cross-workspace)

### 3. Gather Requirements

For comprehensive instructions, collect these details:

#### Core Requirements

- **Primary goal**: What should Claude do differently?
- **Key constraints**: What rules, standards, or limitations apply?
- **Success criteria**: How to know the instruction is followed correctly?

#### Context Details

- **File patterns** (if file-based): `*.py`, `src/**/*.test.ts`, specific paths?
- **Language/framework specifics**: Python linting rules, React patterns, API conventions?
- **Tools or dependencies**: Required libraries, formatters, testing frameworks?
- **Examples**: Concrete before/after examples of desired behavior

#### Advanced Options (if relevant)

- **Tool restrictions**: Should certain tools be disabled? (e.g., no terminal access)
- **Priority level**: How important vs other instructions?
- **Dependencies**: Does this build on other instructions or skills?

Use the `ask_questions` tool to efficiently gather this information. Group related questions (max 4 at once) to avoid overwhelming the user.

### 4. Structure the Instruction

Build the instruction file with these components:

#### YAML Frontmatter (Required)

```yaml
---
description: [Clear, comprehensive description for triggering/discovery]
applyTo: [File patterns - optional, for explicit triggering]
---
```

**Description best practices:**

- Include what, when, and why
- Use concrete examples: "Use when reviewing Python API tests" rather than "For code review"
- Front-load important keywords
- Make it discoverable - think "what would the user say?"

**applyTo patterns:**

- `*.py` - all Python files
- `src/**/*.test.ts` - all test files under src/
- `docs/*.md` - markdown files in docs folder
- Can specify multiple patterns in array

#### Body Structure

Organize content based on complexity:

**Simple instructions** (< 10 rules):

```markdown
## Guidelines

1. Rule one with example
2. Rule two with example
3. Rule three with example
```

**Complex instructions** (> 10 rules):

```markdown
## Overview

Brief context (1-2 sentences)

## Core Principles

High-level guidelines (3-5 items)

## Detailed Rules

### Category 1

Specific rules with examples

### Category 2

More specific rules

## Examples

Before/after or complete examples
```

**Process-driven instructions**:

```markdown
## Workflow

1. **Step 1**: Action to take
   - Substep details
2. **Step 2**: Next action
   - Substep details

## Validation

How to verify correct implementation
```

### 5. Generate and Validate

Create the instruction file:

1. Place in correct location (`.github/instructions/` or user folder)
2. Include complete YAML frontmatter
3. Write clear, actionable body content
4. Use imperative voice ("Use X", "Ensure Y", "Validate Z")
5. Include concrete examples where helpful

After creation, validate:

- YAML syntax is correct (between `---` markers)
- Description is comprehensive and triggering
- `applyTo` patterns are accurate (if used)
- Body content is clear and actionable

## Common Patterns

### Code Style Instructions

```yaml
---
description: Python code style following PEP 8, with Black formatting and type hints. Use for Python files requiring strict style compliance.
applyTo: "*.py"
---

## Style Requirements

1. Format with Black (line length: 88)
2. Add type hints for all function signatures
3. Use docstrings (Google style) for public functions
4. Organize imports: stdlib, third-party, local
```

### Testing Patterns

```yaml
---
description: API test patterns using pytest with fixtures, mocking, and parametrization. Use when writing or reviewing test files.
applyTo: ["**/*_test.py", "**/test_*.py"]
---

## Test Structure

1. **Arrange**: Setup using fixtures
2. **Act**: Call function under test
3. **Assert**: Verify behavior with specific assertions

## Fixture Usage
[Examples...]
```

### Documentation Standards

```yaml
---
description: Technical documentation standards for API endpoints with examples, error cases, and auth requirements. Use when creating or updating API docs.
applyTo: 'docs/api/*.md'
---
## Required Sections
[Content...]
```

### On-Demand Instructions

```yaml
---
description: Security review checklist for authentication and authorization code. Invoke explicitly when reviewing security-sensitive changes.
---
## Security Checklist
[Items without applyTo trigger only when user explicitly requests]
```

## Reference Files

For detailed information on instruction file patterns and examples:

- See [references/instruction-patterns.md](references/instruction-patterns.md) for proven patterns
- See [references/frontmatter-guide.md](references/frontmatter-guide.md) for complete frontmatter options
- See [references/examples.md](references/examples.md) for real-world examples across domains

## Tips for Effective Instructions

1. **Be specific over general**: "Use dataclasses for DTOs" > "Follow Python best practices"
2. **Include rationale when non-obvious**: Explain _why_ a rule exists
3. **Provide examples**: Show don't just tell
4. **Test the trigger**: Would you say the description when needing this instruction?
5. **Keep focused**: One clear purpose per instruction file
6. **Use imperative voice**: "Validate inputs" not "Inputs should be validated"
