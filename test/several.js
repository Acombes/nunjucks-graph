const path = require('path')
const describe = require('mocha').describe
const { assertInclusion } = require('./utils')

const nunjucksGraph = require('..')

describe('Several', () => {
  it('should only show main.njk including partial-1.njk and partial-2.njk', () => {
    const baseDir = 'test/fixtures/several'
    const main = path.resolve(`${baseDir}/main.njk`)
    const partial1 = path.resolve(`${baseDir}/partial-1.njk`)
    const partial2 = path.resolve(`${baseDir}/partial-2.njk`)

    const graph = nunjucksGraph.parseDir(baseDir)

    assertInclusion(graph, main, partial1)
    assertInclusion(graph, main, partial2)
  })
})
