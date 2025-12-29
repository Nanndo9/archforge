import fs from 'node:fs/promises'
import path from 'node:path'
import type { ProjectContext } from '../../core/context/types'
import type { OutputPort } from '../../core/io/output'
import type {
  GenerationResult,
  ProjectGenerator
} from '../../core/generate/generator'
import { TargetDirectoryResolver } from '../../core/generate/target-directory'
import type { TemplateEngine } from '../../core/templates/engine'

export class ExpressCleanGenerator implements ProjectGenerator {
  public readonly name = 'express-clean-postgres-typeorm'

  constructor(
    private readonly templateEngine: TemplateEngine,
    private readonly targetResolver: TargetDirectoryResolver,
    private readonly output: OutputPort
  ) { }

  public supports(context: ProjectContext): boolean {
    return (
      context.backend === 'express' &&
      context.architecture === 'clean' &&
      context.database === 'postgres' &&
      context.orm === 'typeorm' &&
      (context.tests === 'vitest' || context.tests === 'none')
    )
  }

  public async generate(context: ProjectContext): Promise<GenerationResult> {
    const targetDir = await this.targetResolver.resolve(context.projectName)
    const variables = this.buildVariables(context)

    await this.templateEngine.renderTemplate('express-clean', targetDir, variables)
    await this.updatePackageScripts(targetDir, context)

    if (context.dockerDatabase) {
      await this.writeDockerCompose(targetDir, variables)
    }

    if (!context.docker) {
      await this.removeDockerArtifacts(targetDir)
    }

    if (context.tests === 'none') {
      await this.removeTestFiles(targetDir)
    }

    this.output.info(`\nProjeto gerado em ${targetDir}`)

    return {
      outputDir: targetDir,
      dependencies: [
        'dotenv',
        'express',
        'pg',
        'reflect-metadata',
        'typeorm'
      ],
      devDependencies: this.buildDevDependencies(context)
    }
  }

  private buildDevDependencies(context: ProjectContext): string[] {
    const devDependencies = [
      '@types/express',
      '@types/node',
      'ts-node',
      'typescript'
    ]

    if (context.tests !== 'none') {
      devDependencies.push('vitest')
    }

    return devDependencies
  }

  private async removeDockerArtifacts(targetDir: string): Promise<void> {
    const dockerFile = path.join(targetDir, 'Dockerfile')
    await fs.unlink(dockerFile).catch(() => undefined)
  }

  private async removeTestFiles(targetDir: string): Promise<void> {
    await this.removeFilesBySuffix(targetDir, '.test.ts')
  }

  private async removeFilesBySuffix(
    directory: string,
    suffix: string
  ): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await this.removeFilesBySuffix(entryPath, suffix)
        continue
      }

      if (entry.isFile() && entry.name.endsWith(suffix)) {
        await fs.unlink(entryPath)
      }
    }
  }

  private buildVariables(context: ProjectContext): Record<string, string> {
    return {
      projectName: context.projectName,
      projectTitle: toTitleCase(context.projectName),
      dbHost: 'localhost',
      dbName: context.projectName,
      dbUser: 'postgres',
      dbPassword: 'postgres'
    }
  }

  private async writeDockerCompose(
    targetDir: string,
    variables: Record<string, string>
  ): Promise<void> {
    const content = `services:\n  api:\n    build: .\n    ports:\n      - \"3000:3000\"\n    env_file:\n      - .env\n    environment:\n      DB_HOST: postgres\n    depends_on:\n      postgres:\n        condition: service_healthy\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: ${variables.dbUser}\n      POSTGRES_PASSWORD: ${variables.dbPassword}\n      POSTGRES_DB: ${variables.dbName}\n    ports:\n      - \"5432:5432\"\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U ${variables.dbUser} -d ${variables.dbName} -h localhost\"]\n      interval: 5s\n      timeout: 5s\n      retries: 10\n\nvolumes:\n  postgres_data:\n`

    const targetPath = path.join(targetDir, 'docker-compose.yml')
    await fs.writeFile(targetPath, content, 'utf8')
  }

  private async updatePackageScripts(
    targetDir: string,
    context: ProjectContext
  ): Promise<void> {
    const packagePath = path.join(targetDir, 'package.json')
    const raw = await fs.readFile(packagePath, 'utf8')
    const pkg = JSON.parse(raw) as { scripts?: Record<string, string> }
    const scripts = { ...(pkg.scripts ?? {}) }
    const useDockerCompose = context.docker && context.dockerDatabase

    scripts.dev = useDockerCompose
      ? 'docker compose -f docker-compose.yml up --build'
      : 'ts-node src/main.ts'

    if (context.tests === 'none') {
      delete scripts.test
      delete scripts['test:watch']
    }

    pkg.scripts = scripts
    await fs.writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  }
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
