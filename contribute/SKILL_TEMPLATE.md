---
name: Name of the folder containing the skill
description: Synthetic description of the skill
context: Explanation of when to use
metadata:
   version: 1.0.0
   referentiel: The rule(s) covered by the skill
   tag: rule
   last-updated: ISO date of the last change
---

<!--
  SKILL TEMPLATE — copy this file, rename it SKILL_<verb>_<subject>.md, and replace every
  [placeholder] with real content. Delete all HTML comments before committing.
-->

# SKILL — [SKILL_NAME]

> **Context:** 

---

## Purpose

<!--
  One sentence only. What does the agent DO when this skill is active?
  This sentence also appears as the skill description — make it specific and keyword-rich.
-->

[One sentence: what the agent does when this skill is active.]

---

## Trigger

This skill is activated when:

- [Situation 1 — e.g. user pastes X and asks for Y]
- [Situation 2 — e.g. a specific annotation or comment is present in the file]
- [Situation 3 — e.g. user explicitly asks to "apply the [SKILL_NAME] skill"]

---

## Source of Truth

The agent **must** consult the following references before producing any output.  
It must **never** invent information not present in these sources.

| Source | URL / Path |
|---|---|
| [Primary reference name] | [URL or relative path] |
| [Secondary reference name] | [URL or relative path] |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **[Step 1 — Identify and validate the input]**  
   [Describe precisely what the agent must check. If the input is missing or ambiguous, specify
   what the agent must ask the user before proceeding — do not guess.]

2. **[Step 2 — Consult the source of truth]**  
   [Describe precisely what the agent must look up and verify. Name the source explicitly.]

3. **[Step 3 — Analyse or transform]**  
   [Describe the reasoning or processing the agent must apply, step by step.]

4. **[Step 4 — Produce output]**  
   [Describe what the agent must produce, in what order, following the Output Format below.]

5. **[Step 5 — Self-check before responding]** *(mandatory — never skip)*  
   Verify that every item in the output: [check 1], [check 2], [check 3].  
   Remove any item that fails a check. Only then respond to the user.

---

## Fallback Behavior

| Situation | Agent action |
|---|---|
| Input is missing or cannot be determined | Ask the user: "[exact question to ask]" |
| No results found after full analysis | Produce the "no results" output block defined below |
| A required source of truth is unreachable | Inform the user; do not hallucinate content from memory |

---

## Output Format

<!--
  Use indented text blocks (4-space indent), NOT fenced code blocks (```), to avoid nesting
  conflicts when this skill file is itself embedded inside another Markdown document.
-->

The agent **must** produce output in exactly this structure:

    [Output block — describe the exact format, field names, and order]

    [Field 1]: <value>
    [Field 2]: <value>
    [Field N]: <value>

### When no results are found

    [No-results message — define it explicitly so the agent never invents a fallback format]

---

## Constraints

The agent **must never**:

- [ ] Invent information not present in the declared sources of truth
- [ ] Skip the self-check step (Step 5) before responding
- [ ] Produce output in a format different from the one defined in Output Format
- [ ] Proceed when the input is ambiguous — always ask first (see Fallback Behavior)
- [ ] [Add skill-specific constraint — e.g. "omit the source URL for any reported item"]
- [ ] [Add skill-specific constraint — e.g. "report findings for out-of-scope inputs"]

---

## Examples

<!--
  Provide at least 2 examples: one happy path, one edge case or negative case.
  Use 4-space indented blocks for input and output — do not use fenced code blocks.
-->

### Example 1 — [Short description: happy path]

**Input:**

    [Paste a realistic input here]

**Expected output:**

    [Paste the exact expected output, matching the Output Format section precisely]

### Example 2 — [Short description: edge case or no-results]

**Input:**

    [Paste a realistic edge-case input here]

**Expected output:**

    [Paste the exact expected output — e.g. the no-results block]

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_green_code_review.md` | [Describe how the two skills interact or complement each other] |
| `SKILL_<other>.md` | [Describe relationship] |

---

## Notes

[Optional: known limitations, maintenance notes, or context for contributors.]

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | YYYY-MM-DD | Initial version |