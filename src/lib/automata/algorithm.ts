import { State, NFA } from './finiteAutomata'

export function bfs(
  nfa: NFA,
  connect: (from: State, to: State, value: string) => void,
  node: (s: State) => void = () => {},
): NFA {
  const visited: Set<State> = new Set()
  const _node = (s: State) => {
    if (!visited.has(s)) {
      visited.add(s)
      if (s.id !== -1) node(s)
      s.out.forEach(([t, v]) =>
        connect(
          s,
          t,
          v,
        ),
      )
    }
  }
  const walk = (n: NFA) => {
    const { start, end, wrap } = n
    _node(start)
    wrap.forEach(a => walk(a))
    _node(end)
  }
  walk(nfa)
  return nfa
}

export function labelIndex(nfa: NFA): NFA {
  let i = 0
  return bfs(nfa, () => {}, f => (f.id = ++i))
}
