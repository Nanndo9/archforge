import { Command } from 'commander'
import { InitCommand } from './commands/init.command'
import { PresetsCommand } from './commands/presets.command'

export class CliProgram {
  constructor(
    private readonly initCommand: InitCommand,
    private readonly presetsCommand: PresetsCommand
  ) {}

  public build(): Command {
    const program = new Command()

    program
      .name('archforge')
      .description(
        'CLI para criacao automatizada de aplicacoes backend, baseada em decisoes tecnicas e padroes de projeto.'
      )
      .version('0.0.1')
      .showHelpAfterError()

    program.addHelpText(
      'after',
      '\nExemplos:\n  $ archforge init\n  $ archforge presets\n  $ archforge -p list\n  $ archforge -p clean-api\n'
    )
    program.addCommand(this.initCommand.build())
    program.addCommand(this.presetsCommand.build())

    return program
  }

  public run(argv: string[]): void {
    this.build().parse(this.normalizeArgv(argv))
  }

  private normalizeArgv(argv: string[]): string[] {
    const args = argv.slice(2)
    if (args.length === 0) {
      return argv
    }

    if (args.some((arg) => this.isKnownCommand(arg))) {
      return argv
    }

    const hasPresetOption = args.some(
      (arg) => arg === '-p' || arg === '--preset'
    )

    if (!hasPresetOption) {
      return argv
    }

    return [argv[0], argv[1], 'init', ...args]
  }

  private isKnownCommand(arg: string): boolean {
    return arg === 'init' || arg === 'presets' || arg === 'help'
  }
}
