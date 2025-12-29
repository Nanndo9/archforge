import { CliProgram } from './cli/program'
import { InitCommand } from './cli/commands/init.command'
import { PresetsCommand } from './cli/commands/presets.command'
import { ConsoleOutput } from './core/io/output'
import {
  ContextLabelCatalog,
  ContextSummaryPresenter,
  DefaultArchitectureProfilePolicy,
  DefaultRecommendationPolicy,
  InquirerModuleLoader,
  InquirerPromptClient,
  ProjectContextBuilder,
  ProjectContextFactory,
  ProjectNamePolicy
} from './core/prompts/build-context'
import { FileContextStore } from './core/context/context-store'
import { PresetRegistry } from './core/presets/presets'
import { GeneratorRegistry } from './core/generate/generator'
import { TargetDirectoryResolver } from './core/generate/target-directory'
import {
  FileTemplateEngine,
  resolveTemplateRoot
} from './core/templates/engine'
import { ExpressCleanGenerator } from './features/generators/express-clean.generator'
import { ExpressCleanNoDbGenerator } from './features/generators/express-clean-nodb.generator'
import { NpmPackageInstaller } from './core/generate/package-installer'
import { ContextValidator } from './core/validate/validate-context'

export class ArchforgeApp {
  private readonly program: CliProgram

  constructor() {
    const output = new ConsoleOutput()
    const loader = new InquirerModuleLoader()
    const promptClient = new InquirerPromptClient(loader)
    const namePolicy = new ProjectNamePolicy()
    const labelCatalog = new ContextLabelCatalog()
    const recommendationPolicy = new DefaultRecommendationPolicy()
    const architectureProfilePolicy = new DefaultArchitectureProfilePolicy()
    const contextFactory = new ProjectContextFactory(
      namePolicy,
      recommendationPolicy,
      architectureProfilePolicy
    )
    const summaryPresenter = new ContextSummaryPresenter(labelCatalog)
    const contextBuilder = new ProjectContextBuilder(
      promptClient,
      namePolicy,
      recommendationPolicy,
      labelCatalog,
      summaryPresenter,
      contextFactory,
      output
    )
    const validator = new ContextValidator()
    const presets = new PresetRegistry()
    const contextStore = new FileContextStore()
    const templateEngine = new FileTemplateEngine(resolveTemplateRoot())
    const targetResolver = new TargetDirectoryResolver()
    const generatorRegistry = new GeneratorRegistry([
      new ExpressCleanGenerator(templateEngine, targetResolver, output),
      new ExpressCleanNoDbGenerator(templateEngine, targetResolver, output)
    ])
    const packageInstaller = new NpmPackageInstaller(output)
    const initCommand = new InitCommand(
      contextBuilder,
      validator,
      output,
      presets,
      contextStore,
      generatorRegistry,
      packageInstaller
    )
    const presetsCommand = new PresetsCommand(presets, output)

    this.program = new CliProgram(initCommand, presetsCommand)
  }

  public run(argv: string[]): void {
    this.program.run(argv)
  }
}
