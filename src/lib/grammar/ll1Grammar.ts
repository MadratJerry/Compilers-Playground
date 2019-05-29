import { intersection } from '@/lib/enhance'
import { Productions, Production, Symbol } from './grammarTypes'
import { Grammar, epsilon, $accept } from './grammar'

export class LeftRecursionError extends Error {}
export class CommonPrefixError extends Error {}
export class DanglingElseError extends Error {}

export const production = (p: Production | undefined): string =>
  p ? `${p[0]} -> ${p[1].length ? p[1].join(' ') : epsilon}` : ``

export class LL1Grammar extends Grammar {
  private _error: Error | null

  constructor(grammar: Grammar)
  constructor(productions: Productions)
  constructor(p: Productions | Grammar) {
    if (p instanceof Grammar) {
      const grammar = p
      super([])
      Object.assign(this, grammar)
    } else super(p)
    this._error = this.check()
  }

  public error(): Error | null {
    return this._error
  }

  private checkRecursive(symbol: Symbol): Array<Symbol> {
    const stack: Array<Symbol> = []
    const set: Set<Symbol> = new Set()
    const dfs = (s: Symbol) => {
      stack.push(s)
      set.add(s)
      if (stack.length !== set.size) return false
      for (const [, [to]] of this.getProductions(s)) if (this.nonTerminal(to) && !dfs(to)) return false
      set.delete(s)
      stack.pop()
      return true
    }
    dfs(symbol)
    return stack
  }

  private check(): Error | null {
    // Ignore the $accept
    const checked: Set<Symbol> = new Set([$accept])

    for (const s of this.nonTerminals()) {
      const chain = checked.has(s) ? [] : this.checkRecursive(s)
      if (chain.length)
        return new LeftRecursionError(`Grammar contains left recursion, the recursive chain is ${chain.join(' -> ')}`)
      const [start, end] = this.getProductionsIndex(s)!
      for (let i = start; i < end - 1; i++)
        for (let j = i + 1; j < end; j++) {
          const [pa, pb] = [this._productions[i], this._productions[j]]
          const [[, a], [, b]] = [pa, pb]
          if (intersection(this.first(a), this.first(b)).size > 0)
            return new CommonPrefixError(
              `Grammar contains common prefix, because FIRST(${production(pa)}) and FIRST(${production(
                pb,
              )}) are not disjoint sets.`,
            )
          if (this.nullable(a) && intersection(this.first(b), this.follow(s)).size > 0)
            return new DanglingElseError(
              `Grammar contains dangling else, because FIRST(${production(
                pb,
              )}) and FOLLOW(${s}) are not disjoint sets.`,
            )
          if (this.nullable(b) && intersection(this.first(a), this.follow(s)).size > 0)
            return new DanglingElseError(
              `Grammar contains dangling else, because FIRST(${production(
                pa,
              )}) and FOLLOW(${s}) are not disjoint sets.`,
            )
        }
    }
    return null
  }
}
