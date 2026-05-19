# cli-skills

AI Skills manager (Copilot/VSCode) stored in a centralized repository.

---

## Installation & Build

### 1. Install Go

Download and install Go from the official website: https://go.dev/dl/

Verify the installation:

```
go version
```

### 2. Build the binary

Clone this repository, then run:

```
cd cli-skills
go build
```

The binary `cli-skills.exe` will be generated in the current directory.

### 3. Run the CLI

```
./cli-skills.exe
```

---

## Prerequisites

| Element | Default value |
|---|---|
| Git repository | `<URL-GIT>` — project `<path-git>` |
| Installation directory | `~/.copilot/skills/` (configurable, see `config local-repo`) |
| Metadata file | `~/.config/cli-skills/meta.json` |
| Application config | `~/.config/cli-skills/config.json` |

### Git Token

Set your token in one of these sources (decreasing priority):

1. Environment variable: `Git_TOKEN=xxxx`
2. `.env` file in the current directory
3. File `~/.config/cli-skills/.env`

Contents of the `.env` file:
```env
# optional
Git_URL=<URL-GIT>
Git_PROJECT=<PATH-GIT>
GIT_REF=<BRANCH-NAME>
GIT_SKILLS_PATH=<PATH-SKILLS>
```

---

## Usage

### Interactive mode (recommended)

Launch the binary without arguments:

```
cli-skills.exe
```

- Automatically checks for available updates at startup.
- REPL with command history (↑↓ arrows) and **autocompletion** (Tab).
- Type `exit` or `quit` to exit.

### Command-line mode

```
cli-skills.exe <command> [options]
```

---

## Commands

### `list`

Displays locally installed skills with their version, source and description.

```
cli-skills.exe list
```

### `catalog`

Displays all skills available on Git, their remote version and local status (installed / update available).

```
cli-skills.exe catalog
```

### `install <name>`

Downloads and installs a skill from Git.

```
cli-skills.exe install my-skill
```

### `update <name> | --all`

Updates an installed skill, or all skills with `--all`.

```
cli-skills.exe update my-skill
cli-skills.exe update --all
```

### `uninstall <name> | --all`

Uninstalls a skill. Asks for confirmation unless `-y` / `--yes` is passed.

```
cli-skills.exe uninstall my-skill
cli-skills.exe uninstall my-skill -y
cli-skills.exe uninstall --all
```

Aliases: `remove`, `rm`

### `config local-repo [<path> | --reset]`

Displays or changes the skill installation directory.

```
# Show the current destination
cli-skills.exe config local-repo

# Set a new directory
cli-skills.exe config local-repo D:\MySkills
cli-skills.exe config local-repo ~/my-skills

# Reset to default (~/.copilot/skills)
cli-skills.exe config local-repo --reset
```

The value is persisted in `~/.config/cli-skills/config.json`.

### `version`

Displays the binary version.

```
cli-skills.exe version
```

### `help`

Displays help.

```
cli-skills.exe help
```

---

## Skill structure

Each skill is a folder containing a `SKILL.md` file with a YAML header (*frontmatter*):

```markdown
---
name: my-skill
version: 1.2.0
description: What this skill does.
---
...
```

The `version` field is used for update management.
