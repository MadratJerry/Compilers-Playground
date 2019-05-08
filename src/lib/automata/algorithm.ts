import { epsilon } from '@/lib/grammar'
import { EqualSet } from '@/lib/enhance'
import { State, NFA, DFA } from './finiteAutomata'

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
  return bfs(nfa, () => {}, f => (f.id = i++))
}

export function inputSet(nfa: NFA): Set<string> {
  const set: Set<string> = new Set()
  bfs(nfa, (_f, _t, v) => set.add(v))
  set.delete(epsilon)
  return set
}

export function dfa(nfa: NFA) {
  const dStates = new EqualSet([epsilonClosure(nfa.start)])
  const dTran: Map<DFA, Map<string, DFA>> = new Map()
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

export function epsilonClosure(s: State | Set<State>): DFA {
  const stack = s instanceof State ? [s] : [...s]
  const stateSet: DFA = new EqualSet(stack)
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

function move(T: Set<State>, a: string): DFA {
  const stateSet: DFA = new EqualSet()
  T.forEach(s => s.out.forEach(([t, v]) => (v === a ? stateSet.add(t) : null)))
  return stateSet
}
