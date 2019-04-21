import { Grammar, epsilon, $accept, $end, Productions, Firsts, Alternatives } from '.'

export function expand(firsts: Firsts): Alternatives {
  return [...firsts.entries()].map(([s, a]) => [s, ...a.values()]).sort()
}

export const case1: Productions = [
  [`E`, [`T`, `E'`]],
  [`E'`, [`"+"`, `T`, `E'`]],
  [`E'`, []],
  [`T`, [`F`, `T'`]],
  [`T'`, [`"*"`, `F`, `T'`]],
  [`T'`, []],
  [`F`, [`"("`, `E`, `")"`]],
  [`F`, [`id`]],
]

export const case2: Productions = [[`A`, [`E`, `x`]], [`A`, []], [`E`, [`A`]]]

export const case3: Productions = [
  [`S`, [`i`, `E`, `t`, `S`, `S'`]],
  [`S`, [`a`]],
  [`S'`, [`e`, `S`]],
  [`S'`, []],
  [`E`, [`b`]],
]

export const case4: Productions = [
  [`A`, [`if`, `(`, `E`, `)`]],
  [`A`, [`if`, `(`, `E`, `)`, `else`, `A`]],
  [`E`, [`A`]],
]

test('Grammars test case 1', () => {
  const grammars = new Grammar(case1)
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
