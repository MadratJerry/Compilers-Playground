import { case1, expand, adapter, case2 } from './grammar.test'
import LL1Grammars, { LeftRecursionError } from './ll1Grammars'
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

test('Grammars test case 2', () => {
  expect(() => new LL1Grammars(adapter(case2))).toThrow(LeftRecursionError)
})
