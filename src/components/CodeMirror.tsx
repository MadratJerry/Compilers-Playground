import * as codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import * as React from 'react'

interface P {
  config: codemirror.EditorConfiguration
  onChange: any
  initialValue: string
  returnInstance: (editor: codemirror.Editor) => any
}
export default class CodeMirror extends React.Component<P> {
  editor: any

  constructor(props: P) {
    super(props)
    this.editor = React.createRef<HTMLElement>()
  }

  componentDidMount() {
    const editor = codemirror(e => this.editor.current.appendChild(e), this.props.config)
    editor.on('change', this.props.onChange)
    editor.getDoc().setValue(this.props.initialValue)

    this.props.returnInstance(editor)
  }

  render() {
    return <div ref={this.editor} />
  }
}
