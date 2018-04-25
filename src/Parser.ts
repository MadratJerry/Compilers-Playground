import Lexer from './Lexer'

interface Node {
  type: String
}

interface Statement extends Node {}

interface Program extends Node {
  sourceType: 'script' | 'module'
  body: [Statement]
}

interface File extends Node {
  type: 'File'
  program: Program
}

class Parser {
  lexer: Lexer
  tokenList: Array<any>

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.tokenList = lexer.tokenList
    this.parse()
  }

  parse() {}
}

export default Parser
