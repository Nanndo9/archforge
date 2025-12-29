# Archforge

CLI for automated backend creation driven by technical decisions.

Versao em portugues: `README.md`

## Why it exists

Most generators treat architecture as a byproduct of the framework. Archforge
was created to do the opposite: turn explicit decisions (backend, architecture,
database, ORM, Docker, tests) into a coherent project from the first commit.

Architecture is not only folder structure. It is about boundaries, dependencies,
and domain rules. Archforge accelerates the starting point, but you are still
responsible for keeping the domain decoupled and consistent.

## What it delivers today (v0.1)

- Express as the backend (focus on simplicity).
- Clean Architecture as the baseline.
- Postgres + TypeORM, or no database.
- Optional Docker (and Postgres in Docker when selected).
- Optional tests (Vitest or none).

## Requirements

- Node 24 LTS
- npm

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
archforge init --no-install
archforge init --save-context
```

## Current presets

- `clean-api`: Express + Clean + Postgres + TypeORM + Docker
- `clean-no-db`: Express + Clean without database

## Generated projects

### Postgres + TypeORM

Includes a basic `users` CRUD, migrations, and endpoints:

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

Migrations:

```bash
npm run migration:generate
npm run migration:run
```

Docker (with Postgres):

```bash
docker compose up --build
```

### No database

Minimal project with healthcheck and no database layer.

## Environment configuration

In the generated project:

```bash
cp .env.example .env
```

Main variables:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

If you choose Postgres in Docker, the compose file injects `DB_HOST=postgres`
only inside the container. On the host, keep `DB_HOST=localhost` so migrations
run normally.

## Architecture note

Archforge provides a coherent scaffold, but it does not enforce decoupling
by itself. The baseline is there; enforcing boundaries and domain rules is
still the team's responsibility.

## License

MIT
