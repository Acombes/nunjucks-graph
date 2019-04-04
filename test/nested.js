const path = require('path')
const describe = require('mocha').describe
const { assertInclusion } = require('./utils')

const nunjucksGraph = require('..')

describe('Nested', () => {
  it('should only show main.njk, partial.njk and sub-partial.njk with inclusion chain: main > partial > sub-partial', () => {
    const baseDir = 'test/fixtures/nested'
    const main = path.resolve(`${baseDir}/main.njk`)
    const partial = path.resolve(`${baseDir}/partial.njk`)
    const subpartial = path.resolve(`${baseDir}/sub-partial.njk`)

    const graph = nunjucksGraph.parseDir(baseDir)

    assertInclusion(graph, main, partial)
    assertInclusion(graph, partial, subpartial)
  })
})
