import type { ProjectContext } from '../context/types'

export interface ValidationRule<T> {
  validate(target: T): string | null
}

export interface Validator<T> {
  validate(target: T): void
}

export class ValidationError extends Error {
  public readonly errors: string[]

  constructor(errors: string[]) {
    super(`Contexto invalido:\n${errors.map((error) => `- ${error}`).join('\n')}`)
    this.name = 'ValidationError'
    this.errors = [...errors]
  }
}

export class CompositeValidator<T> implements Validator<T> {
  constructor(private readonly rules: ValidationRule<T>[]) {}

  public validate(target: T): void {
    const errors = this.rules
      .map((rule) => rule.validate(target))
      .filter((error): error is string => Boolean(error))

    if (errors.length > 0) {
      throw new ValidationError(errors)
    }
  }
}

class ProjectNameRule implements ValidationRule<ProjectContext> {
  private readonly namePattern = /^[a-z0-9][a-z0-9-_]*$/

  public validate(target: ProjectContext): string | null {
    if (!this.namePattern.test(target.projectName)) {
      return 'projectName invalido. Use letras minusculas, numeros, "-" ou "_".'
    }

    return null
  }
}

class MongoRequiresMongooseRule implements ValidationRule<ProjectContext> {
  public validate(target: ProjectContext): string | null {
    if (target.database === 'mongodb' && target.orm !== 'mongoose') {
      return 'MongoDB exige Mongoose neste setup.'
    }

    return null
  }
}

class MongooseRequiresMongoRule implements ValidationRule<ProjectContext> {
  public validate(target: ProjectContext): string | null {
    if (target.database !== 'mongodb' && target.orm === 'mongoose') {
      return 'Mongoose so e compativel com MongoDB.'
    }

    return null
  }
}

class DockerDatabaseRequiresDockerRule implements ValidationRule<ProjectContext> {
  public validate(target: ProjectContext): string | null {
    if (target.dockerDatabase && !target.docker) {
      return 'dockerDatabase exige Docker habilitado.'
    }

    return null
  }
}

class DockerDatabaseRequiresPostgresRule
  implements ValidationRule<ProjectContext>
{
  public validate(target: ProjectContext): string | null {
    if (target.dockerDatabase && target.database !== 'postgres') {
      return 'dockerDatabase so e suportado para Postgres neste MVP.'
    }

    return null
  }
}

class DatabaseNoneRequiresOrmNoneRule implements ValidationRule<ProjectContext> {
  public validate(target: ProjectContext): string | null {
    if (target.database === 'none' && target.orm !== 'none') {
      return 'Sem banco exige ORM/ODM definido como nenhum.'
    }

    return null
  }
}

class OrmNoneRequiresDatabaseNoneRule implements ValidationRule<ProjectContext> {
  public validate(target: ProjectContext): string | null {
    if (target.database !== 'none' && target.orm === 'none') {
      return 'ORM/ODM nenhum so e valido quando nao ha banco.'
    }

    return null
  }
}

export class ContextValidator extends CompositeValidator<ProjectContext> {
  constructor() {
    super([
      new ProjectNameRule(),
      new MongoRequiresMongooseRule(),
      new MongooseRequiresMongoRule(),
      new DatabaseNoneRequiresOrmNoneRule(),
      new OrmNoneRequiresDatabaseNoneRule(),
      new DockerDatabaseRequiresDockerRule(),
      new DockerDatabaseRequiresPostgresRule()
    ])
  }
}
