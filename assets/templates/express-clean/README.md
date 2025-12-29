# {{projectTitle}}

API base gerada com Archforge.

## Scripts

- `npm run dev`
- `npm run build`
- `npm start`
- `npm test`
- `npm run migration:generate`
- `npm run migration:run`

## Ambiente

Copie o arquivo `.env.example` para `.env` e ajuste os valores.

Antes de subir a API, rode as migracoes:

```bash
npm run migration:generate
npm run migration:run
```

## Docker

Se voce optou por Docker com Postgres, use:

```bash
docker compose up --build
```

A API sobe em `http://localhost:3000/health`.

## Endpoints basicos

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
