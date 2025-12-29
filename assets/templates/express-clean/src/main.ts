import 'reflect-metadata'
import 'dotenv/config'
import { createDataSource } from './infrastructure/database/data-source'
import { createServer } from './infrastructure/http/server'
import { UserService } from './application/user/user.service'
import { TypeOrmUserRepository } from './infrastructure/database/repositories/user.repository'

const config = {
  port: Number(process.env.PORT ?? '3000'),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5432'),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'app'
  }
}

async function bootstrap() {
  const dataSource = await createDataSource(config.database)
  const userRepository = new TypeOrmUserRepository(dataSource)
  const userService = new UserService(userRepository)
  const app = createServer({ userService })

  app.listen(config.port, () => {
    console.log(`API online na porta ${config.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Falha ao iniciar a API', error)
  process.exit(1)
})
