const path = require('path')
const describe = require('mocha').describe
const assert = require('chai').assert

const nunjucksMap = require('../nunjucks-map')

describe('Pathing', () => {
  describe('Descending', () => {
    describe('parseDir', () => {
      it('should only show main.njk and partial.njk with proper paths', () => {
        const baseDir = 'test/fixtures/descending-path'
        const main = path.resolve(`${baseDir}/main.njk`)
        const partial = path.resolve(`${baseDir}/partials/partial.njk`)

        assert.sameDeepMembers(nunjucksMap.parseDir(baseDir), [ {
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

  describe('Ascending', () => {
    describe('parseDir', () => {
      it('should only show main.njk and partial.njk with proper paths', () => {
        const baseDir = 'test/fixtures/ascending-path'
        const main = path.resolve(`${baseDir}/main/main.njk`)
        const partial = path.resolve(`${baseDir}/partial.njk`)

        assert.sameDeepMembers(nunjucksMap.parseDir(baseDir), [ {
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
})
