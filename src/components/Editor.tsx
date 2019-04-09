import React, { useRef } from 'react'
import * as monaco from 'monaco-editor'
import { CSSProperties } from '@material-ui/styles/withStyles'

export interface Props {
  onContentChange?: (e: monaco.editor.IModelContentChangedEvent, model: monaco.editor.ITextModel) => void
  options?: monaco.editor.IEditorConstructionOptions
  style?: CSSProperties
}

const Editor: React.SFC<Props> = ({ options, onContentChange = () => {}, ...rest }) => {
  const editorEl = useRef<HTMLDivElement>(document.createElement('div'))

  React.useEffect(() => {
    const editor = monaco.editor.create(editorEl.current, options)
    const model = editor.getModel()
    if (model) {
      model.onDidChangeContent(e => onContentChange(e, model))
    }
  }, [])

  return <div ref={editorEl} {...rest} />
}

export default Editor
