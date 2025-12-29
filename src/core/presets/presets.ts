import type { ProjectContextData } from '../context/types'

type PresetContext = Omit<ProjectContextData, 'projectName' | 'architectureProfile'>

export interface ProjectPreset {
  id: string
  name: string
  description: string
  context: PresetContext
}

export class PresetRegistry {
  private readonly presets: ProjectPreset[] = [
    {
      id: 'clean-api',
      name: 'Clean API (Express + Postgres)',
      description: 'Express + Clean Architecture + Postgres + TypeORM + Docker',
      context: {
        backend: 'express',
        architecture: 'clean',
        docker: true,
        dockerDatabase: true,
        database: 'postgres',
        orm: 'typeorm',
        tests: 'vitest'
      }
    },
    {
      id: 'clean-no-db',
      name: 'Clean API (Express sem banco)',
      description: 'Express + Clean Architecture + Sem banco',
      context: {
        backend: 'express',
        architecture: 'clean',
        docker: false,
        dockerDatabase: false,
        database: 'none',
        orm: 'none',
        tests: 'vitest'
      }
    }
  ]

  public list(): ProjectPreset[] {
    return [...this.presets]
  }

  public get(id: string): ProjectPreset | null {
    return this.presets.find((preset) => preset.id === id) ?? null
  }
}
