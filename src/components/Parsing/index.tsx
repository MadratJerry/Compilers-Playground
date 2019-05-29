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
import { Grammar } from '@/lib/grammar'
import { production } from './ProductionLink'
import NonTerminalsTable, { set } from './NonTerminalsTable'

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
  const [grammar, setGrammar] = useState<Grammar>()
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
          {grammar ? (
            <ul>
              {grammar.checks().unreachable.size ? (
                <li>
                  The grammar has unreachable nonterminals:
                  <i>
                    <strong>{set(grammar.checks().unreachable)}</strong>
                  </i>
                  .
                </li>
              ) : (
                <li>All nonterminals are reachable.</li>
              )}
              {grammar.checks().unrealizable.size ? (
                <li>
                  The grammar has unrealizable nonterminals:
                  <i>
                    <strong> {set(grammar.checks().unrealizable)} </strong>
                  </i>
                  .
                </li>
              ) : (
                <li>All nonterminals are realizable.</li>
              )}
              {grammar.checks().cycle.length ? (
                <li>
                  The grammar is cyclic:
                  <i>
                    <strong> {grammar.checks().cycle.join(' -> ')} </strong>
                  </i>
                  is a cycle.
                </li>
              ) : (
                <li>The grammar contains no cycles.</li>
              )}
              {grammar.checks().nullAmbiguity.length ? (
                <li>
                  contains a null ambiguity:
                  <i>
                    <strong> {production(grammar.checks().nullAmbiguity[0])} </strong>
                  </i>
                  and
                  <i>
                    <strong> {production(grammar.checks().nullAmbiguity[1])} </strong>
                  </i>
                  are ambiguously nullable.
                </li>
              ) : (
                <li>The grammar is null unambiguous. </li>
              )}
            </ul>
          ) : null}

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
