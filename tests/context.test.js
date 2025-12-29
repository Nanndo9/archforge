const test = require('node:test')
const assert = require('node:assert/strict')

const {
  ProjectContextFactory,
  ProjectNamePolicy,
  DefaultRecommendationPolicy,
  DefaultArchitectureProfilePolicy,
  ContextSummaryPresenter,
  ContextLabelCatalog
} = require('../dist/core/prompts/build-context')
const {
  ContextValidator
} = require('../dist/core/validate/validate-context')
const { ProjectContext } = require('../dist/core/context/types')

const architectureProfilePolicy = new DefaultArchitectureProfilePolicy()

function baseContext(overrides = {}) {
  return new ProjectContext({
    projectName: 'demo',
    backend: 'express',
    architecture: 'clean',
    architectureProfile: architectureProfilePolicy.getDefaults('clean'),
    docker: true,
    dockerDatabase: true,
    database: 'postgres',
    orm: 'typeorm',
    tests: 'vitest',
    ...overrides
  })
}

test('factory forces orm none when database is none', () => {
  const factory = new ProjectContextFactory(
    new ProjectNamePolicy(),
    new DefaultRecommendationPolicy(),
    architectureProfilePolicy
  )

  const context = factory.create({
    projectName: 'My API',
    database: 'none',
    orm: 'prisma',
    docker: true
  })

  assert.equal(context.database, 'none')
  assert.equal(context.orm, 'none')
  assert.equal(context.dockerDatabase, false)
})

test('validator rejects mongo with prisma', () => {
  const validator = new ContextValidator()
  const context = baseContext({
    database: 'mongodb',
    orm: 'prisma',
    dockerDatabase: false
  })

  assert.throws(() => validator.validate(context))
})

test('validator rejects database none with orm', () => {
  const validator = new ContextValidator()
  const context = baseContext({
    database: 'none',
    orm: 'typeorm',
    dockerDatabase: false
  })

  assert.throws(() => validator.validate(context))
})

test('validator rejects docker database without docker', () => {
  const validator = new ContextValidator()
  const context = baseContext({
    docker: false,
    dockerDatabase: true
  })

  assert.throws(() => validator.validate(context))
})

test('summary labels database and orm when none', () => {
  const summary = new ContextSummaryPresenter(new ContextLabelCatalog())
  const context = baseContext({
    database: 'none',
    orm: 'none',
    dockerDatabase: false
  })

  const output = summary.format(context)
  assert.match(output, /- Banco: nenhum/)
  assert.match(output, /- ORM\/ODM: nenhum/)
})
