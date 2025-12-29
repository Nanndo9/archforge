import express from 'express'
import { registerRoutes } from './routes'

export function createServer() {
  const app = express()

  app.use(express.json())
  registerRoutes(app)

  return app
}
