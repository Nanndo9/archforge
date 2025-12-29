import type { ProjectContext } from '../context/types'

export interface GenerationResult {
  outputDir: string
  dependencies?: string[]
  devDependencies?: string[]
}

export interface ProjectGenerator {
  readonly name: string
  supports(context: ProjectContext): boolean
  generate(context: ProjectContext): Promise<GenerationResult>
}

export class GeneratorRegistry {
  constructor(private readonly generators: ProjectGenerator[]) {}

  public resolve(context: ProjectContext): ProjectGenerator | null {
    return this.generators.find((generator) => generator.supports(context)) ?? null
  }
}
