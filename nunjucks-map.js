const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')

const INCLUDE_REGEXP = /\{% include [\'\"]([-\/\\'\w.]+)[\'\"] %\}/g

let nunjucksEnv

const initNunjucksEnv = dir => {
  nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(dir))
}

const getAllNjkFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    if (!isDirectory && !file.match(/\.njk$/)) return files
    return isDirectory ? [ ...files, ...getAllNjkFiles(name) ] : [ ...files, path.resolve(name) ]
  }, [])

const getFileChildren = (templateName, childrenRegex) => {
  const template = nunjucksEnv.getTemplate(templateName, false)
  const includes = []

  let match
  while ((match = childrenRegex.exec(template.tmplStr))) {
    includes.push(path.join(path.parse(templateName).dir, match[ 1 ]))
  }

  return includes
}

module.exports.parseDir = dir => {
  const tree = []

  initNunjucksEnv(dir)

  getAllNjkFiles(dir).forEach(file => {
    const fileIncludes = getFileChildren(file, INCLUDE_REGEXP)

    fileIncludes.forEach(includedFile => {
      const treeItem = tree.find(item => item.name === includedFile)
      if (treeItem) {
        treeItem.includedBy.push(file)
      } else {
        tree.push({
          name: includedFile,
          includes: [],
          includedBy: [ file ],
        })
      }
    })

    const treeItem = tree.find(item => item.name === file)
    if (treeItem) {
      treeItem.includes = fileIncludes
    } else {
      tree.push({
        name: file,
        includes: fileIncludes,
        includedBy: [],
      })
    }
  })

  return tree
}
