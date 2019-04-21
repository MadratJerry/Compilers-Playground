import { case1, expand, case2, case3, case4 } from './grammar.test'
import { LeftRecursionError, DanglingElseError, CommonPrefixError } from './ll1Grammar'
import { LL1Grammar, epsilon, $end, $accept } from '.'

function sort(array: string[][]) {
  return array.map(a => a.sort()).sort()
}

test('LL1 Grammars test', () => {
  const grammars = new LL1Grammar(case1)

  expect(sort(expand(grammars.firsts()))).toEqual(
    sort([
      [$accept, '"("', 'id'],
      ['F', '"("', 'id'],
      ['T', '"("', 'id'],
      ['E', '"("', 'id'],
      [`E'`, '"+"', epsilon],
      [`T'`, '"*"', epsilon],
    ]),
  )

  expect(sort(expand(grammars.follows()))).toEqual(
    sort([
      [$accept],
      ['F', $end, '")"', '"+"', '"*"'],
      ['T', $end, '")"', '"+"'],
      ['E', $end, '")"'],
      [`E'`, $end, '")"'],
      [`T'`, $end, '")"', '"+"'],
    ]),
  )
})

test('LL1 Grammars test case 2', () => {
  expect(() => new LL1Grammar(case2)).toThrow(LeftRecursionError)
})

test('LL1 Grammars test case 3', () => {
  expect(() => new LL1Grammar(case3)).toThrow(DanglingElseError)
})

test('LL1 Grammars test case 4', () => {
  expect(() => new LL1Grammar(case4)).toThrow(CommonPrefixError)
})
