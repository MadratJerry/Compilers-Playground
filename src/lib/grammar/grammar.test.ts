import Grammars, { epsilon } from './grammars'
import * as Grammar from './grammarTypes'
import { Token } from '../tokenizer'

function S(symbol: Grammar.Symbol): Token {
  if ((symbol >= 'A' && symbol <= 'Z') || symbol.match(`'`)) return new Token(0, symbol, 'NonTerminal')
  else return new Token(0, symbol, 'Terminal')
}

function A(alternative: Grammar.Alternative<Grammar.Symbol>): Array<Token> {
  return alternative.map(symbol => S(symbol))
}

export function adapter(productions: Grammar.Productions<Grammar.Symbol>): Grammar.Productions<Token> {
  return productions.map(([symbol, alternatives]) => [S(symbol), alternatives.map(alternative => A(alternative))])
}

export function expand(firsts: Grammar.Firsts<Grammar.Symbol>): Grammar.Alternatives<Grammar.Symbol> {
  return [...firsts.entries()].map(([s, a]) => [s, ...a.values()]).sort()
}

export const case1: Grammar.Productions<Grammar.Symbol> = [
  [`E`, [[`T`, `E'`]]],
  [`E'`, [[`+`, `T`, `E'`], []]],
  [`T`, [[`F`, `T'`]]],
  [`T'`, [[`*`, `F`, `T'`], []]],
  [`F`, [[`(`, `E`, `)`], [`id`]]],
]

test('Grammars test', () => {
  const grammars = new Grammars(adapter(case1))
  expect([...grammars.getProductions().entries()].toString().replace(new RegExp(`${epsilon}`, 'g'), '')).toBe(
    case1.toString(),
  )
})
