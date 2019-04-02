export interface IMonarchLanguage {
  tokenizer: IMonarchLanguageTokenizer
}
export interface IMonarchLanguageJSON extends IMonarchLanguage {
  [expression: string]: IMonarchLanguageTokenizer | RegExp | string[] | string
}

export interface IMonarchLanguageTokenizer {
  [stateName: string]: IMonarchLanguageRule[]
}

export type IMonarchLanguageRule = [RegExp, string] | { regex: RegExp; action: string }

export interface IMonarchState {
  name: string
}
