# Contributing rules

This folder contains guidelines for skill creation. All types of contributions are encouraged and valued.

## Files in this folder

<!-- TODO : mettre à jour les SKILL.md de frugal-ai/, rgesn/ et w3c/ pour correspondre aux roles du tableau ci-dessous ? -->

| File                 | Role                                                                                    |
|----------------------|-----------------------------------------------------------------------------------------|
| `SKILL_TEMPLATE.md`  | Generic template to write a new skill                                                   |
| `frugal-ai/SKILL.md` | Skill creator : help any agent creating a skill matching AFNOR frugal AI considerations |
| `rgesn/SKILL.md`     | Skill creator : help any agent creating a skill matching RGESN considerations           |
| `w3c/SKILL.md`       | Skill creator : help any agent creating a skill matching w3c considerations             |

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
