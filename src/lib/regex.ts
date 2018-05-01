import ParseDecorator from './parseDecorator'
import NFA from './nfa'

const Parse = ParseDecorator(
  (propertyName: string, self: Regex) => console.log(`> ${propertyName} ${self.lookahead()}`),
  (propertyName: string, self: Regex) => console.log(`< ${propertyName} ${self.lookahead()}`),
)

export default class Regex {
  regex: string
  index: number = -1
  id: number

  constructor(regex: string) {
    this.regex = regex
    console.log(this.parse().showGraphviz())
    if (this.hasNext()) throw Error(`Abort unexpected at offset: ${this.index}`)
  }

  parse(): NFA {
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
  item(): NFA {
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
  symbol(): NFA {
    const fa = this.lookahead() ? new NFA(this.lookahead()) : null
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
