import { Command } from 'commander'
import type { OutputPort } from '../../core/io/output'
import type { PresetRegistry } from '../../core/presets/presets'

export class PresetsCommand {
  constructor(
    private readonly presets: PresetRegistry,
    private readonly output: OutputPort
  ) {}

  public build(): Command {
    return new Command('presets')
      .description('Lista os presets disponiveis')
      .action(() => this.execute())
  }

  private execute(): void {
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
}
