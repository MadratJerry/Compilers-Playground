export interface IMonarchLanguage {
  tokenizer: IMonarchLanguageTokenizer
  [expession: string]: IMonarchLanguageTokenizer | RegExp | string[]
}

export interface IMonarchLanguageTokenizer {
  [stateName: string]: IMonarchLanguageRule
}

export type IMonarchLanguageRule = Array<[RegExp, string]>

export interface IMonarchState {
  name: string
}
