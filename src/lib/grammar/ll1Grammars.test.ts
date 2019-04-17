import { case1, expand, adapter, case2 } from './grammar.test'
import LL1Grammars, { LeftRecursionError } from './ll1Grammars'
import { epsilon, $end, $accept } from './grammars'

test('LL1 Grammars test', () => {
  const grammars = new LL1Grammars(adapter(case1))

  expect(expand(grammars.firsts())).toEqual(
    [
      [$accept, '(', 'id'],
      ['F', '(', 'id'],
      ['T', '(', 'id'],
      ['E', '(', 'id'],
      [`E'`, '+', epsilon],
      [`T'`, '*', epsilon],
    ].sort(),
  )

  expect(expand(grammars.follows())).toEqual(
    [
      [$accept],
      ['F', $end, ')', '+', '*'],
      ['T', $end, ')', '+'],
      ['E', $end, ')'],
      [`E'`, $end, ')'],
      [`T'`, $end, ')', '+'],
    ].sort(),
  )
})

test('Grammars test case 2', () => {
  expect(() => new LL1Grammars(adapter(case2))).toThrow(LeftRecursionError)
})
