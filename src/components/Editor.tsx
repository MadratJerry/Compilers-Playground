import React, { useRef } from 'react'
import * as monaco from 'monaco-editor'

interface Props {
  value?: string
}

const Editor: React.SFC<Props> = ({ value = '' }) => {
  const editorEl = useRef<HTMLDivElement>(document.createElement('div'))
  React.useEffect(() => {
    monaco.editor.create(editorEl.current, { value })
  }, [])
  return <div ref={editorEl} style={{ height: 500 }} />
}

export default Editor
