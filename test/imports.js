const path = require('path')
const describe = require('mocha').describe
const { assertImport } = require('./utils')

const nunjucksGraph = require('..')

describe('Imports', () => {
  it('should only show main-from-import.njk and main-import-as.njk importing macros.njk and the other way around', () => {
    const baseDir = 'test/fixtures/imports'
    const mainFromImport = path.resolve(`${baseDir}/main-from-import.njk`)
    const mainImportAs = path.resolve(`${baseDir}/main-import-as.njk`)
    const macros = path.resolve(`${baseDir}/macros.njk`)

    const graph = nunjucksGraph.parseDir(baseDir)

    assertImport(graph, mainFromImport, macros)
    assertImport(graph, mainImportAs, macros)
  })
})
