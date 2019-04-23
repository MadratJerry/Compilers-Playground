import React, { useEffect, useState } from 'react'
import MonacoEditor, { EditorDidMount, ChangeHandler } from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import Typography from '@material-ui/core/Typography'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import { parse } from '@/lib/grammar/grammarParser'
import {
  LL1Grammar,
  CommonPrefixError,
  LeftRecursionError,
  DanglingElseError,
  Production,
  epsilon,
} from '@/lib/grammar'
import { makeStyles } from '@material-ui/styles'
import { LL1Parser } from '@/lib/parser'

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
  },
  productionIndex: {
    margin: '0 4px',
  },
  tableContainer: {
    overflow: 'scroll',
  },
}))

const steps = ['Valid grammar', 'No left recursion', 'No common prefix', 'No dangling else']

const series = (start: number, end: number): Array<number> => {
  const s = []
  for (; start < end; start++) s.push(start)
  return s
}

const production = (p: Production | undefined): string =>
  p ? `${p[0]} -> ${p[1].length ? p[1].join(' ') : epsilon}` : ``

const ProductinoLink: React.SFC<{ index: number; className: string }> = ({ index, ...rest }) => (
  <a href={`#production_${index}`} {...rest}>
    {index}
  </a>
)

const Parsing = () => {
  const classes = useStyles()
  const [step, setStep] = useState(-1)
  const [error, setError] = useState('')
  const [grammar, setGrammar] = useState<LL1Grammar>()
  let editor: monaco.editor.IEditor | null = null,
    parser: LL1Parser | null = null

  const handleEditorDidMount: EditorDidMount = e => (editor = e)

  const handleResize = () => editor!.layout()

  const handleModelChange: ChangeHandler = value => {
    if (value === '') {
      setStep(-1)
      return
    }
    try {
      const productions = parse(value)
      const grammar = new LL1Grammar(productions)
      setStep(4)
      setError('')
      setGrammar(grammar)
    } catch (e) {
      if (e instanceof LeftRecursionError) setStep(1)
      else if (e instanceof CommonPrefixError) setStep(2)
      else if (e instanceof DanglingElseError) setStep(3)
      else setStep(0)
      setError(e.message)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (grammar) parser = new LL1Parser(grammar)

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        LL(1) Parsing
      </Typography>

      <Paper className={classes.container}>
        <MonacoEditor
          width="50%"
          height="300"
          language="plain"
          options={{
            lineNumbers: 'off',
            minimap: { enabled: false },
          }}
          onChange={handleModelChange}
          editorDidMount={handleEditorDidMount}
        />
        <Stepper activeStep={step} orientation="vertical">
          {steps.map((t, i) => (
            <Step key={i}>
              <StepLabel
                error={step === i}
                optional={
                  step === i ? (
                    <Typography variant="caption" color="error">
                      {error}
                    </Typography>
                  ) : null
                }
              >
                {t}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Typography id="NonTerminals" variant="h3" gutterBottom>
        Nonterminals
      </Typography>
      <Paper>
        {grammar ? (
          <List component="ul">
            {[...grammar.nonTerminals.values()].sort().map(k => (
              <ListItem key={k}>
                <div>
                  <Typography variant="h5" gutterBottom>
                    {k}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    First:
                    {[
                      ...grammar
                        .firsts()
                        .get(k)!
                        .values(),
                    ].join(' , ')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Follow:
                    {[
                      ...grammar
                        .follows()
                        .get(k)!
                        .values(),
                    ].join(' , ')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Productions:
                    {series(...grammar.getProductionsIndex(k)!).map(i => (
                      <ProductinoLink key={i} index={i} className={classes.productionIndex} />
                    ))}
                  </Typography>
                </div>
              </ListItem>
            ))}
          </List>
        ) : null}
      </Paper>

      <Typography id="Productions" variant="h3" gutterBottom>
        Productions
      </Typography>
      <Paper>
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
      </Paper>

      <Typography id="PredictiveTable" variant="h3" gutterBottom>
        Predictive Table
      </Typography>
      <Paper className={classes.tableContainer}>
        {grammar ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                {[...grammar.terminals.values()].map(t => (
                  <TableCell key={t} align="left">
                    {t}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...grammar.nonTerminals.values()].map(n => (
                <TableRow key={n}>
                  <TableCell component="th" scope="row">
                    {n}
                  </TableCell>
                  {[...grammar.terminals.values()].map(t => (
                    <TableCell align="left" key={t}>
                      <Tooltip
                        title={production(
                          grammar.getProductions()[
                            parser!
                              .getPredictiveTable()
                              .get(n)!
                              .get(t)!
                          ],
                        )}
                        placement="top-start"
                      >
                        <ProductinoLink
                          index={
                            parser!
                              .getPredictiveTable()
                              .get(n)!
                              .get(t)!
                          }
                          className={classes.productionIndex}
                        />
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </Paper>
    </div>
  )
}

export default Parsing
