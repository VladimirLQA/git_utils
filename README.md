# git-interactive

A collection of interactive CLI commands for common Git workflows, built on [Conventional Commits](https://www.conventionalcommits.org/).

## Prerequisites

- Node.js

## Installation

```bash
npm install -g git-interactive-vlaqa
```

---

## Commands

### `gicm` — Interactive Commit

Creates a Conventional Commit via guided prompts. Requires staged changes.

```bash
gicm
```

#### Interactive Prompts

**1. Commit type**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `test` | Test additions or changes |
| `fix` | Bug fix |
| `chore` | Maintenance tasks |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation changes |
| `style` | Formatting, whitespace, etc. |

**2. Scope** *(optional)*

| Option | Description |
|--------|-------------|
| `branch` | Uses the current branch name as scope |
| `e2e` | Literal scope `e2e` |
| `api` | Literal scope `api` |
| `omit` | No scope |
| `custom` | Prompts for a custom scope string |

**3. Description**

A short description of the change. Must be at least 5 characters. A live character counter (`[n/75]`) is shown while typing.

#### Output format

```
<type>(<scope>): <description>
```

Examples:

```
feat(my-branch): add user authentication
fix: resolve null pointer on login
chore(api): update dependencies
```

After a successful commit, the short hash and subject are printed:

```
✔ Committed: a1b2c3d feat(my-branch): add user authentication
```

#### Error handling

| Condition | Message |
|-----------|---------|
| Not inside a Git repository | `Make sure you are calling commands from GIT project!` |
| No staged files | `No staged files. Stage your changes with \`git add\` first.` |
| Prompt cancelled (`Ctrl+C`) | `👋 until next time!` |

---

### `gia` — Interactive Add

Interactively stage files using a checkbox UI. Shows all changed files grouped by directory, with their current Git status.

```bash
gia
```

#### Interactive Prompts

A checkbox list is presented with all modified, untracked, and partially staged files. Files inside subdirectories are grouped under their parent directory.

| Entry type | Example display |
|------------|-----------------|
| Root-level file | `M  src/index.ts` |
| Directory group | `src/` |
| File inside directory | `    M  src/add.ts` |

- Already-staged files are pre-checked.
- Selecting a directory entry (`src/`) stages all files inside it.
- Space to toggle, Enter to confirm.

#### Output

```
✔ Staged 3 file(s):
  src/add.ts
  src/index.ts
  tests/add.test.ts
```

#### Error handling

| Condition | Message |
|-----------|---------|
| Not inside a Git repository | `Make sure you are calling commands from GIT project!` |
| Working tree is clean | `No changes to stage. Working tree is clean.` |
| No files selected | `No files selected. Nothing staged.` |
| Prompt cancelled (`Ctrl+C`) | `👋 until next time!` |
