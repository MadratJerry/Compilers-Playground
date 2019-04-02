import { hot } from 'react-hot-loader'
import React, { ChangeEvent, useState } from 'react'
import Monarch from './lib/tokenizer'
import Token from './lib/tokenizer/token'

const App = () => {
  const [toekns, setTokens] = useState<Token[]>([])

  const defaultText = '/*int this \n/*is*/ a comment\n*/ int a = 1;'
  const tokenizer = new Monarch({
    keywords: ['int', 'long'],
    tokenizer: {
      root: [
        [/@keywords/, 'keyword'],
        [/[ \t\r\n]+/, 'whitespace'],
        [/\/\/.*\n/, 'comment'],
        [/\/\*[.\S\W]*\*\//, 'comment'],
      ],
    },
  })

  const handleChange = ({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    const tokenList = tokenizer.tokenize(target.value)
    setTokens(tokenList)
  }

  return (
    <div>
      <textarea onChange={handleChange} defaultValue={defaultText} />
      <ul>
        {toekns.map((token, index) => (
          <li key={index}>{token.toString()}</li>
        ))}
      </ul>
    </div>
  )
}

export default (process.env.NODE_ENV === 'development' ? hot(module)(App) : App)
