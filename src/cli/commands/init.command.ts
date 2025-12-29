import { Command } from 'commander'
import type {
  ProjectContext,
  PublicProjectContextData
} from '../../core/context/types'
import type { ContextStore } from '../../core/context/context-store'
import type { OutputPort } from '../../core/io/output'
import type { ProjectContextBuilder } from '../../core/prompts/build-context'
import type { PresetRegistry } from '../../core/presets/presets'
import type { GeneratorRegistry } from '../../core/generate/generator'
import type { PackageInstaller } from '../../core/generate/package-installer'
import type { Validator } from '../../core/validate/validate-context'

export class InitCommand {
  constructor(
    private readonly contextBuilder: ProjectContextBuilder,
    private readonly validator: Validator<ProjectContext>,
    private readonly output: OutputPort,
    private readonly presets: PresetRegistry,
    private readonly contextStore: ContextStore,
    private readonly generatorRegistry: GeneratorRegistry,
    private readonly packageInstaller: PackageInstaller
  ) {}

  public build(): Command {
    const command = new Command('init')
      .description('Inicializa um novo projeto backend a partir de escolhas interativas')
      .option('-p, --preset <id>', 'Usar um preset de stack')
      .option('-n, --name <name>', 'Nome do projeto (com --preset)')
      .option('--save-context', 'Salvar contexto em .archforge.json')
      .option('--no-install', 'Nao rodar npm install')
      .action(() => this.execute(command))

    return command
  }

  private async execute(command: Command): Promise<void> {
    try {
      const options = command.opts<{
        preset?: string
        name?: string
        install?: boolean
        saveContext?: boolean
      }>()
      if (options.preset && this.isListPresetsRequest(options.preset)) {
        this.printPresets()
        return
      }
      const context = options.preset
        ? await this.buildFromPreset(options.preset, options.name)
        : await this.contextBuilder.build()

      this.validator.validate(context)

      const generator = this.generatorRegistry.resolve(context)

      this.output.info('\nContext gerado:\n')
      const publicContext = this.toPublicContext(context)
      this.output.info(JSON.stringify(publicContext, null, 2))

      let outputDir = process.cwd()
      let dependencies: string[] = []
      let devDependencies: string[] = []
      if (generator) {
        const result = await generator.generate(context)
        outputDir = result.outputDir
        dependencies = result.dependencies ?? []
        devDependencies = result.devDependencies ?? []
      } else {
        this.output.info('\nNenhum gerador compativel ainda. Apenas contexto salvo.')
      }

      if (options.saveContext) {
        const savedPath = await this.contextStore.save(publicContext, outputDir)
        this.output.info(`\nContexto salvo em ${savedPath}`)
      }

      if (generator && options.install !== false) {
        await this.packageInstaller.install(outputDir, dependencies, devDependencies)
      }
    } catch (error) {
      if (this.isPromptAbort(error)) {
        process.exitCode = 130
        return
      }

      const message = error instanceof Error ? error.message : String(error)
      this.output.error(`\nErro: ${message}`)
      process.exitCode = 1
    }
  }

  private async buildFromPreset(
    presetId: string,
    projectName?: string
  ): Promise<ProjectContext> {
    const preset = this.presets.get(presetId)
    if (!preset) {
      const available = this.presets.list().map((item) => item.id).join(', ')
      throw new Error(
        `Preset \"${presetId}\" nao encontrado. Disponiveis: ${available}`
      )
    }

    return this.contextBuilder.buildFromPreset(preset, projectName)
  }

  private isListPresetsRequest(value: string): boolean {
    return value === 'list' || value === 'ls' || value === 'presets'
  }

  private printPresets(): void {
    const entries = this.presets.list()
    if (entries.length === 0) {
      this.output.info('Nenhum preset disponivel.')
      return
    }

    this.output.info('Presets:')
    for (const preset of entries) {
      this.output.info(`- ${preset.id}: ${preset.name}`)
    }
  }

  private toPublicContext(
    context: ProjectContext
  ): PublicProjectContextData {
    const { architectureProfile: _architectureProfile, ...publicContext } =
      context.toJSON()
    return publicContext
  }

  private isPromptAbort(error: unknown): boolean {
    const payload = error as { name?: string; code?: string; message?: string }
    const name = payload?.name ?? ''
    const code = payload?.code ?? ''
    const message = payload?.message ?? ''

    return (
      name === 'ExitPromptError' ||
      code === 'SIGINT' ||
      /SIGINT/i.test(message) ||
      /force closed the prompt/i.test(message)
    )
  }
}
