import React, { useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import Monarch from '@/lib/tokenizer'
import Token from '@/lib/tokenizer/token'
import simpleC from '@/lib/languages/simpleC'
import NavagationButton from '@/components/NavagationButton'

const tokenizer = new Monarch(simpleC)

const Home = () => {
  const defaultText = '`number ${n}`/*int this \n/*is*/ a comment\n*/ double pi = 3.1415;'
  const [toekns, setTokens] = useState<Token[]>(tokenizer.tokenize(defaultText))

  const editorDidMount = (editor: any) => {
    const model = editor.getModel()
    model.onDidChangeContent(() => {
      const tokenList = tokenizer.tokenize(model.getValue())
      setTokens(tokenList)
    })
  }

  return (
    <div>
      <NavagationButton />
      <h1>Content</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <MonacoEditor
          width="50%"
          height="300"
          language="plain"
          defaultValue={defaultText}
          options={{
            lineNumbers: 'off',
            minimap: { enabled: false },
          }}
          editorDidMount={editorDidMount}
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

export default Home
