import { Token } from '@/lib/tokenizer'
import * as Grammar from './grammarTypes'

export const $accept = '$accept'
export const $end = '$end'
export const epsilon = 'ϵ'
export const NonTerminal = 'NonTerminal'
export const Terminal = 'Terminal'

class Grammars {
  private readonly _productions: Grammar.ProductionsMap<Grammar.Symbol> = new Map()
  private readonly _symbolMap: Grammar.SymbolMap = new Map([[epsilon, Terminal]])
  protected readonly _symbolIndexMap: Grammar.SymbolIndexMap<Grammar.Symbol> = new Map()

  constructor(productions: Grammar.Productions<Token>) {
    productions = [
      [new Token(0, $accept, NonTerminal), [[productions[0][0], new Token(0, $end, Terminal)]]],
      ...productions,
    ]
    for (const production of productions) {
      const [symbol, alternatives] = production
      for (const alternative of alternatives)
        this.addProduction(this.addSymbol(symbol), alternative.map(t => this.addSymbol(t)))
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

  private addSymbol(symbol: Token): string {
    const symbolType = this._symbolMap.get(symbol.token)
    if (symbolType === undefined) {
      this._symbolMap.set(symbol.token, symbol.type)
    } else {
      if (symbolType !== symbol.type)
        throw new Error(`The symbol '${symbol.token} can't be both ${symbolType} and ${symbol.type}`)
    }
    return symbol.token
  }

  private addProduction(symbol: Grammar.Symbol, alternative: Grammar.Alternative<Grammar.Symbol>) {
    if (alternative.length === 0) alternative = [epsilon]
    const alternatives = this.getAlternatives(symbol)
    alternatives.push(alternative)
    alternative.forEach((s, i) => this.addSymbolIndex(s, symbol, alternative, i))
  }

  private addSymbolIndex(
    symbol: Grammar.Symbol,
    nonTerminal: Grammar.Symbol,
    alternative: Grammar.Alternative<Grammar.Symbol>,
    index: number,
  ) {
    const indexSet = this._symbolIndexMap.get(symbol)
    if (indexSet) {
      indexSet.add([nonTerminal, alternative, index])
    } else {
      this._symbolIndexMap.set(symbol, new Set([[nonTerminal, alternative, index]]))
    }
  }
}

export default Grammars
