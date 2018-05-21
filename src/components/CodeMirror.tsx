import * as codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import * as React from 'react'

interface P {
  height?: string
  config?: codemirror.EditorConfiguration
  onChange?: any
  initialValue?: string
  returnInstance?: (editor: codemirror.Editor) => any
}
export default class CodeMirror extends React.Component<P> {
  editor: any

  constructor(props: P) {
    super(props)
    this.editor = React.createRef<HTMLElement>()
  }

  componentDidMount() {
    const { height = '100%', config = {}, onChange = () => {}, initialValue = '' } = this.props
    this.editor.current.style.height = height
    this.editor.current.style.overflow = 'scroll'
    const editor = codemirror(e => this.editor.current.appendChild(e), config)
    editor.on('change', onChange)
    editor.getDoc().setValue(initialValue)

    this.props.returnInstance(editor)
  }

  render() {
    return <div ref={this.editor} />
  }
}
