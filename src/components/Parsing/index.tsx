import React, { useCallback, useEffect, useState, useRef } from 'react'
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import { makeStyles, createStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import { parse } from '@/lib/grammar/grammarParser'
import { Grammar } from '@/lib/grammar'
import { production } from './ProductionLink'
import NonTerminalsTable from './NonTerminalsTable'

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      height: 600,
    },
    analysis: {
      width: '70%',
      overflow: 'scroll',
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
  const [error, setError] = useState('')
  const [grammar, setGrammar] = useState<Grammar>()
  const editor = useRef<monaco.editor.ICodeEditor>({} as monaco.editor.ICodeEditor)

  const handleEditorDidMount: EditorDidMount = e => (editor.current = e)

  useEffect(() => {
    try {
      const productions = parse(value)
      const grammar = new Grammar(productions)
      setError('')
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
        <MonacoEditor
          width="30%"
          height="100%"
          language="plain"
          options={{
            lineNumbers: 'off',
            minimap: { enabled: false },
          }}
          onChange={useCallback(v => setValue(v), [])}
          editorDidMount={handleEditorDidMount}
          value={value}
        />
        <div className={classes.analysis}>
          <Typography id="NonTerminals" variant="h2" gutterBottom>
            Analysis
          </Typography>
          <Typography id="NonTerminals" variant="h3" gutterBottom>
            Sanity Checks
          </Typography>

          <Typography id="NonTerminals" variant="h3" gutterBottom>
            Nonterminals
          </Typography>
          <div>{grammar ? <NonTerminalsTable grammar={grammar} /> : null}</div>

          <Typography id="Productions" variant="h3" gutterBottom>
            Productions
          </Typography>
          <div>
            {grammar ? (
              <List component="ul">
                {grammar.getProductions().map((p, i) => (
                  <ListItem key={i} id={`production_${i}`}>
                    <Typography variant="h5" gutterBottom>
                      {i}. {production(p)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : null}
          </div>
        </div>
      </Paper>
    </>
  )
}

export default Parsing
