import { Token } from '@/lib/tokenizer'
import * as Grammar from './grammarTypes'

export const $accept = '$accept'
export const $end = '$end'
export const epsilon = 'ε'
export const NonTerminal = 'NonTerminal'
export const Terminal = 'Terminal'

class Grammars {
  private readonly _productions: Grammar.Productions<Grammar.Symbol>
  private readonly _alternativesMap: Grammar.AlternativesMap<Grammar.Symbol> = new Map()
  private readonly _typeMap: Grammar.TypeMap = new Map([[epsilon, Terminal]])
  protected readonly _indexMap: Grammar.IndexMap<Grammar.Symbol> = new Map()

  constructor(productions: Grammar.Productions<Token>) {
    this._productions = productions.map(([symbol, alternative]) =>
      this.addProduction(this.addSymbol(symbol), alternative.map(t => this.addSymbol(t))),
    )
    this._productions.push([$accept, [this._productions[0][0], $end]])
    this._productions.sort()
  }

  public getProductions(): Grammar.Productions<Grammar.Symbol> {
    return this._productions
  }

  public getAlternatives(symbol: Grammar.Symbol): Grammar.Alternatives<Grammar.Symbol> {
    let alternatives = this._alternativesMap.get(symbol)
    if (alternatives) return alternatives
    else {
      alternatives = []
      this._alternativesMap.set(symbol, alternatives)
      return alternatives
    }
  }

  public getSymbolType(symbol: string): string | undefined {
    return this._typeMap.get(symbol)
  }

  private addSymbol(symbol: Token): string {
    const symbolType = this._typeMap.get(symbol.token)
    if (symbolType === undefined) {
      this._typeMap.set(symbol.token, symbol.type)
    } else {
      if (symbolType !== symbol.type)
        throw new Error(`The symbol '${symbol.token} can't be both ${symbolType} and ${symbol.type}`)
    }
    return symbol.token
  }

  private addProduction(
    symbol: Grammar.Symbol,
    alternative: Grammar.Alternative<Grammar.Symbol>,
  ): Grammar.Production<Grammar.Symbol> {
    if (alternative.length === 0) alternative = [epsilon]
    const production: Grammar.Production<Grammar.Symbol> = [symbol, alternative]
    const alternatives = this.getAlternatives(symbol)
    alternatives.push(alternative)
    alternative.forEach((s, i) => this.addSymbolIndex(s, production, i))
    return production
  }

  private addSymbolIndex(symbol: Grammar.Symbol, production: Grammar.Production<Grammar.Symbol>, index: number) {
    const indexSet = this._indexMap.get(symbol)
    if (indexSet) {
      indexSet.add([production, index])
    } else {
      this._indexMap.set(symbol, new Set([[production, index]]))
    }
  }
}

export default Grammars
