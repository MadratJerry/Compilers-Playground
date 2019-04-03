import { hot } from 'react-hot-loader'
import React, { ChangeEvent, useState } from 'react'
import Monarch from './lib/tokenizer'
import Token from './lib/tokenizer/token'

const App = () => {
  const [toekns, setTokens] = useState<Token[]>([])

  const defaultText = '/*int this \n/*is*/ a comment\n*/ int a = 1;'
  // prettier-ignore
  const tokenizer = new Monarch({
    keywords: ['abstract',
      'bool', 'break', 'case', 'catch', 'char', 'class',
      'const', 'continue', 'default', 'do', 'double', 'else',
      'enum', 'false', 'final', 'float', 'for', 'goto',
      'if', 'in', 'int', 'long', 'namespace', 'new', 'operator',
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
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': { token: 'keyword.$0' },
            '@default': 'identifier'
          }
        }],
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
