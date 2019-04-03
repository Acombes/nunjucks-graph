const path = require('path')
const describe = require('mocha').describe
const assert = require('chai').assert

const nunjucksMap = require('../nunjucks-map')

describe('Simple', () => {
  describe('parseDir', () => {
    it('should only show main.njk and partial.njk with main including partial', () => {
      const baseDir = 'test/fixtures/simple'
      const main = path.resolve(`${baseDir}/main.njk`)
      const partial = path.resolve(`${baseDir}/partial.njk`)

      assert.sameDeepMembers(nunjucksMap.parseDir('test/fixtures/simple'), [ {
        name: main,
        includes: [ partial ],
        includedBy: [],
      }, {
        name: partial,
        includes: [],
        includedBy: [ main ],
      } ])
    })
  })
})
