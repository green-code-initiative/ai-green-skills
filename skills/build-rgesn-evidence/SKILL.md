# SKILL - RGESN Evidence Builder

> **Version:** 1.0  
> **Last updated:** 2026-05-19  
> **Description:** Use when: RGESN evidence builder; RGESN self-assessment; declaration d'ecoconception; eco-design compliance dossier; digital sobriety evidence; sustainability proof matrix; ecoconception declaration; public-sector eco-design audit.

---

## Purpose

Build a traceable RGESN self-assessment dossier for a digital service, including applicability, evidence,
gaps, weighted progress score, declaration d'ecoconception draft, and prioritized remediation roadmap.

---

## Trigger

This skill is activated when:

- The user asks to build, review, or complete an RGESN self-assessment
- The user asks for an ecoconception declaration, compliance proof, or evidence dossier
- The user asks for RGESN criteria mapped to a codebase, architecture, product documentation, or pull request
- The user mentions "RGESN", "declaration d'ecoconception", "eco-design evidence", "conformite ecoconception", or "score d'avancement"

---

## Source of Truth

The agent **must** consult the official RGESN sources before producing an assessment.  
It must **never** invent criteria, weights, N/A conditions, or compliance claims.

| Source | URL |
|---|---|
| RGESN 2024 publication page | https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/ |
| RGESN 2024 PDF | https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/referentiel_general_ecoconception_des_services_numeriques_version_2024.pdf |
| Official evaluation spreadsheet | Use the XLSX or ODS linked from the RGESN 2024 publication page |
| Official declaration example | Use the DOCX or ODT linked from the RGESN 2024 publication page |
| Creedengo rules specifications | https://github.com/green-code-initiative/creedengo-rules-specifications |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **Define the assessed service and scope**  
   Identify the service name, service type, user-facing scope, URLs if any, repository boundaries,
   environments, main user journeys, and excluded components. If the scope is unclear, ask before scoring.

2. **Load the official RGESN criteria**  
   Consult the official RGESN page or spreadsheet. Keep the official theme, criterion ID, wording,
   priority, difficulty, target, N/A condition, implementation guidance, and control method for each criterion.

3. **Build the applicability matrix**  
   For every criterion, classify applicability as:
   - `Applicable`
   - `Not applicable`
   - `Unknown`

   Mark a criterion `Not applicable` only when the official RGESN condition allows it and the project facts
   support that decision. Criteria marked "applicable to all services" must not be excluded from scoring.

4. **Collect evidence**  
   Search the codebase and documentation for proof. Evidence may include files, line references, route
   definitions, API contracts, infrastructure configuration, CI reports, performance budgets, monitoring
   dashboards, analytics exports, product specs, UX research, architecture decisions, hosting data, or security
   and privacy documentation.

   Classify evidence strength as:
   - `Strong` - direct proof from code, config, document, or measurement
   - `Weak` - indirect signal requiring human confirmation
   - `Missing` - no usable proof found

5. **Evaluate each criterion**  
   For each applicable criterion, assign:
   - `Validated` when the official control method is satisfied by strong evidence
   - `Not validated` when evidence shows a gap or when proof is missing
   - `Needs human confirmation` when the agent cannot verify the point from available material

   Do not count partial implementation as validated for the official score.

6. **Compute the RGESN progress score**  
   Use the official weighting:
   - `Prioritaire`: 1.5
   - `Recommande`: 1.25
   - `Modere`: 1.0

   Calculate:

       weighted validated applicable criteria / weighted applicable criteria * 100

   Exclude only criteria legitimately marked `Not applicable`. Treat `Needs human confirmation` as not
   validated unless the user explicitly asks for a provisional internal score.

7. **Generate the declaration draft**  
   Produce a declaration d'ecoconception draft that includes the assessed scope, methodology, score,
   theme scores, evidence summary, limitations, known gaps, and planned improvements. Label it as a draft
   until reviewed by the service owner.

8. **Generate a remediation roadmap**  
   Prioritize gaps using this order:
   - Official RGESN priority
   - Evidence strength
   - Estimated impact on resource consumption, terminal lifetime, or user control
   - Implementation effort
   - Risk of regression

9. **Self-check before responding** *(mandatory - never skip)*  
   Verify: every criterion ID and wording comes from the official RGESN source, every N/A decision cites the
   official condition, every score uses the official weights, and every compliance claim has evidence.
   Remove or downgrade any item that fails a check.

---

## Fallback Behavior

| Situation | Agent action |
|---|---|
| Service scope is missing | Ask the user: "What digital service, repository, URL, and perimeter should be assessed for RGESN?" |
| Official RGESN source is unreachable | Inform the user; do not score or invent criteria from memory |
| Evidence is insufficient | Produce an evidence gap report instead of a compliance claim |
| The user asks for certification | Explain that this is a self-assessment aid, not a certification or legal assurance |
| The user asks for a public declaration | Produce a draft and mark which claims require owner validation before publication |

---

## Output Format

The agent **must** produce output in exactly this structure:

    # RGESN Evidence Dossier

    Service:
    Scope:
    Assessment date:
    RGESN version:
    Sources consulted:

    ## Executive Summary
    Overall score:
    Validated criteria:
    Not validated criteria:
    Not applicable criteria:
    Needs human confirmation:
    Main risks:

    ## Theme Scores
    | Theme | Score | Validated / Applicable | Main gap |
    |---|---:|---:|---|

    ## Evidence Matrix
    | Criterion | Theme | Priority | Applicability | Status | Evidence | Evidence strength | Gap |
    |---|---|---|---|---|---|---|---|

    ## Declaration Draft
    <Draft declaration d'ecoconception text. Mark assumptions and unverified claims.>

    ## Remediation Roadmap
    | Priority | Criterion | Action | Evidence needed | Effort | Risk |
    |---|---|---|---|---|---|

    ## Human Review Required
    - <Items that require product owner, architecture, hosting, legal, RSE, or accessibility confirmation>

    ## Self-check
    - Official criteria used: <yes/no>
    - N/A decisions justified: <yes/no>
    - Score formula applied: <yes/no>
    - Unsupported claims removed: <yes/no>

### When evidence is insufficient for scoring

    # RGESN Evidence Gap Report

    Service:
    Scope:
    RGESN version:

    The available material is insufficient to produce a reliable RGESN score.

    Missing inputs:
    - <input needed>

    Next evidence to collect:
    - <evidence item>

---

## Constraints

The agent **must never**:

- [ ] Present the dossier as a certification, legal validation, or third-party audit
- [ ] Invent RGESN criterion IDs, wording, priorities, weights, or N/A conditions
- [ ] Count a criterion as validated without strong evidence tied to the official control method
- [ ] Treat a partial implementation as validated in the official score
- [ ] Exclude a criterion from scoring unless the official N/A condition supports it
- [ ] Claim environmental impact reduction in CO2, water, or resources without a measurement method and data
- [ ] Hide uncertainty; use `Needs human confirmation` when evidence is not available
- [ ] Produce output in a format different from the one defined in Output Format

---

## Examples

### Example 1 - Evidence dossier for a web service

**Input:**

    Apply the RGESN Evidence Builder skill to this Next.js application.
    Produce the self-assessment, score, declaration draft, and roadmap.

**Expected output:**

    # RGESN Evidence Dossier

    Service: <project name>
    Scope: Next.js web application, repository only, production hosting data not provided
    Assessment date: <current date>
    RGESN version: 2024
    Sources consulted: official RGESN publication page, official RGESN criteria

    ## Executive Summary
    Overall score: provisional, because hosting and product governance evidence are missing
    Validated criteria: <count>
    Not validated criteria: <count>
    Not applicable criteria: <count>
    Needs human confirmation: <count>
    Main risks: missing declaration, no documented service utility, no hosting environmental data

    ## Theme Scores
    | Theme | Score | Validated / Applicable | Main gap |
    |---|---:|---:|---|
    | Frontend | <score> | <count>/<count> | Missing media budget |

    ## Evidence Matrix
    | Criterion | Theme | Priority | Applicability | Status | Evidence | Evidence strength | Gap |
    |---|---|---|---|---|---|---|---|
    | <official ID> | Frontend | Prioritaire | Applicable | Not validated | No performance budget found | Missing | Add budget and measurement |

### Example 2 - Missing scope

**Input:**

    Build an RGESN declaration.

**Expected output:**

    What digital service, repository, URL, and perimeter should be assessed for RGESN?

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_green_code_review.md` | Provides code-level Creedengo evidence that can support RGESN technical criteria |
| `SKILL_review_frugal_ai.md` | Provides deeper evidence for RGESN Algorithmie criteria when the service includes AI or ML |
| `SKILL_contribute_creedengo_rule.md` | Helps improve Creedengo rules when recurring RGESN evidence gaps map to missing code rules |

---

## Notes

- RGESN scoring is a progress indicator for implementation of the reference framework, not a direct
  environmental impact calculation.
- A public declaration should be reviewed by the service owner before publication.
- When the assessed service includes AI, use `SKILL_review_frugal_ai.md` for the Algorithmie theme before
  finalizing the dossier.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial version |
