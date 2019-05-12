import React, { useRef, useEffect, useState, useCallback } from 'react'
import MonacoEditor from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import { makeStyles, createStyles } from '@material-ui/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { Monarch, Token } from '@/lib/tokenizer'
import './index.css'

interface RangeToken extends Token {
  range: monaco.Range
}

const defaultText = `return  {
  expressions: {
    keywords: ['abstract',
      'bool', 'break', 'case', 'catch', 'char', 'class',
      'const', 'continue', 'default', 'do', 'double', 'else',
      'enum', 'false', 'final', 'float', 'for', 'goto',
      'if', 'int', 'long', 'namespace', 'new', 'operator',
      'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
      'template', 'this', 'true', 'typedef', 'unsigned', 'void', 'while'
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<',
      '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
      '^=', '%=', '<<=', '>>=', '>>>='
    ],
  },
  tokenizer: {
    root: [
      [/[a-zA-Z_]\\w*/, {
        cases: {
          '@keywords': { token: 'keyword.$&' },
          '@default': 'identifier'
        }
      }],
      [/(")(.*)(")/, ['string','string', 'string']],
      [/[ \\t\\r\\n]+/, 'whitespace'],
      [/\\/\\/.*\\n/, 'comment'],
      [/\\/\\*[.\\S\\W]*\\*\\//, 'comment'],
    ],
  },
}
`

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      '& > div:nth-child(1)': {
        width: '60%',
      },
      '& > div:nth-child(2)': {
        width: '40%',
      },
    },
    tokenList: {
      overflow: 'scroll',
      height: 450,
    },
  }),
)

const posStack = (value: string) => {
  const stack: Array<number> = [0]
  for (let i = 0; i < value.length; i++) if (value.charAt(i) === '\n') stack.push(i + 1)
  stack.push(value.length + 1)
  return stack
}

const pos = (offset: number, stack: Array<number>) => {
  for (let i = 0; i < stack.length - 1; i++) {
    if (offset >= stack[i] && offset < stack[i + 1]) {
      return [i, offset - stack[i]]
    }
  }
  return [0, 0]
}

monaco.languages.register({ id: 'sampleLanguage' })

const Tokenizer = () => {
  const classes = useStyles()
  const [tokens, setTokens] = useState<RangeToken[]>([])
  const [language, setLanguage] = useState(defaultText)
  //   const [sample, setSample] = useState(`"it's a string"\n/*it's a \ncomment*/\nbool a `)
  const [sample, setSample] = useState(`a = 1`)
  const [dispose, setDispose] = useState<monaco.IDisposable | null>(null)
  const languageEditor = useRef<monaco.editor.ICodeEditor>({} as monaco.editor.ICodeEditor)
  const sampleEditor = useRef<monaco.editor.ICodeEditor>({} as monaco.editor.ICodeEditor)
  const hoverDecoration = useRef<Array<string>>([])
  const tokenDecoration = useRef<Array<string>>([])

  const handleMouseOver = useCallback(
    range => () => {
      hoverDecoration.current = sampleEditor.current.deltaDecorations(hoverDecoration.current, [
        {
          range: range,
          options: {
            inlineClassName: 'inlineTokenHighlight',
          },
        },
      ])
    },
    [tokens],
  )

  const handleMouseOut = () =>
    (hoverDecoration.current = sampleEditor.current.deltaDecorations(hoverDecoration.current, []))

  useEffect(() => {
    if (dispose) dispose.dispose()

    let rangeTokens: RangeToken[] = []
    try {
      const config = eval(`(function(){ ${language}; })()`)
      const tokenizer = new Monarch(config)
      rangeTokens = tokenizer.tokenize(sample) as RangeToken[]
      const stack = posStack(sample)
      sampleEditor.current.deltaDecorations(tokenDecoration.current, [])
      for (const token of rangeTokens) {
        const [startLineNumber, startColumn] = pos(token.offset, stack)
        const [endLineNumber, endColumn] = pos(token.offset + token.token.length, stack)
        token.range = new monaco.Range(startLineNumber + 1, startColumn + 1, endLineNumber + 1, endColumn + 1)
        const [decoration] = sampleEditor.current.deltaDecorations(
          [],
          [
            {
              range: token.range,
              options: { inlineClassName: 'tokenDecoration' },
            },
          ],
        )
        tokenDecoration.current.push(decoration)
      }

      setTokens(rangeTokens)
    } catch (e) {}

    const d = monaco.languages.registerHoverProvider('sampleLanguage', {
      provideHover: function(_model, position) {
        const token = rangeTokens.filter(({ range }) => range.containsPosition(position))[0]

        return token
          ? {
              range: token.range,
              contents: [
                { value: `**${token.type}**` },
                { value: `offset: ${token.offset} range:${token.range.toString()}` },
              ],
            }
          : { range: new monaco.Range(0, 0, 0, 0), contents: [] }
      },
    })
    setDispose(d)
    return () => d.dispose()
  }, [language, sample])

  useEffect(() => {
    const handleResize = () => {
      languageEditor.current.layout()
      sampleEditor.current.layout()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Definition
      </Typography>
      <Paper>
        <MonacoEditor
          height="450"
          language="javascript"
          onChange={useCallback(v => setLanguage(v), [])}
          editorDidMount={useCallback(e => (languageEditor.current = e), [])}
          value={language}
        />
      </Paper>
      <Typography variant="h2" gutterBottom>
        Result
      </Typography>
      <Paper className={classes.container}>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Language Editor
          </Typography>
          <MonacoEditor
            width="100%"
            height="450"
            language="sampleLanguage"
            options={{
              renderControlCharacters: true,
              minimap: { enabled: false },
            }}
            onChange={useCallback(v => setSample(v), [])}
            editorDidMount={useCallback(e => (sampleEditor.current = e), [])}
            value={sample}
          />
        </div>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Tokens
          </Typography>
          <List component="ul" onMouseOutCapture={handleMouseOut} className={classes.tokenList}>
            {tokens.map(({ offset, type, token, range }) => (
              <ListItem key={offset} button>
                <ListItemText primary={type} onMouseOverCapture={handleMouseOver(range)} />
                {range.toString()}
              </ListItem>
            ))}
          </List>
        </div>
      </Paper>
    </>
  )
}

export default Tokenizer
