import Tokenizer from '@/lib/tokenizer'
import { RuleMap, Token } from '@/lib/types'

class GrammarParser {
  text: string
  index: number = 0
  ruleMap: RuleMap = new Map()
  tokenizer: Tokenizer = new Tokenizer({
    tokenizer: {
      root: [
        [/".*"/, 'STRING'],
        [/[a-z_\$'][\w\$']*/, 'TERMINAL'],
        [/[A-Z_\$][\w\$]*/, 'NONTERMINAL'],
        [/[:|;]/, 'OPERATOR'],
      ],
    },
  })

  constructor(text: string) {
    this.text = text
    this.tokenizer.parse(text)
    this.rules()
  }

  rule() {
    let left = ''
    if (this.lookahead().type === 'TERMINAL') {
      left = this.lookahead().value
      if (this.next().value === ':') {
        this.next()
        const expr = this.expr()
        if (expr) {
          if (this.lookahead().value === ';') {
            this.ruleMap.set(left, expr)
            return true
          }
        }
      }
    }
    return false
  }

  rules(): boolean {
    if (this.rule()) {
      this.next()
      return this.rules()
    } else return false
  }

  expr(): Array<Array<string>> {
    const expr = []
    let term = this.term()
    while (term && this.lookahead().value === '|') {
      expr.push(term)
      this.next()
      term = this.term()
    }
    if (term) expr.push(term)
    return expr
  }

  term(): Array<string> {
    const term = []
    while (
      this.lookahead().type === 'TERMINAL' ||
      this.lookahead().type === 'NONTERMINAL' ||
      this.lookahead().type === 'STRING'
    ) {
      term.push(
        this.lookahead().type === 'STRING'
          ? JSON.parse(`{"value":${this.lookahead().value}}`).value
          : { type: this.lookahead().type, value: this.lookahead().value },
      )
      this.next()
    }
    if (this.lookahead().type === 'OPERATOR') return term
    else return null
  }

  lookahead(): Token | any {
    return this.tokenizer.tokens[this.index] || {}
  }

  next(): Token {
    return this.tokenizer.tokens[++this.index]
  }
}

export default GrammarParser
