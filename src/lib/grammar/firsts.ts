import Grammars, { NonTerminal, Terminal } from './grammars'
import * as GrammarType from './grammarTypes'

export default function firsts(grammar: Grammars): GrammarType.Firsts {
  const firsts: GrammarType.Firsts = new Map()
  grammar.getProductions().forEach((_, k) => firsts.set(k, first(k)))

  function first(symbol: GrammarType.Symbol): Set<GrammarType.Symbol> {
    const type = grammar.getSymbolType(symbol)
    if (type === Terminal) return new Set([symbol])
    else if (type === NonTerminal) {
      const set = firsts.get(symbol)
      if (set) return set

      const newSet = new Set()
      const alternatives = grammar.getAlternatives(symbol)
      for (const alternative of alternatives) {
        if (alternative.length) {
          first(alternative[0]).forEach(s => newSet.add(s))
        }
      }

      firsts.set(symbol, newSet)
      return newSet
    } else if (type === undefined) throw Error(`The type of '${symbol}' is unknown`)
    else throw new Error(`Symbol can only be 'NonTerminal' or 'Terminal'`)
  }

  return firsts
}
