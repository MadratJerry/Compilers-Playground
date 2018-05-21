import CodeMirror from '@/components/CodeMirror'
import { GrammarParser } from '@/lib/parser'
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import { Editor } from 'codemirror'
import * as React from 'react'

const styles = (theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
})

class TokenizerGround extends React.Component<WithStyles<'root'>> {
  editor: Editor

  // prettier-ignore
  initialCode: string =
`e
    : e "+" t
    | t
    ;

t
    : ZERO
;`

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <CodeMirror
          config={{ lineNumbers: true }}
          onChange={(e: Editor) => {
            new GrammarParser(e.getDoc().getValue())
          }}
          initialValue={this.initialCode}
          returnInstance={(editor: Editor) => (this.editor = editor)}
        />
      </div>
    )
  }
}

export default withStyles(styles)(TokenizerGround)
