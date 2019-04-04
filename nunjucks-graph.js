const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')

const INCLUDE_REGEXP = /\{% ?include ['"]([-\/\w.]+)['"] ?%\}/g
const EXTENDS_REGEXP = /\{% ?extends ['"]([-\/\w.]+)[\'\"] ?%\}/g
const IMPORTS_REGEXP = /\{% ?(?:import|from) ["']([-_\/\w.]+)["'].*%\}/g

const makeObject  = ({includes, includedBy, extend, extendedBy, imports, importedBy}) => ({
  includes: includes || [],
  includedBy: includedBy || [],
  extend: extend || [],
  extendedBy: extendedBy || [],
  imports: imports || [],
  importedBy: importedBy || []
})

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
    const addRelationship = (parent, childrenByProperties) => {
      if (this.index [ parent ]) {
        Object.entries(childrenByProperties).forEach(([propName, propValue]) => {
          this.index[ parent ][propName].push(...propValue)
        })
      } else {
        this.index[parent] = makeObject(Object.entries(childrenByProperties).reduce((obj, [propName, propValue]) => {
          obj[propName] = propValue
          return obj
        }, {}))
      }
    }

    const includes = getFileChildren(this.nunjucks, file, INCLUDE_REGEXP)
    const extend = getFileChildren(this.nunjucks, file, EXTENDS_REGEXP)
    const imports = getFileChildren(this.nunjucks, file, IMPORTS_REGEXP)

    addRelationship(file, { includes, imports, extend })

    includes.forEach(include => addRelationship(include, { includedBy: [ file ] }))
    extend  .forEach(parent  => addRelationship(parent,  { extendedBy: [ file ] }))
    imports .forEach(imp     => addRelationship(imp,     { importedBy: [ file ] }))
  }

  getGraph () {
    return this.index
  }

  getSimpleGraph () {
    return Object.entries(this.index).reduce((obj, [filePath, fileDependencies]) => {
      obj[ filePath ] = {
        parents: [...fileDependencies.includedBy, ...fileDependencies.importedBy, ...fileDependencies.extend],
        children: [...fileDependencies.includes, ...fileDependencies.imports, ...fileDependencies.extendedBy]
      }
      return obj
    }, {})
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
