import firsts from './firsts'
import Syntax, { epsilon } from './syntax'
import { SyntaxType } from './syntaxTypes'
import Token from '@/lib/tokenizer/token'

function S(symbol: SyntaxType.Symbol): Token {
  if ((symbol >= 'A' && symbol <= 'Z') || symbol.match(`'`)) return new Token(0, symbol, 'NonTerminal')
  else return new Token(0, symbol, 'Terminal')
}

function A(alternative: SyntaxType.Alternative): Array<Token> {
  return alternative.map(symbol => S(symbol))
}

function expand(firsts: SyntaxType.Firsts): Array<Array<string>> {
  return [...firsts.entries()].map(([s, a]) => [s, ...a.values()]).sort()
}

test('firsts test case 1', () => {
  const syntax = new Syntax()
  syntax.addProduction(S(`E`), A([`T`, `E'`]))
  syntax.addProduction(S(`E'`), A([`+`, `T`, `E'`]))
  syntax.addProduction(S(`E'`), A([]))
  syntax.addProduction(S(`T`), A([`F`, `T'`]))
  syntax.addProduction(S(`T'`), A([`*`, `F`, `T'`]))
  syntax.addProduction(S(`T'`), A([]))
  syntax.addProduction(S(`F`), A([`(`, `E`, `)`]))
  syntax.addProduction(S(`F`), A([`id`]))

  expect(expand(firsts(syntax))).toEqual(
    [['F', '(', 'id'], ['T', '(', 'id'], ['E', '(', 'id'], [`E'`, '+', epsilon], [`T'`, '*', epsilon]].sort(),
  )
})
