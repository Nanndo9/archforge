# Archforge

CLI para criação automatizada de aplicações backend baseada em decisões técnicas.

Idioma: [Português](README.md) | [English](README.en.md)
Documentação: [PT-BR](docs/pt-BR/index.md) | [EN](docs/en/index.md)

## Por que existe

Surgiu de uma insatisfação: toda vez que um projeto novo começava, era preciso
refazer o setup inteiro. Isso gastava tempo e energia que deveriam ir para o que
realmente importa. O Archforge automatiza essa etapa para você focar no produto
e nas regras de negócio.

Geradores comuns tratam arquitetura como efeito colateral do framework. O
Archforge nasceu para fazer o contrário: transformar decisões explícitas
(backend, arquitetura, banco, ORM, Docker e testes) em um projeto coerente desde
o primeiro commit.

Arquitetura não é só organização de pastas. Ela envolve limites, dependências e
regras de negócio. O Archforge acelera o ponto de partida, mas você continua
responsável por manter desacoplamento e consistência do domínio.

Não usa IA: a geração é determinística e baseada em templates e regras.

## O que entrega hoje (v0.1)

- Express como backend (foco em simplicidade).
- Clean Architecture como padrão.
- Postgres + TypeORM, ou nenhum banco.
- Docker opcional (e Postgres no Docker quando escolhido).
- Testes opcionais (Vitest ou nenhum).

## Documentação

- PT-BR: `docs/pt-BR/index.md`
- EN: `docs/en/index.md`

## Requisitos

- Node 24 LTS
- npm

## Instalação (desenvolvimento local)

```bash
npm run build
npm link
```

Depois disso, o comando `archforge` fica disponível globalmente.

## Uso rápido

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

## Licença

MIT
