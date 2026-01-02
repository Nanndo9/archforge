# Archforge

CLI para criacao automatizada de backends, guiada por decisoes tecnicas e arquiteturais.

Idioma: [Portugues](https://github.com/Nanndo9/archforge/blob/main/README.md) | [English](https://github.com/Nanndo9/archforge/blob/main/README.en.md)
Documentacao: [PT-BR](https://github.com/Nanndo9/archforge/blob/main/docs/pt-BR/index.md) | [EN](https://github.com/Nanndo9/archforge/blob/main/docs/en/index.md)

## Por que existe

Surgiu de uma insatisfacao real: toda vez que um projeto novo comecava, era preciso refazer o setup inteiro. Isso consome tempo e energia que deveriam ir para o produto e para as regras de negocio.

O Archforge nasceu para automatizar o inicio do projeto e transformar decisoes explicitas (backend, arquitetura, banco, ORM, Docker, testes) em um projeto coerente desde o primeiro commit.

Arquitetura nao e so organizacao de pastas. E sobre limites, dependencias e dominio. O Archforge acelera o ponto de partida, mas o desacoplamento e a consistencia do dominio continuam sendo responsabilidade do time.

Sem IA: a geracao e deterministica e baseada em templates.

## O que entrega hoje (v0.1)

- Express como backend (foco no basico bem feito).
- Clean Architecture como baseline.
- Postgres + TypeORM, ou sem banco.
- Docker opcional (inclui Postgres quando banco).
- Testes opcionais (Vitest ou nenhum).

## Instalacao (npm)

```bash
npm i -g archforgejs
```

O comando instalado continua sendo `archforge`.

## Instalacao local (desenvolvimento)

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
archforge -p clean-no-db
archforge init --no-install
archforge init --save-context
```

## Presets atuais

- `clean-api`: Express + Clean + Postgres + TypeORM + Docker
- `clean-no-db`: Express + Clean sem banco

## Requisitos

- Node 24 LTS
- npm

## Licenca

MIT
