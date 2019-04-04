const path = require('path')
const describe = require('mocha').describe
const { assertInclusion } = require('./utils')

const nunjucksGraph = require('..')

describe('Simple', () => {
  it('should only show main.njk and partial.njk with main including partial', () => {
    const baseDir = 'test/fixtures/simple'
    const main = path.resolve(`${baseDir}/main.njk`)
    const partial = path.resolve(`${baseDir}/partial.njk`)

    const graph = nunjucksGraph.parseDir(baseDir)

    assertInclusion(graph, main, partial)
  })
})
