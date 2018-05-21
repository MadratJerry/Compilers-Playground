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
