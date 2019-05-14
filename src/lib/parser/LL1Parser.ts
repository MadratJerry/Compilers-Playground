import { LL1Grammar, epsilon, $accept, $end, Symbol, NonTerminal, Terminal, Grammar } from '@/lib/grammar'
import { Token } from '@/lib/tokenizer'
import { ASTNode } from './ASTNode'

type PredictiveTable = Map<Symbol, Map<Symbol, number>>

const stringRegex = /"(.*)"/

export class LL1Parser {
  private readonly _predictiveTable: PredictiveTable = new Map()
  private readonly _grammar: LL1Grammar

  constructor(grammar: LL1Grammar) {
    this._grammar = grammar
    grammar.getProductions().forEach((production, i) => {
      const [symbol, alternative] = production
      const firstSet = grammar.first(alternative)
      const add = (s: Symbol) => (grammar.terminal(s) ? this.addProduction(i, symbol, s) : null)
      firstSet.forEach(add)
      if (firstSet.has(epsilon)) grammar.follow(symbol).forEach(add)
    })
  }

  public getPredictiveTable(): PredictiveTable {
    return this._predictiveTable
  }

  public parse(tokens: Token[]): ASTNode {
    const root = new ASTNode($accept)
    const stack = [root]
    let index = 0

    do {
      const X: Symbol = stack[stack.length - 1].symbol as Symbol,
        token = tokens[index]

      if (this._grammar.terminal(X)) {
        if (X.match(stringRegex) ? token.token === X.slice(1, -1) : token.type === X) {
          stack[stack.length - 1].symbol = token
          stack.pop()
          index++
        } else throw new Error()
      } else if (this.getM(X, token.type) === undefined && this.getM(X, `"${token.token}"`) === undefined) {
        throw new Error('Unexpected grammar')
      } else {
        const productions = this._grammar.getProductions()
        const production =
          this.getM(X, token.type) === undefined
            ? productions[this.getM(X, `"${token.token}"`)!]
            : productions[this.getM(X, token.type)!]
        const [, alternative] = production
        const top = stack.pop()!
        top.children = alternative.map(s => new ASTNode(s, top))
        stack.push(...[...top.children].reverse())
      }
    } while (stack.length)

    return root
  }

  private getM(nonTerminal: Symbol, terminal: Symbol): number | undefined {
    const tMap = this._predictiveTable.get(nonTerminal)
    if (tMap) {
      return tMap.get(terminal)
    } else return undefined
  }

  private addProduction(index: number, nonTerminal: Symbol, terminal: Symbol) {
    let tMap = this._predictiveTable.get(nonTerminal)
    if (!tMap) {
      tMap = new Map()
      this._predictiveTable.set(nonTerminal, tMap)
    }
    if (tMap.has(terminal)) throw new Error(`M[${nonTerminal}, ${terminal}] can only be one item`)
    tMap.set(terminal, index)
  }
}
