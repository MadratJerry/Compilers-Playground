import * as React from 'react'
import * as codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'

export default class CodeMirror extends React.Component {
  editor: any

  constructor(props: any) {
    super(props)
    this.editor = React.createRef<HTMLElement>()
  }

  componentDidMount() {
    const editor = codemirror(e => this.editor.current.appendChild(e), {
      value: `function name(a, b) { };
let a = 1;`,
      lineNumbers: true,
      mode: 'javascript',
    })
  }

  render() {
    return <div ref={this.editor} />
  }
}
