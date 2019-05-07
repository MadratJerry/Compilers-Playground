import { State, FiniteAutomata } from './finiteAutomata'

export function dfs(
  fa: FiniteAutomata,
  connect: (from: State, to: State, value: string) => void,
  node: (s: State) => void = () => {},
): FiniteAutomata {
  const visited: Set<FiniteAutomata | State> = new Set()
  const _node = (s: State) => {
    if (!visited.has(s)) {
      visited.add(s)
      node(s)
      s.out.forEach(([t, v]) => {
        walk(t.fa)
        connect(
          s,
          t,
          v,
        )
      })
    }
  }
  const walk = (f: FiniteAutomata): FiniteAutomata => {
    if (!visited.has(f)) {
      visited.add(f)
      _node(f.start)
      _node(f.end)
    }
    return f
  }
  return walk(fa)
}

export function labelIndex(fa: FiniteAutomata): FiniteAutomata {
  let i = 0
  return dfs(fa, () => {}, f => (f.id = ++i))
}
