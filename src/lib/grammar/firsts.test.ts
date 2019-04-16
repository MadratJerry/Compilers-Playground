import firsts from './firsts'
import Grammars, { epsilon } from './grammars'
import * as GrammarType from './grammarTypes'
import { Token } from '@/lib/tokenizer'

function S(symbol: GrammarType.Symbol): Token {
  if ((symbol >= 'A' && symbol <= 'Z') || symbol.match(`'`)) return new Token(0, symbol, 'NonTerminal')
  else return new Token(0, symbol, 'Terminal')
}

function A(alternative: GrammarType.Alternative): Array<Token> {
  return alternative.map(symbol => S(symbol))
}

function expand(firsts: GrammarType.Firsts): Array<Array<string>> {
  return [...firsts.entries()].map(([s, a]) => [s, ...a.values()]).sort()
}

test('firsts test case 1', () => {
  const grammar = new Grammars()
  grammar.addProduction(S(`E`), A([`T`, `E'`]))
  grammar.addProduction(S(`E'`), A([`+`, `T`, `E'`]))
  grammar.addProduction(S(`E'`), A([]))
  grammar.addProduction(S(`T`), A([`F`, `T'`]))
  grammar.addProduction(S(`T'`), A([`*`, `F`, `T'`]))
  grammar.addProduction(S(`T'`), A([]))
  grammar.addProduction(S(`F`), A([`(`, `E`, `)`]))
  grammar.addProduction(S(`F`), A([`id`]))

  expect(expand(firsts(grammar))).toEqual(
    [['F', '(', 'id'], ['T', '(', 'id'], ['E', '(', 'id'], [`E'`, '+', epsilon], [`T'`, '*', epsilon]].sort(),
  )
})
