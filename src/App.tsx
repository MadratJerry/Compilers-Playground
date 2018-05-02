import * as React from 'react'
import CodeMirror from '@/components/CodeMirror'
import Regex from '@/lib/regex'
import FA from '@/lib/fa'

export default class App extends React.Component {
  componentDidMount() {
    const r = new Regex('a|b|c')
  }

  render() {
    return (
      <>
        <CodeMirror />
      </>
    )
  }
}
