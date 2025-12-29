const test = require('node:test')
const assert = require('node:assert/strict')

const {
  ExpressCleanGenerator
} = require('../dist/features/generators/express-clean.generator')
const {
  ExpressCleanNoDbGenerator
} = require('../dist/features/generators/express-clean-nodb.generator')
const {
  GeneratorRegistry
} = require('../dist/core/generate/generator')
const { ProjectContext } = require('../dist/core/context/types')
const {
  DefaultArchitectureProfilePolicy
} = require('../dist/core/prompts/build-context')

const dummyTemplateEngine = {
  renderTemplate: async () => undefined
}
const dummyTargetResolver = {
  resolve: async () => ''
}
const dummyOutput = {
  info: () => undefined,
  error: () => undefined
}

const architecturePolicy = new DefaultArchitectureProfilePolicy()

function makeContext(overrides = {}) {
  return new ProjectContext({
    projectName: 'demo',
    backend: 'express',
    architecture: 'clean',
    architectureProfile: architecturePolicy.getDefaults('clean'),
    docker: true,
    dockerDatabase: true,
    database: 'postgres',
    orm: 'typeorm',
    tests: 'vitest',
    ...overrides
  })
}

function buildRegistry() {
  return new GeneratorRegistry([
    new ExpressCleanGenerator(
      dummyTemplateEngine,
      dummyTargetResolver,
      dummyOutput
    ),
    new ExpressCleanNoDbGenerator(
      dummyTemplateEngine,
      dummyTargetResolver,
      dummyOutput
    )
  ])
}

test('express combinations resolve to the expected generator', () => {
  const registry = buildRegistry()
  const cases = [
    {
      label: 'postgres docker vitest',
      context: makeContext({
        database: 'postgres',
        orm: 'typeorm',
        docker: true,
        dockerDatabase: true,
        tests: 'vitest'
      }),
      expected: 'express-clean-postgres-typeorm'
    },
    {
      label: 'postgres sem docker',
      context: makeContext({
        database: 'postgres',
        orm: 'typeorm',
        docker: false,
        dockerDatabase: false,
        tests: 'vitest'
      }),
      expected: 'express-clean-postgres-typeorm'
    },
    {
      label: 'postgres sem testes',
      context: makeContext({
        database: 'postgres',
        orm: 'typeorm',
        docker: true,
        dockerDatabase: true,
        tests: 'none'
      }),
      expected: 'express-clean-postgres-typeorm'
    },
    {
      label: 'sem banco com docker',
      context: makeContext({
        database: 'none',
        orm: 'none',
        docker: true,
        dockerDatabase: false,
        tests: 'vitest'
      }),
      expected: 'express-clean-nodb'
    },
    {
      label: 'sem banco e sem testes',
      context: makeContext({
        database: 'none',
        orm: 'none',
        docker: false,
        dockerDatabase: false,
        tests: 'none'
      }),
      expected: 'express-clean-nodb'
    }
  ]

  for (const item of cases) {
    const resolved = registry.resolve(item.context)
    assert.ok(resolved, `gera projeto para ${item.label}`)
    assert.equal(resolved.name, item.expected)
  }
})

test('express combinações fora do suporte nao geram projeto', () => {
  const registry = buildRegistry()
  const context = makeContext({
    database: 'postgres',
    orm: 'prisma',
    docker: true,
    dockerDatabase: true,
    tests: 'vitest'
  })

  assert.equal(registry.resolve(context), null)
})
