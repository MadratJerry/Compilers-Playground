import { case1, adapter } from '@/lib/grammar/grammar.test'
import LL1Grammars from '@/lib/grammar/ll1Grammars'
import LL1Parser from './LL1Parser'
import { $accept, $end } from '@/lib/grammar/grammars'
import { Token } from '@/lib/tokenizer'
import ASTNode from './ASTNode'

function dfs(node: ASTNode): string {
  if (node.children) {
    return node.children
      .map(n => dfs(n))
      .filter(s => s !== '')
      .join(' ')
  } else {
    return node.symbol
  }
}

test('LL1 Parser test case 1', () => {
  const parser = new LL1Parser(new LL1Grammars(adapter(case1)))
  expect(parser.getPredictiveTable()).toEqual(
    new Map([
      [$accept, new Map([['(', 0], ['id', 0]])],
      [`E'`, new Map([[`+`, 1], [')', 2], [$end, 2]])],
      [`E`, new Map([[`(`, 3], ['id', 3]])],
      [`F`, new Map([[`(`, 4], ['id', 5]])],
      [`T'`, new Map([[`*`, 6], ['+', 7], [')', 7], [$end, 7]])],
      [`T`, new Map([[`(`, 8], ['id', 8]])],
    ]),
  )

  const ast = parser.parse([
    new Token(0, 'id', 'identifier'),
    new Token(0, '+', 'symbol'),
    new Token(0, 'id', 'identifier'),
    new Token(0, '*', 'oprator'),
    new Token(0, 'id', 'identifier'),
    new Token(0, $end, 'oprator'),
  ])

  expect(dfs(ast)).toBe("id + id * id $end")
})
