import React, { useCallback, useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import { makeStyles, createStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import { parse } from '@/lib/grammar/grammarParser'
import { Grammar, production } from '@/lib/grammar'
import NonTerminalsTable from './NonTerminalsTable'
import ParsingTable from './ParsingTable'
import Sanity from './Sanity'
import ProductionList from './ProductionList'

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      height: 600,
    },
    editorContainer: {
      width: '30%',
    },
    editorError: {
      outline: '1px solid #f44336',
    },
    analysis: {
      width: '70%',
      overflow: 'scroll',
      padding: 4,
    },
    productionIndex: {
      margin: '0 4px',
    },
    tableContainer: {
      overflow: 'scroll',
    },
  }),
)

const Parsing = () => {
  const classes = useStyles()
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [grammar, setGrammar] = useState<Grammar>(new Grammar([]))
  const editor = useRef<monaco.editor.ICodeEditor>({} as monaco.editor.ICodeEditor)

  const handleEditorDidMount: EditorDidMount = e => (editor.current = e)

  useEffect(() => {
    try {
      const productions = parse(value)
      const grammar = new Grammar(productions)
      setError(null)
      setGrammar(grammar)
    } catch (e) {
      setError(e.message)
    }
  }, [value])

  useEffect(() => {
    const handleResize = () => editor.current.layout()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <Paper className={classes.container}>
        <div className={classNames(classes.editorContainer, { [classes.editorError]: error !== null })}>
          <MonacoEditor
            language="plain"
            options={{
              lineNumbers: 'off',
              minimap: { enabled: false },
            }}
            onChange={useCallback(v => setValue(v), [])}
            editorDidMount={handleEditorDidMount}
            value={value}
          />
        </div>
        <div className={classes.analysis}>
          <Typography id="NonTerminals" variant="h2" gutterBottom>
            Analysis
          </Typography>

          <Typography id="NonTerminals" variant="h3" gutterBottom>
            Sanity Checks
          </Typography>
          <Sanity checks={grammar.checks()} />

          <Typography id="NonTerminals" variant="h3" gutterBottom>
            Nonterminals
          </Typography>
          <NonTerminalsTable grammar={grammar} />

          <Typography id="Productions" variant="h3" gutterBottom>
            Productions
          </Typography>
          <ProductionList productions={grammar.getProductions()} />

          <Typography id="Productions" variant="h3" gutterBottom>
            Parsing Algorithms
          </Typography>
          <ParsingTable grammar={grammar} />
        </div>
      </Paper>
    </>
  )
}

export default Parsing
