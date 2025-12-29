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

export class ExpressCleanNoDbGenerator implements ProjectGenerator {
  public readonly name = 'express-clean-nodb'

  constructor(
    private readonly templateEngine: TemplateEngine,
    private readonly targetResolver: TargetDirectoryResolver,
    private readonly output: OutputPort
  ) {}

  public supports(context: ProjectContext): boolean {
    return (
      context.backend === 'express' &&
      context.architecture === 'clean' &&
      context.database === 'none' &&
      context.orm === 'none' &&
      (context.tests === 'vitest' || context.tests === 'none')
    )
  }

  public async generate(context: ProjectContext): Promise<GenerationResult> {
    const targetDir = await this.targetResolver.resolve(context.projectName)
    const variables = this.buildVariables(context)

    await this.templateEngine.renderTemplate(
      'express-clean-nodb',
      targetDir,
      variables
    )
    await this.updatePackageScripts(targetDir, context)

    if (!context.docker) {
      await this.removeDockerArtifacts(targetDir)
    }

    if (context.tests === 'none') {
      await this.removeTestFiles(targetDir)
    }

    await this.removeEmptyDirectories([
      path.join(targetDir, 'src', 'application', 'user'),
      path.join(targetDir, 'src', 'infrastructure', 'database'),
      path.join(targetDir, 'src', 'infrastructure', 'config')
    ])

    this.output.info(`\nProjeto gerado em ${targetDir}`)

    return {
      outputDir: targetDir,
      dependencies: ['dotenv', 'express'],
      devDependencies: this.buildDevDependencies(context)
    }
  }

  private buildVariables(context: ProjectContext): Record<string, string> {
    return {
      projectName: context.projectName,
      projectTitle: toTitleCase(context.projectName)
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

  private async updatePackageScripts(
    targetDir: string,
    context: ProjectContext
  ): Promise<void> {
    const packagePath = path.join(targetDir, 'package.json')
    const raw = await fs.readFile(packagePath, 'utf8')
    const pkg = JSON.parse(raw) as { scripts?: Record<string, string> }
    const scripts = { ...(pkg.scripts ?? {}) }

    if (context.tests === 'none') {
      delete scripts.test
      delete scripts['test:watch']
    }

    pkg.scripts = scripts
    await fs.writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  }

  private async removeDockerArtifacts(targetDir: string): Promise<void> {
    const dockerFile = path.join(targetDir, 'Dockerfile')
    await fs.unlink(dockerFile).catch(() => undefined)
  }

  private async removeTestFiles(targetDir: string): Promise<void> {
    await this.removeFilesBySuffix(targetDir, '.test.ts')
  }

  private async removeEmptyDirectories(directories: string[]): Promise<void> {
    for (const directory of directories) {
      await this.pruneEmptyDirectory(directory)
    }
  }

  private async pruneEmptyDirectory(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => [])

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      await this.pruneEmptyDirectory(path.join(directory, entry.name))
    }

    const remaining = await fs.readdir(directory).catch(() => [])
    if (remaining.length === 0) {
      await fs.rmdir(directory).catch(() => undefined)
    }
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
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
