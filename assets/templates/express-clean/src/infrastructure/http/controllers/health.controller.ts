import type { Request, Response } from 'express'
import { HealthCheck } from '../../../application/health/health.usecase'

export function healthController(_req: Request, res: Response) {
  const useCase = new HealthCheck()
  const result = useCase.execute()
  res.json(result)
}
