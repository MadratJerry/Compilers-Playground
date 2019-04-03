export interface IMonarchLanguage {
  tokenizer: IMonarchLanguageTokenizer
}
export interface IMonarchLanguageJSON extends IMonarchLanguage {
  [expression: string]: IMonarchLanguageTokenizer | RegExp | string[] | string
}

export interface IMonarchLanguageTokenizer {
  [stateName: string]: IMonarchLanguageRule[]
}

export type IMonarchLanguageRule = IShortMonarchLanguageRule | IExpandedMonarchLanguageRule
export type IShortMonarchLanguageRule = [RegExp, IMonarchLanguageAction]
export interface IExpandedMonarchLanguageRule {
  regex: RegExp
  action: IMonarchLanguageAction
}

export type IMonarchLanguageAction =
  | IShortMonarchLanguageAction
  | IExpandedMonarchLanguageAction
  | IShortMonarchLanguageAction[]
  | IExpandedMonarchLanguageAction[]
export type IShortMonarchLanguageAction = string
export interface IExpandedMonarchLanguageAction {
  group?: IMonarchLanguageAction[]
  cases?: { [guard: string]: IMonarchLanguageAction }
  token?: string
}

export interface IMonarchState {
  name: string
}
