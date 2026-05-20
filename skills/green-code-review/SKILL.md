---
name: green-code-review
description: reen code review; Creedengo violations; eco-design code analysis; sustainable code audit; GCI rules; energy-efficient code.
metadata: 
   version: 1.1.0
---

## Purpose

Analyse source code and detect violations of Creedengo green code rules,
then report each violation with its official ID, severity, fix, and a link
to the authoritative specification.

---

## Trigger

This skill is activated when:

- The user pastes a code snippet and asks for a green code review
- A comment `# @agent review this file for Creedengo green code violations` is present in the file
- The user explicitly asks to "apply the Green Code Review skill"
- Any review request references Creedengo, green code, or eco-design rules

---

## Source of Truth

The agent **must** consult the following references before reporting any violation.  
It must **never** invent a rule ID or description not present in these sources.

| Source | URL |
|---|---|
| Rules support matrix | https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md |
| Rule specification (per rule) | `https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/src/main/rules/<RULE_ID>/<language>/<RULE_ID>.asciidoc` |
| Rule metadata (per rule) | `https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/src/main/rules/<RULE_ID>/<RULE_ID>.json` |
| Green Code Initiative | https://green-code-initiative.org |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **Identify the programming language**  
   Detect the language of the submitted code (Java, Python, PHP, JavaScript, C#, Rust, HTML, etc.).  
   If the language cannot be determined, ask the user before proceeding.

2. **Load the applicable rules for that language**  
   Consult RULES.md. Retain only the rules where the column for the detected language shows ✅, 🚧, or 🚀.  
   Discard every rule marked 🚫 for that language — they must never be reported.

3. **Scan the code for pattern matches**  
   For each retained rule, check whether the submitted code contains a pattern that violates the rule description.  
   Work rule by rule, top to bottom.

4. **Verify each candidate violation**  
   For every pattern match found, open the official `.asciidoc` specification for that rule and confirm  
   the violation is real and applies to this language. Do not report a violation without this step.

5. **Build the report**  
   For each confirmed violation, produce one entry in the Output Format defined below.  
   Order entries by line number in the submitted code.

6. **Produce the summary block**  
   After all violation entries, always add the summary block as defined below.

7. **Self-check before responding** *(mandatory — never skip)*  
   Verify: every reported rule ID exists in RULES.md, no language column is 🚫, every entry contains  
   a valid specification URL. If any check fails, remove that entry.

---

## Fallback Behavior

| Situation | Agent action |
|---|---|
| Language cannot be determined | Ask the user: "What programming language is this code written in?" |
| No violations found after full scan | Produce the "no violations" output block defined in Output Format |
| RULES.md or `.asciidoc` specification is unreachable | Inform the user; do not report violations from memory |

---

## Output Format

### Per violation — one block per violation found

    🌿 [<RULE_ID>] — <Rule short name>
       Status   : <icon and label — see Status Icons table>
       Severity : <Critical | Major | Minor | Info>
       Line(s)  : <line number(s) in the submitted code>
       Issue    : <one sentence describing what is wrong>
       Impact   : <one sentence describing the energy / performance impact>
       Fix      : <the corrected code snippet or pattern>
       Cost     : <remediation cost from the rule JSON, e.g. "5min">
       Ref      : https://github.com/green-code-initiative/creedengo-rules-specifications/
                  blob/main/src/main/rules/<RULE_ID>/<language>/<RULE_ID>.asciidoc

### Summary block — always present, even when there are zero violations

    --- Summary ---
    Language  : <detected language>
    Violations: <total count> (<count> ✅ enforced by SonarQube, <count> 🚀 not yet)

### When no violations are found

    ✅ No Creedengo green code violations detected for <Language>.

    --- Summary ---
    Language  : <detected language>
    Violations: 0

---

## Status Icons

| Icon | Meaning |
|---|---|
| ✅ | Rule already enforced by SonarQube — will appear in your quality gate |
| 🚧 | Rule implementation in progress — not yet in SonarQube |
| 🚀 | Rule specified but not yet implemented — not yet in SonarQube |
| ❓ | Potential issue — applicability not yet confirmed for this language |
| 🚫 | Not applicable — never reported for this language |

The Status field in each violation entry must use the icon that appears in the RULES.md column
for the detected language, not the icon for another language.

---

## Constraints

The agent **must never**:

- [ ] Invent a rule ID (e.g. GCI999) not present in RULES.md
- [ ] Report a violation for a language where the rule is marked 🚫 in RULES.md
- [ ] Skip the verification step against the official `.asciidoc` specification
- [ ] Omit the `Ref` URL in any violation entry
- [ ] Produce output in a format different from the one defined in Output Format
- [ ] Report a rule as ✅ when RULES.md shows 🚀 or 🚧 for that language
- [ ] Modify or paraphrase rule IDs — always use the exact ID from RULES.md

---

## Examples

### Example 1 — Python logging with f-string interpolation

**Input:**

    import logging
    name = "world"
    logging.info(f"Hello {name}")

**Expected output:**

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

### Example 2 — Java Spring repository called inside a loop

**Input:**

    for (User user : users) {
        Order order = orderRepository.findByUserId(user.getId());
        process(order);
    }

**Expected output:**

    🌿 [GCI1] — Calling a Spring repository inside a loop or a stream
       Status   : ✅ Implemented
       Severity : Major
       Line(s)  : 2
       Issue    : orderRepository.findByUserId() is called on each iteration,
                  triggering one database query per loop cycle
       Impact   : Unnecessary repeated database calls consume CPU, memory, and
                  network bandwidth — prefer a single batched query
       Fix      : List<Order> orders = orderRepository.findAllByUserIdIn(
                      users.stream().map(User::getId).collect(Collectors.toList()));
       Cost     : 30min
       Ref      : https://github.com/green-code-initiative/creedengo-rules-specifications/
                  blob/main/src/main/rules/GCI1/java/GCI1.asciidoc

    --- Summary ---
    Language  : Java
    Violations: 1 (1 ✅ enforced by SonarQube, 0 🚀 not yet)

### Example 3 — Python no violations found

**Input:**

    import logging
    name = "world"
    logging.info("Hello %s", name)

**Expected output:**

    ✅ No Creedengo green code violations detected for Python.

    --- Summary ---
    Language  : Python
    Violations: 0

### Example 4 — Java no violations found

**Input:**

    List<Long> userIds = users.stream()
        .map(User::getId)
        .collect(Collectors.toList());
    List<Order> orders = orderRepository.findAllByUserIdIn(userIds);
    orders.forEach(order -> process(order));

**Expected output:**

    ✅ No Creedengo green code violations detected for Java.

    --- Summary ---
    Language  : Java
    Violations: 0

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_TEMPLATE.md` | Base template used to create this skill |

---

## Notes

- The agent does **not** know the Creedengo rules by heart. It must always verify against
  `creedengo-rules-specifications` before reporting a violation.
- The rules matrix is updated regularly. Always use the live RULES.md, not a cached copy,
  to determine language applicability.
- For rules marked ❓, the agent may report a **potential** violation prefixed with `❓`
  and note that applicability is not yet confirmed for this language.
- Remediation cost comes from the `constantCost` field in each rule's `.json` metadata file.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.1 | 2026-05-19 | Added `Last updated` and `Description` metadata; added Fallback Behavior section; added Example 4 (Java — no violations); labelled Example 3 more precisely |
| 1.0 | 2026-05-19 | Initial version |