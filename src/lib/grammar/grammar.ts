import { difference } from '@/lib/enhance'
import {
  Productions,
  IndexMap,
  ProductionsIndexMap,
  Alternative,
  Production,
  Symbol,
  Firsts,
  Follows,
} from './grammarTypes'
import { $end, $accept } from '.'

export interface CheckResult {
  unreachable: Set<Symbol>
  unrealizable: Set<Symbol>
}

export class Grammar {
  protected readonly _productions: Productions
  protected readonly _indexMap: IndexMap = new Map()
  protected readonly _productionsIndexMap: ProductionsIndexMap = new Map()
  private readonly _terminals = new Set([$end])
  private readonly _nonTerminals = new Set([$accept])
  private readonly _nullables = new Set()
  private readonly _firsts: Firsts = new Map()
  private readonly _follows: Follows = new Map()
  private readonly _checks: CheckResult

  constructor(productions: Productions) {
    this._productions = productions.map(([symbol, alternative]) => this.addProduction(symbol, alternative))
    this._productions.push(this.addProduction($accept, productions.length ? [this._productions[0][0], $end] : [$end]))
    this._productions.sort()

    for (let i = 0, last = 0; i <= this._productions.length; i++) {
      if ((this._productions[i] || [])[0] !== (this._productions[last] || [])[0]) {
        this._productionsIndexMap.set(this._productions[last][0], [last, i])
        last = i
      }
    }

    this.computeNullables()
    this.computeFirsts()
    this.computeFollows()
    this._checks = this.sanityCheck()
  }

  public getProductions(symbol?: Symbol): Productions {
    if (symbol) {
      const loc = this.getProductionsIndex(symbol)
      if (loc) return this._productions.slice(...loc)
      else return []
    }
    return this._productions
  }

  public getProductionsIndex(symbol: Symbol): [number, number] | undefined {
    const loc = this._productionsIndexMap.get(symbol)
    if (loc) return loc
    else return undefined
  }

  public nonTerminals(): Set<Symbol> {
    return new Set(this._nonTerminals)
  }

  public nonTerminal(symbol: Symbol): boolean {
    return this._nonTerminals.has(symbol)
  }

  public terminals(): Set<Symbol> {
    return new Set(this._terminals)
  }

  public terminal(symbol: Symbol): boolean {
    return this._terminals.has(symbol)
  }

  public nullable(symbol: Symbol | Alternative): boolean {
    if (Array.isArray(symbol)) return this.NULLABLE(symbol)
    return this._nullables.has(symbol)
  }

  public nullables(): Set<Symbol> {
    return new Set(this._nullables)
  }

  public first(symbol: Symbol | Alternative): Set<Symbol> {
    if (Array.isArray(symbol)) return this.FIRST(symbol)
    const set = this._firsts.get(symbol)
    return new Set(set ? set : this.terminal(symbol) ? [symbol] : [])
  }

  public firsts(): Firsts {
    return new Map(this._firsts)
  }

  public follow(symbol: Symbol): Set<Symbol> {
    const set = this._follows.get(symbol)
    return set ? new Set(set) : new Set()
  }

  public follows(): Follows {
    return new Map(this._follows)
  }

  public checks(): CheckResult {
    return { ...this._checks }
  }

  protected getSymbolIndex(symbol: Symbol) {
    const set = this._indexMap.get(symbol)
    return new Set(set ? set : [])
  }

  private addProduction(symbol: Symbol, alternative: Alternative): Production {
    if (alternative.length === 0) alternative = []
    const production: Production = [symbol, alternative]
    this._nonTerminals.add(symbol)
    this._terminals.delete(symbol)
    alternative.forEach((s, i) => this.addSymbolIndex(s, production, i))
    return production
  }

  private addSymbolIndex(symbol: Symbol, production: Production, index: number) {
    if (!this.nonTerminal(symbol)) this._terminals.add(symbol)

    const indexSet = this._indexMap.get(symbol)
    if (indexSet) {
      indexSet.add([production, index])
    } else {
      this._indexMap.set(symbol, new Set([[production, index]]))
    }
  }

  private NULLABLE(symbol: Symbol | Alternative): boolean {
    if (Array.isArray(symbol)) {
      return symbol.reduce((p, v) => this.nullable(v) && p, <boolean>true)
    } else return this.nullable(symbol)
  }

  private computeNullables() {
    // It's a fixed-point iteration
    let changed
    do {
      changed = false
      for (const n of this.nonTerminals()) {
        let newValue = false
        for (const production of this.getProductions(n)) {
          const [, alternative] = production
          newValue = newValue || this.NULLABLE(alternative)
          if (newValue) break
        }
        if (newValue !== this.nullable(n)) {
          this._nullables.add(n)
          changed = true
        }
      }
    } while (changed)
  }

  private FIRST(symbol: Symbol | Alternative): Set<Symbol> {
    if (Array.isArray(symbol)) {
      const [s, ...y] = symbol
      const set = this.FIRST(s)
      if (this.nullable(s)) {
        this.FIRST(y).forEach(e => set.add(e))
      }
      return set
    } else if (this.terminal(symbol)) return new Set([symbol])
    else if (this.nonTerminal(symbol)) {
      const set = this.first(symbol)
      return set ? new Set(set) : new Set()
    } else return new Set()
  }

  private computeFirsts() {
    let changed
    do {
      changed = false
      for (const n of this.nonTerminals()) {
        const newValue = new Set()
        for (const production of this.getProductions(n)) {
          const [, alternative] = production
          this.FIRST(alternative).forEach(s => newValue.add(s))
        }

        if (newValue.size !== this.first(n).size) {
          this._firsts.set(n, newValue)
          changed = true
        }
      }
    } while (changed)
  }

  private FOLLOW(symbol: Symbol | [Symbol, Alternative]): Set<Symbol> {
    if (Array.isArray(symbol)) {
      const [s, right] = symbol
      const set = this.FIRST(right)
      if (this.NULLABLE(right)) this.FOLLOW(s).forEach(e => set.add(e))
      return set
    } else return this.follow(symbol)
  }

  private computeFollows() {
    let changed
    do {
      changed = false
      for (const n of this.nonTerminals()) {
        const newValue = new Set()

        for (const [[s, a], i] of this.getSymbolIndex(n)) {
          this.FOLLOW([s, a.slice(i + 1)]).forEach(e => newValue.add(e))
        }

        if (newValue.size !== this.follow(n).size) {
          this._follows.set(n, newValue)
          changed = true
        }
      }
    } while (changed)
  }

  private sanityCheck(): CheckResult {
    return {
      unreachable: this.unreachable(),
      unrealizable: this.unrealizable(),
    }
  }

  private unreachable(): Set<Symbol> {
    const visited: Set<Symbol> = new Set()
    const stack: Array<Symbol> = [$accept]

    while (stack.length) {
      const top = stack.pop()!
      visited.add(top)
      for (const [, alternative] of this.getProductions(top)) {
        for (const s of alternative) {
          if (this.nonTerminal(s) && !visited.has(s)) {
            stack.push(s)
          }
        }
      }
    }

    return difference(this.nonTerminals(), visited)
  }

  private unrealizable(): Set<Symbol> {
    const marked: Set<Symbol> = new Set()

    let changed
    do {
      changed = false
      const rest = difference(this.nonTerminals(), marked)
      for (const n of rest) {
        for (const [, a] of this.getProductions(n)) {
          if (a.reduce((p, c) => (p && this.nonTerminal(c) ? marked.has(c) : true), true)) {
            marked.add(n)
            changed = true
          }
        }
      }
    } while (changed)

    return difference(this.nonTerminals(), marked)
  }
}
