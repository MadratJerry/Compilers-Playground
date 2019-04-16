import Token from '@/lib/tokenizer/token'
import * as Grammar from './grammarTypes'

export const epsilon = 'ϵ'
export const NonTerminal = 'NonTerminal'
export const Terminal = 'Terminal'

class Grammars {
  private readonly _productions: Grammar.ProductionsMap = new Map()
  private readonly _symbolMap: Grammar.SymbolMap = new Map([[epsilon, Terminal]])

  public addSymbol(symbol: Token): string {
    const symbolType = this._symbolMap.get(symbol.token)
    if (symbolType === undefined) {
      this._symbolMap.set(symbol.token, symbol.type)
    } else {
      if (symbolType !== symbol.type)
        throw new Error(`The symbol '${symbol.token} can't be both ${symbolType} and ${symbol.type}`)
    }
    return symbol.token
  }

  public getSymbolType(symbol: string): string | undefined {
    return this._symbolMap.get(symbol)
  }

  public addProduction(symbol: Token, alternative: Array<Token>) {
    this._addProduction(this.addSymbol(symbol), alternative.map(t => this.addSymbol(t)))
  }

  public getAlternatives(symbol: Grammar.Symbol): Grammar.Alternatives {
    let alternatives = this._productions.get(symbol)
    if (alternatives) return alternatives
    else {
      alternatives = []
      this._productions.set(symbol, alternatives)
      return alternatives
    }
  }
  public getProductions(): Grammar.ProductionsMap {
    return this._productions
  }

  private _addProduction(symbol: Grammar.Symbol, alternative: Grammar.Alternative) {
    if (alternative.length === 0) alternative = [epsilon]
    const alternatives = this.getAlternatives(symbol)
    alternatives.push(alternative)
  }
}

export default Grammars
