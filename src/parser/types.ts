export interface Node {
  type: String
}

export interface Program extends Node {
  type: 'Program'
  sourceType: 'script' | 'module'
  body: Array<Statement>
}

export interface File extends Node {
  type: 'File'
  program: Program
}

export interface Pattern extends Node {}

export interface Identifier extends Expression, Pattern {
  type: 'Identifier'
  name: string
}

export interface Function extends Node {
  id: Identifier | null
  params: Array<Pattern>
  body: BlockStatement
  generator: boolean
  async: boolean
}

export interface Statement extends Node {}

export interface BlockStatement extends Statement {
  type: 'BlockStatement'
  body: Array<Statement>
}

export interface Expression extends Node {}

export interface FunctionExpression extends Function, Expression {
  type: 'FunctionExpression'
}

export interface ExpressionStatement extends Statement {
  type: 'ExpressionStatement'
  expression: Expression
}

export interface BlockStatement extends Statement {
  type: 'BlockStatement'
  body: Array<Statement>
}
