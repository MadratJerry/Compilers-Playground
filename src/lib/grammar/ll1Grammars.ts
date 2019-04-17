import { Token } from '@/lib/tokenizer'
import Grammars, { Terminal, NonTerminal, epsilon, $accept } from './grammars'
import * as Grammar from './grammarTypes'

export default class LL1Grammars extends Grammars {
  private readonly _firsts: Grammar.Firsts<Grammar.Symbol> = new Map()
  private readonly _follows: Grammar.Follows<Grammar.Symbol> = new Map()

  constructor(productions: Grammar.Productions<Token>) {
    super(productions)

    this.getProductions().forEach((_, k) => this._firsts.set(k, this.first(k)) && this._follows.set(k, this.follow(k)))
  }

  public firsts(): Grammar.Firsts<Grammar.Symbol> {
    return this._firsts
  }

  public follows(): Grammar.Follows<Grammar.Symbol> {
    return this._follows
  }

  private first(symbol: Grammar.Symbol | Grammar.Alternative<Grammar.Symbol>): Set<Grammar.Symbol> {
    if (Array.isArray(symbol)) {
      if (symbol.length) return new Set(this.first(symbol[0]))
      else return new Set([epsilon])
    }

    const type = this.getSymbolType(symbol)
    if (type === Terminal) return new Set([symbol])
    else if (type === NonTerminal) {
      const set = this._firsts.get(symbol)
      if (set) return new Set(set)

      const newSet = new Set()
      const alternatives = this.getAlternatives(symbol)
      for (const alternative of alternatives) {
        if (alternative.length) {
          this.first(alternative[0]).forEach(s => newSet.add(s))
        }
      }

      this._firsts.set(symbol, newSet)
      return newSet
    } else if (type === undefined) throw Error(`The type of '${symbol}' is unknown`)
    else throw new Error(`Symbol can only be 'NonTerminal' or 'Terminal'`)
  }

  private follow(symbol: Grammar.Symbol): Set<Grammar.Symbol> {
    const indexSet = this._symbolIndexMap.get(symbol)
    const set = this._follows.get(symbol)
    if (set) return set

    const newSet = new Set()
    if (indexSet) {
      indexSet.forEach(([n, a, i]) => {
        const rest = a.slice(i + 1)
        const firstSet = this.first(rest)
        if ((rest.length === 0 || firstSet.has(epsilon)) && symbol !== n) {
          this.follow(n).forEach(s => newSet.add(s))
        }
        firstSet.delete(epsilon)
        firstSet.forEach(s => newSet.add(s))
      })
    } else {
      if (symbol !== $accept) throw new Error(`NonTerminal '${symbol}' is not in productinos.`)
    }
    return newSet
  }
}
