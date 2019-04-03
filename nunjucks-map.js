const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')

const INCLUDE_REGEXP = /\{% include [\'\"]([-\/\\'\w.]+)[\'\"] %\}/g

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

  _getFileChildren (templateName, childrenRegex) {
    if (typeof this.nunjucks === 'undefined') throw new Error('Base Nunjucks directory must be set first')

    const template = this.nunjucks.getTemplate(templateName, false)
    const includes = []

    let match
    while ((match = childrenRegex.exec(template.tmplStr))) {
      includes.push(path.join(path.parse(templateName).dir, match[ 1 ]))
    }

    return includes
  }

  setDir (dirpath) {
    this.dir = dirpath
    this.nunjucks = new nunjucks.Environment(new nunjucks.FileSystemLoader(dirpath))
  }

  addFile (file) {
    const children = this._getFileChildren(file, INCLUDE_REGEXP)

    if (this.index[ file ]) {
      this.index[ file ].includes.push(...children)
    } else {
      this.index[ file ] = {
        includes: children,
        includedBy: []
      }
    }

    children.forEach(child => {
      if (this.index[ child ]) {
        this.index[ child ].includedBy.push(file)
      } else {
        this.index[ child ] = {
          includes: [],
          includedBy: [ file ]
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
