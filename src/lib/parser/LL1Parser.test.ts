import { case1 } from '@/lib/grammar/grammar.test'
import { LL1Grammar, $accept, $end } from '@/lib/grammar'
import { Token } from '@/lib/tokenizer'
import { ASTNode, LL1Parser } from '.'

function dfs(node: ASTNode): string {
  if (node.children) {
    return node.children
      .map(n => dfs(n))
      .filter(s => s !== '')
      .join(' ')
  } else {
    if (typeof node.symbol === 'string') return node.symbol
    else return node.symbol.token
  }
}

test('LL1 Parser test case 1', () => {
  const parser = new LL1Parser(new LL1Grammar(case1))
  expect(parser.getPredictiveTable()).toEqual(
    new Map([
      [$accept, new Map([['"("', 0], ['id', 0]])],
      [`E'`, new Map([[`"+"`, 2], ['")"', 1], [$end, 1]])],
      [`E`, new Map([[`"("`, 3], ['id', 3]])],
      [`F`, new Map([[`"("`, 4], ['id', 5]])],
      [`T'`, new Map([[`"*"`, 7], ['"+"', 6], ['")"', 6], [$end, 6]])],
      [`T`, new Map([[`"("`, 8], ['id', 8]])],
    ]),
  )

  const ast = parser.parse([
    new Token(0, 'a', 'id'),
    new Token(0, '+', 'symbol'),
    new Token(0, 'b', 'id'),
    new Token(0, '*', 'oprator'),
    new Token(0, 'c', 'id'),
    new Token(0, $end, $end),
  ])

  expect(dfs(ast)).toBe('a + b * c $end')
})
