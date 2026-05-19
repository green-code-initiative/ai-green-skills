---
name: agent-builder
description: Guide users through creating custom VS Code agents with specialized capabilities, tool restrictions, and subagent workflows. Use when users want to create agent modes, define specialized workflows with context isolation, or build multi-stage agent systems with different tool access per stage. Provides structured interview process for comprehensive agent development.
---

# Agent Builder

## Overview

This skill guides users through an interactive interview process to create high-quality `.agent.md` files for custom VS Code agents. It helps design agents with specialized capabilities, tool restrictions, subagent coordination, and multi-stage workflows.

## Agent Use Cases

Create custom agents for:

- **Specialized workflows**: Research, code generation, testing, documentation
- **Context isolation**: Subagents that return focused results
- **Tool restrictions**: Read-only review, no-terminal execution, specific tool sets
- **Multi-stage processes**: Planning → Implementation → Review
- **Domain expertise**: Security auditing, performance profiling, API design

## Interview Process

Follow this workflow when helping users create custom agents:

### 1. Understand the Purpose

Ask clarifying questions to understand the agent's mission:

- **What is the agent's primary goal?** (e.g., "Research and summarize", "Generate test cases", "Security audit")
- **What makes this agent different from the default agent?** (specialized knowledge, restricted tools, specific workflow)
- **Is this a standalone agent or a subagent?**
  - **Standalone**: User explicitly invokes by name
  - **Subagent**: Called by other agents via `runSubagent` tool

### 2. Determine Invocation Method

Based on user responses, determine how the agent is triggered:

**On-demand agents** (user-invoked):

- User explicitly requests agent by name or description
- Set `infer: false` (default)
- Description is critical for discovery

**Subagents** (inferred by other agents):

- Called by other agents via `runSubagent` tool
- Set `infer: true`
- Description guides other agents when to use

Ask: **"Will users invoke this agent directly, or will other agents call it automatically?"**

### 3. Define Scope and Location

Determine where the agent file should live:

**Workspace agents** (`.agents/agents/`):

- Project-specific, team-shared
- Workspace-relevant expertise

**User agents** (`~/Library/Application Support/Code - Insiders/User/prompts/`):

- Personal, cross-workspace
- User's preferred workflows

Ask: **"Is this agent specific to this project, or a personal workflow you want across all projects?"**

### 4. Gather Requirements

Collect comprehensive details about the agent:

#### Core Capabilities

- **Primary function**: What does the agent do?
- **Specialized knowledge**: Domain expertise, frameworks, standards
- **Expected inputs**: What information does the agent need?
- **Expected outputs**: What does the agent deliver?

#### Tool Access

- **Full access**: All tools available (default)
- **Restricted access**: Specific tools only (use `allowedTools`)
- **Blocked tools**: Exclude dangerous operations (use `disabledTools`)

Common restrictions:

- **Read-only**: Disable `create_file`, `replace_string_in_file`, `run_in_terminal`
- **No terminal**: Disable `run_in_terminal`, `install_python_packages`
- **Research only**: Enable only search and read tools
- **Safe execution**: Disable file modifications, allow code analysis

#### Workflow Structure

- **Single-stage**: One continuous process
- **Multi-stage**: Multiple phases (plan → execute → verify)
- **Subagent coordination**: Delegates to specialized subagents

#### Context Requirements

- **Workspace context**: Needs access to codebase
- **Isolated context**: Subagent returns focused result
- **Progressive disclosure**: Loads references as needed

Use the `ask_questions` tool to efficiently gather this information.

### 5. Structure the Agent

Build the agent file with these components:

#### YAML Frontmatter (Required)

```yaml
---
name: agent-name
description: [Clear explanation of what agent does and when to use it]
infer: [true for subagents, false or omit for user-invoked]
disabledTools: [optional - tools to block]
allowedTools: [optional - tools to allow (all others blocked)]
---
```

**Description best practices:**

- Explain the agent's purpose and expertise
- Include when other agents should use it (for subagents)
- Use concrete examples: "Research Python security vulnerabilities" vs "Security agent"
- Front-load keywords for discoverability

**Tool restriction patterns:**

Read-only agent:

```yaml
disabledTools:
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
  - install_python_packages
```

Research agent (search & read only):

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

Safe code analyzer:

```yaml
disabledTools:
  - run_in_terminal
  - install_python_packages
  - create_file
  - replace_string_in_file
```

#### Body Structure

Organize content based on agent type:

**Simple agent** (single clear task):

```markdown
## Purpose

Brief description (1-2 sentences)

## Approach

1. Step one
2. Step two
3. Step three

## Output Format

Expected deliverable format
```

**Complex agent** (multi-step workflow):

```markdown
## Purpose

Context and goals

## Workflow

### Phase 1: [Name]

Detailed instructions

### Phase 2: [Name]

Detailed instructions

### Phase 3: [Name]

Detailed instructions

## Quality Criteria

How to determine success

## Output Format

Expected deliverable format
```

**Subagent coordinator** (orchestrates other agents):

```markdown
## Purpose

Overall goal

## Subagent Workflow

1. **Research Phase**

   - Invoke research-agent with: [parameters]
   - Expected output: [format]

2. **Implementation Phase**

   - Invoke coding-agent with: [parameters]
   - Expected output: [format]

3. **Verification Phase**
   - Invoke testing-agent with: [parameters]
   - Expected output: [format]

## Integration

How to combine subagent outputs

## Final Deliverable

Complete output format
```

**Research/Analysis agent**:

```markdown
## Purpose

Research scope and objectives

## Research Process

1. Discovery phase
2. Analysis phase
3. Synthesis phase

## Sources

Where to gather information

## Analysis Framework

How to evaluate findings

## Report Format

Structured output format with sections
```

### 6. Add Specialized Knowledge

Include domain-specific guidance:

#### Reference Files

For detailed information, create reference files:

- `references/security-patterns.md` - Security best practices
- `references/api-design.md` - API design principles
- `references/testing-strategies.md` - Testing approaches

Reference in SKILL.md:

```markdown
## Domain Knowledge

For detailed patterns, see:

- [Security Patterns](references/security-patterns.md)
- [API Design Guide](references/api-design.md)
```

#### Examples

Include concrete examples in agent body:

```markdown
## Example Interaction

**User request**: "Analyze authentication security"

**Agent process**:

1. Scan auth-related files
2. Check for common vulnerabilities
3. Verify best practices
4. Generate report

**Expected output**:

- Executive summary
- Detailed findings
- Recommendations with priority
```

### 7. Generate and Validate

Create the agent file:

1. Place in correct location (`.agents/agents/` or user folder)
2. Include complete YAML frontmatter
3. Write clear, actionable body content
4. Use imperative voice for instructions
5. Include concrete examples where helpful

After creation, validate:

- YAML syntax is correct (between `---` markers)
- `name` and `description` are present
- `infer` is set appropriately
- Tool restrictions (if any) are correctly specified
- Body provides clear guidance for the agent's mission
- Examples demonstrate expected behavior

## Common Agent Patterns

### Pattern 1: Research Agent

````yaml
---
name: research-agent
description: Comprehensive research agent that searches codebases, documentation, and web resources to answer technical questions. Use when thorough investigation is needed.
infer: true
allowedTools:
  - read_file
  - list_dir
  - grep_search
  - semantic_search
  - file_search
  - fetch_webpage
  - github_repo
  - list_code_usages
---

## Purpose

Conduct thorough research to answer technical questions by exploring codebases, documentation, and external resources.

## Research Process

1. **Understand Question**: Parse the research request
2. **Gather Context**: Search relevant files and documentation
3. **Web Research**: Fetch external resources if needed
4. **Synthesize**: Combine findings into coherent answer
5. **Cite Sources**: Reference all sources used

## Output Format

```markdown
# Research Findings

## Summary
[2-3 sentence overview]

## Detailed Findings
[Organized by topic]

## Sources
- [File paths or URLs with relevance]

## Recommendations
[Actionable insights]
````

````

### Pattern 2: Code Review Agent

```yaml
---
name: code-review-agent
description: Security-focused code review agent that analyzes code for vulnerabilities, best practices, and quality issues without modifying files. Use for safe code analysis.
disabledTools:
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
  - install_python_packages
---

## Purpose

Perform comprehensive code review focusing on security, quality, and best practices.

## Review Process

1. **Scan Files**: Identify files to review
2. **Security Analysis**: Check for vulnerabilities
3. **Quality Review**: Assess code quality
4. **Best Practices**: Verify conventions
5. **Generate Report**: Structured findings

## Review Checklist

### Security
- [ ] Input validation
- [ ] Authentication/authorization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Secrets management

### Quality
- [ ] Code clarity
- [ ] Error handling
- [ ] Test coverage
- [ ] Documentation

## Output Format

```markdown
# Code Review Report

## Executive Summary
[High-level overview with severity indicators]

## Critical Issues
[Must-fix items]

## Warnings
[Should-fix items]

## Suggestions
[Nice-to-have improvements]

## Positive Highlights
[Good patterns to recognize]
````

````

### Pattern 3: Multi-Stage Orchestrator

```yaml
---
name: feature-builder
description: Multi-stage agent that orchestrates feature development from planning through implementation and testing. Coordinates specialized subagents for each phase.
---

## Purpose

Build complete features by coordinating planning, implementation, and testing phases.

## Multi-Stage Workflow

### Stage 1: Planning (Research Subagent)

Invoke `research-agent` to:
- Analyze existing codebase patterns
- Research similar implementations
- Identify dependencies and impacts

**Expected output**: Implementation plan with architecture decisions

### Stage 2: Implementation (Coding Phase)

Using planning output:
1. Generate necessary files
2. Implement core functionality
3. Add error handling
4. Apply code style standards

**Expected output**: Complete, tested code

### Stage 3: Testing (Test Generator Subagent)

Invoke `test-generator-agent` to:
- Generate comprehensive tests
- Cover edge cases
- Verify integration points

**Expected output**: Test suite with good coverage

### Stage 4: Documentation

Generate:
- API documentation
- Usage examples
- Integration guide

## Quality Gates

Each stage must complete successfully before proceeding:
- Planning: Clear architecture documented
- Implementation: Code passes linting
- Testing: All tests pass
- Documentation: Complete and accurate

## Final Deliverable

- Working feature code
- Comprehensive tests
- Complete documentation
- Integration instructions
````

### Pattern 4: Specialized Expert Agent

````yaml
---
name: performance-profiler
description: Performance analysis expert that profiles code, identifies bottlenecks, and recommends optimizations. Use when performance issues need investigation.
---

## Purpose

Analyze code performance, identify bottlenecks, and provide optimization recommendations.

## Expertise Areas

- **Algorithm complexity**: Big O analysis
- **Database queries**: Query optimization, N+1 detection
- **Memory usage**: Memory leaks, excessive allocation
- **I/O operations**: Async patterns, batching opportunities
- **Caching**: Cache hit ratios, invalidation strategies

## Analysis Process

1. **Profile Execution**: Identify hot paths
2. **Measure Baselines**: Establish current metrics
3. **Identify Bottlenecks**: Pinpoint performance issues
4. **Research Solutions**: Find optimization patterns
5. **Recommend Changes**: Prioritized improvements
6. **Estimate Impact**: Expected performance gains

## Profiling Tools

- Python: cProfile, memory_profiler, py-spy
- Node.js: clinic, 0x, Chrome DevTools
- Database: EXPLAIN, query logs
- Network: Chrome DevTools, curl timing

## Output Format

```markdown
# Performance Analysis Report

## Current State
- Baseline metrics
- Performance characteristics

## Bottlenecks Identified
1. [Bottleneck] - Impact: [High/Medium/Low]
   - Current: [metric]
   - Root cause: [explanation]

## Recommended Optimizations

### Priority 1: [High Impact, Low Effort]
[Specific recommendations with code examples]

### Priority 2: [High Impact, Medium Effort]
[Recommendations]

### Priority 3: [Medium Impact]
[Recommendations]

## Expected Improvements
- [Optimization]: [estimated improvement]

## Implementation Roadmap
1. Quick wins
2. Structural changes
3. Long-term improvements
````

```

## Reference Files

For detailed patterns and examples:
- See [references/agent-patterns.md](references/agent-patterns.md) for proven patterns
- See [references/subagent-workflows.md](references/subagent-workflows.md) for coordination patterns
- See [references/tool-restrictions.md](references/tool-restrictions.md) for tool access patterns
- See [references/examples.md](references/examples.md) for complete agent examples

## Tips for Effective Agents

1. **Clear mission**: Agent should have one primary purpose
2. **Appropriate tools**: Restrict tools to match security requirements
3. **Structured output**: Define expected output format
4. **Context isolation**: Use subagents for independent analysis
5. **Quality criteria**: Include how to measure success
6. **Examples**: Show concrete usage scenarios
7. **Progressive disclosure**: Reference detailed docs rather than including everything
8. **Test invocation**: Would you say the description when needing this agent?
```
