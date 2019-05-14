import { Productions, IndexMap, ProductionsIndexMap, Alternative, Production, Symbol, Firsts } from './grammarTypes'
import { $end, $accept } from '.'

export class Grammar {
  protected readonly _productions: Productions
  protected readonly _indexMap: IndexMap = new Map()
  protected readonly _productionsIndexMap: ProductionsIndexMap = new Map()
  private readonly _terminals = new Set([$end])
  private readonly _nonTerminals = new Set([$accept])
  private readonly _nullables = new Set()
  private readonly _firsts: Firsts = new Map()

  constructor(productions: Productions) {
    this._productions = productions.map(([symbol, alternative]) => this.addProduction(symbol, alternative))
    this._productions.push(this.addProduction($accept, [this._productions[0][0], $end]))
    this._productions.sort()

    for (let i = 0, last = 0; i <= this._productions.length; i++) {
      if ((this._productions[i] || [])[0] !== (this._productions[last] || [])[0]) {
        this._productionsIndexMap.set(this._productions[last][0], [last, i])
        last = i
      }
    }

    this.computeNullables()
    this.computeFirsts()
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
    return this._nonTerminals
  }

  public nonTerminal(symbol: Symbol): boolean {
    return this._nonTerminals.has(symbol)
  }

  public terminals(): Set<Symbol> {
    return this._terminals
  }

  public terminal(symbol: Symbol): boolean {
    return this._terminals.has(symbol)
  }

  public nullable(symbol: Symbol | Alternative): boolean {
    if (Array.isArray(symbol)) {
      return symbol.reduce((p, v) => this.nullable(v) && p, <boolean>true)
    } else return this._nullables.has(symbol)
  }

  public nullables(): Set<Symbol> {
    return this._nullables
  }

  public first(symbol: Symbol): Set<Symbol> {
    const set = this._firsts.get(symbol)
    return new Set(set ? set : [])
  }

  public firsts(): Firsts {
    return this._firsts
  }

  protected getSymbolIndex(symbol: Symbol) {
    return this._indexMap.get(symbol)
  }

  private addProduction(symbol: Symbol, alternative: Alternative): Production {
    if (alternative.length === 0) alternative = []
    const production: Production = [symbol, alternative]
    this.nonTerminals().add(symbol)
    this.terminals().delete(symbol)
    alternative.forEach((s, i) => this.addSymbolIndex(s, production, i))
    return production
  }

  private addSymbolIndex(symbol: Symbol, production: Production, index: number) {
    if (!this.nonTerminal(symbol)) this.terminals().add(symbol)

    const indexSet = this._indexMap.get(symbol)
    if (indexSet) {
      indexSet.add([production, index])
    } else {
      this._indexMap.set(symbol, new Set([[production, index]]))
    }
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
          newValue = newValue || this.nullable(alternative)
          if (newValue) break
        }
        if (newValue !== this.nullable(n)) {
          this.nullables().add(n)
          changed = true
        }
      }
    } while (changed)
  }

  private computeFirsts() {
    const FIRST = (symbol: Symbol | Alternative): Set<Symbol> => {
      if (Array.isArray(symbol)) {
        const [s, ...y] = symbol
        const set = FIRST(s)
        if (this.nullable(s)) {
          FIRST(y).forEach(e => set.add(e))
        }
        return set
      } else if (this.terminal(symbol)) return new Set([symbol])
      else if (this.nonTerminal(symbol)) {
        const set = this.first(symbol)
        return set ? new Set(set) : new Set()
      } else return new Set()
    }

    let changed
    do {
      changed = false
      for (const n of this.nonTerminals()) {
        const newValue = new Set()
        for (const production of this.getProductions(n)) {
          const [, alternative] = production
          FIRST(alternative).forEach(s => newValue.add(s))
        }

        if (newValue.size !== this.first(n).size) {
          this.firsts().set(n, newValue)
          changed = true
        }
      }
    } while (changed)
  }
        if (newValue.size !== this.first(n).size) {
          this._firsts.set(n, newValue)
          changed = true
        }
      }
    } while (changed)
  }
}
