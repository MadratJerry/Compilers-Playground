import Grammars, { epsilon, $accept, $end } from './grammars'
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
  return productions.map(([symbol, alternative]) => [S(symbol), A(alternative)])
}

export function expand(firsts: Grammar.Firsts<Grammar.Symbol>): Grammar.Alternatives<Grammar.Symbol> {
  return [...firsts.entries()].map(([s, a]) => [s, ...a.values()]).sort()
}

export const case1: Grammar.Productions<Grammar.Symbol> = [
  [`E`, [`T`, `E'`]],
  [`E'`, [`+`, `T`, `E'`]],
  [`E'`, []],
  [`T`, [`F`, `T'`]],
  [`T'`, [`*`, `F`, `T'`]],
  [`T'`, []],
  [`F`, [`(`, `E`, `)`]],
  [`F`, [`id`]],
]

export const case2: Grammar.Productions<Grammar.Symbol> = [[`A`, [`E`, `x`]], [`A`, []], [`E`, [`A`]]]

export const case3: Grammar.Productions<Grammar.Symbol> = [
  [`S`, [`i`, `E`, `t`, `S`, `S'`]],
  [`S`, [`a`]],
  [`S'`, [`e`, `S`]],
  [`S'`, []],
  [`E`, [`b`]],
]

export const case4: Grammar.Productions<Grammar.Symbol> = [
  [`A`, [`if`, `(`, `E`, `)`]],
  [`A`, [`if`, `(`, `E`, `)`, `else`, `A`]],
  [`E`, [`A`]],
]

test('Grammars test case 1', () => {
  const grammars = new Grammars(adapter(case1))
  expect(
    grammars
      .getProductions()
      .toString()
      .replace(new RegExp(`${epsilon}`, 'g'), '')
      .split(',')
      .sort(),
  ).toEqual(
    [[$accept, [`E`, $end]]]
      .concat(case1)
      .toString()
      .split(',')
      .sort(),
  )
})
