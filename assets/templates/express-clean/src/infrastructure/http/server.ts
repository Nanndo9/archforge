import express from 'express'
import { registerRoutes } from './routes'
import type { RouteDependencies } from './routes'

export function createServer(dependencies: RouteDependencies) {
  const app = express()

  app.use(express.json())
  registerRoutes(app, dependencies)

  return app
}
