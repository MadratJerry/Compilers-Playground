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

export interface Statement extends Node {}
