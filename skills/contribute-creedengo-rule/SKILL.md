# SKILL - Creedengo Rule Contributor

> **Version:** 1.0  
> **Last updated:** 2026-05-19  
> **Agent targets:** Claude, GitHub Copilot, ChatGPT, Cursor, or any LLM  
> **File name:** `SKILL_contribute_creedengo_rule.md`  
> **Description:** Use when: create Creedengo rule; review Creedengo rule specification; write GCI rule; update RULES.md; generate Asciidoc rule spec; generate rule metadata JSON; compliant and non-compliant examples; green code rule contribution; ecoCode rule contribution.

---

## Purpose

Help contributors create, review, or update a Creedengo green code rule specification with verified source
references, language applicability, metadata, examples, and contribution checklist.

---

## Trigger

This skill is activated when:

- The user proposes a new green code rule for Creedengo
- The user asks to review or improve a Creedengo rule specification
- The user asks to generate rule metadata, Asciidoc, compliant examples, or non-compliant examples
- The user asks whether a rule already exists in Creedengo
- The user mentions "GCI rule", "Creedengo rule", "ecoCode rule", `RULES.md`, rule metadata JSON, or rule Asciidoc

---

## Source of Truth

The agent **must** consult the official Creedengo repository before producing rule artifacts.  
It must **never** invent final rule IDs, schema fields, language applicability, or implementation status.

| Source | URL |
|---|---|
| Creedengo rules specifications repository | https://github.com/green-code-initiative/creedengo-rules-specifications |
| Rules support matrix | https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md |
| Existing rule folders | `https://github.com/green-code-initiative/creedengo-rules-specifications/tree/main/src/main/rules/<RULE_ID>` |
| Green Code Initiative | https://green-code-initiative.org |
| cnumr best practices | https://github.com/cnumr/best-practices |
| RGESN 2024 publication page | https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/ |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **Identify the contribution mode**  
   Determine whether the user wants to:
   - propose a new rule
   - review an existing rule
   - update language applicability
   - write metadata JSON
   - write Asciidoc specification
   - generate compliant and non-compliant examples
   - prepare implementation guidance for a plugin

2. **Load existing rules and avoid duplicates**  
   Consult `RULES.md`, existing rule folders, deprecated rules, refused/deleted rules, and related rule names.
   If a similar rule already exists, recommend updating or extending that rule instead of creating a duplicate.

3. **Validate the rule candidate**  
   A valid Creedengo rule candidate must have:
   - a specific detectable anti-pattern
   - an environmental or resource-efficiency rationale
   - at least one realistic non-compliant example
   - at least one realistic compliant example
   - a remediation that preserves behavior
   - a language scope
   - a false-positive risk analysis
   - source references or measurements

4. **Choose the rule identifier policy**  
   Use an existing official rule ID only when it already exists in `RULES.md` or a rule folder.
   For a new rule, use `GCI-TBD` unless a maintainer has assigned an ID. If proposing a candidate numeric ID,
   label it clearly as `candidate only - maintainer confirmation required`.

5. **Infer artifact structure from existing rules**  
   Before writing JSON or Asciidoc, inspect similar existing rule folders. Reuse their field names,
   section names, examples, and style. Do not invent schema fields that are not used by comparable rules.

6. **Draft or review metadata JSON**  
   Check or produce metadata with the fields used by comparable rules, such as title, type, remediation cost,
   severity, tags, and language-specific metadata when present. If a field cannot be determined, use
   `TBD - maintainer input required` rather than guessing.

7. **Draft or review Asciidoc specification**  
   Include the rule title, rationale, non-compliant example, compliant example, remediation guidance,
   references, and limitations. Keep the rule deterministic enough for future static analysis.

8. **Assess implementation feasibility**  
   Classify detection as:
   - `Straightforward AST/static rule`
   - `Heuristic static rule`
   - `Requires data flow or type information`
   - `Requires runtime measurement`
   - `Not suitable for Creedengo static rule`

   If the candidate is not suitable for a static rule, recommend a checklist, measurement script, or RGESN
   evidence item instead.

9. **Prepare contribution checklist**  
   Produce the exact next actions: files to create or update, tests to add, examples to verify, `RULES.md`
   changes to propose, and maintainer questions.

10. **Self-check before responding** *(mandatory - never skip)*  
   Verify: no duplicate rule exists, official IDs are not invented, language applicability is supported,
   examples compile or are clearly pseudocode, references are cited, and every TBD is explicit.

---

## Fallback Behavior

| Situation | Agent action |
|---|---|
| Rule idea is too vague | Ask the user: "What exact code pattern should this Creedengo rule detect, in which language, and what is the preferred compliant alternative?" |
| Creedengo repository is unreachable | Inform the user; do not create official IDs or schema from memory |
| Similar rule already exists | Produce a duplicate analysis and recommend update/extension instead of new rule |
| Environmental rationale is missing | Ask for a source, measurement, or accepted best-practice reference |
| Rule requires runtime data | Recommend a measurement or review checklist instead of a static Creedengo rule |

---

## Output Format

The agent **must** produce output in exactly this structure:

    # Creedengo Rule Contribution

    Contribution mode:
    Proposed rule:
    Language(s):
    Source references consulted:

    ## Duplicate Check
    Existing related rules:
    Verdict:

    ## Rule Candidate
    Rule ID:
    Title:
    Anti-pattern:
    Compliant alternative:
    Environmental rationale:
    Detection feasibility:
    False-positive risks:

    ## Draft Artifacts
    Files to create or update:
    - <path>

    Metadata JSON draft:
        <indented JSON or "not enough information">

    Asciidoc draft:
        <indented Asciidoc or "not enough information">

    ## Examples
    Non-compliant:
        <code>

    Compliant:
        <code>

    ## Contribution Checklist
    - <next action>

    ## Maintainer Questions
    - <question>

    ## Self-check
    - Duplicate check completed: <yes/no>
    - Official IDs preserved: <yes/no>
    - Schema copied from existing rules: <yes/no/not applicable>
    - Examples verified or marked pseudocode: <yes/no>
    - Unsupported claims removed: <yes/no>

### When the rule is a duplicate

    # Creedengo Rule Duplicate Analysis

    Proposed rule:
    Matching existing rule:
    Evidence:
    Recommendation:
    Suggested update instead:

---

## Constraints

The agent **must never**:

- [ ] Invent a final GCI rule ID for a new rule
- [ ] Create a duplicate rule when an existing rule already covers the pattern
- [ ] Invent JSON metadata fields without checking comparable existing rules
- [ ] Mark a language as supported without evidence from `RULES.md` or maintainer intent
- [ ] Claim an environmental benefit without a source, accepted best practice, or measurement rationale
- [ ] Produce examples that change application behavior without saying so
- [ ] Treat runtime-only issues as deterministic static rules
- [ ] Produce output in a format different from the one defined in Output Format

---

## Examples

### Example 1 - Duplicate candidate

**Input:**

    Create a Creedengo rule for Python: pandas read_csv should not load every column when only two columns are used.

**Expected output:**

    # Creedengo Rule Duplicate Analysis

    Proposed rule: pandas read_csv should not load every column when only a subset is used
    Matching existing rule: verify current `RULES.md`; this appears related to the existing data/AI rule
    for avoiding unnecessary CSV columns if present.
    Evidence: `RULES.md` contains a similar rule after verification.
    Recommendation: do not create a duplicate rule.
    Suggested update instead: improve examples, metadata, or language-specific documentation for the
    existing rule if coverage is incomplete.

### Example 2 - New rule candidate

**Input:**

    Propose a Creedengo rule for JavaScript that detects unbounded LLM retries in an API route.

**Expected output:**

    # Creedengo Rule Contribution

    Contribution mode: propose a new rule
    Proposed rule: detect unbounded LLM retries in an API route
    Language(s): JavaScript / TypeScript
    Source references consulted: RULES.md, similar JavaScript rules, RGESN Algorithmie

    ## Duplicate Check
    Existing related rules: <list after checking RULES.md>
    Verdict: no exact duplicate found / possible overlap with retry or API-efficiency rule if present

    ## Rule Candidate
    Rule ID: GCI-TBD
    Title: Avoid unbounded retries around AI inference calls
    Anti-pattern: retry loops around model calls without max attempts, timeout, or backoff
    Compliant alternative: bounded retry with timeout, max attempts, and error handling
    Environmental rationale: unbounded retries can multiply inference calls and resource consumption
    Detection feasibility: Heuristic static rule
    False-positive risks: custom retry helpers may hide limits outside the local function

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_green_code_review.md` | Uses official Creedengo rules to review user code after rules exist |
| `SKILL_build_rgesn_evidence.md` | May reveal recurring RGESN gaps that deserve Creedengo rules |
| `SKILL_review_frugal_ai.md` | May identify AI efficiency anti-patterns that could become future Creedengo rules |

---

## Notes

- Prefer improving an existing rule over adding a new overlapping rule.
- A strong rule is narrow, testable, language-aware, and behavior-preserving.
- When the candidate is valuable but not static-analysis-friendly, turn it into an audit checklist or RGESN
  evidence requirement instead of forcing it into Creedengo.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial version |
