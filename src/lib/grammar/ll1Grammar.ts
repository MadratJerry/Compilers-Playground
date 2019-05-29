import { intersection } from '@/lib/enhance'
import { Productions, Production } from './grammarTypes'
import { Grammar, epsilon } from './grammar'

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

  private check(): Error | null {
    for (const s of this.nonTerminals()) {
      const loc = this._productionsIndexMap.get(s)
      if (loc) {
        const [start, end] = loc
        for (let i = start; i < end - 1; i++)
          for (let j = i + 1; j < end; j++) {
            const [pa, pb] = [this._productions[i], this._productions[j]]
            const [[, a], [, b]] = [pa, pb]
            if (intersection(this.first(a), this.first(b)).size > 0)
              return new CommonPrefixError(
                `Grammars have common prefix, because FIRST(${production(pa)}) and FIRST(${production(
                  pb,
                )}) are not disjoint sets.`,
              )
            if (this.nullable(a) && intersection(this.first(b), this.follow(s)).size > 0)
              return new DanglingElseError(
                `Grammars have dangling else, because FIRST(${production(pb)}) and FOLLOW(${s}) are not disjoint sets.`,
              )
            if (this.nullable(b) && intersection(this.first(a), this.follow(s)).size > 0)
              return new DanglingElseError(
                `Grammars have dangling else, because FIRST(${production(pa)}) and FOLLOW(${s}) are not disjoint sets.`,
              )
          }
      }
    }
    return null
  }
}
