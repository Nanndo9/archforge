import fs from 'node:fs/promises'
import path from 'node:path'
import type { PublicProjectContextData } from './types'

export interface ContextStore {
  save(context: PublicProjectContextData, cwd?: string): Promise<string>
}

export class FileContextStore implements ContextStore {
  constructor(private readonly filename = '.archforge.json') {}

  public async save(
    context: PublicProjectContextData,
    cwd: string = process.cwd()
  ): Promise<string> {
    const target = path.join(cwd, this.filename)
    const payload = `${JSON.stringify(context, null, 2)}\n`

    await fs.writeFile(target, payload, 'utf8')

    return target
  }
}
