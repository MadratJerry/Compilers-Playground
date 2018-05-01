import * as React from 'react'
import CodeMirror from '@/components/CodeMirror'
import Regex from '@/lib/regex'
import NFA from '@/lib/nfa'

export default class App extends React.Component {
  componentDidMount() {
    const r = new Regex('(a|b)*abb')
  }
  render() {
    return (
      <>
        <CodeMirror />
      </>
    )
  }
}
