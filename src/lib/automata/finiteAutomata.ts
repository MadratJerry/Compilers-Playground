import { epsilon } from '@/lib/grammar'
import { Equal, EqualSet } from '@/lib/enhance'

export class Id extends Number implements Equal<Id> {
  public euqals(value?: Id): boolean {
    return value ? this.valueOf() === value.valueOf() : false
  }
}

export class State<T extends Equal<T>> implements Equal<State<T>> {
  public id: T
  public out: Set<[this, string]> = new Set()
  public label: string = ''

  constructor(id: T) {
    this.id = id
  }

  public euqals(value?: this): boolean {
    return this.id && value ? this.id.euqals(value.id) : false
  }

  public toString(): string {
    return this.label
  }

  static connect<T extends Equal<T>>(from: State<T>, to: State<T>, value: string) {
    from.out.add([to, value])
  }
}

export class NFAState extends State<Id> {}

export class DFAState extends State<EqualSet<NFAState>> {}

export class MFAState extends State<EqualSet<DFAState>> {}

export abstract class FiniteAutomata<T extends State<Equal<any>>> {
  abstract start: T
  abstract end: T | Array<T>
  wrap: Array<any> = []
}

export class NFA extends FiniteAutomata<NFAState> {
  start = new NFAState(new Id())
  end = new NFAState(new Id())
  type: 'closure' | 'concat' | 'union' | 'basic' = 'basic'
  wrap: [NFA, NFA] | [NFA] | [] = []

  constructor(value?: string) {
    super()
    if (value !== undefined) this.start.out.add([this.end, value])
  }
}

export class DFA extends FiniteAutomata<DFAState> {
  start = new DFAState(new EqualSet())
  end: Array<DFAState> = []
}

export class MFA extends FiniteAutomata<MFAState> {
  start = new MFAState(new EqualSet())
  end: Array<MFAState> = []
}

export function closure(a: NFA): NFA {
  if (a.type === 'closure') return a
  const c = new NFA()
  c.type = 'closure'
  c.wrap = [a]
  State.connect(a.end, a.start, epsilon)
  State.connect(c.start, a.start, epsilon)
  State.connect(a.end, c.end, epsilon)
  State.connect(c.start, c.end, epsilon)
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
  State.connect(c.start, a.start, epsilon)
  State.connect(c.start, b.start, epsilon)
  State.connect(a.end, c.end, epsilon)
  State.connect(b.end, c.end, epsilon)
  return c
}
