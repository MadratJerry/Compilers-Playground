import FA from '@/lib/fa'
import Regex from '@/lib/regex'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import * as React from 'react'
import Viz from 'viz.js'
import workerURL from 'viz.js/full.render.js'

const styles = (theme: Theme) => ({
  progress: {
    margin: theme.spacing.unit * 2,
  },
})

const viz = new Viz({ workerURL })
class FAGraph extends React.Component<WithStyles<'progress'>> {
  nfa: any
  dfa: any
  mfa: any

  state = {
    loading: false,
  }

  constructor(props: any) {
    super(props)
    this.nfa = React.createRef<HTMLElement>()
    this.dfa = React.createRef<HTMLElement>()
    this.mfa = React.createRef<HTMLElement>()
  }

  handleChange = async (e: any) => {
    const timeOut = setTimeout(() => {
      this.setState({ loading: true })
    }, 16)
    const r = new Regex(e.target.value)
    const [NFA, DFA, MFA] = await Promise.all([
      viz.renderString(FA.graphviz(r.NFA)),
      viz.renderString(FA.graphviz(r.NFA)),
      viz.renderString(FA.graphviz(r.MFA)),
    ])
    this.nfa.current.innerHTML = NFA
    this.dfa.current.innerHTML = DFA
    this.mfa.current.innerHTML = MFA
    clearTimeout(timeOut)
    this.setState({ loading: false })
  }

  render() {
    const { classes } = this.props
    const { loading } = this.state
    return (
      <>
        <TextField
          id="full-width"
          label="Label"
          onChange={this.handleChange}
          InputLabelProps={{
            shrink: true,
          }}
          placeholder="Placeholder"
          fullWidth
          margin="normal"
        />
        {loading ? <CircularProgress className={classes.progress} /> : null}
        <div style={{ display: loading ? 'none' : 'block' }}>
          <div ref={this.nfa} />
          <div ref={this.dfa} />
          <div ref={this.mfa} />
        </div>
      </>
    )
  }
}

export default withStyles(styles)(FAGraph)
