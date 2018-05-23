import CodeMirror from '@/components/CodeMirror'
import { GrammarParser, LL } from '@/lib/parser'
import Tokenizer from '@/lib/tokenizer'
import { Firsts, Follows } from '@/lib/types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Step from '@material-ui/core/Step'
import StepContent from '@material-ui/core/StepContent'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import ErrorIcon from '@material-ui/icons/Error'
import { Editor } from 'codemirror'
import * as React from 'react'

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  stepper: {
    width: '50%',
    height: '100%',
    overflow: 'scroll',
  },
})

function getSteps() {
  return ['No left recursive', 'Create an ad group', 'Create an ad']
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`
    case 1:
      return 'An ad group contains one or more ads which target a shared set of keywords.'
    case 2:
      return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`
    default:
      return 'Unknown step'
  }
}

class TokenizerGround extends React.Component<
  WithStyles<'root' | 'stepper'>,
  {
    activeStep: number
    ll: LL
    errors: Array<string>
    result: string
  }
> {
  state = {
    activeStep: 0,
    ll: new LL(new Map(), new Map()),
    result: '',
    errors: [] as Array<string>,
  }
  grammarEditor: Editor
  codeEditor: Editor

  // prettier-ignore
  initialGrammar: string =
`
$accept: e { _ = $[0].val };

e   : t e'
      {
        if ($[1].op === "+")
          $$.val = $[0].val + $[1].val
        else $$.val = $[0].val
      }
    ;

e'  : "+" t e'
      {
        $$.op = "+";
        if ($[2].op === "+")
          $$.val = $[1].val + $[2].val
        else $$.val = $[1].val
      }
    |
    ;

t   : f t'
      {
        if ($[1].op === "*")
          $$.val = $[0].val * $[1].val
        else $$.val = $[0].val
      }
    ;

t'  : "*" f t'
      {
        $$.op = "*"
        if ($[2].op === "*")
          $$.val = $[1].val * $[2].val
        else $$.val = $[1].val
      }
    |
    ;

f   : "(" e ")" { $$.val = $[1].val }
    | DIGIT { $$.val = parseInt($[0].token.value) }
    ;
`
  initialCode = `(1 + 2) * 3`

  tokenizer = new Tokenizer({
    tokenizer: {
      root: [[/\d+/, 'DIGIT'], [/[~!@#%\^&*-+=|\\:`<>.?\/\(\)]+/, 'OP']],
    },
  })

  onEditorChange = (e: Editor) => {
    let gp
    try {
      gp = new GrammarParser(e.getDoc().getValue())
    } catch (e) {
      this.setState({ errors: e })
      return
    }
    const ll = new LL(gp.ruleMap, gp.symbolTable)
    const activeHash = [!ll.isRecursive]
    this.setState({
      activeStep: activeHash.filter(a => a).length,
      ll: ll,
      errors: [],
    })
  }

  render() {
    const { classes } = this.props
    const steps = getSteps()
    const {
      activeStep,
      ll: { firsts, follows, productions, forecastingTable, symbolTable },
      errors,
      result,
    } = this.state
    const terminals = [...symbolTable].filter(e => e[1] === 'TERMINAL' || e[1] === 'STRING')

    return (
      <>
        <div className={classes.root}>
          <div style={{ overflow: 'scroll' }}>
            <CodeMirror
              height="auto"
              config={{ lineNumbers: true }}
              onChange={this.onEditorChange}
              initialValue={this.initialGrammar}
              returnInstance={(editor: Editor) => (this.grammarEditor = editor)}
            />
            <List dense>
              {errors.map((e, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary={e} />
                </ListItem>
              ))}
            </List>
            <CodeMirror
              height="auto"
              config={{ lineNumbers: true }}
              onChange={(e: Editor) =>
                this.setState({ result: this.state.ll.parse(e.getDoc().getValue(), this.tokenizer) })
              }
              initialValue={this.initialCode}
              returnInstance={(editor: Editor) => (this.codeEditor = editor)}
            />
            <div>{result}</div>
          </div>
          <div className={classes.stepper}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => {
                return (
                  <Step key={label}>
                    <StepLabel error={activeStep === index}>{label}</StepLabel>
                    <StepContent>
                      <Typography>{getStepContent(index)}</Typography>
                    </StepContent>
                  </Step>
                )
              })}
            </Stepper>
            <h2>Nonterminals</h2>
            {((firsts: Firsts, follows: Follows) => {
              const array = []
              for (const f of firsts) {
                array.push(
                  <Card key={f[0]} style={{ margin: 10 }}>
                    <CardContent>
                      <h3>{f[0]}</h3>
                      <p>FIRST: {`{${[...f[1]].join(', ')}}`}</p>
                      <p>FOLLOW: {`{${[...follows.get(f[0])].join(', ')}}`}</p>
                    </CardContent>
                  </Card>,
                )
              }
              return array
            })(firsts, follows)}
            <h2>Productions</h2>
            <ul>
              {productions.map((p, i) => (
                <li key={i}>
                  {i}. {p[0]} -> {p[1].join(' ')}
                </li>
              ))}
            </ul>
            <Typography />
          </div>
        </div>
        <Paper style={{ overflow: 'scroll', width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                {terminals.map(e => <TableCell key={e[0]}>{e[0].padEnd(10, '　')}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...forecastingTable.entries()].map(n => {
                return (
                  <TableRow key={n[0]}>
                    <TableCell component="th" scope="row">
                      {n[0]}
                    </TableCell>
                    {terminals.map(t => {
                      const p = n[1].get(t[0])
                      return p.length ? (
                        <TableCell key={t[0] + n[0]} style={{ width: '100%' }}>
                          {p[0]} -> {p[1].join()}
                        </TableCell>
                      ) : (
                        <TableCell key={t[0] + n[0]} />
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
      </>
    )
  }
}

export default withStyles(styles)(TokenizerGround)
