import CodeMirror from '@/components/CodeMirror'
import { GrammarParser, LL } from '@/lib/parser'
import { Firsts } from '@/lib/types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Step from '@material-ui/core/Step'
import StepContent from '@material-ui/core/StepContent'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import Typography from '@material-ui/core/Typography'
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import { Editor } from 'codemirror'
import * as React from 'react'

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  stepper: {
    width: '50%',
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

class TokenizerGround extends React.Component<WithStyles<'root' | 'stepper'>, { activeStep: number; firsts: Firsts }> {
  state = { activeStep: 0, firsts: new Map() }
  editor: Editor

  // prettier-ignore
  initialCode: string =
`e
    : t "+" t
    | t
    ;

t   : ONE
    | ZERO
    ;`

  onEditorChange = (e: Editor) => {
    const gp = new GrammarParser(e.getDoc().getValue())
    const ll = new LL(gp.ruleMap)
    const activeHash = [!ll.isRecursive]
    this.setState({ activeStep: activeHash.filter(a => a).length, firsts: ll.firsts })
  }

  render() {
    const { classes } = this.props
    const steps = getSteps()
    const { activeStep, firsts } = this.state

    return (
      <div className={classes.root}>
        <CodeMirror
          config={{ lineNumbers: true }}
          onChange={this.onEditorChange}
          initialValue={this.initialCode}
          returnInstance={(editor: Editor) => (this.editor = editor)}
        />
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
          {((firsts: Firsts) => {
            const array = []
            for (const f of firsts) {
              const firstList: Array<string> = []
              f[1].forEach(s => firstList.push(typeof s === 'string' ? s : s.value))
              array.push(
                <Card key={f[0]}>
                  <CardContent>
                    <h3>{f[0]}</h3>
                    <p>Firsts: {firstList.join(', ')}</p>
                  </CardContent>
                </Card>,
              )
            }
            return array
          })(firsts)}
          <Typography />
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(TokenizerGround)
