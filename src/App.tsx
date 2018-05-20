import CodeMirror from '@/components/CodeMirror'
import Tokenizer, { Token } from '@/tokenizer'
import * as React from 'react'

export default class App extends React.Component {
  state: { tokens: Array<Token> } = {
    tokens: [],
  }

  tokenizer: Tokenizer = new Tokenizer({
    tokenizer: {
      root: [[/[a-zA-Z_\$][\w\$]*/, 'IDENTIFIER'], [/[{}()\[\]]/, 'BRACKETS'], [/[;,.]/, 'DELIMITER']],
    },
  })

  componentDidMount() {
    this.tokenizer.parse('function () { let a = 1; }')
    console.log(this.tokenizer.tokens)
  }

  render() {
    const { tokens } = this.state
    return (
      <>
        <CodeMirror config={{ lineNumbers: true }} onChange={(e: any) => {}} />
      </>
    )
  }
}
