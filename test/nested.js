const path = require('path')
const describe = require('mocha').describe
const { assertInclusion } = require('./utils')

const nunjucksMap = require('..')

describe('Simple', () => {
  it('should only show main.njk, partial.njk and sub-partial.njk with inclusion chain: main > partial > sub-partial', () => {
    const baseDir = 'test/fixtures/nested'
    const main = path.resolve(`${baseDir}/main.njk`)
    const partial = path.resolve(`${baseDir}/partial.njk`)
    const subpartial = path.resolve(`${baseDir}/sub-partial.njk`)

    const graph = nunjucksMap.parseDir(baseDir)

    assertInclusion(graph, main, partial)
    assertInclusion(graph, partial, subpartial)
  })
})
