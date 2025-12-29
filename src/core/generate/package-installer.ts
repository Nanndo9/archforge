import { spawn } from 'node:child_process'
import type { OutputPort } from '../io/output'

export interface PackageInstaller {
  install(
    targetDir: string,
    dependencies: string[],
    devDependencies: string[]
  ): Promise<void>
}

export class NpmPackageInstaller implements PackageInstaller {
  constructor(private readonly output: OutputPort) {}

  public async install(
    targetDir: string,
    dependencies: string[],
    devDependencies: string[]
  ): Promise<void> {
    if (dependencies.length > 0) {
      await this.runInstall(targetDir, dependencies, false)
    }

    if (devDependencies.length > 0) {
      await this.runInstall(targetDir, devDependencies, true)
    }
  }

  private runInstall(
    targetDir: string,
    dependencies: string[],
    dev: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ['install', ...(dev ? ['-D'] : []), ...dependencies]
      const label = dev ? 'dev dependencias' : 'dependencias'
      this.output.info(`\nInstalando ${label} (npm install)...`)

      const child = spawn('npm', args, {
        cwd: targetDir,
        stdio: 'inherit',
        shell: process.platform === 'win32'
      })

      child.on('close', (code) => {
        if (code === 0) {
          this.output.info(`Instalacao de ${label} concluida.`)
          resolve()
        } else {
          reject(
            new Error(
              `npm install falhou para ${label} (codigo ${code ?? 'desconhecido'}).`
            )
          )
        }
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }
}
