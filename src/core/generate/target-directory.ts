import fs from 'node:fs/promises'
import path from 'node:path'

export class TargetDirectoryResolver {
  private readonly ignoreEntries = new Set(['.archforge.json'])

  public async resolve(
    projectName: string,
    cwd: string = process.cwd()
  ): Promise<string> {
    const currentDirName = path.basename(cwd)
    if (currentDirName === projectName) {
      const empty = await this.isEmptyDir(cwd)
      if (!empty) {
        throw new Error('Diretorio atual nao esta vazio.')
      }
      return cwd
    }

    const targetDir = path.join(cwd, projectName)
    const exists = await this.exists(targetDir)
    if (exists) {
      const empty = await this.isEmptyDir(targetDir)
      if (!empty) {
        throw new Error(`Diretorio ${projectName} ja existe e nao esta vazio.`)
      }
      return targetDir
    }

    await fs.mkdir(targetDir, { recursive: true })
    return targetDir
  }

  private async exists(targetDir: string): Promise<boolean> {
    try {
      await fs.access(targetDir)
      return true
    } catch {
      return false
    }
  }

  private async isEmptyDir(targetDir: string): Promise<boolean> {
    const entries = await fs.readdir(targetDir)
    const visibleEntries = entries.filter(
      (entry) => !this.ignoreEntries.has(entry)
    )
    return visibleEntries.length === 0
  }
}
