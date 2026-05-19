# Subagent Workflows

Complete guide to coordinating multiple agents for complex workflows.

## Subagent Basics

### What are Subagents?

Subagents are specialized agents invoked by other agents via the `runSubagent` tool. They provide:

- **Context isolation**: Returns single focused result
- **Specialized expertise**: Domain-specific capabilities
- **Parallel execution**: Different tool restrictions per agent
- **Reusability**: Same subagent used across workflows

### Subagent vs Regular Agent

| Aspect        | Regular Agent            | Subagent                       |
| ------------- | ------------------------ | ------------------------------ |
| Invocation    | User explicitly requests | Another agent calls it         |
| Context       | Continuous with user     | Isolated, returns one message  |
| `infer` field | `false` or omitted       | `true`                         |
| Communication | Back-and-forth with user | Single result to calling agent |
| Tool access   | Full or restricted       | Often restricted for safety    |

### Creating a Subagent

Key frontmatter for subagents:

```yaml
---
name: research-subagent
description: |
  Research specialized topics by searching codebase and documentation.
  Use when you need focused investigation without modifying files.
infer: true # <-- Critical for subagent
allowedTools: # Restrict to read-only
  - read_file
  - list_dir
  - grep_search
  - semantic_search
  - file_search
---
```

## Orchestration Patterns

### Pattern 1: Sequential Pipeline

Each stage depends on previous stage output.

**Use when:**

- Steps must occur in order
- Each step requires previous results
- Linear dependency chain

**Example: Feature Development Pipeline**

```yaml
---
name: feature-builder
description: Builds complete features through planning, implementation, testing, and documentation stages
---

## Purpose
Orchestrate complete feature development lifecycle

## Sequential Workflow

### Stage 1: Planning
**Invoke**: `planning-agent`
**Prompt**:
```

Analyze the codebase and create an implementation plan for: {feature_description}

Consider:

- Existing code patterns
- Dependencies and impacts
- File structure
- Testing requirements

Return a structured plan with:

1. Files to create/modify
2. Key functions/classes needed
3. Dependencies required
4. Testing strategy

```

**Wait for**: Complete implementation plan

### Stage 2: Implementation
**Input**: Implementation plan from Stage 1
**Invoke**: `coding-agent`
**Prompt**:
```

Implement the following feature using this plan:

Plan:
{plan_from_stage_1}

Requirements:

- Follow project code style
- Include error handling
- Add inline documentation
- Use existing patterns

Return: Complete working code

```

**Wait for**: Implemented code

### Stage 3: Testing
**Input**: Implemented code from Stage 2
**Invoke**: `test-generator`
**Prompt**:
```

Generate comprehensive tests for this implementation:

Code:
{code_from_stage_2}

Generate:

- Unit tests for all functions
- Integration tests
- Edge case coverage
- Error scenario tests

Follow project test patterns.

```

**Wait for**: Complete test suite

### Stage 4: Documentation
**Input**: Code and tests from Stages 2 & 3
**Invoke**: `documentation-agent`
**Prompt**:
```

Document this feature:

Code:
{code_from_stage_2}

Tests:
{tests_from_stage_3}

Create:

- API documentation
- Usage examples
- Integration guide

```

**Wait for**: Complete documentation

## Integration
Combine all outputs into final deliverable with summary
```

### Pattern 2: Parallel Investigation

Multiple subagents work independently, results combined.

**Use when:**

- Tasks are independent
- Different expertise areas
- Want comprehensive coverage

**Example: Comprehensive Code Analysis**

````yaml
---
name: code-analyzer
description: Performs parallel analysis of code from multiple perspectives
---

## Purpose
Comprehensive code analysis using specialized subagents

## Parallel Workflow

Launch all subagents simultaneously:

### Security Analysis
**Invoke**: `security-auditor`
**Prompt**: "Analyze {file_path} for security vulnerabilities"
**Focus**: Security issues only

### Performance Analysis
**Invoke**: `performance-profiler`
**Prompt**: "Profile {file_path} for performance issues"
**Focus**: Performance bottlenecks only

### Quality Analysis
**Invoke**: `quality-reviewer`
**Prompt**: "Review {file_path} for code quality issues"
**Focus**: Code quality only

### Compliance Analysis
**Invoke**: `compliance-checker`
**Prompt**: "Check {file_path} for coding standards compliance"
**Focus**: Standards adherence only

## Integration

Combine all reports:

```markdown
# Comprehensive Analysis Report

## Executive Summary
[Synthesize key findings from all areas]

## Security Findings
{security_report}

## Performance Findings
{performance_report}

## Quality Findings
{quality_report}

## Compliance Findings
{compliance_report}

## Priority Recommendations
[Combined top priorities across all areas]
````

````

### Pattern 3: Iterative Refinement

Subagent processes work product through multiple iterations.

**Use when:**
- Quality refinement needed
- Multiple review passes
- Incremental improvement

**Example: Document Polish Pipeline**

```yaml
---
name: document-polisher
description: Iteratively refines documentation through multiple specialized passes
---

## Purpose
Polish documentation through specialized refinement stages

## Iterative Workflow

### Iteration 1: Technical Accuracy
**Invoke**: `technical-reviewer`
**Input**: Draft documentation
**Prompt**: "Review for technical accuracy, fix errors"
**Output**: Technically accurate draft

### Iteration 2: Clarity & Readability
**Invoke**: `clarity-editor`
**Input**: Output from Iteration 1
**Prompt**: "Improve clarity and readability"
**Output**: Clear, readable draft

### Iteration 3: Completeness Check
**Invoke**: `completeness-checker`
**Input**: Output from Iteration 2
**Prompt**: "Identify missing sections, add them"
**Output**: Complete draft

### Iteration 4: Style & Formatting
**Invoke**: `style-formatter`
**Input**: Output from Iteration 3
**Prompt**: "Apply style guide and formatting standards"
**Output**: Polished final document

## Quality Gate
After each iteration, validate improvement before proceeding
````

### Pattern 4: Conditional Branching

Different subagents invoked based on conditions.

**Use when:**

- Different paths needed
- Condition-dependent processing
- Dynamic workflow routing

**Example: Intelligent Bug Fixer**

```yaml
---
name: bug-resolver
description: Analyzes bugs and routes to appropriate specialized fixing agent
---

## Purpose
Intelligently route bug fixes to specialized agents

## Conditional Workflow

### Step 1: Analyze Bug
Read error message and stack trace
Determine bug category:
- Security vulnerability
- Performance issue
- Logic error
- Integration issue
- UI/UX problem

### Step 2: Route to Specialist

#### If Security Bug
**Invoke**: `security-fixer`
**Prompt**: "Fix security vulnerability: {bug_details}"
**Restrictions**: Read-write, no terminal

#### If Performance Bug
**Invoke**: `performance-optimizer`
**Prompt**: "Optimize performance issue: {bug_details}"
**Restrictions**: Full access with profiling

#### If Logic Error
**Invoke**: `logic-debugger`
**Prompt**: "Debug and fix logic error: {bug_details}"
**Restrictions**: Read-write with testing

#### If Integration Issue
**Invoke**: `integration-fixer`
**Prompt**: "Fix integration issue: {bug_details}"
**Restrictions**: Full access

#### If UI/UX Problem
**Invoke**: `ui-fixer`
**Prompt**: "Fix UI/UX issue: {bug_details}"
**Restrictions**: Frontend files only

### Step 3: Validate Fix
Run tests to ensure bug is fixed
Verify no regressions introduced
```

### Pattern 5: Recursive Decomposition

Agent breaks complex tasks into subtasks, delegates to specialized subagents.

**Use when:**

- Complex hierarchical tasks
- Unknown depth of complexity
- Need divide-and-conquer

**Example: Refactoring Orchestrator**

```yaml
---
name: refactoring-orchestrator
description: Recursively decomposes complex refactoring into manageable subtasks
---

## Purpose
Break down and execute complex refactoring operations

## Recursive Workflow

### Level 1: Analyze Scope
Examine code to refactor
Identify major components:
- If simple: execute directly
- If complex: decompose further

### Level 2: Decompose Complex Tasks

For each complex component:

#### Extract Function Refactoring
**Invoke**: `extract-function-agent`
**Prompt**: "Extract functions from {component}"
**Wait**: Complete extraction

#### Rename Refactoring
**Invoke**: `rename-agent`
**Prompt**: "Rename unclear symbols in {component}"
**Wait**: Complete renaming

#### Structure Refactoring
**Invoke**: `structure-agent`
**Prompt**: "Improve structure of {component}"
**Wait**: Complete restructuring

### Level 3: Validate Each Change
After each refactoring:
1. Run tests
2. Check for errors
3. Verify behavior preserved

### Integration
Combine refactorings:
- Apply in dependency order
- Validate after each
- Roll back if issues
```

## Communication Patterns

### Pattern A: Prompt Engineering for Subagents

**Clear Context**

```yaml
Invoke: research-agent
Prompt: |
  Research authentication patterns in our codebase.

  Context: We're implementing OAuth2 for a new API.

  Find:
  - Existing OAuth implementations
  - Authentication middleware patterns
  - Token validation approaches

  Return: Structured summary with code examples
```

**Structured Output Request**

```yaml
Invoke: analysis-agent
Prompt: |
  Analyze {file} for performance issues.

  Return in this format:

  ## Issues Found
  1. [Issue description]
     - Location: [file:line]
     - Impact: [High/Medium/Low]
     - Fix: [suggestion]

  ## Recommendations
  [Prioritized list]
```

### Pattern B: Result Integration

**Aggregation**

````markdown
## Integration Method: Aggregation

Combine multiple subagent outputs into unified report:

### Structure

```markdown
# Combined Report

## Summary

[Synthesize key points from all subagents]

## Detailed Findings

### From Research Agent

{research_results}

### From Analysis Agent

{analysis_results}

## Integrated Recommendations

[Combine and prioritize across all findings]
```
````

````

**Transformation**
```markdown
## Integration Method: Transformation

Transform subagent output into different format:

### Subagent Output
Research findings in narrative form

### Transform To
Structured JSON or data format

### Process
Extract key data points, reorganize into structured format
````

**Synthesis**

```markdown
## Integration Method: Synthesis

Create new insights from multiple subagent outputs:

### Inputs

- Security analysis
- Performance analysis
- Architecture review

### Synthesis

Identify relationships between findings:

- Security fix that improves performance
- Architecture change that addresses both security and performance

### Output

Holistic recommendations considering all perspectives
```

## Error Handling

### Subagent Failure Patterns

**Retry with Clarification**

```yaml
If subagent returns unclear result:
1. Analyze what was unclear
2. Re-invoke with more specific prompt
3. Provide additional context
4. Request structured format
```

**Fallback Strategy**

```yaml
If subagent fails:
1. Try alternative subagent
2. Break task into smaller pieces
3. Execute directly if simple enough
4. Escalate to user if blocked
```

**Partial Success**

```yaml
If subagent partially completes:
1. Accept partial results
2. Identify missing pieces
3. Invoke for missing pieces only
4. Combine results
```

## Best Practices

### 1. Clear Prompts

- Provide complete context
- Request specific format
- Define success criteria
- Include relevant data

### 2. Appropriate Subagents

- Match subagent expertise to task
- Consider tool restrictions
- Verify subagent availability
- Use right level of specialization

### 3. Result Validation

- Check subagent output completeness
- Validate against requirements
- Handle unexpected formats
- Retry if needed

### 4. Efficient Coordination

- Parallelize independent tasks
- Sequence dependent tasks
- Avoid unnecessary subagent calls
- Cache results when possible

### 5. Error Recovery

- Graceful degradation
- Alternative approaches
- Clear error messages
- User escalation when stuck

### 6. Context Management

- Pass minimal necessary context
- Structure data clearly
- Avoid context overflow
- Reference files rather than inline large data

## Example: Complete Multi-Stage Orchestrator

```yaml
---
name: feature-complete-builder
description: Complete feature development with parallel and sequential stages
---

## Purpose
Build production-ready features using optimized subagent coordination

## Workflow

### Stage 1: Parallel Research
Launch simultaneously:
- **research-agent**: Analyze existing patterns
- **dependency-agent**: Identify dependencies
- **impact-agent**: Assess changes impact

**Integration**: Combine into comprehensive context

### Stage 2: Sequential Planning
**Input**: Combined research from Stage 1
**Invoke**: **planning-agent**
**Output**: Detailed implementation plan

### Stage 3: Parallel Implementation
Split implementation by component:
- **backend-agent**: API implementation
- **frontend-agent**: UI implementation
- **database-agent**: Schema changes

**Integration**: Combine all code

### Stage 4: Sequential Testing
**Input**: All code from Stage 3
1. **unit-test-agent**: Generate unit tests
2. **integration-test-agent**: Generate integration tests
3. **test-runner-agent**: Execute all tests

**Validation**: All tests must pass

### Stage 5: Parallel Documentation
Launch simultaneously:
- **api-doc-agent**: API documentation
- **user-doc-agent**: User guide
- **dev-doc-agent**: Developer notes

**Integration**: Combine into complete documentation

### Stage 6: Final Review
**Invoke**: **review-agent**
**Input**: All artifacts
**Output**: Final validation and summary

## Quality Gates
- Stage 1: Research complete and comprehensive
- Stage 2: Plan clear and feasible
- Stage 3: Code implements plan correctly
- Stage 4: All tests pass
- Stage 5: Documentation complete
- Stage 6: Review approves for delivery
```

## Tool: runSubagent Reference

```typescript
runSubagent({
  agentName: 'research-agent', // Optional: specific agent name
  description: 'Research task', // Brief description
  prompt: `
    Detailed instructions for subagent.
    Include all necessary context.
    Request specific output format.
  `,
})
```

**Parameters:**

- `agentName` (optional): Exact agent name (case-sensitive)
- `description` (required): Short 3-5 word description
- `prompt` (required): Detailed task description for subagent

**Returns:**
Single message with subagent's complete result

**Notes:**

- Subagent executes in isolated context
- Cannot have back-and-forth with subagent
- Include all information in prompt
- Specify expected output format
