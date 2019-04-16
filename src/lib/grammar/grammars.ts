import { Token } from '@/lib/tokenizer'
import * as Grammar from './grammarTypes'

export const epsilon = 'ϵ'
export const NonTerminal = 'NonTerminal'
export const Terminal = 'Terminal'

class Grammars {
  private readonly _productions: Grammar.ProductionsMap<Grammar.Symbol> = new Map()
  private readonly _symbolMap: Grammar.SymbolMap = new Map([[epsilon, Terminal]])

  constructor(productions: Grammar.Productions<Token>) {
    for (const production of productions) {
      const [symbol, alternatives] = production
      for (const alternative of alternatives)
        this._addProduction(this._addSymbol(symbol), alternative.map(t => this._addSymbol(t)))
    }
  }

  public getProductions(): Grammar.ProductionsMap<Grammar.Symbol> {
    return this._productions
  }

  public getAlternatives(symbol: Grammar.Symbol): Grammar.Alternatives<Grammar.Symbol> {
    let alternatives = this._productions.get(symbol)
    if (alternatives) return alternatives
    else {
      alternatives = []
      this._productions.set(symbol, alternatives)
      return alternatives
    }
  }

  public getSymbolType(symbol: string): string | undefined {
    return this._symbolMap.get(symbol)
  }

  private _addSymbol(symbol: Token): string {
    const symbolType = this._symbolMap.get(symbol.token)
    if (symbolType === undefined) {
      this._symbolMap.set(symbol.token, symbol.type)
    } else {
      if (symbolType !== symbol.type)
        throw new Error(`The symbol '${symbol.token} can't be both ${symbolType} and ${symbol.type}`)
    }
    return symbol.token
  }

  private _addProduction(symbol: Grammar.Symbol, alternative: Grammar.Alternative<Grammar.Symbol>) {
    if (alternative.length === 0) alternative = [epsilon]
    const alternatives = this.getAlternatives(symbol)
    alternatives.push(alternative)
  }
}

export default Grammars
