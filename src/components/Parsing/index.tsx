import React, { useEffect, useState } from 'react'
import MonacoEditor, { EditorDidMount, ChangeHandler } from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import { parse } from '@/lib/grammar/grammarParser'
import { LL1Grammar, CommonPrefixError, LeftRecursionError, DanglingElseError, Grammar } from '@/lib/grammar'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
  },
}))

const steps = ['Valid grammar', 'No left recursion', 'No common prefix', 'No dangling else']

const series = (start: number, end: number): Array<number> => {
  const s = []
  for (; start < end; start++) s.push(start)
  return s
}

const Parsing = () => {
  const classes = useStyles()
  const [step, setStep] = useState(-1)
  const [error, setError] = useState('')
  const [grammar, setGrammar] = useState<LL1Grammar>()
  let editor: monaco.editor.IEditor | null = null

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
    return window.addEventListener('resize', handleResize)
  }, [])

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        LL(1) Parsing
      </Typography>

      <Typography id="grammar" variant="h3" gutterBottom>
        Grammar
      </Typography>
      <Card>
        <CardContent className={classes.container}>
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
        </CardContent>
      </Card>

      <Typography id="nonterminals" variant="h3" gutterBottom>
        Nonterminals
      </Typography>
      <Card>
        <CardContent>
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
                      Productions:{' '}
                      {series(...grammar.getProductionsIndex(k)!).map(i => (
                        <a href={`#production_${i}`} key={i}>
                          {i}
                        </a>
                      ))}
                    </Typography>
                  </div>
                </ListItem>
              ))}
            </List>
          ) : null}
        </CardContent>
      </Card>

      <Typography id="productions" variant="h3" gutterBottom>
        Productions
      </Typography>
      <Card>
        <CardContent>
          {grammar ? (
            <List component="ul">
              {grammar.getProductions().map((p, i) => (
                <ListItem key={i} id={`production_${i}`}>
                  <Typography variant="h5" gutterBottom>
                    {i}. {p[0]} -> {p[1].join(' ')}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default Parsing
