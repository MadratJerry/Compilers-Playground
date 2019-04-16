import { case1, expand, adapter } from './grammar.test'
import LL1Grammars from './ll1Grammars'
import { epsilon, $end } from './grammars'

test('LL1 Grammars test', () => {
  const grammars = new LL1Grammars(adapter(case1))

  expect(expand(grammars.firsts())).toEqual(
    [['F', '(', 'id'], ['T', '(', 'id'], ['E', '(', 'id'], [`E'`, '+', epsilon], [`T'`, '*', epsilon]].sort(),
  )

  expect(expand(grammars.follows())).toEqual(
    [
      ['F', $end, ')', '+', '*'],
      ['T', $end, ')', '+'],
      ['E', $end, ')'],
      [`E'`, $end, ')'],
      [`T'`, $end, ')', '+'],
    ].sort(),
  )
})