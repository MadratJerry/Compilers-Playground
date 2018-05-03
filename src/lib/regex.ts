import ParseDecorator from './parseDecorator'
import FA from './fa'

const Parse = ParseDecorator(
  (propertyName: string, self: Regex) => console.log(`> ${propertyName} ${self.lookahead()}`),
  (propertyName: string, self: Regex) => console.log(`< ${propertyName} ${self.lookahead()}`),
  true,
)

export default class Regex {
  regex: string
  index: number = -1
  id: number
  NFA: FA
  DFA: any

  constructor(regex: string) {
    this.regex = regex
    const nfa = this.parse()
    this.NFA = nfa
    this.DFA = this.NFA ? nfa.DFA() : null
    if (this.hasNext()) throw Error(`Abort unexpected at offset: ${this.index}`)
  }

  parse(): FA {
    return this.expression()
  }

  @Parse
  expression(): any {
    let fa = this.term()
    if (this.lookahead() === '|') {
      this.next()
      fa.union(this.expression())
    }
    return fa
  }

  @Parse
  term() {
    let fa = this.factor()
    while (this.lookahead() !== '|' && this.lookahead() != ')' && this.hasNext()) {
      fa.concat(this.factor())
    }
    return fa
  }

  @Parse
  factor() {
    let fa = this.item()
    while (this.lookahead() === '*') {
      this.next()
      fa.closure()
    }
    return fa
  }

  @Parse
  item(): FA {
    if (this.lookahead() === '(') {
      this.next()
      const fa = this.expression()
      if (this.lookahead() !== ')') throw Error(`Missing ')' at offset: ${this.index}`)
      this.next()
      return fa
    } else if (this.hasNext()) {
      return this.symbol()
    } else throw Error(`Unknown letter found at offset: ${this.index}`)
  }

  @Parse
  symbol(): FA {
    const fa = this.lookahead() ? new FA(this.lookahead()) : null
    this.next()
    return fa
  }

  lookahead() {
    return this.regex.charAt(this.index + 1)
  }

  next() {
    return this.hasNext() ? this.regex.charAt(this.index++) : null
  }

  hasNext() {
    return this.index !== this.regex.length
  }
}
