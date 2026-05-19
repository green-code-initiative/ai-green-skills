# Creedengo AI Skills

This folder contains **AI skills** for the [Creedengo](https://green-code-initiative.org) project.

---

## What is a Skill?

A **skill** is a structured instruction file written for an AI agent (Claude, GitHub Copilot,
ChatGPT, Cursor, or any LLM). It tells the agent:

- **What** to do — the task to accomplish
- **How** to reason — the steps to follow, in order
- **Where** to look — the authoritative references to consult
- **What to produce** — the exact format of the output
- **What not to do** — hard constraints to never violate

A skill is not code. It is a **contract between a human and an AI agent**, written in plain
Markdown so it is readable by both.

### Why skills for Creedengo?

The Creedengo project maintains a growing catalog of green code rules across multiple languages.
Skills allow any AI agent to assist contributors and developers consistently, without
hallucinating rules, without duplicating the specifications, and always pointing back to
[`creedengo-rules-specifications`](https://github.com/green-code-initiative/creedengo-rules-specifications)
as the single source of truth.

---

## Files in this folder

| File | Role |
|---|---|
| `SKILL_TEMPLATE.md` | Generic template to write a new skill |
| `SKILL_green_code_review.md` | Skill: detect green code violations in source code |

---

## How to use `SKILL_TEMPLATE.md` — create a new skill

Use this template whenever you want to define a new capability for an AI agent on the project.

### Step 1 — Copy the template

    cp SKILL_TEMPLATE.md SKILL_my_new_skill.md

### Step 2 — Fill in each section

Open `SKILL_my_new_skill.md` and replace every `[placeholder]` with real content:

| Section | What to write |
|---|---|
| **Purpose** | One sentence: what the agent does with this skill |
| **Trigger** | The situations that activate this skill |
| **Source of Truth** | The files or URLs the agent must consult |
| **Instructions** | The ordered steps the agent must follow |
| **Output Format** | The exact structure of what the agent produces |
| **Constraints** | Hard rules: what the agent must never do |
| **Examples** | At least one input/output pair to validate the skill |
| **Related Skills** | Other skills that complement this one |

### Step 3 — Test it manually

Before committing, paste the content of your skill into your AI agent as a system prompt
or instruction, then give it a realistic input and verify the output matches the format
and constraints you defined.

### Step 4 — Name it consistently

Use the naming convention: `SKILL_<verb>_<subject>.md`

Examples: `SKILL_review_rule_spec.md`, `SKILL_implement_rule.md`, `SKILL_generate_asciidoc.md`

---

## How to use `SKILL_green_code_review.md`

This skill enables an AI agent to analyse source code and detect violations of Creedengo
green code rules. It works for any language (Java, Python, PHP, JavaScript, C#, etc.)
and any tool (Claude, Copilot, ChatGPT, Cursor, etc.).

### What it does

Given a code snippet or a file, the agent:

1. Identifies the programming language
2. Scans the code for patterns matching Creedengo rules
3. Verifies each violation against the official `creedengo-rules-specifications`
4. Reports only rules that apply to the detected language
5. Provides a compliant fix for every violation found

### How to use it — with a chat-based agent (Claude, ChatGPT, etc.)

**Step 1** — Open a conversation with your AI agent.

**Step 2** — Paste the full content of `SKILL_green_code_review.md` as the first message
(or as the system prompt if your tool supports it).

**Step 3** — Then send your code:

    Please apply the Green Code Review skill to the following code:

```python
    import logging
    name = "world"
    logging.info(f"Hello {name}")
```

**Step 4** — The agent will respond with a structured report:

    🌿 [GCI111] — Logging format interpolation
       Status   : ✅ Implemented
       Severity : Minor
       Line(s)  : 3
       Issue    : f-string is evaluated immediately even if the INFO level is inactive
       Impact   : CPU cycles wasted on string interpolation that may never be used
       Fix      : logging.info("Hello %s", name)
       Cost     : 5min
       Ref      : https://github.com/green-code-initiative/creedengo-rules-specifications/
                  blob/main/src/main/rules/GCI111/python/GCI111.asciidoc

    --- Summary ---
    Language  : Python
    Violations: 1 (1 ✅ enforced by SonarQube, 0 🚀 not yet)

### How to use it — with Copilot or Cursor

Add the content of `SKILL_green_code_review.md` to your `.github/copilot-instructions.md`
or your tool's custom instructions file. Then trigger it with a comment in your code:

    # @agent review this file for Creedengo green code violations

### What the status icons mean

| Icon | Meaning |
|---|---|
| ✅ | Rule already enforced by SonarQube — will appear in your quality gate |
| 🚧 | Rule implementation in progress — not yet in SonarQube |
| 🚀 | Rule specified but not yet implemented — not yet in SonarQube |
| ❓ | Potential issue — applicability not yet confirmed for this language |
| 🚫 | Not applicable — never reported for this language |

### Important: the agent does not know the rules by heart

The agent is instructed to always verify rules against `creedengo-rules-specifications`
before reporting a violation. It will never invent a rule ID or report a violation
for a language where the rule is marked 🚫.

---

## Contributing a new skill

If you identify a recurring task where an AI agent could help Creedengo contributors,
create a new skill using `SKILL_TEMPLATE.md` and open a pull request.

Good candidates for future skills:

- Review a new rule specification (JSON + asciidoc) for completeness
- Guide a contributor through implementing a rule in a plugin
- Generate the asciidoc scaffold for a new rule from a plain description
- Validate a test resource file (compliant/non-compliant annotations)

---

## Reference

- Creedengo rules specifications: https://github.com/green-code-initiative/creedengo-rules-specifications
- Rules support matrix: https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md
- Green Code Initiative: https://green-code-initiative.org