import { epsilon } from '@/lib/grammar'
import { Equal } from '@/lib/enhance'

type Edge = [State, string]
export class State implements Equal<State> {
  public id?: number
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

export class NFA extends FiniteAutomata {
  type: 'closure' | 'concat' | 'union' | 'basic' = 'basic'
  wrap: [NFA, NFA] | [NFA] | [] = []
}

export function closure(a: NFA): NFA {
  if (a.type === 'closure') return a
  const c = new NFA()
  c.type = 'closure'
  c.wrap = [a]
  c.addEdge(a.end, a.start, epsilon)
  c.addEdge(c.start, a.start, epsilon)
  c.addEdge(a.end, c.end, epsilon)
  c.addEdge(c.start, c.end, epsilon)
  return c
}

export function concat(a: NFA, b: NFA): NFA {
  const c = new NFA()
  c.type = 'concat'
  c.wrap = [a, b]
  a.end.out = b.start.out
  b.start.out = new Set()
  b.start.id = -1
  c.start = a.start
  c.end = b.end
  return c
}

export function union(a: NFA, b: NFA): NFA {
  const c = new NFA()
  c.type = 'union'
  c.wrap = [a, b]
  c.addEdge(c.start, a.start, epsilon)
  c.addEdge(c.start, b.start, epsilon)
  c.addEdge(a.end, c.end, epsilon)
  c.addEdge(b.end, c.end, epsilon)
  return c
}
