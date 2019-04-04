const path = require('path')
const describe = require('mocha').describe
const { assertExtension } = require('./utils')

const nunjucksGraph = require('..')

describe('Extends', () => {
  it('should only show parent.njk and child.njk with child extending parent', () => {
    const baseDir = 'test/fixtures/extends'
    const parent = path.resolve(`${baseDir}/parent.njk`)
    const child = path.resolve(`${baseDir}/child.njk`)

    const graph = nunjucksGraph.parseDir(baseDir)

    assertExtension(graph, parent, child)
  })
})
