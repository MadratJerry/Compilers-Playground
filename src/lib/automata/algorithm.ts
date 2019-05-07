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
      node(s)
      s.out.forEach(([t, v]) =>
        connect(
          s,
          t,
          v,
        ),
      )
    }
  }
  const walk = (n: NFA, concat: boolean = false) => {
    const { start, end, type, wrap } = n
    if (!concat) _node(start)
    if (type === 'concat') {
      const [a, b] = <[NFA, NFA]>wrap
      walk(a, concat)
      walk(b, true)
    } else {
      wrap.forEach(a => walk(a))
    }
    _node(end)
  }
  walk(nfa)
  return nfa
}

export function labelIndex(nfa: NFA): NFA {
  let i = 0
  return bfs(nfa, () => {}, f => (f.id = ++i))
}
