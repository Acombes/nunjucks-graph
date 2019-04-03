const { assert } = require('chai')



module.exports.assertInclusion = function (graph, ancestor, child) {
  assert.include(graph.index[ ancestor ].includes, child)
  assert.include(graph.index[ child ].includedBy, ancestor)
}
