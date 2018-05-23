export interface Node {
  type: string
  loc?: SourceLocation
}

export interface SourceLocation {
  source?: string
  start: Position
  end: Position
}

export interface Position {
  line: number // >= 0
  column: number // >= 0
}

export interface Token extends Node {
  value: string
}

export type RuleTerm = string

export type Rule = Array<RuleTerm>

export type Rules = Array<Rule>

export type RuleMap = Map<string, Rules>

export type Production = [string, Rule]

export type Firsts = Map<string, Set<RuleTerm>>

export type Follows = Map<string, Set<RuleTerm>>

export type SymbolTable = Map<string, string>

export type ForecastingTable = Map<string, Map<string, Production>>

export type AnalysisTable = Map<number, Map<string, string>>

export type ASTNode = {
  value: string
  type: string
  children: Array<ASTNode>
  parent: ASTNode
  token?: Token
  [sdd: string]: any
}

export const epsilon = 'ε'
