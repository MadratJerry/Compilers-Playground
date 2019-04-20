import { Token } from '@/lib/tokenizer'
import Grammars, { Terminal, NonTerminal, epsilon, $accept } from './grammars'
import * as Grammar from './grammarTypes'

export class LeftRecursionError extends Error {}
export class CommonPrefixError extends Error {}
export class DanglingElseError extends Error {}

const symbolSet = Symbol('SymbolSet')

function checkLeftRecursion() {
  return function(
    _target: unknown,
    _propertyName: string,
    descriptor: TypedPropertyDescriptor<
      (symbol: Grammar.Symbol | Grammar.Alternative<Grammar.Symbol>) => Set<Grammar.Symbol>
    >,
  ) {
    let method = descriptor.value || new Function()
    descriptor.value = function(this: LL1Grammars) {
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

export default class LL1Grammars extends Grammars {
  [symbolSet] = new Set()
  private readonly _firsts: Grammar.Firsts<Grammar.Symbol> = new Map()
  private readonly _follows: Grammar.Follows<Grammar.Symbol> = new Map()

  constructor(productions: Grammar.Productions<Token>) {
    super(productions)

    this.nonTerminals.forEach(s => this._firsts.set(s, this.first(s)) && this._follows.set(s, this.follow(s)))

    this.nonTerminals.forEach(s => {
      const loc = this._productionsIndexMap.get(s)
      if (loc) {
        const [start, end] = loc
        for (let i = start; i < end - 1; i++)
          for (let j = start + 1; j < end; j++) {
            const [[, a], [, b]] = [this._productions[i], this._productions[j]]
            if (intersection(this.first(a), this.first(b)).size > 0)
              throw new CommonPrefixError(
                `Grammars have common prefix, because FIRST(${a}) and FIRST(${b}) are not disjoint sets`,
              )
            if (this.first(a).has(epsilon) && intersection(this.first(b), this.follow(s)).size > 0)
              throw new DanglingElseError(
                `Grammars have dangling else, because FIRST(${b}) and FOLLOW(${s}) are not disjoint sets`,
              )
            if (this.first(b).has(epsilon) && intersection(this.first(a), this.follow(s)).size > 0)
              throw new DanglingElseError(
                `Grammars have dangling else, because FIRST(${a}) and FOLLOW(${s}) are not disjoint sets`,
              )
          }
      }
    })
  }

  public firsts(): Grammar.Firsts<Grammar.Symbol> {
    return this._firsts
  }

  public follows(): Grammar.Follows<Grammar.Symbol> {
    return this._follows
  }

  @checkLeftRecursion()
  public first(symbol: Grammar.Symbol | Grammar.Alternative<Grammar.Symbol>): Set<Grammar.Symbol> {
    if (Array.isArray(symbol)) {
      if (symbol.length) return new Set(this.first(symbol[0]))
      else return new Set([epsilon])
    }

    if (this.terminals.has(symbol) || symbol === epsilon) return new Set([symbol])
    else if (this.nonTerminals.has(symbol)) {
      const set = this._firsts.get(symbol)
      if (set) return new Set(set)

      const newSet = new Set()
      const productions = this.getProductions(symbol)
      for (const [, alternative] of productions) {
        if (alternative.length) {
          this.first(alternative[0]).forEach(s => newSet.add(s))
        }
      }

      this._firsts.set(symbol, newSet)
      return newSet
    } else throw new Error(`Symbol can only be '${Terminal}' or '${NonTerminal}'`)
  }

  public follow(symbol: Grammar.Symbol): Set<Grammar.Symbol> {
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
}
