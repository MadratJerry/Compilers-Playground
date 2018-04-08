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
})()`,
  'javascript',
)

const output = monaco.editor.createModel('')

monaco.editor.create(document.getElementById('editor'), {
  model: source,
})

monaco.editor.create(document.getElementById('result'), {
  model: output,
})

source.onDidChangeContent(function() {
  parse()
})

function parse() {
  output.setValue(new Lexer(source.getValue()).output())
}

parse()
