import type { Express } from 'express'
import { healthController } from './controllers/health.controller'

export function registerRoutes(app: Express) {
  app.get('/health', healthController)
}
