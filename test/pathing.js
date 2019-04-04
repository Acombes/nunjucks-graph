const path = require('path')
const describe = require('mocha').describe
const { assertInclusion } = require('./utils')

const nunjucksGraph = require('..')

describe('Pathing', () => {
  describe('Descending', () => {
    it('should only show main.njk and partial.njk with proper paths', () => {
      const baseDir = 'test/fixtures/descending-path'
      const main = path.resolve(`${baseDir}/main.njk`)
      const partial = path.resolve(`${baseDir}/partials/partial.njk`)

      const graph = nunjucksGraph.parseDir(baseDir)

      assertInclusion(graph, main, partial)
    })
  })

  describe('Ascending', () => {
    it('should only show main.njk and partial.njk with proper paths', () => {
      const baseDir = 'test/fixtures/ascending-path'
      const main = path.resolve(`${baseDir}/main/main.njk`)
      const partial = path.resolve(`${baseDir}/partial.njk`)

      const graph = nunjucksGraph.parseDir(baseDir)

      assertInclusion(graph, main, partial)
    })
  })
})
