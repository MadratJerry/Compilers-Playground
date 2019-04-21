import LL1Grammars from '@/lib/grammar/ll1Grammars'
import * as Grammar from '@/lib/grammar/grammarTypes'
import Grammars, { epsilon, $accept, $end } from '@/lib/grammar/grammars'
import { Token } from '@/lib/tokenizer'
import ASTNode from './ASTNode'

type PredictiveTable = Map<Grammar.Symbol, Map<Grammar.Symbol, number>>

export default class LL1Parser {
  private readonly _predictiveTable: PredictiveTable = new Map()
  private readonly _grammars: Grammars

  constructor(grammars: LL1Grammars) {
    this._grammars = grammars
    grammars.getProductions().forEach((production, i) => {
      const [symbol, alternative] = production
      const firstSet = grammars.first(alternative)
      const add = (s: Grammar.Symbol) => (grammars.terminals.has(s) ? this.addProduction(i, symbol, s) : null)
      firstSet.forEach(add)
      if (firstSet.has(epsilon)) grammars.follow(symbol).forEach(add)
    })
  }

  public getPredictiveTable(): PredictiveTable {
    return this._predictiveTable
  }

  public parse(tokens: Token[]): ASTNode {
    const root = new ASTNode($accept)
    const stack = [root]
    let index = 0,
      X = $accept

    while (X !== $end) {
      const token = tokens[index]

      if (this._grammars.terminals.has(X)) {
        if (token.type === X || token.token === X) {
          stack.pop()
          index++
        } else throw new Error()
      } else if (this.getM(X, token.type) === undefined && this.getM(X, token.token) === undefined) {
        throw new Error()
      } else {
        const productions = this._grammars.getProductions()
        const production =
          this.getM(X, token.type) === undefined
            ? productions[this.getM(X, token.token)!]
            : productions[this.getM(X, token.type)!]
        const [, alternative] = production
        const top = stack.pop()!
        top.children = alternative.filter(s => s !== epsilon).map(s => new ASTNode(s, top))
        stack.push(...[...top.children].reverse())
      }

      X = stack[stack.length - 1].symbol
    }

    return root
  }

  private getM(nonTerminal: Grammar.Symbol, terminal: Grammar.Symbol): number | undefined {
    const tMap = this._predictiveTable.get(nonTerminal)
    if (tMap) {
      return tMap.get(terminal)
    } else return undefined
  }

  private addProduction(index: number, nonTerminal: Grammar.Symbol, terminal: Grammar.Symbol) {
    let tMap = this._predictiveTable.get(nonTerminal)
    if (!tMap) {
      tMap = new Map()
      this._predictiveTable.set(nonTerminal, tMap)
    }
    if (tMap.has(terminal)) throw new Error(`M[${nonTerminal}, ${terminal}] can only be one item`)
    tMap.set(terminal, index)
  }
}
