# Archforge Documentation (EN)

## Overview

Archforge is a CLI that turns technical decisions into a coherent project. It
was created to avoid repeating the same setup every time a new backend starts.
Generation is deterministic and template driven, with no AI usage.

Architecture is not only folder structure. Archforge provides the baseline, but
decoupling and domain rules are still the team's responsibility.

## Requirements

- Node 24 LTS
- npm

## Install (local development)

```bash
npm run build
npm link
```

## CLI usage

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

## Presets

- `clean-api`: Express + Clean + Postgres + TypeORM + Docker
- `clean-no-db`: Express + Clean without database

## Supported combos (v0.1)

- Backend: Express
- Architecture: Clean Architecture
- Database: Postgres or none
- ORM: TypeORM (when Postgres) or none
- Docker: optional
- Tests: Vitest or none

## Generated projects

### Postgres + TypeORM

Includes a basic `users` CRUD, migrations, and endpoints:

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

Migration scripts:

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

## Architecture notes

Archforge provides a coherent scaffold, but it does not enforce decoupling
by itself. Keeping boundaries and domain rules is the team's responsibility.

### Detailed note

Architecture is not just folders. It defines:

- dependency boundaries (who can depend on whom)
- contracts between layers
- where business rules live

In the Clean template, the intent is:

1) **Domain** does not know infrastructure.  
   Entities, rules and contracts should exist without HTTP, database or ORM.

2) **Application** coordinates use cases.  
   It orchestrates rules, validations, and calls repository interfaces.

3) **Infrastructure** is a detail.  
   Database, HTTP, ORM, email, cache, queues. All implement contracts defined
   above, never the other way around.

4) **Controllers are thin.**  
   They map requests to commands and call the service/use case.  
   Business rules do not belong in controllers.

5) **Dependencies point inward.**  
   If a domain module imports infrastructure, the architecture is broken.

Archforge does not enforce these rules automatically.  
It accelerates the start, but discipline belongs to the team.

## License

MIT
