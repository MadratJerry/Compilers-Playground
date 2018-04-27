import Token from './token'
import { tokenizer } from '../Token'

class LexicalDefinition {
  tokenizer: Function
  constructor(d: any) {
    this.tokenizer = this.parseAction(d.tokenizer)
  }

  private parseAction(a: any) {
    if (Array.isArray(a)) {
      const regex = new RegExp(a.map(({ regex }) => `(${regex.source})`).join('|'), 'g')
      const captureMap = new Map()
      a.reduce((g, { regex, action, group }) => {
        if (action) captureMap.set(g, this.parseAction(action))
        if (group) group.forEach((gp: any, i: number) => captureMap.set(g + i + 1, this.parseAction(gp)))
        return g + LexicalDefinition.getGroups(regex) + 1
      }, 1)
      return (s: string) => {
        for (let m = regex.exec(s); m != null; m = regex.exec(s)) {
          m.forEach((s: any, index: number) => (captureMap.get(index) ? captureMap.get(index)(s) : 0))
        }
      }
    } else if (typeof a === 'object') {
      const { regex, action, group } = a
      return (s: any): any => {
        const m = regex.exec(s)
        if (action) this.parseAction(action)(m[0])
        if (group) group.forEach((g: any, index: number) => this.parseAction(g)(m[index + 1]))
      }
    } else if (typeof a === 'string') {
      return (s: any) => {
        if (s) console.log(`${s} ${a}`)
      }
    }
  }

  // How many capturing groups in regular expression
  static getGroups(regex: RegExp): number {
    const s = regex.source
    let ignore = false,
      pass = false,
      count = 0

    // Because each regular expression is correct, so just count the left bracket
    for (const i of s) {
      if (ignore) ignore = false
      else if (i === ']') pass = false
      else if (pass) continue
      else if (i === '[') pass = true
      else if (i === '\\') ignore = true
      else if (i === '(') count++
    }

    // Remove the non-capturing group
    return count - s.split('(?:').length + 1
  }
}

const ld = new LexicalDefinition({
  tokenizer: [
    { regex: /[;,.]/, action: 'delimiter' },
    { regex: /([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, group: ['identifier', 'white', 'delimiter'] },
    { regex: /[{}()\[\]]/, action: 'bracket' },
  ],
})

class RETokenizer {
  text: string
  tokens: Array<Token> = []
  constructor(text: string) {
    this.text = text
    ld.tokenizer(text)
  }
}

export default RETokenizer
