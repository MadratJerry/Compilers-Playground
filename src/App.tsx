import { hot } from 'react-hot-loader'
import React, { ChangeEvent, useState } from 'react'
import Monarch from './lib/tokenizer'
import Token from './lib/tokenizer/token'

// prettier-ignore
const tokenizer = new Monarch({
  expressions: {
    keywords: ['abstract',
      'bool', 'break', 'case', 'catch', 'char', 'class',
      'const', 'continue', 'default', 'do', 'double', 'else',
      'enum', 'false', 'final', 'float', 'for', 'goto',
      'if', 'int', 'long', 'namespace', 'new', 'operator',
      'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
      'template', 'this', 'true', 'typedef', 'unsigned', 'void', 'while'
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<',
      '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
      '^=', '%=', '<<=', '>>=', '>>>='
    ],
  },
  tokenizer: {
    root: [
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': { token: 'keyword.$&' },
          '@default': 'identifier'
        }
      }],
      [/(`)(.*)(`)/, ['string','string', 'string']],
      [/[ \t\r\n]+/, 'whitespace'],
      [/\/\/.*\n/, 'comment'],
      [/\/\*[.\S\W]*\*\//, 'comment'],
    ],
  },
})
const App = () => {
  const defaultText = '`number ${n}`/*int this \n/*is*/ a comment\n*/ double pi = 3.1415;'
  const [toekns, setTokens] = useState<Token[]>(tokenizer.tokenize(defaultText))

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
