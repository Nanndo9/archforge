import fs from 'node:fs/promises'
import path from 'node:path'

export interface TemplateEngine {
  renderTemplate(
    templateName: string,
    targetDir: string,
    variables: Record<string, string>
  ): Promise<void>
}

export class FileTemplateEngine implements TemplateEngine {
  constructor(private readonly templateRoot: string) {}

  public async renderTemplate(
    templateName: string,
    targetDir: string,
    variables: Record<string, string>
  ): Promise<void> {
    const templateDir = path.join(this.templateRoot, templateName)
    await this.copyDir(templateDir, targetDir, variables)
  }

  private async copyDir(
    sourceDir: string,
    targetDir: string,
    variables: Record<string, string>
  ): Promise<void> {
    await fs.mkdir(targetDir, { recursive: true })
    const entries = await fs.readdir(sourceDir, { withFileTypes: true })

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name)
      const targetPath = path.join(targetDir, entry.name)

      if (entry.isDirectory()) {
        await this.copyDir(sourcePath, targetPath, variables)
        continue
      }

      if (entry.isFile()) {
        await this.copyFile(sourcePath, targetPath, variables)
      }
    }
  }

  private async copyFile(
    sourcePath: string,
    targetPath: string,
    variables: Record<string, string>
  ): Promise<void> {
    const content = await fs.readFile(sourcePath, 'utf8')
    const rendered = this.applyVariables(content, variables)
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.writeFile(targetPath, rendered, 'utf8')
  }

  private applyVariables(
    content: string,
    variables: Record<string, string>
  ): string {
    let rendered = content
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g')
      rendered = rendered.replace(pattern, value)
    }
    return rendered
  }
}

export function resolveTemplateRoot(): string {
  return path.resolve(__dirname, '..', '..', '..', 'assets', 'templates')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
}
