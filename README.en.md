# Archforge

CLI for automated backend creation driven by technical and architectural decisions.

Language: [Portugues](https://github.com/Nanndo9/archforge/blob/main/README.md) | [English](https://github.com/Nanndo9/archforge/blob/main/README.en.md)
Documentation: [PT-BR](https://github.com/Nanndo9/archforge/blob/main/docs/pt-BR/index.md) | [EN](https://github.com/Nanndo9/archforge/blob/main/docs/en/index.md)

## Why it exists

It came from a real frustration: every new project meant rebuilding the entire setup. That drains time and energy that should go to the product and domain rules.

Archforge automates the starting stage and turns explicit decisions (backend, architecture, database, ORM, Docker, tests) into a coherent project from the first commit.

Architecture is not just folder structure. It is about boundaries, dependencies, and domain rules. Archforge accelerates the starting point, but the domain decoupling and consistency are still your responsibility.

No AI usage: generation is deterministic and template driven.

## What it delivers today (v0.1)

- Express as the backend (focus on the basics done right).
- Clean Architecture as the baseline.
- Postgres + TypeORM, or no database.
- Optional Docker (includes Postgres when a database is selected).
- Optional tests (Vitest or none).

## Install (npm)

```bash
npm i -g archforgejs
```

The installed command is still `archforge`.

## Local development install

```bash
npm run build
npm link
```

After that, the `archforge` command is available globally.

## Quick usage

```bash
archforge init
```

Other commands:

```bash
archforge --help
archforge presets
archforge -p list
archforge -p clean-api
archforge -p clean-no-db
archforge init --no-install
archforge init --save-context
```

## Current presets

- `clean-api`: Express + Clean + Postgres + TypeORM + Docker
- `clean-no-db`: Express + Clean without database

## Requirements

- Node 24 LTS
- npm

## License

MIT
