import { hot } from 'react-hot-loader'
import React, { ChangeEvent, useState } from 'react'
import Monarch from './lib/tokenizer'
import Token from './lib/tokenizer/token'
import simpleC from './lib/languages/simpleC'
import MiniDrawer from './components/MiniDrawer'

const tokenizer = new Monarch(simpleC)
const App = () => {
  const defaultText = '`number ${n}`/*int this \n/*is*/ a comment\n*/ double pi = 3.1415;'
  const [toekns, setTokens] = useState<Token[]>(tokenizer.tokenize(defaultText))

  const handleChange = ({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    const tokenList = tokenizer.tokenize(target.value)
    setTokens(tokenList)
  }

  return (
    <div>
      <MiniDrawer>
        <textarea onChange={handleChange} defaultValue={defaultText} />
        <ul>
          {toekns.map((token, index) => (
            <li key={index}>{token.toString()}</li>
          ))}
        </ul>
      </MiniDrawer>
    </div>
  )
}

export default (process.env.NODE_ENV === 'development' ? hot(module)(App) : App)
