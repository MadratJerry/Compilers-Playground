import ParseDecorator from './parseDecorator'

const Parse = ParseDecorator(
  (propertyName: string, self: Regex) => console.log(`> ${propertyName} ${self.lookahead()}`),
  (propertyName: string, self: Regex) => console.log(`< ${propertyName} ${self.lookahead()}`),
)

export default class Regex {
  regex: string
  index: number = -1

  constructor(regex: string) {
    this.regex = regex
    console.log(this.parse())
    if (this.hasNext()) throw Error(`Abort unexpected at offset: ${this.index}`)
  }

  parse() {
    return this.expression()
  }

  @Parse
  expression(): any {
    let fa = this.term()
    if (this.lookahead() === '|') {
      this.next()
      fa = fa + this.expression() + '|'
    }
    return fa
  }

  @Parse
  term() {
    let fa = this.factor()
    while (this.lookahead() !== '|' && this.lookahead() != ')' && this.hasNext()) {
      fa = fa + this.factor()
    }
    return fa
  }

  @Parse
  factor() {
    let fa = this.item()
    while (this.lookahead() === '*') {
      this.next()
      fa = `(${fa})`
    }
    return fa
  }

  @Parse
  item() {
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
  symbol() {
    const fa = this.lookahead()
    this.next()
    return fa
  }

  lookahead() {
    return this.regex.charAt(this.index + 1)
  }

  next() {
    return this.hasNext() ? this.regex.charAt(this.index++) : ''
  }

  hasNext() {
    return this.index !== this.regex.length
  }
}
