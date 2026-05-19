# AI Green Skills

This folder contains **AI skills** for sustainable software engineering, with a strong focus on
[Creedengo rules](https://green-code-initiative.org) and [RGESN evidences](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/).

---

## Files in this folder

| File | Role |
|---|---|
| `SKILL_TEMPLATE.md` | Generic template to write a new skill |
| `SKILL_green_code_review.md` | Skill: detect green code violations in source code |
| `SKILL_build_rgesn_evidence.md` | Skill: build a traceable RGESN self-assessment dossier with evidence, score, declaration draft, and roadmap |
| `SKILL_review_frugal_ai.md` | Skill: review AI, ML, LLM, RAG, and agent features for digital sobriety and RGESN Algorithmie evidence |
| `SKILL_contribute_creedengo_rule.md` | Skill: create, review, or update Creedengo rule specifications and contribution artifacts |

---

## How to use these skills?

A skill should be registered as a **persistent custom instruction** in your AI coding assistant —
not pasted into a chat. This way the agent applies the skill automatically whenever the trigger
conditions are met, without you having to repeat anything.

> **Key principle:** a skill is an instruction you give to your assistant once. It stays active
> for every future interaction in that context.

### GitHub Copilot

Add the skill content to your repository's custom instructions file:

    .github/copilot-instructions.md

Or create a dedicated instructions file with an `applyTo` pattern:

    .github/instructions/green-code-review.instructions.md

Copilot will apply the skill automatically on matching files and requests.

### Cursor

Paste the skill content into your Cursor rules file at the root of your project:

    .cursor/rules/green-code-review.mdc

Cursor applies rules automatically based on the context of each conversation.

### Claude (claude.ai)

Open **Settings → Custom Instructions** (personal) or your **Project Instructions** (project-scoped)
and paste the skill content there. Claude will apply it to every conversation in that scope.

### ChatGPT

Open **Settings → Personalization → Custom instructions** and paste the skill content.
For a project-scoped setup, create a **GPT** and add the skill as part of its system instructions.

### Any other LLM tool

Look for the equivalent of "system prompt", "custom instructions", or "persistent context"
in your tool's settings. Paste the skill content there.

---

## How to create a new skill — `SKILL_TEMPLATE.md`

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
| **Fallback Behavior** | What to do when input is missing, ambiguous, or a source is unreachable |
| **Output Format** | The exact structure of what the agent produces |
| **Constraints** | Hard rules: what the agent must never do |
| **Examples** | At least one happy-path and one edge-case input/output pair |
| **Related Skills** | Other skills that complement this one |
| **Changelog** | Version history of breaking changes |

### Step 3 — Test it manually

Register the skill in your AI assistant (see "How to use these skills?" above), then give it
a realistic input and verify the output matches the format and constraints you defined.

### Step 4 — Name it consistently

Use the naming convention: `SKILL_<verb>_<subject>.md`

Examples: `SKILL_review_rule_spec.md`, `SKILL_implement_rule.md`, `SKILL_generate_asciidoc.md`

---

## Contributing a new skill

If you identify a recurring task where an AI agent could help Creedengo contributors,
create a new skill using `SKILL_TEMPLATE.md` and open a pull request.

Good candidates for future skills:

- Guide a contributor through implementing a rule in a plugin
- Generate the asciidoc scaffold for a new rule from a plain description
- Validate a test resource file (compliant/non-compliant annotations)
- Generate a cross-agent installation package for Copilot, Cursor, Claude, ChatGPT, and Codex
- Compare a pull request against an existing RGESN evidence dossier

---

## Reference

- Creedengo rules specifications: https://github.com/green-code-initiative/creedengo-rules-specifications
- Rules support matrix: https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md
- Green Code Initiative: https://green-code-initiative.org
