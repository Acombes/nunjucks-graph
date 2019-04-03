const { assert } = require('chai')

module.exports.assertInclusion = function (graph, ancestor, child) {
  assert.include(graph.index[ ancestor ].includes, child)
  assert.include(graph.index[ child ].includedBy, ancestor)
}

module.exports.assertExtension = function (graph, ancestor, child) {
  assert.include(graph.index[ child ].extends, ancestor)
  assert.include(graph.index[ ancestor ].extendedBy, child)
}
