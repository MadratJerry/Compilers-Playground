import Tokenizer from '@/tokenizer'
import * as React from 'react'

export default class App extends React.Component {
  componentDidMount() {
    const tokenizer = new Tokenizer({
      tokenizer: [
        { regex: /[;,.]/, action: 'delimiter' },
        { regex: /([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, group: ['identifier', 'white', 'delimiter'] },
        { regex: /[{}()\[\]]/, action: 'bracket' },
      ],
    })
    tokenizer.parse('abc()\ncde()')
  }
  render() {
    return <>Token</>
  }
}
