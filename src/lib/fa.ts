import Graph, { Vertex } from './graph'

const epsilon = 'ε'
let hash = 0

class State extends Vertex<number> {
  label: number
  constructor(label?: number) {
    super(label || hash++)
  }
}

export default class FA extends Graph<number, string> {
  symbol: string
  start: State
  end: State
  inputSet: Set<string> = new Set()

  constructor(symbol: string) {
    super()
    this.symbol = symbol
    this.start = new State()
    this.end = new State()
    this.addEdge(this.start, this.end, symbol)
    this.inputSet.add(symbol)
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

  showGraphviz() {
    console.group()
    let s: any = []
    this.map.forEach(v => {
      v.forEach(e => s.push(`${e.from} -> ${e.to} [ label = "${e.weight}" ];`))
    })
    console.log(`
  digraph finite_state_machine {
  rankdir=LR;
  size="8,5"
  node [shape = doublecircle]; ${this.end};
  node [shape = circle];
  ${s.join('\n')}
}`)
    console.groupEnd()
  }

  epsilonClosure(v: Set<State>): Set<State> {
    const stack = [...v]
    let a = 0
    while (stack.length !== 0) {
      const state = stack.pop()
      this.map.get(state).forEach(e => {
        if (e.weight === epsilon && !v.has(e.to)) {
          v.add(e.to)
          stack.push(e.to)
        }
      })
    }
    console.log(v)
    return v
  }

  move(v: Set<State>, transition: string): Set<State> {
    const result = new Set()
    v.forEach(s =>
      this.map.get(s).forEach(e => {
        if (e.weight === transition) result.add(e.to)
      }),
    )
    console.log(result)
    return result
  }

  DFA() {
    const dStates = new Set<Set<State>>([this.epsilonClosure(new Set([this.start]))])
    const getT = (function*(): IterableIterator<Set<State>> {
      for (const i of dStates) yield i
    })()
    let T = getT.next()
    while (!T.done) {
      this.inputSet.forEach(c => {
        const states = this.epsilonClosure(this.move(T.value, c))
        if (states.size) {
          if (!FA.isInSet(dStates, states)) {
            dStates.add(states)
          }
        }
      })
      T = getT.next()
    }
  }

  static isInSet(set: Set<Set<State>>, T: Set<State>): boolean {
    set.forEach(s => {
      if (FA.isSetEqual(s, T)) return true
    })
    return false
  }

  static isSetEqual(x: Set<State>, y: Set<State>): boolean {
    if (x.size === y.size) {
      for (const s of x) if (!y.has(s)) return false
      return true
    } else return false
  }
}
