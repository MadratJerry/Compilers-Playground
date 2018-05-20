import CodeMirror from '@/components/CodeMirror'
import Tokenizer, { Token } from '@/tokenizer'
import * as React from 'react'

export default class App extends React.Component {
  state: { tokens: Array<Token> } = {
    tokens: [],
  }

  tokenizer: Tokenizer = new Tokenizer({
    // prettier-ignore
    keywords: [
      'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger',
      'default', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends', 'false', 'final',
      'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in',
      'instanceof', 'int', 'interface', 'let','long', 'native', 'new', 'null', 'package', 'private',
      'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this',
      'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
      'with'
    ],
    // prettier-ignore
    builtins: [
      'define','require','window','document','undefined'
    ],
    // prettier-ignore
    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<',
      '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
      '^=', '%=', '<<=', '>>=', '>>>='
    ],
    symbols: /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
    exponent: /[eE][\-+]?[0-9]+/,
    tokenizer: {
      root: [
        // strings
        [/".*"/, 'STRING'],
        [/'.*'/, 'STRING'],
        [/`[.\S\W]*`/, 'STRING'],
        // identifiers
        [/[a-zA-Z_\$][\w\$]*/, { cases: { '@keywords': 'KEYWORD', '@default': 'IDENTIFIER' } }],
        [/[{}()\[\]]/, 'BRACKET'],
        [/[;,.]/, 'DELIMITER'],
        [/@symbols/, { cases: { '@operators': 'OPERATOR', '@default': '' } }],
        // numbers
        [/\d+\.\d*(?:@exponent)?/, 'NUMBER.FLOAT'],
        [/\.\d+(?:@exponent)?/, 'NUMBER.FLOAT'],
        [/\d+@exponent/, 'NUMBER.FLOAT'],
        [/0[xX][\da-fA-F]+/, 'NUMBER.HEX'],
        [/0[0-7]+/, 'NUMBER.OCTAL'],
        [/\d+/, 'NUMBER'],
        // comment
        [/\/\/.*\n/, 'COMMENT'],
        [/\/\*[.\S\W]*\*\//, 'COMMENT'],
      ],
    },
  })

  // prettier-ignore
  initialCode =
`let a = 1.1e10;
let s1 = "string\\""
var s2 = 'wow'
const s3 = \`multiple
line\`
if (a >= 1) console.log(s3)
// comment
/* comment
    comment **/
`

  render() {
    const { tokens } = this.state
    return (
      <>
        <CodeMirror
          config={{ lineNumbers: true }}
          onChange={(e: any) => {
            this.tokenizer.parse(e.getDoc().getValue())
            this.setState({ tokens: this.tokenizer.tokens })
          }}
          initialValue={this.initialCode}
        />
        <ul>
          {tokens.map((t, i) => (
            <li key={i}>
              {t.value} Start: {t.loc.start.line + 1},{t.loc.start.column + 1} End:{t.loc.end.line + 1},{t.loc.end
                .column + 1}{' '}
              Type: {t.type}
            </li>
          ))}
        </ul>
      </>
    )
  }
}
