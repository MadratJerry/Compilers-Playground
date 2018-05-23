import Tokenizer from '@/lib/tokenizer'
import { RuleMap, SymbolTable, Token, epsilon } from '@/lib/types'

const accept: string = '$accept'
const end: string = '$end'

class GrammarParser {
  private text: string
  private index: number = 0
  private tokenizer: Tokenizer = new Tokenizer({
    tokenizer: {
      root: [
        [/".*?"/, 'STRING'],
        [/\$accept/, 'NONTERMINAL'],
        [/[a-z_\$'][\w\$']*/, 'NONTERMINAL'],
        [/[A-Z_\$][\w\$]*/, 'TERMINAL'],
        [/[:|;]/, 'OPERATOR'],
        [/\{[.\S\W]*?\}/, 'SDD'],
      ],
    },
  })
  ruleMap: RuleMap = new Map()
  symbolTable: SymbolTable = new Map()
  leftSet: Set<string> = new Set([accept])

  constructor(text: string) {
    this.text = text
    this.tokenizer.parse(text)
    this.ruleMap.set(accept, [['']])
    this.symbolTable.set(accept, 'NONTERMINAL')
    this.symbolTable.set(end, 'TERMINAL')
    this.rules()
    // Check whether defined
    const errors: Array<string> = []
    this.symbolTable.forEach((v, k) => {
      if (v === 'NONTERMINAL' && !this.leftSet.has(k)) errors.push(`'${k}' is not defined`)
    })
    if (errors.length) throw errors
  }

  addToST(t: Token): string {
    const value =
      this.lookahead().type === 'STRING'
        ? JSON.parse(`{"value":${this.lookahead().value}}`).value
        : this.lookahead().value
    this.symbolTable.set(value, t.type)
    return value
  }

  rule() {
    let left = ''
    if (this.lookahead().type === 'NONTERMINAL') {
      this.addToST(this.lookahead())
      left = this.lookahead().value
      if (this.next().value === ':') {
        this.next()
        const expr = this.expr()
        if (expr) {
          if (this.lookahead().value === ';') {
            this.ruleMap.set(left, expr)
            this.leftSet.add(left)
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

  term(): Array<string> & { sdd?: string } {
    const term = [] as Array<string> & { sdd?: string }
    while (
      this.lookahead().type === 'TERMINAL' ||
      this.lookahead().type === 'NONTERMINAL' ||
      this.lookahead().type === 'STRING'
    ) {
      term.push(this.addToST(this.lookahead()))
      this.next()
    }
    if (this.lookahead().type === 'SDD') {
      term.sdd = this.lookahead().value
      this.next()
    }
    if (this.lookahead().type === 'OPERATOR') {
      if (term.length === 0) term[0] = epsilon
      return term
    } else return null
  }

  lookahead(): Token | any {
    return this.tokenizer.tokens[this.index] || {}
  }

  next(): Token {
    return this.tokenizer.tokens[++this.index]
  }
}

export default GrammarParser

export { accept, end }
