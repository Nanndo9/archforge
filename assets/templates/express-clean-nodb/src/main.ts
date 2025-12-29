import 'dotenv/config'
import { createServer } from './infrastructure/http/server'

async function bootstrap() {
  const app = createServer()
  const port = Number(process.env.PORT ?? '3000')

  app.listen(port, () => {
    console.log(`API online na porta ${port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Falha ao iniciar a API', error)
  process.exit(1)
})
