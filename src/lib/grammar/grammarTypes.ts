import { Token } from '@/lib/tokenizer'

export type Symbol = string
export type SymbolMap = Map<string, Token['type']>
export type Alternative<T> = Array<T>
export type Alternatives<T> = Array<Alternative<T>>
export type Production<T> = [T, Alternatives<T>]
export type Productions<T> = Array<Production<T>>
export type ProductionsMap<T> = Map<T, Alternatives<T>>
export type Firsts<T> = Map<T, Set<T>>
