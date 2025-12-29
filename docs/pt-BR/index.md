# Documentacao Archforge (pt-BR)

## Visao geral

O Archforge e uma CLI que transforma decisoes tecnicas em um projeto coerente.
Ele surgiu para evitar o retrabalho de iniciar o mesmo setup toda vez que um
novo backend comeca. A geracao e deterministica e baseada em templates e regras,
sem uso de IA.

Arquitetura nao e so organizacao de pastas. O Archforge entrega o baseline, mas
o desacoplamento e as regras de negocio continuam sob responsabilidade do time.

## Requisitos

- Node 24 LTS
- npm

## Instalacao (desenvolvimento local)

```bash
npm run build
npm link
```

## Uso da CLI

```bash
archforge init
```

Outros comandos:

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
- `clean-no-db`: Express + Clean sem banco

## Combos suportados (v0.1)

- Backend: Express
- Arquitetura: Clean Architecture
- Banco: Postgres ou nenhum
- ORM: TypeORM (quando Postgres) ou nenhum
- Docker: opcional
- Testes: Vitest ou nenhum

## Projetos gerados

### Postgres + TypeORM

Inclui CRUD simples de `users`, migrations e endpoints basicos:

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

Scripts de migrations:

```bash
npm run migration:generate
npm run migration:run
```

Docker (com Postgres):

```bash
docker compose up --build
```

### Sem banco

Projeto minimo com healthcheck e sem camada de banco.

## Configuracao de ambiente

No projeto gerado:

```bash
cp .env.example .env
```

Variaveis principais:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Se voce escolher Postgres no Docker, o compose injeta `DB_HOST=postgres`
apenas dentro do container. No host, `DB_HOST` fica como `localhost` para
rodar migrations normalmente.

## Observacoes sobre arquitetura

O Archforge entrega um esqueleto coerente, mas nao garante o desacoplamento
por si so. Manter limites e regras de negocio e responsabilidade do time.

## Licenca

MIT
