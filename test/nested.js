const path = require('path')
const describe = require('mocha').describe
const assert = require('chai').assert

const nunjucksMap = require('../nunjucks-map')

describe('Nested', () => {
  describe('parseDir', () => {
    it('should only show main.njk, partial.njk and sub-partial.njk with inclusion chain: main > partial > sub-partial', () => {
      const baseDir = 'test/fixtures/nested'
      const main = path.resolve(`${baseDir}/main.njk`)
      const partial = path.resolve(`${baseDir}/partial.njk`)
      const subpartial = path.resolve(`${baseDir}/sub-partial.njk`)

      assert.sameDeepMembers(nunjucksMap.parseDir(baseDir), [ {
        name: main,
        includes: [ partial ],
        includedBy: [],
      }, {
        name: partial,
        includes: [ subpartial ],
        includedBy: [ main ],
      }, {
        name: subpartial,
        includes: [],
        includedBy: [ partial ],
      } ])
    })
  })
})
