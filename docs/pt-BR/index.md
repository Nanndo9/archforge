# Documentação Archforge (pt-BR)

## Visão geral

O Archforge é uma CLI que transforma decisões técnicas em um projeto coerente.
Ele surgiu para evitar o retrabalho de iniciar o mesmo setup toda vez que um
novo backend começa. A geração é determinística e baseada em templates e regras,
sem uso de IA.

Arquitetura não é só organização de pastas. O Archforge entrega o baseline, mas
o desacoplamento e as regras de negócio continuam sob responsabilidade do time.

## Requisitos

- Node 24 LTS
- npm

## Instalação (npm)

```bash
npm i -g archforgejs
```

O comando instalado continua sendo `archforge`.

## Instalação (desenvolvimento local)

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

Inclui CRUD simples de `users`, migrations e endpoints básicos:

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

Projeto mínimo com healthcheck e sem camada de banco.

## Configuração de ambiente

No projeto gerado:

```bash
cp .env.example .env
```

Variáveis principais:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Se você escolher Postgres no Docker, o compose injeta `DB_HOST=postgres`
apenas dentro do container. No host, `DB_HOST` fica como `localhost` para
rodar migrations normalmente.

## Observações sobre arquitetura

O Archforge entrega um esqueleto coerente, mas não garante o desacoplamento
por si só. Manter limites e regras de negócio é responsabilidade do time.

### Nota detalhada

Arquitetura não é somente pastas. Ela define:

- limites de dependência (quem pode conhecer quem)
- contratos entre camadas
- onde as regras de negócio vivem

No template Clean, a intenção é:

1) **Domínio** não conhece infraestrutura.  
   Entidades, regras e contratos devem existir sem depender de HTTP, banco ou ORM.

2) **Aplicação** coordena casos de uso.  
   É onde se orquestram regras, validações e chamadas de repositórios (interfaces).

3) **Infraestrutura** é detalhe.  
   Banco, HTTP, ORM, email, cache, filas. Tudo isso deve implementar contratos
   definidos acima, nunca o contrário.

4) **Controllers são finos.**  
   Eles apenas transformam request em comando e chamam o serviço/uso.  
   Regra de negócio não deve estar no controller.

5) **Dependências apontam para dentro.**  
   Se um módulo de domínio importar algo de infra, a arquitetura já quebrou.

O Archforge não aplica essas regras sozinho.  
Ele facilita o arranque, mas a disciplina é do time.

## Licença

MIT
