export class HealthStatus {
  constructor(private readonly status: string) {}

  public toJSON() {
    return {
      status: this.status
    }
  }
}
