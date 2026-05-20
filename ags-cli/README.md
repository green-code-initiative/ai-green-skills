# ags-cli

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
cd ags-cli
go build
```

The binary `ags-cli.exe` will be generated in the current directory.

### 3. Run the CLI

```
./ags-cli.exe
```

---

## Prerequisites

| Element | Default value |
|---|---|
| Git repository | `<URL-GIT>` — project `<path-git>` |
| Installation directory | `~/.copilot/skills/` (configurable, see `config local-repo`) |
| Metadata file | `~/.config/ags-cli/meta.json` |
| Application config | `~/.config/ags-cli/config.json` |

### Git Token

Set your token in one of these sources (decreasing priority):

1. Environment variable: `Git_TOKEN=xxxx`
2. `.env` file in the current directory
3. File `~/.config/ags-cli/.env`

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
ags-cli.exe
```

- Automatically checks for available updates at startup.
- REPL with command history (↑↓ arrows) and **autocompletion** (Tab).
- Type `exit` or `quit` to exit.

### Command-line mode

```
ags-cli.exe <command> [options]
```

---

## Commands

### `list`

Displays locally installed skills with their version, source and description.

```
ags-cli.exe list
```

### `catalog`

Displays all skills available on Git, their remote version and local status (installed / update available).

```
ags-cli.exe catalog
```

### `install <name>`

Downloads and installs a skill from Git.

```
ags-cli.exe install my-skill
```

### `update <name> | --all`

Updates an installed skill, or all skills with `--all`.

```
ags-cli.exe update my-skill
ags-cli.exe update --all
```

### `uninstall <name> | --all`

Uninstalls a skill. Asks for confirmation unless `-y` / `--yes` is passed.

```
ags-cli.exe uninstall my-skill
ags-cli.exe uninstall my-skill -y
ags-cli.exe uninstall --all
```

Aliases: `remove`, `rm`

### `config local-repo [<path> | --reset]`

Displays or changes the skill installation directory.

```
# Show the current destination
ags-cli.exe config local-repo

# Set a new directory
ags-cli.exe config local-repo D:\MySkills
ags-cli.exe config local-repo ~/my-skills

# Reset to default (~/.copilot/skills)
ags-cli.exe config local-repo --reset
```

The value is persisted in `~/.config/ags-cli/config.json`.

### `version`

Displays the binary version.

```
ags-cli.exe version
```

### `help`

Displays help.

```
ags-cli.exe help
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
