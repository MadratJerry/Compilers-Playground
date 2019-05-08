import { epsilon } from '@/lib/grammar'
import { EqualSet, Equal } from '@/lib/enhance'
import { State, NFA, Id, FiniteAutomata, NFAState } from './finiteAutomata'

export function bfs<T extends Equal<T>, F extends FiniteAutomata<T>>(
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
    _node(end)
  }
  walk(f)
  return f
}

export function labelIndex(nfa: NFA): NFA {
  let i = 0
  return bfs(nfa, () => {}, f => (f.id = new Id(i++)))
}

export function inputSet(nfa: NFA): Set<string> {
  const set: Set<string> = new Set()
  bfs(nfa, (_f, _t, v) => set.add(v))
  set.delete(epsilon)
  return set
}

export function dfa(nfa: NFA) {
  const dStates = new EqualSet([epsilonClosure(nfa.start)])
  const dTran: Map<EqualSet<NFAState>, Map<string, EqualSet<NFAState>>> = new Map()
  const inputs = inputSet(nfa)
  for (const T of dStates) {
    dTran.set(T, new Map())
    for (const a of inputs) {
      const U = epsilonClosure(move(T, a))
      if (!dStates.has(U)) dStates.add(U)
      dTran.get(T)!.set(a, U)
    }
  }
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
