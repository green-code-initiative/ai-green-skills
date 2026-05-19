# SKILL — [SKILL_NAME]

> **Version:** 1.0  
> **Agent targets:** Claude, GitHub Copilot, ChatGPT, Cursor, or any LLM  
> **Naming convention:** `SKILL_<verb>_<subject>.md`

---

## Purpose

[One sentence: what the agent does when this skill is active.]

---

## Trigger

This skill is activated when:

- [Situation 1 that activates this skill]
- [Situation 2 that activates this skill]
- [Situation 3 — e.g. a specific user request, comment, or context]

---

## Source of Truth

The agent **must** consult the following references before producing any output.  
It must **never** invent information not present in these sources.

| Source | URL / Path |
|---|---|
| [Primary reference name] | [URL or relative path] |
| [Secondary reference name] | [URL or relative path] |
| creedengo-rules-specifications | https://github.com/green-code-initiative/creedengo-rules-specifications |
| Rules support matrix | https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **[Step 1 — e.g. Identify the input]**  
   [Describe precisely what the agent must do in this step.]

2. **[Step 2 — e.g. Consult the source of truth]**  
   [Describe precisely what the agent must look up and verify.]

3. **[Step 3 — e.g. Analyse or transform]**  
   [Describe the reasoning or processing the agent must apply.]

4. **[Step 4 — e.g. Produce output]**  
   [Describe what the agent must produce, in what order.]

5. **[Step 5 — e.g. Validate]**  
   [Describe any self-check the agent must perform before responding.]

---

## Output Format

The agent **must** produce output in exactly this structure:

    [Output block — describe the exact format, fields, and order]

    [Example output structure — use indented text blocks, not fenced code, to avoid nesting issues]

---

## Constraints

The agent **must never**:

- [ ] Invent a rule ID or reference not present in creedengo-rules-specifications
- [ ] Report a violation for a language where the rule is marked 🚫 in RULES.md
- [ ] Omit the official source URL for every reported item
- [ ] Produce output in a format different from the one defined above
- [ ] [Add any skill-specific hard constraint here]

---

## Examples

### Example 1 — [Short description of the input]

**Input:**

    [Paste a realistic input here — use indented block to avoid nesting conflicts]

**Expected output:**

    [Paste the exact expected output here, matching the Output Format section]

### Example 2 — [Short description, e.g. edge case or negative case]

**Input:**

    [Paste a realistic input here]

**Expected output:**

    [Paste the exact expected output here]

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_green_code_review.md` | [Describe how the two skills interact or complement each other] |
| `SKILL_<other>.md` | [Describe relationship] |

---

## Notes

[Optional: any additional context, known limitations, or maintenance notes for contributors.]