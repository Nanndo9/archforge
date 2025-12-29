# {{projectTitle}}

API base gerada com Archforge.

## Scripts

- `npm run dev`
- `npm run build`
- `npm start`
- `npm test`

## Ambiente

Copie o arquivo `.env.example` para `.env` e ajuste os valores.

## Docker

Se voce optou por Docker, use:

```bash
docker build -t {{projectName}} .
docker run -p 3000:3000 {{projectName}}
```

A API sobe em `http://localhost:3000/health`.

## Endpoints basicos

- `GET /health`
