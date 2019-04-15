import Token from '@/lib/tokenizer/token'

export declare namespace SyntaxType {
  export type Symbol = string
  export type SymbolMap = Map<string, Token['type']>
  export type Alternative = Array<Symbol>
  export type Alternatives = Array<Alternative>
  export type Production = [Symbol, Alternatives]
  export type Productions = Array<Production>
  export type ProductionsMap = Map<Symbol, Alternatives>
  export type Firsts = Map<Symbol, Set<Symbol>>
}
