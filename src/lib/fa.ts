import Graph, { Vertex } from './graph'
import { stat } from 'fs/promises'
import { isUndefined } from 'util'

const epsilon = 'ε'
let hash = 0

class State extends Vertex<number> {
  label: number
  constructor(label?: number) {
    super(label || hash++)
  }
}

export default class FA extends Graph<State, string> {
  inputSet: Set<string> = new Set()

  constructor(symbol?: string) {
    super()
    if (symbol) {
      this.start = new State()
      this.end = new State()
      this.addEdge(this.start, this.end, symbol)
      this.inputSet.add(symbol)
    }
  }

  closure() {
    const start = new State()
    const end = new State()
    this.addEdge(start, this.start, epsilon)
    this.addEdge(start, end, epsilon)
    this.addEdge(this.end, end, epsilon)
    this.addEdge(this.end, this.start, epsilon)
    this.start = start
    this.end = end
  }

  concat(nfa: FA) {
    if (!nfa) return
    this.merge(nfa)
    this.map.get(nfa.start).forEach(e => this.addEdge(this.end, e.to, e.weight))
    this.map.delete(nfa.start)
    this.end = nfa.end
  }

  union(nfa: FA) {
    if (!nfa) return
    const start = new State()
    const end = new State()
    this.merge(nfa)
    this.addEdge(start, this.start, epsilon)
    this.addEdge(start, nfa.start, epsilon)
    this.addEdge(this.end, end, epsilon)
    this.addEdge(nfa.end, end, epsilon)
    this.start = start
    this.end = end
  }

  merge(nfa: FA) {
    nfa.map.forEach((v, k) => this.map.set(k, v))
    nfa.inputSet.forEach(i => this.inputSet.add(i))
  }

  static graphviz(fa: any): string {
    if (!fa) return ''
    let id = 0,
      s: any = []
    const idMap = new Map()
    const getId = (o: State) => {
      let i = idMap.get(o)
      if (i) return i
      else {
        idMap.set(o, id)
        return id++
      }
    }
    for (const v of fa.map)
      for (const e of v[1]) if (e.from) s.push(`${getId(e.from)} -> ${getId(e.to)} [ label = "${e.weight}" ];`)
    return `digraph finite_state_machine {
              rankdir=LR;
              size="8,5"
              node [shape = doublecircle]; ${(() => {
                if (Array.isArray(fa.end)) {
                  return fa.end.map((e: any) => getId(e)).join(' ') + ';'
                } else return fa.end ? getId(fa.end) + ';' : ''
              })()}
              node [shape = circle];
              ${s.join('\n')}
            }`
  }

  epsilonClosure(v: Set<State>): Set<State> {
    const stack = [...v]
    const result = new Set(v)
    while (stack.length !== 0) {
      const state = stack.pop()
      for (const e of this.map.get(state)) {
        if (e.weight === epsilon && !result.has(e.to)) {
          result.add(e.to)
          stack.push(e.to)
        }
      }
    }
    return result
  }

  move(v: Set<State>, transition: string): Set<State> {
    const result = new Set()
    for (const s of v) for (const e of this.map.get(s)) if (e.weight === transition) result.add(e.to)
    return result
  }

  DFA() {
    const dStates = new Set<Set<State>>([this.epsilonClosure(new Set([this.start]))])
    const getT = (function*(): IterableIterator<Set<State>> {
      for (const i of dStates) yield i
    })()
    let T = getT.next()
    const DFA = new Graph<Set<State>, string>()
    const isEnd = (t: Set<State>) => {
      for (const e of t) if (e == this.end) return true
      return false
    }
    DFA.end = []
    while (!T.done) {
      this.inputSet.forEach(c => {
        const states = this.epsilonClosure(this.move(T.value, c))
        if (states.size) {
          const U = FA.isInSet(dStates, states)
          if (U === states) {
            dStates.add(states)
          }
          DFA.addEdge(T.value, U, c)
        }
      })
      T = getT.next()
    }
    for (const e of dStates) if (isEnd(e)) DFA.end.push(e)
    return DFA
  }

  showSet(set: Set<any>) {
    let a: Array<string> = []
    set.forEach(s => a.push(`${s}`))
    return `{${a.join(',')}}`
  }

  static isInSet(set: Set<Set<State>>, T: Set<State>): Set<State> {
    for (const s of set) if (FA.isSetEqual(s, T)) return s
    return T
  }

  static isSetEqual(x: Set<State>, y: Set<State>): boolean {
    if (x.size === y.size) {
      for (const s of x) if (!y.has(s)) return false
      return true
    } else return false
  }
}
