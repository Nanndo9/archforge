export type Backend = 'express' | 'nestjs' | 'fastify'
export type Architecture = 'clean' | 'hexagonal' | 'modular' | 'framework'
export type Database = 'postgres' | 'mysql' | 'mongodb' | 'none'
export type Orm = 'typeorm' | 'prisma' | 'mongoose' | 'none'
export type Tests = 'jest' | 'vitest' | 'none'
export type ModuleLayout = 'feature-first' | 'layer-first'
export type BoundaryMode = 'strict' | 'flexible'
export type ApplicationPattern = 'use-cases' | 'services'
export type DomainModel = 'rich' | 'anemic'
export type TransactionBoundary = 'per-usecase' | 'per-request'

export interface ArchitectureProfileData {
  moduleLayout: ModuleLayout
  boundaryMode: BoundaryMode
  applicationPattern: ApplicationPattern
  domainModel: DomainModel
  cqrs: boolean
  domainEvents: boolean
  transactionBoundary: TransactionBoundary
}

export interface ProjectContextData {
  projectName: string
  backend: Backend
  architecture: Architecture
  architectureProfile: ArchitectureProfileData
  docker: boolean
  dockerDatabase: boolean
  database: Database
  orm: Orm
  tests: Tests
}

export type PublicProjectContextData = Omit<
  ProjectContextData,
  'architectureProfile'
>

export class ProjectContext implements ProjectContextData {
  public readonly projectName: string
  public readonly backend: Backend
  public readonly architecture: Architecture
  public readonly architectureProfile: ArchitectureProfileData
  public readonly docker: boolean
  public readonly dockerDatabase: boolean
  public readonly database: Database
  public readonly orm: Orm
  public readonly tests: Tests

  constructor(data: ProjectContextData) {
    this.projectName = data.projectName
    this.backend = data.backend
    this.architecture = data.architecture
    this.architectureProfile = Object.freeze({ ...data.architectureProfile })
    this.docker = data.docker
    this.dockerDatabase = data.dockerDatabase
    this.database = data.database
    this.orm = data.orm
    this.tests = data.tests

    Object.freeze(this)
  }

  public toJSON(): ProjectContextData {
    return {
      projectName: this.projectName,
      backend: this.backend,
      architecture: this.architecture,
      architectureProfile: { ...this.architectureProfile },
      docker: this.docker,
      dockerDatabase: this.dockerDatabase,
      database: this.database,
      orm: this.orm,
      tests: this.tests
    }
  }
}
