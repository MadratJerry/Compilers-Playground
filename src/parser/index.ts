import Lexer from '../Lexer'
import Token from '../Token'
import * as Types from './types'

class Parser {
  lexer: Lexer
  tokenList: Array<Token>
  ast: Types.File
  token: Token
  nextToken = this.tokenGenerator()

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.tokenList = lexer.tokenList
    this.ast = { type: 'File', program: this.Program() }
  }

  Program(): Types.Program {
    return {
      type: 'Program',
      sourceType: 'script',
      body: [<Types.Statement>{}],
    }
  }

  getToken(): Token {
    const next = this.nextToken.next()
    this.token = next.value
    if (next.done) throw Error('ENDTOKEN')
    return this.token
  }

  *tokenGenerator(): IterableIterator<Token> {
    for (const i of this.tokenList) yield i
  }
}

export default Parser
