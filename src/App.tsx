import FA from '@/lib/fa'
import Regex from '@/lib/regex'
import * as React from 'react'
const Viz = require('viz.js')

export default class App extends React.Component {
  nfa: any
  dfa: any
  mfa: any

  constructor(props: any) {
    super(props)
    this.nfa = React.createRef<HTMLElement>()
    this.dfa = React.createRef<HTMLElement>()
    this.mfa = React.createRef<HTMLElement>()
  }

  handleChange = (e: any) => {
    const r = new Regex(e.target.value)
    this.nfa.current.innerHTML = Viz(FA.graphviz(r.NFA))
    this.dfa.current.innerHTML = Viz(FA.graphviz(r.DFA))
    this.mfa.current.innerHTML = Viz(FA.graphviz(r.MFA))
  }

  render() {
    return (
      <>
        <input onChange={this.handleChange} />
        <div ref={this.nfa} />
        <div ref={this.dfa} />
        <div ref={this.mfa} />
      </>
    )
  }
}
