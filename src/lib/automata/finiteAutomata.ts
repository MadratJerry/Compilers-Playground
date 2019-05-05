import { epsilon } from '@/lib/grammar'

let id = 0
export class State {
  id = id++
}

type GraphMap = Map<State, Map<State, string>>
export default class FiniteAutomata {
  start: State = new State()
  end: State = new State()
  map: GraphMap = new Map()
  reverseMap: GraphMap = new Map()

  constructor(value?: string) {
    if (value) this.addEdge(this.start, this.end, value)
  }

  public addEdge(from: State, to: State, value: string) {
    this.addEdgeWithMap(from, to, value, this.map)
    this.addEdgeWithMap(to, from, value, this.reverseMap)
  }

  public removeEdge(from: State, to: State) {
    this.removeEdgeWithMap(from, to, this.map)
    this.removeEdgeWithMap(to, from, this.reverseMap)
  }

  public removeState(s: State) {
    this.removeStateWithMap(s, this.map)
    this.removeStateWithMap(s, this.reverseMap)
  }

  private removeStateWithMap(s: State, map: GraphMap) {
    if (this.map.has(s)) this.map.get(s)!.forEach((v, k) => this.reverseMap.get(k)!.delete(s))
    this.map.delete(s)
  }

  private addEdgeWithMap(from: State, to: State, value: string, map: GraphMap) {
    const edgeMap = map.get(from)
    if (edgeMap) {
      edgeMap.set(to, value)
    } else {
      map.set(from, new Map([[to, value]]))
    }
  }

  private removeEdgeWithMap(from: State, to: State, map: GraphMap) {
    const edgeMap = map.get(from)
    if (edgeMap) edgeMap.delete(to)
  }
}

function clone(a: FiniteAutomata): FiniteAutomata {
  return Object.assign(new FiniteAutomata(), {
    start: a.start,
    end: a.end,
    map: new Map([...a.map.entries()].map(([k, v]) => [k, new Map(v)])),
    reverseMap: new Map([...a.reverseMap.entries()].map(([k, v]) => [k, new Map(v)])),
  })
}

function merge(a: FiniteAutomata, b: FiniteAutomata): FiniteAutomata {
  a = clone(a)
  b = clone(b)
  a.map = new Map([...a.map.entries(), ...b.map.entries()])
  a.reverseMap = new Map([...a.reverseMap.entries(), ...b.reverseMap.entries()])
  return a
}

export function closure(a: FiniteAutomata): FiniteAutomata {
  const c = clone(a)
  c.start = new State()
  c.end = new State()
  c.addEdge(c.start, a.start, epsilon)
  c.addEdge(c.start, c.end, epsilon)
  c.addEdge(a.end, c.end, epsilon)
  c.addEdge(a.end, a.start, epsilon)
  return c
}

export function concat(a: FiniteAutomata, b: FiniteAutomata): FiniteAutomata {
  const c = merge(a, b)
  if (b.map.has(b.start)) b.map.get(b.start)!.forEach((v, k) => c.addEdge(a.end, k, v))
  if (b.reverseMap.has(b.start)) b.reverseMap.get(b.start)!.forEach((v, k) => c.addEdge(k, a.end, v))
  c.removeState(b.start)
  return c
}

export function union(a: FiniteAutomata, b: FiniteAutomata): FiniteAutomata {
  const c = merge(a, b)
  c.start = new State()
  c.end = new State()
  c.addEdge(c.start, a.start, epsilon)
  c.addEdge(c.start, b.start, epsilon)
  c.addEdge(a.end, c.end, epsilon)
  c.addEdge(b.end, c.end, epsilon)
  return c
}
