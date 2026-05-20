# AI Green Skills

This folder contains **AI skills** for sustainable software engineering, with a strong focus on
[Creedengo rules](https://green-code-initiative.org) and [RGESN evidences](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/).

---

## How to use these skills?

A skill should be registered as a **persistent custom instruction** in your AI coding assistant —
not pasted into a chat. This way the agent applies the skill automatically whenever the trigger
conditions are met, without you having to repeat anything.

> **Key principle:** a skill is an instruction you give to your assistant once. It stays active
> for every future interaction in that context.

<!-- TODO Mettre à jour cette partie avec outil CLI -->
<!-- Détail par Agent pertinent ? (solution générique) -->

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

## Contributing with new skills

Please read [CONTRIBUTING.md](./contribute/CONTRIBUTING.md)

---

## Reference

- Creedengo rules specifications: https://github.com/green-code-initiative/creedengo-rules-specifications
- Rules support matrix: https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md
- Green Code Initiative: https://green-code-initiative.org
