const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')

const INCLUDE_REGEXP = /\{% include [\'\"]([-\/\\'\w.]+)[\'\"] %\}/g
const EXTENDS_REGEXP = /\{% extends [\'\"]([-\/\\'\w.]+)[\'\"] %\}/g

function getFileChildren (nunjucks, templateName, childrenRegex) {
  if (typeof nunjucks === 'undefined') throw new Error('Base Nunjucks directory must be set first')

  const template = nunjucks.getTemplate(templateName, false)
  const children = []

  let match
  while ((match = childrenRegex.exec(template.tmplStr))) {
    children.push(path.join(path.parse(templateName).dir, match[ 1 ]))
  }

  return children
}

class NunjucksGraph {
  constructor (options, dir) {
    this.extensions = options.extensions

    this.index = {}

    if (dir) {
      this.setDir(dir)
      this._getAllNjkFiles(this.dir).forEach(file => {
        this.addFile(file)
      })
    }
  }

  _getAllNjkFiles (dir) {
    return fs.readdirSync(dir).reduce((files, file) => {
      const name = path.join(dir, file)
      const isDirectory = fs.statSync(name).isDirectory()
      if (!isDirectory && !file.match(new RegExp(`\\.(${this.extensions.join('|')})$`))) return files
      return isDirectory ? [ ...files, ...this._getAllNjkFiles(name) ] : [ ...files, path.resolve(name) ]
    }, [])
  }


  setDir (dirpath) {
    this.dir = dirpath
    this.nunjucks = new nunjucks.Environment(new nunjucks.FileSystemLoader(dirpath))
  }

  addFile (file) {
    const includes = getFileChildren(this.nunjucks, file, INCLUDE_REGEXP)
    const extend = getFileChildren(this.nunjucks, file, EXTENDS_REGEXP)

    if (this.index[ file ]) {
      this.index[ file ].includes.push(...includes)
      this.index[ file ].extends.push(...extend) // There should only be one, but just in case...
    } else {
      this.index[ file ] = {
        includes: includes,
        includedBy: [],
        extends: extend,
        extendedBy: [],
      }
    }

    includes.forEach(include => {
      if (this.index[ include ]) {
        this.index[ include ].includedBy.push(file)
      } else {
        this.index[ include ] = {
          includes: [],
          includedBy: [ file ],
          extends: [],
          extendedBy: []
        }
      }
    })

    extend.forEach(parent => {
      if (this.index[ parent ]) {
        this.index[ parent ].extendedBy.push(file)
      } else {
        this.index[ parent ] = {
          includes: [],
          includedBy: [],
          extends: [],
          extendedBy: [ file ]
        }
      }
    })
  }
}

module.exports.parseDir = (dirpath, options) => {
  if (fs.lstatSync(dirpath).isDirectory()) {
    dirpath = path.resolve(dirpath)
    return new NunjucksGraph(Object.assign({
      extensions: [ 'njk', 'html' ]
    }, options), dirpath)
  }
}
