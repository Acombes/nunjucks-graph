const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')

const REGEXP = {
  INCLUDE: /{% ?include ['"]([-\/\w.]+)['"] ?%}/g,
  EXTENDS: /{% ?extends ['"]([-\/\w.]+)['"] ?%}/g,
  IMPORTS: /{% ?(?:import|from) ["']([-_\/\w.]+)["'].*%}/g,
}

const makeObject  = ({includes, includedBy, extend, extendedBy, imports, importedBy}) => ({
  includes: includes || [],
  includedBy: includedBy || [],
  extend: extend || [],
  extendedBy: extendedBy || [],
  imports: imports || [],
  importedBy: importedBy || []
})

/**
 * Build a list of files a given templates depends on given a RegExp matching the dependency instruction.
 * @param {Object} nunjucks - A Nunjucks Environment instance.
 * @param {String} templateName - The template's name.
 * @param {RegExp} childrenRegex - The RegExp to lookup inside the template. Its first group should match the target file's relative path.
 * @returns {Array} - A list of absolute filepaths.
 */
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

/**
 * Gather all files matching given extensions in the given directory.
 * @param {String} dir - The directory in which to fetch the files.
 * @param {Array<String>} extensions - The extensions the resulting files have to match.
 * @returns {Array} - A list of absolute filepaths.
 */
function getAllNjkFiles (dir, extensions) {
  if (typeof dir === 'undefined') { dir = this.dir }

  return fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    if (!isDirectory && !file.match(new RegExp(`\\.(${extensions.join('|')})$`))) return files
    return isDirectory ? [ ...files, ...getAllNjkFiles(name, extensions) ] : [ ...files, path.resolve(name) ]
  }, [])
}

class NunjucksGraph {
  /**
   * @param {Object} options
   * @param {String} dir - Absolute path to the graph's base directory
   */
  constructor (options, dir) {
    this.extensions = options.extensions

    this.index = {}

    if (dir) {
      this.setDir(dir)
      getAllNjkFiles(this.dir, this.extensions).forEach(file => {
        this.addFile(file)
      })
    }
  }

  /**
   * Set the graph's base directory
   * @param {String} dirpath
   */
  setDir (dirpath) {
    this.dir = dirpath
    this.nunjucks = new nunjucks.Environment(new nunjucks.FileSystemLoader(dirpath))
  }

  /**
   * Add a file to the graph's index
   * @param {String} file - The absolute path to the file
   */
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

    const includes = getFileChildren(this.nunjucks, file, REGEXP.INCLUDE)
    const extend = getFileChildren(this.nunjucks, file, REGEXP.EXTENDS)
    const imports = getFileChildren(this.nunjucks, file, REGEXP.IMPORTS)

    addRelationship(file, { includes, imports, extend })

    includes.forEach(include => addRelationship(include, { includedBy: [ file ] }))
    extend  .forEach(parent  => addRelationship(parent,  { extendedBy: [ file ] }))
    imports .forEach(imp     => addRelationship(imp,     { importedBy: [ file ] }))
  }

  /**
   * Get the graph's index
   * @returns {Object} - The graph's index
   */
  getIndex () {
    return this.index
  }

  /**
   * Build and get a simplified version of the graph's index where all types of dependencies are merged
   * @returns {Object} - The graph's simplified index
   */
  getSimpleIndex () {
    return Object.entries(this.index).reduce((obj, [filePath, fileDependencies]) => {
      obj[ filePath ] = {
        parents: [...fileDependencies.includedBy, ...fileDependencies.importedBy, ...fileDependencies.extend],
        children: [...fileDependencies.includes, ...fileDependencies.imports, ...fileDependencies.extendedBy]
      }
      return obj
    }, {})
  }
}

/**
 * Parse a directory and extract a dependency graph from it
 * @param {String} dirpath
 * @param options
 * @returns {NunjucksGraph}
 */
module.exports.parseDir = (dirpath, options) => {
  if (fs.lstatSync(dirpath).isDirectory()) {
    dirpath = path.resolve(dirpath)
    return new NunjucksGraph(Object.assign({
      extensions: [ 'njk', 'html' ]
    }, options), dirpath)
  }
}
