import 'dotenv/config'
import path from 'node:path'
import { DataSource } from 'typeorm'
import type { DataSourceOptions } from 'typeorm'
import { UserEntity } from './entities/user.entity'

export type DatabaseConfig = {
  host: string
  port: number
  user: string
  password: string
  name: string
}

let appDataSource: DataSource | null = null
const envConfig = resolveEnvConfig()

export const AppDataSource = new DataSource(buildDataSourceOptions(envConfig))

export async function createDataSource(
  config: DatabaseConfig
): Promise<DataSource> {
  if (!appDataSource) {
    appDataSource = new DataSource(buildDataSourceOptions(config))
  }

  if (!appDataSource.isInitialized) {
    const maxAttempts = 10
    const retryDelayMs = 2000
    let attempt = 1

    while (true) {
      try {
        await appDataSource.initialize()
        break
      } catch (error) {
        if (attempt >= maxAttempts) {
          throw error
        }

        console.warn(
          `Falha ao conectar com o banco. Tentativa ${attempt}/${maxAttempts}. Reintentando em ${Math.round(retryDelayMs / 1000)}s...`
        )
        attempt += 1
        await delay(retryDelayMs)
      }
    }
  }

  return appDataSource
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs))
}

function buildDataSourceOptions(config: DatabaseConfig): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    database: config.name,
    entities: [UserEntity],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false
  }
}

function resolveEnvConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5432'),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'app'
  }
}
