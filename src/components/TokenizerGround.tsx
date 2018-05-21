import CodeMirror from '@/components/CodeMirror'
import Tokenizer, { Token } from '@/lib/tokenizer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import { Editor, TextMarker } from 'codemirror'
import * as React from 'react'

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'space-between',
  },
  list: {
    overflow: 'scroll',
    width: '50%',
  },
})

class TokenizerGround extends React.Component<WithStyles<'root' | 'list'>> {
  state: { tokens: Array<Token> } = {
    tokens: [],
  }

  editor: Editor

  textMarker: TextMarker

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
        // comment
        [/\/\/.*\n/, 'COMMENT'],
        [/\/\*[.\S\W]*\*\//, 'COMMENT'],
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

  handleEnter = (index: number) => () => {
    const { editor } = this
    const { tokens } = this.state
    const {
      loc: { start, end },
    } = tokens[index]
    this.textMarker = editor
      .getDoc()
      .markText({ line: start.line, ch: start.column }, { line: end.line, ch: end.column }, { className: 'inlineMark' })
  }

  render() {
    const { tokens } = this.state
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <CodeMirror
          config={{ lineNumbers: true }}
          onChange={(e: any) => {
            this.tokenizer.parse(e.getDoc().getValue())
            this.setState({ tokens: this.tokenizer.tokens })
          }}
          initialValue={this.initialCode}
          returnInstance={(editor: Editor) => (this.editor = editor)}
        />
        <List className={classes.list}>
          {tokens.map((t, i) => (
            <ListItem key={i} button dense onMouseOver={this.handleEnter(i)} onMouseOut={() => this.textMarker.clear()}>
              <ListItemText primary={t.value} secondary={t.type} />
              {/* {t.value} Start: {t.loc.start.line + 1},{t.loc.start.column + 1} End:{t.loc.end.line + 1},{t.loc.end
                .column + 1} Type: {t.type} */}
            </ListItem>
          ))}
        </List>
      </div>
    )
  }
}

export default withStyles(styles)(TokenizerGround)
