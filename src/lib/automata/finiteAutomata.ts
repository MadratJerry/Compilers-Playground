import { epsilon } from '@/lib/grammar'
import { Equal, EqualSet } from '@/lib/enhance'

export interface NFAState extends State<Id> {}

export class Id extends Number implements Equal<Id> {
  public euqals(value?: Id): boolean {
    return value ? this.valueOf() === value.valueOf() : false
  }
}

export class State<T extends Equal<T>> implements Equal<State<T>> {
  public id?: T
  public out: Set<[State<T>, string]> = new Set()

  constructor(id?: T) {
    if (id) this.id = id
  }

  public euqals(value: State<T>): boolean {
    return this.id ? this.id.euqals(value.id) : false
  }
}

export abstract class FiniteAutomata<T extends Equal<T>> {
  abstract start: State<T>
  abstract end: State<T>
  wrap: Array<any> = []

  public addEdge(from: State<T>, to: State<T>, value: string) {
    from.out.add([to, value])
  }
}

export class NFA extends FiniteAutomata<Id> {
  start = new State(new Id())
  end = new State(new Id())
  type: 'closure' | 'concat' | 'union' | 'basic' = 'basic'
  wrap: [NFA, NFA] | [NFA] | [] = []

  constructor(value?: string) {
    super()
    if (value !== undefined) this.start.out.add([this.end, value])
  }
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
  delete b.start.id
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
