import {
  Terminal,
  NonTerminal,
  epsilon,
  Alternative,
  Firsts,
  Follows,
  Productions,
  Symbol,
  symbolSet,
  Production,
} from '.'
import { Grammar } from './grammar'

export class LeftRecursionError extends Error {}
export class CommonPrefixError extends Error {}
export class DanglingElseError extends Error {}

function checkLeftRecursion() {
  return function(
    _target: unknown,
    _propertyName: string,
    descriptor: TypedPropertyDescriptor<(symbol: Symbol | Alternative) => Set<Symbol>>,
  ) {
    let method = descriptor.value || new Function()
    descriptor.value = function(this: LL1Grammar) {
      const symbol = arguments[0]
      if (this[symbolSet].has(symbol)) throw new LeftRecursionError(`Symbol '${symbol}' is left recursion`)
      else this[symbolSet].add(symbol)
      const result = method.apply(this, arguments)
      this[symbolSet].delete(symbol)
      return result
    }
  }
}

function intersection<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter(v => b.has(v)))
}

export class LL1Grammar extends Grammar {
  [symbolSet] = new Set()
  private readonly _firsts: Firsts = new Map()
  private readonly _follows: Follows = new Map()

  constructor(productions: Productions) {
    super(productions)

    this.nonTerminals().forEach(s => this._firsts.set(s, this.first(s)) && this._follows.set(s, this.follow(s)))

    this.nonTerminals().forEach(s => {
      const loc = this._productionsIndexMap.get(s)
      if (loc) {
        const [start, end] = loc
        for (let i = start; i < end - 1; i++)
          for (let j = i + 1; j < end; j++) {
            const [pa, pb] = [this._productions[i], this._productions[j]]
            const [[, a], [, b]] = [pa, pb]
            if (intersection(this.first(a), this.first(b)).size > 0)
              throw new CommonPrefixError(
                `Grammars have common prefix, because FIRST(${this.proudctionToString(
                  pa,
                )}) and FIRST(${this.proudctionToString(pb)}) are not disjoint sets`,
              )
            if (this.first(a).has(epsilon) && intersection(this.first(b), this.follow(s)).size > 0)
              throw new DanglingElseError(
                `Grammars have dangling else, because FIRST(${this.proudctionToString(
                  pb,
                )}) and FOLLOW(${s}) are not disjoint sets`,
              )
            if (this.first(b).has(epsilon) && intersection(this.first(a), this.follow(s)).size > 0)
              throw new DanglingElseError(
                `Grammars have dangling else, because FIRST(${this.proudctionToString(
                  pa,
                )}) and FOLLOW(${s}) are not disjoint sets`,
              )
          }
      }
    })
  }

  public firsts(): Firsts {
    return this._firsts
  }

  public follows(): Follows {
    return this._follows
  }

  @checkLeftRecursion()
  public first(symbol: Symbol | Alternative): Set<Symbol> {
    if (Array.isArray(symbol)) {
      if (symbol.length) return new Set(this.first(symbol[0]))
      else return new Set([epsilon])
    }

    if (this.terminal(symbol) || symbol === epsilon) return new Set([symbol])
    else if (this.nonTerminal(symbol)) {
      const set = this._firsts.get(symbol)
      if (set) return new Set(set)

      const newSet = new Set()
      const productions = this.getProductions(symbol)
      for (const [, alternative] of productions) {
        if (alternative.length) {
          this.first(alternative[0]).forEach(s => newSet.add(s))
        } else newSet.add(epsilon)
      }

      this._firsts.set(symbol, newSet)
      return newSet
    } else throw new Error(`Symbol can only be '${Terminal}' or '${NonTerminal}'`)
  }

  public follow(symbol: Symbol): Set<Symbol> {
    const indexSet = this.getSymbolIndex(symbol)
    const set = this._follows.get(symbol)
    if (set) return set

    const newSet = new Set()
    if (indexSet) {
      this._follows.set(symbol, newSet)
      indexSet.forEach(([[s, a], i]) => {
        const firstSet = this.first(a.slice(i + 1))
        firstSet.delete(epsilon)
        firstSet.forEach(s => newSet.add(s))
      })
      indexSet.forEach(([[s, a], i]) => {
        const rest = a.slice(i + 1)
        if ((rest.length === 0 || this.first(rest).has(epsilon)) && symbol !== s)
          this.follow(s).forEach(s => newSet.add(s))
      })
    }

    return newSet
  }

  private proudctionToString(p: Production): string {
    return `${p[0]} -> ${p[1].join(' ')}`
  }
}
