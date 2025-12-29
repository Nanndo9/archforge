# Archforge

CLI for automated backend creation driven by technical decisions.

Language: [Português](README.md) | [English](README.en.md)
Documentation: [PT-BR](https://github.com/Nanndo9/archforge/blob/main/docs/pt-BR/index.md) | [EN](https://github.com/Nanndo9/archforge/blob/main/docs/en/index.md)

## Why it exists

It came from a dissatisfaction: every new project meant rebuilding the entire
setup from scratch. That wasted time and energy that should go to what matters.
Archforge automates this stage so you can focus on product and domain rules.

Most generators treat architecture as a byproduct of the framework. Archforge
was created to do the opposite: turn explicit decisions (backend, architecture,
database, ORM, Docker, tests) into a coherent project from the first commit.

Architecture is not only folder structure. It is about boundaries, dependencies,
and domain rules. Archforge accelerates the starting point, but you are still
responsible for keeping the domain decoupled and consistent.

No AI usage: generation is deterministic and template driven.

## What it delivers today (v0.1)

- Express as the backend (focus on simplicity).
- Clean Architecture as the baseline.
- Postgres + TypeORM, or no database.
- Optional Docker (and Postgres in Docker when selected).
- Optional tests (Vitest or none).

## Documentation

- PT-BR: `docs/pt-BR/index.md`
- EN: `docs/en/index.md`

## Requirements

- Node 24 LTS
- npm

## Install (npm)

```bash
npm i -g archforgejs
```

The installed command is still `archforge`.

## Install (local development)

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

## License

MIT
