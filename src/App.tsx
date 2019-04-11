import { hot } from 'react-hot-loader'
import React, { useState } from 'react'
import Editor, { Props as EditorProps } from '@/components/Editor'
import Monarch from '@/lib/tokenizer'
import Token from '@/lib/tokenizer/token'
import simpleC from '@/lib/languages/simpleC'
import NavagationButton from '@/components/NavagationButton'

const tokenizer = new Monarch(simpleC)
const App = () => {
  const defaultText = '`number ${n}`/*int this \n/*is*/ a comment\n*/ double pi = 3.1415;'
  const [toekns, setTokens] = useState<Token[]>(tokenizer.tokenize(defaultText))

  const editorRef = React.useRef<NonNullable<EditorProps['editorRef']>['current']>()

  React.useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current
      const model = editor.getModel()

      if (model) {
        model.onDidChangeContent(() => {
          const tokenList = tokenizer.tokenize(model.getValue())
          setTokens(tokenList)
        })
      }
    }
  }, [])

  return (
    <div>
      <NavagationButton />
      <h1>Content</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Editor
          editorRef={editorRef}
          style={{ width: '50%', height: 300 }}
          options={{
            value: defaultText,
            lineNumbers: 'off',
            minimap: { enabled: false },
          }}
        />
        <ul>
          {toekns.map((token, index) => (
            <li key={index}>{token.toString()}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default (process.env.NODE_ENV === 'development' ? hot(module)(App) : App)
