import Lexer from './Lexer'
import Parser from './Parser.js'
import CodeMirror from './codemirror'

const html = String.raw

const editor = CodeMirror(document.getElementById('editor'), {
  value: `(function name(a,b,){}
)`,
  lineNumbers: true,
  inputStyle: 'contenteditable',
  mode: 'javascript',
})

editor.on('change', () => main())

function main() {
  const lexer = new Lexer(editor.getDoc().getValue())
  new Parser(lexer)
  render(lexer)
}

let mark
function render(lexer) {
  const result = document.getElementById('result')
  const div = document.createElement('div')
  div.addEventDelegate('mouseover', 'li', e => {
    const lr = parseInt(e.currentTarget.dataset.lr) - 1
    const lc = parseInt(e.currentTarget.dataset.lc) - 1
    const rr = parseInt(e.currentTarget.dataset.rr) - 1
    const rc = parseInt(e.currentTarget.dataset.rc) - 1
    mark = editor.getDoc().markText({ line: lr, ch: lc }, { line: rr, ch: rc }, { className: 'inlineMark' })
  })
  div.addEventDelegate('mouseout', 'li', () => {
    mark.clear()
  })
  const { tokenList, errorList } = lexer
  div.innerHTML = `<ul>
  ${tokenList
    .map(
      t =>
        html`
        <li data-lr=${t.l.row} data-lc=${t.l.column} data-rr=${t.r.row} data-rc=${
          t.r.column
        }>Token: <abbr class="string" title=${t.getType()}>${t.token}</abbr> Row: ${t.l.row} Column: ${
          t.l.column
        }</li>`,
    )
    .join('')}
  ${errorList
    .map(
      ({ error, char: { row, column } }) =>
        html`<li data-lr=${row} data-lc=${column} data-rr=${row} data-rc=${column + 1} class="error">Error: <span>${
          error.message
        }</span> Row: ${row} Column: ${column}</li>`,
    )
    .join('')}
  </ul>`
  result.innerHTML = ''
  result.appendChild(div)
}

main()
