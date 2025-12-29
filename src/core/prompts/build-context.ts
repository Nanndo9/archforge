import path from 'node:path'
import type {
  Architecture,
  ArchitectureProfileData,
  Backend,
  Database,
  Orm,
  ProjectContextData,
  Tests
} from '../context/types'
import { ProjectContext } from '../context/types'
import type { OutputPort } from '../io/output'
import type { ProjectPreset } from '../presets/presets'

type InquirerModule = typeof import('inquirer')
type InquirerInstance = InquirerModule['default']

type ContextDraft = Partial<ProjectContextData>

type Choice<T> = { name: string; value: T }

type PromptQuestions = Array<Record<string, unknown>>

export interface PromptClient {
  prompt<T>(questions: PromptQuestions): Promise<T>
}

export class InquirerModuleLoader {
  private cached: InquirerInstance | null = null

  public async load(): Promise<InquirerInstance> {
    if (this.cached) {
      return this.cached
    }

    // Lazy-load ESM-only inquirer while keeping CommonJS output.
    const importer = new Function(
      'return import("inquirer")'
    ) as () => Promise<InquirerModule>
    const module = await importer()
    const resolved = (module.default ?? module) as InquirerInstance
    this.cached = resolved
    return resolved
  }
}

export class InquirerPromptClient implements PromptClient {
  constructor(private readonly loader: InquirerModuleLoader) {}

  public async prompt<T>(questions: PromptQuestions): Promise<T> {
    const inquirer = await this.loader.load()
    return inquirer.prompt(questions as never) as Promise<T>
  }
}

export class ProjectNamePolicy {
  private readonly namePattern = /^[a-z0-9][a-z0-9-_]*$/

  public normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '')
  }

  public getDefault(): string {
    const fromCwd = this.normalize(path.basename(process.cwd()))
    return fromCwd || 'my-backend'
  }

  public validate(input: string): true | string {
    const normalized = this.normalize(input)
    if (!normalized) {
      return 'Informe um nome valido.'
    }

    if (!this.namePattern.test(normalized)) {
      return 'Use apenas letras minusculas, numeros, "-" ou "_".'
    }

    return true
  }
}

export interface RecommendationPolicy {
  getArchitecture(backend: Backend): Architecture
  getOrm(database: Database): Orm
  getTests(backend: Backend): Tests
}

export class DefaultRecommendationPolicy implements RecommendationPolicy {
  public getArchitecture(backend: Backend): Architecture {
    return backend === 'nestjs' ? 'framework' : 'clean'
  }

  public getOrm(database: Database): Orm {
    if (database === 'none') {
      return 'none'
    }

    return database === 'mongodb' ? 'mongoose' : 'typeorm'
  }

  public getTests(backend: Backend): Tests {
    return backend === 'nestjs' ? 'jest' : 'vitest'
  }
}

export interface ArchitectureProfilePolicy {
  getDefaults(architecture: Architecture): ArchitectureProfileData
}

export class DefaultArchitectureProfilePolicy
  implements ArchitectureProfilePolicy
{
  public getDefaults(architecture: Architecture): ArchitectureProfileData {
    switch (architecture) {
      case 'clean':
        return {
          moduleLayout: 'layer-first',
          boundaryMode: 'strict',
          applicationPattern: 'use-cases',
          domainModel: 'rich',
          cqrs: false,
          domainEvents: true,
          transactionBoundary: 'per-usecase'
        }
      case 'hexagonal':
        return {
          moduleLayout: 'feature-first',
          boundaryMode: 'strict',
          applicationPattern: 'use-cases',
          domainModel: 'rich',
          cqrs: false,
          domainEvents: true,
          transactionBoundary: 'per-usecase'
        }
      case 'modular':
        return {
          moduleLayout: 'feature-first',
          boundaryMode: 'strict',
          applicationPattern: 'services',
          domainModel: 'rich',
          cqrs: false,
          domainEvents: false,
          transactionBoundary: 'per-usecase'
        }
      case 'framework':
      default:
        return {
          moduleLayout: 'layer-first',
          boundaryMode: 'flexible',
          applicationPattern: 'services',
          domainModel: 'anemic',
          cqrs: false,
          domainEvents: false,
          transactionBoundary: 'per-request'
      }
    }
  }
}

export class ProjectContextFactory {
  constructor(
    private readonly namePolicy: ProjectNamePolicy,
    private readonly recommendationPolicy: RecommendationPolicy,
    private readonly architectureProfilePolicy: ArchitectureProfilePolicy
  ) {}

  public create(draft: Partial<ProjectContextData>): ProjectContext {
    const backend = (draft.backend ?? 'express') as Backend
    const architecture = (draft.architecture ??
      this.recommendationPolicy.getArchitecture(backend)) as Architecture
    const database = (draft.database ?? 'postgres') as Database
    const dockerEnabled = draft.docker ?? true
    const dockerDatabase =
      dockerEnabled && database === 'postgres'
        ? (draft.dockerDatabase ?? true)
        : false
    const normalizedName = draft.projectName
      ? this.namePolicy.normalize(draft.projectName)
      : ''
    const projectName = normalizedName || this.namePolicy.getDefault()
    const architectureProfile =
      draft.architectureProfile ??
      this.architectureProfilePolicy.getDefaults(architecture)
    const orm =
      database === 'none'
        ? 'none'
        : ((draft.orm ??
            this.recommendationPolicy.getOrm(database)) as Orm)

    return new ProjectContext({
      projectName,
      backend,
      architecture,
      architectureProfile,
      docker: dockerEnabled,
      dockerDatabase,
      database,
      orm,
      tests: (draft.tests ??
        this.recommendationPolicy.getTests(backend)) as Tests
    })
  }
}

export class ContextLabelCatalog {
  private readonly architectureLabels: Record<Architecture, string> = {
    clean: 'Clean Architecture',
    hexagonal: 'Hexagonal Architecture (Ports and Adapters)',
    modular: 'Modular Monolith (Arquitetura Modular)',
    framework: 'Framework-driven Architecture (MVC do framework)'
  }

  public architectureLabel(value: Architecture): string {
    return this.architectureLabels[value]
  }
}

export class ContextSummaryPresenter {
  constructor(private readonly labels: ContextLabelCatalog) {}

  public format(context: ProjectContext): string {
    const architectureLabel =
      context.backend === 'nestjs'
        ? `${this.labels.architectureLabel(context.architecture)} (definida pelo NestJS)`
        : this.labels.architectureLabel(context.architecture)
    const databaseLabel = this.databaseLabel(context.database)
    const ormLabel = this.ormLabel(context.orm)
    const dockerDatabaseLine =
      context.docker && context.database === 'postgres'
        ? `- Postgres no Docker: ${context.dockerDatabase ? 'sim' : 'nao'}`
        : null

    return [
      '',
      'Resumo das escolhas:',
      `- Projeto: ${context.projectName}`,
      `- Backend: ${context.backend}`,
      `- Arquitetura: ${architectureLabel}`,
      `- Banco: ${databaseLabel}`,
      `- ORM/ODM: ${ormLabel}`,
      `- Docker: ${context.docker ? 'sim' : 'nao'}`,
      ...(dockerDatabaseLine ? [dockerDatabaseLine] : []),
      `- Testes: ${context.tests}`,
      ''
    ].join('\n')
  }

  private databaseLabel(value: Database): string {
    switch (value) {
      case 'postgres':
        return 'Postgres'
      case 'mysql':
        return 'MySQL'
      case 'mongodb':
        return 'MongoDB'
      case 'none':
      default:
        return 'nenhum'
    }
  }

  private ormLabel(value: Orm): string {
    switch (value) {
      case 'typeorm':
        return 'TypeORM'
      case 'prisma':
        return 'Prisma'
      case 'mongoose':
        return 'Mongoose'
      case 'none':
      default:
        return 'nenhum'
    }
  }
}

export class ProjectContextBuilder {
  private readonly backendChoices: Choice<Backend>[] = [
    { name: 'Express (simples e flexivel)', value: 'express' }
  ]

  private readonly architectureOptions: Architecture[] = [
    'clean'
  ]

  private readonly databaseChoices: Choice<Database>[] = [
    { name: 'Postgres', value: 'postgres' },
    { name: 'Nenhum (sem banco)', value: 'none' }
  ]

  private readonly ormLabels: Record<Orm, string> = {
    typeorm: 'TypeORM',
    prisma: 'Prisma',
    mongoose: 'Mongoose',
    none: 'Nenhum'
  }

  private readonly testsChoices: Choice<Tests>[] = [
    { name: 'Vitest', value: 'vitest' },
    { name: 'Nenhum', value: 'none' }
  ]

  constructor(
    private readonly promptClient: PromptClient,
    private readonly namePolicy: ProjectNamePolicy,
    private readonly recommendationPolicy: RecommendationPolicy,
    private readonly labelCatalog: ContextLabelCatalog,
    private readonly summaryPresenter: ContextSummaryPresenter,
    private readonly contextFactory: ProjectContextFactory,
    private readonly output: OutputPort
  ) {}

  public async build(): Promise<ProjectContext> {
    while (true) {
      const answers = await this.promptClient.prompt<ContextDraft>([
        {
          type: 'input',
          name: 'projectName',
          message: 'Nome do projeto:',
          default: () => this.namePolicy.getDefault(),
          filter: (value: string) => this.namePolicy.normalize(value),
          validate: (value: string) => this.namePolicy.validate(value)
        },
        {
          type: 'rawlist',
          name: 'backend',
          message: 'Qual backend?',
          when: () => this.backendChoices.length > 1,
          choices: this.backendChoices,
          default: 'express'
        },
        {
          type: 'rawlist',
          name: 'architecture',
          message: 'Qual arquitetura?',
          when: (current: ContextDraft) => {
            const backend = this.getBackendFrom(current)
            if (backend === 'nestjs') {
              return false
            }
            return this.getArchitectureChoices(backend).length > 1
          },
          choices: (current: ContextDraft) =>
            this.getArchitectureChoices(this.getBackendFrom(current)),
          default: (current: ContextDraft) =>
            this.recommendationPolicy.getArchitecture(
              this.getBackendFrom(current)
            )
        },
        {
          type: 'confirm',
          name: 'docker',
          message: 'Usar Docker?',
          default: true
        },
        {
          type: 'rawlist',
          name: 'database',
          message: 'Banco de dados?',
          choices: this.databaseChoices,
          default: 'postgres'
        },
        {
          type: 'confirm',
          name: 'dockerDatabase',
          message: 'Subir Postgres no Docker?',
          when: (current: ContextDraft) =>
            Boolean(current.docker) && this.getDatabaseFrom(current) === 'postgres',
          default: true
        },
        {
          type: 'rawlist',
          name: 'orm',
          message: 'ORM / ODM?',
          when: (current: ContextDraft) =>
            this.getDatabaseFrom(current) !== 'none' &&
            this.getOrmChoices(this.getDatabaseFrom(current)).length > 1,
          choices: (current: ContextDraft) =>
            this.getOrmChoices(this.getDatabaseFrom(current)),
          default: (current: ContextDraft) =>
            this.recommendationPolicy.getOrm(this.getDatabaseFrom(current))
        },
        {
          type: 'rawlist',
          name: 'tests',
          message: 'Testes?',
          choices: this.testsChoices,
          default: (current: ContextDraft) =>
            this.recommendationPolicy.getTests(this.getBackendFrom(current))
        }
      ])

      const context = this.contextFactory.create(
        answers as Partial<ProjectContextData>
      )

      if (await this.confirmContext(context)) {
        return context
      }
    }
  }

  public async buildFromPreset(
    preset: ProjectPreset,
    projectNameOverride?: string
  ): Promise<ProjectContext> {
    const resolvedProjectName =
      this.resolveProjectNameOverride(projectNameOverride)

    if (resolvedProjectName) {
      const context = this.contextFactory.create({
        ...preset.context,
        projectName: resolvedProjectName
      })

      if (await this.confirmContext(context)) {
        return context
      }
    }

    while (true) {
      const projectName = await this.promptProjectName()
      const context = this.contextFactory.create({
        ...preset.context,
        projectName
      })

      if (await this.confirmContext(context)) {
        return context
      }
    }
  }

  private getBackendFrom(draft: ContextDraft): Backend {
    return (draft.backend ?? 'express') as Backend
  }

  private getDatabaseFrom(draft: ContextDraft): Database {
    return (draft.database ?? 'postgres') as Database
  }

  private getArchitectureChoices(backend: Backend): Choice<Architecture>[] {
    const recommended = this.recommendationPolicy.getArchitecture(backend)

    return this.architectureOptions.map((value) => ({
      name:
        value === recommended
          ? `${this.labelCatalog.architectureLabel(value)} (recomendado)`
          : this.labelCatalog.architectureLabel(value),
      value
    }))
  }

  private getOrmChoices(database: Database): Choice<Orm>[] {
    if (database === 'none') {
      return [{ name: this.ormLabels.none, value: 'none' }]
    }

    const allowed: Orm[] =
      database === 'mongodb' ? ['mongoose'] : ['typeorm']
    const recommended = this.recommendationPolicy.getOrm(database)

    return allowed.map((value) => {
      const label = this.ormLabels[value]
      return {
        name: value === recommended ? `${label} (recomendado)` : label,
        value
      }
    })
  }

  private async promptProjectName(): Promise<string> {
    const answers = await this.promptClient.prompt<{ projectName: string }>([
      {
        type: 'input',
        name: 'projectName',
        message: 'Nome do projeto:',
        default: () => this.namePolicy.getDefault(),
        filter: (value: string) => this.namePolicy.normalize(value),
        validate: (value: string) => this.namePolicy.validate(value)
      }
    ])

    return answers.projectName
  }

  private resolveProjectNameOverride(value?: string): string | null {
    if (!value) {
      return null
    }

    const normalized = this.namePolicy.normalize(value)
    const validation = this.namePolicy.validate(normalized)

    if (validation !== true) {
      throw new Error(validation)
    }

    return normalized
  }

  private async confirmContext(context: ProjectContext): Promise<boolean> {
    this.output.info(this.summaryPresenter.format(context))

    const confirmation = await this.promptClient.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirmar essas escolhas?',
        default: true
      }
    ])

    return confirmation.confirm
  }

}
