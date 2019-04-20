import { case1, expand, adapter, case2, case3, case4 } from './grammar.test'
import LL1Grammars, { LeftRecursionError, DanglingElseError, CommonPrefixError } from './ll1Grammars'
import { epsilon, $end, $accept } from './grammars'

function sort(array: string[][]) {
  return array.map(a => a.sort()).sort()
}

test('LL1 Grammars test', () => {
  const grammars = new LL1Grammars(adapter(case1))

  expect(sort(expand(grammars.firsts()))).toEqual(
    sort([
      [$accept, '(', 'id'],
      ['F', '(', 'id'],
      ['T', '(', 'id'],
      ['E', '(', 'id'],
      [`E'`, '+', epsilon],
      [`T'`, '*', epsilon],
    ]),
  )

  expect(sort(expand(grammars.follows()))).toEqual(
    sort([
      [$accept],
      ['F', $end, ')', '+', '*'],
      ['T', $end, ')', '+'],
      ['E', $end, ')'],
      [`E'`, $end, ')'],
      [`T'`, $end, ')', '+'],
    ]),
  )
})

test('LL1 Grammars test case 2', () => {
  expect(() => new LL1Grammars(adapter(case2))).toThrow(LeftRecursionError)
})

test('LL1 Grammars test case 3', () => {
  expect(() => new LL1Grammars(adapter(case3))).toThrow(DanglingElseError)
})

test('LL1 Grammars test case 4', () => {
  expect(() => new LL1Grammars(adapter(case4))).toThrow(CommonPrefixError)
})
