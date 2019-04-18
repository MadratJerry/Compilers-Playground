import { Token } from '@/lib/tokenizer'

export type Symbol = string
export type TypeMap = Map<string, Token['type']>
export type Alternative<T> = Array<T>
export type Alternatives<T> = Array<Alternative<T>>
export type Production<T> = [T, Alternative<T>]
export type Productions<T> = Array<Production<T>>
export type AlternativesMap<T> = Map<T, Alternatives<T>>
export type Firsts<T> = Map<T, Set<T>>
export type Follows<T> = Map<T, Set<T>>
export type IndexMap<T> = Map<T, Set<[Production<T>, number]>>
