import { describe, expect, it } from 'vitest'
import { HealthCheck } from './health.usecase'

describe('HealthCheck', () => {
  it('retorna status ok', () => {
    const useCase = new HealthCheck()

    expect(useCase.execute()).toEqual({ status: 'ok' })
  })
})
