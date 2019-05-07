import { epsilon } from '@/lib/grammar'
import { Equal } from '@/lib/enhance'
import { dfs, labelIndex } from './algorithm'

let id = 0
type Edge = [State, string]
export class State implements Equal<State> {
  public id?: number = id++
  public out: Set<Edge> = new Set()
  public fa: FiniteAutomata

  constructor(fa: FiniteAutomata) {
    this.fa = fa
  }

  public euqals(value: State): boolean {
    return this.id === value.id
  }
}

export class FiniteAutomata {
  start: State
  end: State

  constructor(value?: string) {
    this.start = new State(this)
    this.end = new State(this)
    if (value !== undefined) this.start.out.add([this.end, value])
  }

  public addEdge(from: State, to: State, value: string) {
    from.out.add([to, value])
  }
}

export function closure(a: FiniteAutomata): FiniteAutomata {
  const c = new FiniteAutomata()
  c.addEdge(c.start, a.start, epsilon)
  c.addEdge(c.start, c.end, epsilon)
  c.addEdge(a.end, c.end, epsilon)
  c.addEdge(a.end, a.start, epsilon)
  return c
}

export function concat(a: FiniteAutomata, b: FiniteAutomata): FiniteAutomata {
  const c = new FiniteAutomata()
  a.end.out = b.start.out
  a.end.fa = b
  b.start = a.end
  c.start = a.start
  c.start.fa = c
  c.end = b.end
  c.end.fa = c
  return c
}

export function union(a: FiniteAutomata, b: FiniteAutomata): FiniteAutomata {
  const c = new FiniteAutomata()
  c.addEdge(c.start, a.start, epsilon)
  c.addEdge(c.start, b.start, epsilon)
  c.addEdge(a.end, c.end, epsilon)
  c.addEdge(b.end, c.end, epsilon)
  return c
}
