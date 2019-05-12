import { epsilon } from '@/lib/grammar'
import { EqualSet, Equal } from '@/lib/enhance'
import { State, NFA, Id, FiniteAutomata, NFAState, DFA, DFAState, MFAState, MFA } from './finiteAutomata'

export function bfs<T extends State<any>, F extends FiniteAutomata<T>>(
  f: F,
  connect: (from: T, to: T, value: string) => void,
  node: (s: T) => void = () => {},
): F {
  const visited: Set<T> = new Set()
  const _node = (s: T) => {
    if (!visited.has(s)) {
      visited.add(s)
      if (s.id) node(s)
      s.out.forEach(([t, v]) =>
        connect(
          s,
          t as T,
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

export function inputSet(fa: FiniteAutomata<any>): Set<string> {
  const set: Set<string> = new Set()
  bfs(fa, (_f, _t, v) => set.add(v))
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

function epsilonClosure(s: NFAState | Set<NFAState>): EqualSet<NFAState> {
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

function move<T extends State<any>>(T: Set<T>, a: string): EqualSet<T> {
  const stateSet: EqualSet<T> = new EqualSet()
  T.forEach(s => s.out.forEach(([t, v]) => (v === a ? stateSet.add(t) : null)))
  return stateSet
}

export function mfa(dfa: DFA): MFA {
  const accepts = new EqualSet(dfa.end)
  const unaccepts: typeof accepts = new EqualSet()
  bfs<DFAState, DFA>(dfa, () => {}, s => unaccepts.add(s))
  accepts.forEach(s => unaccepts.delete(s))
  const inputs = inputSet(dfa)

  let sets = new EqualSet([unaccepts, accepts].filter(s => s.size))
  while (true) {
    const setsNew = new EqualSet(sets)
    const map: Map<DFAState, EqualSet<DFAState>> = new Map()
    sets.forEach(G => G.forEach(d => map.set(d, G)))

    for (const G of sets) {
      if (G.size === 1) continue
      // TODO: EqualMap can be better
      for (const a of inputs) {
        const toMap: Map<DFAState, EqualSet<DFAState>> = new Map()
        const splitSet: EqualSet<EqualSet<DFAState>> = new EqualSet()
        for (const d of G) {
          const to = map.get([...move(new Set([d]), a)][0])
          // If there is a transferable state, just add, else split itself to a new group
          if (to) {
            toMap.set(d, to)
            splitSet.add(to)
          } else {
            const newTo = new EqualSet([d])
            toMap.set(d, newTo)
            splitSet.add(newTo)
          }
        }
        if (splitSet.size > 1) {
          for (const s of splitSet)
            setsNew.add(new EqualSet([...toMap.entries()].filter(([, to]) => to.euqals(s)).map(([d]) => d)))
          setsNew.delete(G)
          break
        }
      }
    }
    if (!setsNew.euqals(sets)) sets = setsNew
    else break
  }
  const setsFinal = new EqualSet([...sets].map(s => new MFAState(s)))
  const map: Map<DFAState, MFAState> = new Map()
  const mfa = new MFA()
  setsFinal.forEach(G => G.id.forEach(d => map.set(d, G)))
  for (const m of setsFinal) {
    if (m.id.has(dfa.start)) mfa.start = m
    dfa.end.forEach(e => {
      if (m.id.has(e)) mfa.end.push(m)
    })
    const represent = [...m.id][0]
    represent.out.forEach(([d, a]) => {
      State.connect(m, map.get(d)!, a)
      const f = new MFA()
      f.start = m
      f.end = [map.get(d)!]
      mfa.wrap.push(f)
    })
  }
  let id = 0
  bfs(mfa, () => {}, f => (f.label = `${id++}`))
  return mfa
}
