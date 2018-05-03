import * as React from 'react'
import CodeMirror from '@/components/CodeMirror'
import Regex from '@/lib/regex'
import FA from '@/lib/fa'
const Viz = require('viz.js')

export default class App extends React.Component {
  nfa: any
  dfa: any

  constructor(props: any) {
    super(props)
    this.nfa = React.createRef<HTMLElement>()
    this.dfa = React.createRef<HTMLElement>()
  }

  render() {
    return (
      <>
        <CodeMirror
          config={{ lineNumbers: true }}
          onChange={(e: any) => {
            const r = new Regex(e.getDoc().getValue())
            this.nfa.current.innerHTML = Viz(FA.graphviz(r.NFA))
            this.dfa.current.innerHTML = Viz(FA.graphviz(r.DFA))
          }}
        />
        <div ref={this.nfa} />
        <div ref={this.dfa} />
      </>
    )
  }
}
