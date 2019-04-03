export interface IMonarchLanguage {
  tokenizer: IMonarchLanguageTokenizer
  expressions: IMonarchLanguageExpressions
}
export interface ICompiledMonarchLanguage {
  tokenizer: ICompiledMonarchLanguageTokenizer
}

export interface IMonarchLanguageExpressions {
  [name: string]: IMonarchLanguageExpression
}
export type IMonarchLanguageExpression = string | string[] | RegExp

export interface IMonarchLanguageTokenizer {
  [stateName: string]: IMonarchLanguageRule[]
}
export interface ICompiledMonarchLanguageTokenizer {
  [stateName: string]: ICompiledMonarchLanguageRule[]
}

export type IMonarchLanguageRule = IShortMonarchLanguageRule | ICompiledMonarchLanguageRule
export type IShortMonarchLanguageRule = [RegExp, IMonarchLanguageAction]
export interface ICompiledMonarchLanguageRule {
  regex: RegExp
  action: ICompiledMonarchLanguageAction
}

export type IMonarchLanguageAction =
  | string
  | IArrayMonarchLanguageAction
  | ICompiledMonarchLanguageAction
  | { token?: string; cases?: { [guard: string]: IMonarchLanguageAction } }
export interface IArrayMonarchLanguageAction extends Array<IMonarchLanguageAction> {}
export interface ICompiledMonarchLanguageAction {
  group?: ICompiledMonarchLanguageAction[]
  cases?: ICompiledMonarchLanguageRule[]
  token?: string
}

export interface IMonarchState {
  name: string
}
