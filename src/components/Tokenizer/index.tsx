import React, { useRef, useEffect, useState, useCallback } from 'react'
import MonacoEditor, { ChangeHandler } from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import { makeStyles, createStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
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
    },
  }),
)

const posStack = (value: string) => {
  const stack: Array<number> = [0]
  for (let i = 0; i < value.length; i++) if (value.charAt(i) === '\n') stack.push(i + 1)
  stack.push(value.length)
  return stack
}

const pos = (offset: number, stack: Array<number>) => {
  for (let i = 0; i < stack.length - 1; i++) {
    if (offset >= stack[i] && offset <= stack[i + 1]) {
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
  const [sample, setSample] = useState(`"it's a string"\n/*it's a \ncomment*/\nbool a `)
  const [dispose, setDispose] = useState<monaco.IDisposable | null>(null)
  const languageEditor = useRef<monaco.editor.ICodeEditor>({} as monaco.editor.ICodeEditor)
  const sampleEditor = useRef<monaco.editor.ICodeEditor>({} as monaco.editor.ICodeEditor)

  const handleResize = () => sampleEditor.current!.layout()

  useEffect(() => {
    if (dispose) dispose.dispose()

    let rangeTokens: RangeToken[] = []
    try {
      const config = eval(`(function(){ ${language}; })()`)
      const tokenizer = new Monarch(config)
      rangeTokens = tokenizer.tokenize(sample) as RangeToken[]
      const stack = posStack(sample)
      for (const token of rangeTokens) {
        const [startLineNumber, startColumn] = pos(token.offset, stack)
        const [endLineNumber, endColumn] = pos(token.offset + token.token.length - 1, stack)
        token.range = new monaco.Range(startLineNumber + 1, startColumn + 1, endLineNumber + 1, endColumn + 2)
        sampleEditor.current.deltaDecorations(
          [],
          [{ range: token.range, options: { inlineClassName: 'tokenDecoration' } }],
        )
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
          : { range: new monaco.Range(1, 1, 1, 1), contents: [] }
      },
    })
    setDispose(d)
    return () => d.dispose()
  }, [language, sample])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Tokenizer
      </Typography>
      <Paper className={classes.container}>
        <MonacoEditor
          width="50%"
          height="500"
          language="javascript"
          options={{
            minimap: { enabled: false },
          }}
          onChange={useCallback(v => setLanguage(v), [])}
          editorDidMount={useCallback(e => (languageEditor.current = e), [])}
          value={language}
        />
        <MonacoEditor
          width="50%"
          height="500"
          language="sampleLanguage"
          options={{
            minimap: { enabled: false },
          }}
          onChange={useCallback(v => setSample(v), [])}
          editorDidMount={useCallback(e => (sampleEditor.current = e), [])}
          value={sample}
        />
      </Paper>
    </>
  )
}

export default Tokenizer
