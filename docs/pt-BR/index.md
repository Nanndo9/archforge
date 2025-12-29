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

### Nota detalhada

Arquitetura nao e somente pastas. Ela define:

- limites de dependencia (quem pode conhecer quem)
- contratos entre camadas
- onde as regras de negocio vivem

No template Clean, a intencao e:

1) **Dominio** nao conhece infraestrutura.  
   Entidades, regras e contratos devem existir sem depender de HTTP, banco ou ORM.

2) **Aplicacao** coordena casos de uso.  
   E onde se orquestram regras, validacoes e chamadas de repositorios (interfaces).

3) **Infraestrutura** e detalhe.  
   Banco, HTTP, ORM, email, cache, filas. Tudo isso deve implementar contratos
   definidos acima, nunca o contrario.

4) **Controllers sao finos.**  
   Eles apenas transformam request em comando e chamam o servico/uso.  
   Regra de negocio nao deve estar no controller.

5) **Dependencias apontam para dentro.**  
   Se um modulo de dominio importar algo de infra, a arquitetura ja quebrou.

O Archforge nao aplica essas regras sozinho.  
Ele facilita o arranque, mas a disciplina e do time.

## Licenca

MIT
