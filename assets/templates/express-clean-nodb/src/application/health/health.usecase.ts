import { HealthStatus } from '../../domain/health-status'

export class HealthCheck {
  public execute() {
    return new HealthStatus('ok').toJSON()
  }
}
