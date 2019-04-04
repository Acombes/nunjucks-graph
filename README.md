# nunjucks-graph
Parse Nunjucks files in a directory and extract a dependency graph. Inspired by [sass-graph](https://github.com/xzyfer/sass-graph).

## Install

Install with [npm](https://npmjs.org/package/sass-graph)

```
npm install nunjucks-graph
```

## Usage

Usage as a Node library:

```js
var nunjucksGraph = require('./nunjucks-graph');
```

## API

#### parseDir
Parses a directory and builds a dependency grap of all requested file extensions.

## Options

#### extensions
Type: `Array`  
Default: `['njk', 'html']`

File Types to be parsed.

### Using a graph
#### setDir
Sets the Graph's base directory

#### addFile
Adds a file to the Graph's index

#### getIndex
Get the graph's index

#### getSimpleIndex
Build and get a simplified version of the graph's index where all types of dependencies are merged

## Example

```js
const nunjucksGraph = require('nunjucks-graph');
console.log(nunjucksGraph.parseDir('test/fixtures/simple'));

/* OUTPUT
{ index: {
  'path/to/test/fixtures/simple/main.njk': {
    includes: [ 'path/to/test/fixtures/simple/partial.njk' ],
    includedBy: [],
    extend: [],
    extendedBy: [],
    imports: [],
    importedBy: []
  },
  'path/to/test/fixtures/simple/partial.njk': {
    includes: [],
    includedBy: [ 'path/to/test/fixtures/simple/main.njk' ],
    extend: [],
    extendedBy: [],
    imports: [],
    importedBy: []
  },
}}
*/
```

## Running Mocha tests
You can run the tests by executing the following commands:

```
npm install
npm test
```
