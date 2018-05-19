import CodeMirror from '@/components/CodeMirror'
import Tokenizer, { Token } from '@/tokenizer'
import * as React from 'react'

export default class App extends React.Component {
  state: { tokens: Array<Token> } = {
    tokens: [],
  }

  tokenizer = new Tokenizer({
    tokenizer: [
      { regex: /[;,.]/, action: 'delimiter' },
      { regex: /([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, group: ['identifier', 'white', 'delimiter'] },
      { regex: /[{}()\[\]]/, action: 'bracket' },
    ],
  })

  componentDidMount() {
    this.tokenizer.parse('let a')
    console.log(this.tokenizer.tokens)
    this.setState({ tokens: this.tokenizer.tokens })
  }
  render() {
    const { tokens } = this.state
    return (
      <>
        <CodeMirror
          config={{ lineNumbers: true }}
          onChange={(e: any) => {
            this.tokenizer.parse(e.getDoc().getValue())
            this.setState({ tokens: this.tokenizer.tokens })
          }}
        />
        <ul>
          {tokens.map((t, i) => (
            <li key={i}>
              {t.value} Start: {t.loc.start.line + 1},{t.loc.start.column + 1} End:{t.loc.end.line + 1},{t.loc.end
                .column + 1}{' '}
              Type: {t.type}
            </li>
          ))}
        </ul>
      </>
    )
  }
}
