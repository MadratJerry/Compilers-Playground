import { intersection } from '@/lib/enhance'
import { Productions, Production } from './grammarTypes'
import { Grammar, epsilon } from './grammar'

export class LeftRecursionError extends Error {}
export class CommonPrefixError extends Error {}
export class DanglingElseError extends Error {}

export class LL1Grammar extends Grammar {
  constructor(productions: Productions) {
    super(productions)

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

  private proudctionToString(p: Production): string {
    return `${p[0]} -> ${p[1].join(' ')}`
  }
}
