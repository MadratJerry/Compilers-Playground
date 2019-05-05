import { State, FiniteAutomata } from './finiteAutomata'

export function dfs(
  f: FiniteAutomata,
  connect: (from: State, to: State, value: string) => void,
  node: (s: State) => void = () => {},
) {
  const visited: Set<State> = new Set()
  const walk = (n: State) => {
    if (visited.has(n)) return
    else {
      visited.add(n)
      node(n)
    }
    const edges = f.map.get(n)
    if (edges)
      edges.forEach((v, s) => {
        connect(
          n,
          s,
          v,
        )
        walk(s)
      })
  }
  walk(f.start)
  return f
}

export function labelIndex(fa: FiniteAutomata) {
  let i = 0
  return dfs(fa, () => {}, f => (f.id = ++i))
}
