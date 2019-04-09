import React, { useRef } from 'react'
import * as monaco from 'monaco-editor'
import { CSSProperties } from '@material-ui/styles/withStyles'

export interface Props {
  options?: monaco.editor.IEditorConstructionOptions
  style?: CSSProperties
  editorRef?: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | undefined>
}

const Editor: React.SFC<Props> = ({ options, editorRef, ...rest }) => {
  const editorEl = useRef<HTMLDivElement>(document.createElement('div'))
  React.useEffect(() => {
    const editor = monaco.editor.create(editorEl.current, options)
    if (editorRef) editorRef.current = editor
  }, [])

  return <div ref={editorEl} {...rest} />
}

export default Editor
