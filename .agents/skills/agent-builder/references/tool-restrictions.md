# Tool Restriction Patterns

Complete guide to configuring tool access for custom agents.

## Tool Restriction Philosophy

Tool restrictions serve multiple purposes:

- **Security**: Prevent dangerous operations
- **Safety**: Avoid unintended modifications
- **Focus**: Limit agent to its intended purpose
- **Compliance**: Enforce organizational policies

## Restriction Methods

### Method 1: disabledTools (Blocklist)

Block specific tools while allowing all others.

**Use when:**

- Most tools are needed
- Only a few tools should be blocked
- Default permissive approach

```yaml
disabledTools:
  - run_in_terminal
  - install_python_packages
  - create_file
```

### Method 2: allowedTools (Allowlist)

Allow only specific tools, block all others.

**Use when:**

- Very restricted scope
- Small set of needed tools
- Default restrictive approach
- Maximum security

```yaml
allowedTools:
  - read_file
  - list_dir
  - grep_search
```

**Important**: Use either `disabledTools` OR `allowedTools`, not both.

## Common Tool Restriction Patterns

### Pattern 1: Read-Only Agent

For agents that analyze without modifying.

**Use cases:**

- Code review
- Security audits
- Documentation analysis
- Research tasks
- Compliance checking

```yaml
---
name: read-only-agent
description: Analysis agent with no modification permissions
disabledTools:
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
  - install_python_packages
  - kill_terminal
  - await_terminal
---
```

**Tools still available:**

- `read_file`
- `list_dir`
- `grep_search`
- `semantic_search`
- `file_search`
- `list_code_usages`
- `get_errors`
- `fetch_webpage`
- All read-only operations

### Pattern 2: Research Agent

For pure information gathering.

**Use cases:**

- Technical research
- Documentation discovery
- API exploration
- Codebase analysis

```yaml
---
name: research-agent
description: Research-focused agent with search and read capabilities only
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
```

**Blocked:**

- All file modifications
- Terminal operations
- Any write operations

### Pattern 3: Safe Code Analyzer

For code analysis with error checking but no execution.

**Use cases:**

- Static analysis
- Linting review
- Type checking
- Pattern detection

```yaml
---
name: safe-analyzer
description: Code analysis without execution or modification
disabledTools:
  - run_in_terminal
  - install_python_packages
  - await_terminal
  - kill_terminal
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
---
```

**Allows:**

- Reading files
- Searching code
- Getting errors
- Code usage analysis

### Pattern 4: Code Generator (No Execution)

For generating code without running it.

**Use cases:**

- Test generation
- Boilerplate creation
- Component scaffolding
- Migration scripts

```yaml
---
name: code-generator
description: Generates code without terminal access
disabledTools:
  - run_in_terminal
  - install_python_packages
  - await_terminal
  - kill_terminal
---
```

**Allows:**

- File creation
- File modification
- Reading files
- Error checking

**Blocks:**

- Executing code
- Installing packages
- Terminal operations

### Pattern 5: Refactoring Agent (No Terminal)

For code modification without execution.

**Use cases:**

- Safe refactoring
- Renaming
- Pattern updates
- Code cleanup

```yaml
---
name: refactoring-agent
description: Refactors code safely without execution
disabledTools:
  - run_in_terminal
  - install_python_packages
  - await_terminal
  - kill_terminal
---
```

**Allows:**

- File modifications
- Multi-file edits
- Reading files
- Error checking
- Usage tracking

**Blocks:**

- Running code
- Installing dependencies

### Pattern 6: Test Runner

For executing tests with controlled permissions.

**Use cases:**

- Running test suites
- Generating test reports
- Fixing failing tests

```yaml
---
name: test-runner
description: Executes tests and analyzes results
# No restrictions needed - requires full access
---
```

**Requires:**

- Terminal access (to run tests)
- File reading (to analyze tests)
- File modification (to fix tests)
- Error checking (to understand failures)

### Pattern 7: Documentation Agent

For creating/updating documentation.

**Use cases:**

- API docs generation
- README updates
- Inline documentation
- Tutorial creation

```yaml
---
name: documentation-agent
description: Creates and updates documentation without code execution
disabledTools:
  - run_in_terminal
  - install_python_packages
  - await_terminal
  - kill_terminal
---
```

**Allows:**

- File creation (docs)
- File modification (docs)
- Reading code
- Searching

**Blocks:**

- Code execution

### Pattern 8: Security Auditor (Strict)

For high-security analysis tasks.

**Use cases:**

- Security audits
- Vulnerability scanning
- Compliance checking
- Secret detection

```yaml
---
name: security-auditor
description: Strict security analysis with minimal permissions
allowedTools:
  - read_file
  - list_dir
  - grep_search
  - semantic_search
  - file_search
  - list_code_usages
  - get_errors
---
```

**Philosophy**: Absolute minimum permissions for maximum security.

### Pattern 9: Database Agent

For database-related tasks with safety limits.

**Use cases:**

- Migration generation
- Schema analysis
- Query optimization

```yaml
---
name: database-agent
description: Database tasks without executing migrations
disabledTools:
  - run_in_terminal # Prevent running migrations
---
```

**Allows:**

- Reading database files
- Generating migration scripts
- Analyzing schema

**Blocks:**

- Executing migrations
- Running database commands

### Pattern 10: Frontend Builder

For frontend development with controlled scope.

**Use cases:**

- Component generation
- UI development
- Frontend refactoring

```yaml
---
name: frontend-builder
description: Frontend development with restricted file access
disabledTools:
  - run_in_terminal # Could install packages
---
```

**Alternative with allowedTools:**

```yaml
allowedTools:
  - read_file
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - list_dir
  - grep_search
  - semantic_search
  - file_search
  - get_errors
```

## Tool Categories Reference

### File Reading Tools

- `read_file` - Read file contents
- `list_dir` - List directory contents
- `get_errors` - Get compilation/lint errors

### File Search Tools

- `grep_search` - Text/regex search
- `semantic_search` - Semantic code search
- `file_search` - Find files by pattern
- `list_code_usages` - Find symbol usages

### File Modification Tools

- `create_file` - Create new file
- `replace_string_in_file` - Edit existing file
- `multi_replace_string_in_file` - Multiple edits at once
- `create_directory` - Create directory

### Terminal Tools

- `run_in_terminal` - Execute commands
- `install_python_packages` - Install Python packages
- `await_terminal` - Wait for background command
- `kill_terminal` - Stop background process
- `get_terminal_output` - Get command output
- `terminal_last_command` - Get last command
- `terminal_selection` - Get terminal selection

### Code Analysis Tools

- `list_code_usages` - Find references
- `get_errors` - Error diagnostics
- `grep_search` - Search within code

### External Tools

- `fetch_webpage` - Fetch web content
- `github_repo` - Search GitHub repos
- `open_simple_browser` - Open browser

### Project Tools

- `get_changed_files` - Git changes
- `get_search_view_results` - Search results
- `create_and_run_task` - VS Code tasks

### Python Tools

- `configure_python_environment` - Setup Python
- `get_python_environment_details` - Python info
- `get_python_executable_details` - Python path
- `install_python_packages` - Install packages
- `mcp_pylance_*` - Pylance operations

### Notebook Tools

- `edit_notebook_file` - Edit notebook
- `run_notebook_cell` - Run cell
- `copilot_getNotebookSummary` - Notebook info

## Decision Matrix

| Agent Purpose  | Tool Access Pattern | Key Restrictions                 |
| -------------- | ------------------- | -------------------------------- |
| Code Review    | Read-only           | All modifications blocked        |
| Research       | Search & Read       | Modifications + terminal blocked |
| Generator      | Create files        | Terminal blocked                 |
| Refactoring    | Modify files        | Terminal blocked                 |
| Testing        | Full access         | None (needs terminal)            |
| Documentation  | Create/modify docs  | Terminal blocked                 |
| Security Audit | Minimal read        | Strict allowlist                 |
| Database       | Read/generate       | Terminal blocked                 |

## Security Considerations

### Low Risk (Read-Only)

```yaml
# Safe for untrusted code analysis
disabledTools:
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
  - install_python_packages
```

### Medium Risk (File Modifications)

```yaml
# Can modify files but not execute
disabledTools:
  - run_in_terminal
  - install_python_packages
  - await_terminal
  - kill_terminal
```

### High Risk (Full Access)

```yaml
# No restrictions - use carefully
# (omit disabledTools and allowedTools)
```

## Pattern Selection Guide

**Ask yourself:**

1. **Does the agent need to modify files?**

   - No → Use read-only pattern
   - Yes → Continue to #2

2. **Does the agent need to execute code?**

   - No → Block terminal tools
   - Yes → Continue to #3

3. **Is execution safety-critical?**

   - Yes → Consider additional restrictions
   - No → Full access may be appropriate

4. **Is this a research/analysis task?**

   - Yes → Use research pattern
   - No → Continue to #5

5. **What's the security risk level?**
   - High → Use strict allowlist
   - Medium → Block dangerous tools
   - Low → Minimal restrictions

## Testing Tool Restrictions

Before deploying an agent, verify tool restrictions work:

### Test Read-Only

```markdown
1. Try to create a file → Should fail
2. Try to modify a file → Should fail
3. Try to run terminal command → Should fail
4. Try to read file → Should succeed
5. Try to search → Should succeed
```

### Test Research Pattern

```markdown
1. Try to read files → Should succeed
2. Try to search codebase → Should succeed
3. Try to fetch webpage → Should succeed
4. Try to modify file → Should fail
5. Try terminal command → Should fail
```

### Test Generator Pattern

```markdown
1. Try to create file → Should succeed
2. Try to modify file → Should succeed
3. Try to run tests → Should fail
4. Try to install package → Should fail
```

## Common Mistakes

### ❌ Mistake 1: Using Both Methods

```yaml
# WRONG - Don't use both!
disabledTools:
  - run_in_terminal
allowedTools:
  - read_file
```

### ❌ Mistake 2: Forgetting Terminal Sub-Tools

```yaml
# WRONG - Incomplete terminal blocking
disabledTools:
  - run_in_terminal
# Missing: await_terminal, kill_terminal, get_terminal_output
```

**Correct:**

```yaml
disabledTools:
  - run_in_terminal
  - await_terminal
  - kill_terminal
  - get_terminal_output
  - terminal_last_command
  - terminal_selection
```

### ❌ Mistake 3: Over-Restricting

```yaml
# WRONG - Agent can't function
allowedTools:
  - read_file # Too limited for most tasks
```

### ❌ Mistake 4: Under-Restricting

```yaml
# WRONG - Security audit with write access
name: security-auditor
# No restrictions - security auditor should be read-only!
```

## Best Practices

1. **Start restrictive**: Begin with minimal permissions, add as needed
2. **Test restrictions**: Verify agent can't do blocked operations
3. **Document rationale**: Explain why specific tools are restricted
4. **Consider security**: Think about worst-case scenarios
5. **Match purpose**: Tool access should align with agent purpose
6. **Be explicit**: Don't rely on defaults for critical security
7. **Regular review**: Periodically audit agent permissions
