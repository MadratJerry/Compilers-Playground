import { Productions, IndexMap, ProductionsIndexMap, Alternative, Production, Symbol } from './grammarTypes'
import { $end, $accept } from '.'

export class Grammar {
  protected readonly _productions: Productions
  protected readonly _indexMap: IndexMap = new Map()
  protected readonly _productionsIndexMap: ProductionsIndexMap = new Map()
  public readonly terminals = new Set([$end])
  public readonly nonTerminals = new Set([$accept])

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
  }

  public getProductions(symbol?: Symbol): Productions {
    if (symbol) {
      const loc = this._productionsIndexMap.get(symbol)
      if (loc) return this._productions.slice(...loc)
      else return []
    }
    return this._productions
  }

  protected getSymbolIndex(symbol: Symbol) {
    return this._indexMap.get(symbol)
  }

  private addProduction(symbol: Symbol, alternative: Alternative): Production {
    if (alternative.length === 0) alternative = []
    const production: Production = [symbol, alternative]
    this.nonTerminals.add(symbol)
    this.terminals.delete(symbol)
    alternative.forEach((s, i) => this.addSymbolIndex(s, production, i))
    return production
  }

  private addSymbolIndex(symbol: Symbol, production: Production, index: number) {
    if (!this.nonTerminals.has(symbol)) this.terminals.add(symbol)

    const indexSet = this._indexMap.get(symbol)
    if (indexSet) {
      indexSet.add([production, index])
    } else {
      this._indexMap.set(symbol, new Set([[production, index]]))
    }
  }
}
