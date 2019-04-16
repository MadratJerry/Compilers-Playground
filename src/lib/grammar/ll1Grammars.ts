import { Token } from '@/lib/tokenizer'
import Grammars, { Terminal, NonTerminal } from './grammars'
import * as Grammar from './grammarTypes'

export default class LL1Grammars extends Grammars {
  private readonly _firsts: Grammar.Firsts<Grammar.Symbol> = new Map()

  constructor(productions: Grammar.Productions<Token>) {
    super(productions)

    this.getProductions().forEach((_, k) => this._firsts.set(k, this.first(k)))
  }

  public firsts(): Grammar.Firsts<Grammar.Symbol> {
    return this._firsts
  }

  private first(symbol: Grammar.Symbol): Set<Grammar.Symbol> {
    const type = this.getSymbolType(symbol)
    if (type === Terminal) return new Set([symbol])
    else if (type === NonTerminal) {
      const set = this._firsts.get(symbol)
      if (set) return set

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
}
