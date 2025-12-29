import type { Express } from 'express'
import { healthController } from './controllers/health.controller'
import { buildUserRouter } from './controllers/user.controller'
import type { UserService } from '../../application/user/user.service'

export type RouteDependencies = {
  userService: UserService
}

export function registerRoutes(app: Express, dependencies: RouteDependencies) {
  app.get('/health', healthController)
  app.use('/users', buildUserRouter(dependencies.userService))
}
