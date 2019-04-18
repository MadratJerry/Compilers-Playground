import { Token } from '@/lib/tokenizer'
import * as Grammar from './grammarTypes'

export const $accept = '$accept'
export const $end = '$end'
export const epsilon = 'ε'
export const NonTerminal = 'NonTerminal'
export const Terminal = 'Terminal'

class Grammars {
  private readonly _productions: Grammar.Productions<Grammar.Symbol>
  private readonly _productionsIndexMap: Grammar.ProductionsIndexMap<Grammar.Symbol> = new Map()
  private readonly _indexMap: Grammar.IndexMap<Grammar.Symbol> = new Map()
  protected readonly _terminals = new Set([epsilon, $end])
  protected readonly _nonTerminals = new Set([$accept])

  constructor(productions: Grammar.Productions<Token>) {
    this._productions = productions.map(([symbol, alternative]) =>
      this.addProduction(this.addSymbol(symbol), alternative.map(t => this.addSymbol(t))),
    )
    this._productions.push(this.addProduction($accept, [this._productions[0][0], $end]))
    this._productions.sort()
    for (let i = 0, last = 0; i <= this._productions.length; i++) {
      if ((this._productions[i] || [])[0] !== (this._productions[last] || [])[0]) {
        this._productionsIndexMap.set(this._productions[last][0], [last, i])
        last = i
      }
    }
  }

  public getProductions(symbol?: Grammar.Symbol): Grammar.Productions<Grammar.Symbol> {
    if (symbol) {
      const loc = this._productionsIndexMap.get(symbol)
      if (loc) return this._productions.slice(...loc)
      else return []
    }
    return this._productions
  }

  protected getSymbolIndex(symbol: Grammar.Symbol) {
    return this._indexMap.get(symbol)
  }

  private addSymbol({ token, type }: Token): string {
    if (type === Terminal) {
      if (this._nonTerminals.has(token))
        throw new Error(`The symbol '${token} can't be both ${Terminal} and ${NonTerminal}`)
      this._terminals.add(token)
    } else if (type === NonTerminal) {
      if (this._terminals.has(token))
        throw new Error(`The symbol '${token} can't be both ${Terminal} and ${NonTerminal}`)
      this._nonTerminals.add(token)
    } else throw new Error(`Symbol can only be '${Terminal}' and '${NonTerminal}'`)
    return token
  }

  private addProduction(
    symbol: Grammar.Symbol,
    alternative: Grammar.Alternative<Grammar.Symbol>,
  ): Grammar.Production<Grammar.Symbol> {
    if (alternative.length === 0) alternative = [epsilon]
    const production: Grammar.Production<Grammar.Symbol> = [symbol, alternative]
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
