import './eventDelegate'
import * as monaco from 'monaco-editor'
import Lexer from './Lexer'

const html = String.raw

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
  let x = 1 / 2;x/=3;
  const /*inline \\\\/\/** *
  ****comment*/a = 1e2
  //One Line Comment//\\
  let b = 1.234e10
  var f = "foo\\
  bar\\n";const g='a111e\\n\\
  11';;;
  if(a>=b)console.log("wow");
})()`,
  'javascript',
)

const editor = monaco.editor.create(document.getElementById('editor'), {
  model: source,
})

source.onDidChangeContent(function() {
  parse()
})

function parse() {
  render(new Lexer(source.getValue()))
}

let decoration = []
function render(lexer) {
  const result = document.getElementById('result')
  const div = document.createElement('div')
  div.addEventDelegate('mouseover', 'li', e => {
    const lr = parseInt(e.currentTarget.dataset.lr)
    const lc = parseInt(e.currentTarget.dataset.lc)
    const rr = parseInt(e.currentTarget.dataset.rr)
    const rc = parseInt(e.currentTarget.dataset.rc)
    decoration = editor.deltaDecorations(decoration, [
      {
        range: new monaco.Range(lr, lc, rr, rc),
        options: { inlineClassName: 'myInlineDecoration' },
      },
    ])
  })
  const { tokenList, errorList } = lexer
  div.innerHTML = `<ul>
  ${tokenList
    .map(
      t =>
        html`
        <li data-lr=${t.l.row} data-lc=${t.l.column} data-rr=${t.r.row} data-rc=${
          t.r.column
        }>Token: <span class="string">${t.token}</span> Row: ${t.l.row} Column: ${t.l.column}</li>`,
    )
    .join('')}
  ${errorList
    .map(
      ({ error, char: { row, column } }) =>
        html`<li data-lr=${row} data-lc=${column} data-rr=${row} data-rc=${column} class="error">Error: <span>${
          error.message
        }</span> Row: ${row} Column: ${column}</li>`,
    )
    .join('')}
  </ul>`
  result.innerHTML = ''
  result.appendChild(div)
}

parse()
