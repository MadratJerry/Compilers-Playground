import * as monaco from 'monaco-editor'
import Lexer from './Lexer'

self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js'
    }
    if (label === 'css') {
      return './css.worker.bundle.js'
    }
    if (label === 'html') {
      return './html.worker.bundle.js'
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js'
    }
    return './editor.worker.bundle.js'
  },
}

const source = monaco.editor.createModel(
  `(function name() {
  const a = 1e2
  let b = 1.234e10
  var f = "foo\\
  bar\\n";const g='a111e\\n\\
  11';;;
  if(a>=b)console.log("wow");
})()`,
  'javascript',
)

monaco.editor.create(document.getElementById('editor'), {
  model: source,
})

source.onDidChangeContent(function() {
  parse()
})

function parse() {
  render(new Lexer(source.getValue()))
}

function render(lexer) {
  const result = document.getElementById('result')
  const { tokenList, errorList } = lexer
  result.innerHTML = `<ul>
  ${tokenList
    .map(t => `<li>Token: <span class="string">${t.token}</span> Row: ${t.row} Column: ${t.column}</li>`)
    .join('')}
  ${errorList
    .map(
      ({ error, char: { row, column } }) =>
        `<li class="error">Error: <span>${error.message}</span> Row: ${row} Column: ${column}</li>`,
    )
    .join('')}
  </ul>`
}

parse()
