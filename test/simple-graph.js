const path = require('path')
const describe = require('mocha').describe
const { assertDependency } = require('./utils')

const nunjucksGraph = require('..')

describe('Simple graph', () => {
  describe('Simple', () => {
    it('should only show main.njk and partial.njk with main depending on partial', () => {
      const baseDir = 'test/fixtures/simple'
      const main = path.resolve(`${baseDir}/main.njk`)
      const partial = path.resolve(`${baseDir}/partial.njk`)

      const graph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

      assertDependency(graph, main, partial)
    })
  })

  describe('Several', () => {
    it('should only show main.njk depending on partial-1.njk and partial-2.njk', () => {
      const baseDir = 'test/fixtures/several'
      const main = path.resolve(`${baseDir}/main.njk`)
      const partial1 = path.resolve(`${baseDir}/partial-1.njk`)
      const partial2 = path.resolve(`${baseDir}/partial-2.njk`)

      const simpleGraph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

      assertDependency(simpleGraph, main, partial1)
      assertDependency(simpleGraph, main, partial2)
    })
  })

  describe('Pathing', () => {
    describe('Descending', () => {
      it('should only show main.njk and partial.njk with proper paths', () => {
        const baseDir = 'test/fixtures/descending-path'
        const main = path.resolve(`${baseDir}/main.njk`)
        const partial = path.resolve(`${baseDir}/partials/partial.njk`)

        const graph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

        assertDependency(graph, main, partial)
      })
    })

    describe('Ascending', () => {
      it('should only show main.njk and partial.njk with proper paths', () => {
        const baseDir = 'test/fixtures/ascending-path'
        const main = path.resolve(`${baseDir}/main/main.njk`)
        const partial = path.resolve(`${baseDir}/partial.njk`)

        const graph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

        assertDependency(graph, main, partial)
      })
    })
  })

  describe('Nested', () => {
    it('should only show main.njk, partial.njk and sub-partial.njk with dependency chain: main > partial > sub-partial', () => {
      const baseDir = 'test/fixtures/nested'
      const main = path.resolve(`${baseDir}/main.njk`)
      const partial = path.resolve(`${baseDir}/partial.njk`)
      const subpartial = path.resolve(`${baseDir}/sub-partial.njk`)

      const graph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

      assertDependency(graph, main, partial)
      assertDependency(graph, partial, subpartial)
    })
  })

  describe('Imports', () => {
    it('should only show main-from-import.njk and main-import-as.njk depending on macros.njk', () => {
      const baseDir = 'test/fixtures/imports'
      const mainFromImport = path.resolve(`${baseDir}/main-from-import.njk`)
      const mainImportAs = path.resolve(`${baseDir}/main-import-as.njk`)
      const macros = path.resolve(`${baseDir}/macros.njk`)

      const graph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

      assertDependency(graph, mainFromImport, macros)
      assertDependency(graph, mainImportAs, macros)
    })
  })

  describe('Extends', () => {
    it('should only show parent.njk and child.njk with child.njk depending on parent.njk', () => {
      const baseDir = 'test/fixtures/extends'
      const parent = path.resolve(`${baseDir}/parent.njk`)
      const child = path.resolve(`${baseDir}/child.njk`)

      const graph = nunjucksGraph.parseDir(baseDir).getSimpleGraph()

      assertDependency(graph, parent, child)
    })
  })
})
