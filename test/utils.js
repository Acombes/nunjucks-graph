const { assert } = require('chai')

module.exports.assertInclusion = (graph, ancestor, child) => {
  assert.include(graph[ ancestor ].includes, child)
  assert.include(graph[ child ].includedBy, ancestor)
}

module.exports.assertExtension = (graph, ancestor, child) => {
  assert.include(graph[ child ].extend, ancestor)
  assert.include(graph[ ancestor ].extendedBy, child)
}

module.exports.assertImport = (graph, ancestor, child) => {
  assert.include(graph[ ancestor ].imports, child)
  assert.include(graph[ child ].importedBy, ancestor)
}

module.exports.assertDependency = (graph, ancestor, child) => {
  assert.include(graph[ancestor].children, child)
  assert.include(graph[child].parents, ancestor)
}
