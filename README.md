# Archforge

CLI para criacao automatizada de aplicacoes backend baseada em decisoes tecnicas.

English version: `README.en.md`

## Por que existe

Geradores comuns tratam arquitetura como efeito colateral do framework. O Archforge
nasceu para fazer o contrario: transformar decisoes explicitas (backend, arquitetura,
banco, ORM, Docker e testes) em um projeto coerente desde o primeiro commit.

Arquitetura nao e so organizacao de pastas. Ela envolve limites, dependencias e
regras de negocio. O Archforge acelera o ponto de partida, mas voce continua
responsavel por manter desacoplamento e consistencia do dominio.

## O que entrega hoje (v0.1)

- Express como backend (foco em simplicidade).
- Clean Architecture como padrao.
- Postgres + TypeORM, ou nenhum banco.
- Docker opcional (e Postgres no Docker quando escolhido).
- Testes opcionais (Vitest ou nenhum).

## Requisitos

- Node 24 LTS
- npm

## Instalacao (desenvolvimento local)

```bash
npm run build
npm link
```

Depois disso, o comando `archforge` fica disponivel globalmente.

## Uso rapido

```bash
archforge init
```

Outros comandos:

```bash
archforge --help
archforge presets
archforge -p list
archforge -p clean-api
archforge init --no-install
archforge init --save-context
```

## Presets atuais

- `clean-api`: Express + Clean + Postgres + TypeORM + Docker
- `clean-no-db`: Express + Clean sem banco

## Projetos gerados

### Postgres + TypeORM

Inclui CRUD simples de `users`, migrations e endpoints basicos:

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

Migracoes:

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

## Nota sobre arquitetura

O Archforge configura um esqueleto coerente, mas nao garante o desacoplamento
por si so. Mantemos o baseline; a disciplina de limites e regras de negocio
continua sendo responsabilidade do time.

## Licenca

MIT
