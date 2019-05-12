import { epsilon } from '@/lib/grammar'
import { EqualSet, Equal } from '@/lib/enhance'
import { State, NFA, Id, FiniteAutomata, NFAState, DFA, DFAState } from './finiteAutomata'

export function bfs<T extends Equal<T>, F extends FiniteAutomata<State<T>>>(
  f: F,
  connect: (from: State<T>, to: State<T>, value: string) => void,
  node: (s: State<T>) => void = () => {},
): F {
  const visited: Set<State<T>> = new Set()
  const _node = (s: State<T>) => {
    if (!visited.has(s)) {
      visited.add(s)
      if (s.id) node(s)
      s.out.forEach(([t, v]) =>
        connect(
          s,
          t,
          v,
        ),
      )
    }
  }
  const walk = (n: F) => {
    const { start, end, wrap } = n
    _node(start)
    wrap.forEach(a => walk(a))
    Array.isArray(end) ? end.forEach(e => _node(e)) : _node(end)
  }
  walk(f)
  return f
}

export function labelIndex(nfa: NFA): NFA {
  let i = 0
  return bfs(
    nfa,
    () => {},
    f => {
      f.id = new Id(i++)
      f.label = `${f.id}`
    },
  )
}

export function inputSet(nfa: NFA): Set<string> {
  const set: Set<string> = new Set()
  bfs(nfa, (_f, _t, v) => set.add(v))
  set.delete(epsilon)
  return set
}

export function dfa(nfa: NFA) {
  const dStates = new EqualSet([new DFAState(epsilonClosure(nfa.start))])
  const dTran: Map<DFAState, Map<string, DFAState>> = new Map()
  const inputs = inputSet(nfa)
  for (const T of dStates) {
    dTran.set(T, new Map())
    for (const a of inputs) {
      let U = new DFAState(epsilonClosure(move(T.id, a)))
      if (U.id.size === 0) continue
      if (!dStates.has(U)) dStates.add(U)
      else U = [...dStates].filter(s => s.euqals(U))[0]
      dTran.get(T)!.set(a, U)
    }
  }
  const dfa = new DFA()
  let id = 0
  for (const [T, toMap] of dTran) {
    T.label = `${id++}`
    if (T.id.has(nfa.start)) dfa.start = T
    if (T.id.has(nfa.end)) dfa.end.push(T)
    for (const [a, U] of toMap) {
      State.connect(T, U, a)
      const d = new DFA()
      d.start = T
      d.end = [U]
      dfa.wrap.push(d)
    }
  }
  return dfa
}

export function epsilonClosure(s: NFAState | Set<NFAState>): EqualSet<NFAState> {
  const stack = s instanceof State ? [s] : [...s]
  const stateSet: EqualSet<NFAState> = new EqualSet(stack)
  while (stack.length !== 0) {
    const state = stack.pop()!
    state.out.forEach(([t, v]) => {
      if (v === epsilon && !stateSet.has(t)) {
        stateSet.add(t)
        stack.push(t)
      }
    })
  }
  return stateSet
}

function move(T: Set<NFAState>, a: string): EqualSet<NFAState> {
  const stateSet: EqualSet<NFAState> = new EqualSet()
  T.forEach(s => s.out.forEach(([t, v]) => (v === a ? stateSet.add(t) : null)))
  return stateSet
}
