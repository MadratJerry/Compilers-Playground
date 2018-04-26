import Lexer from '../Lexer'
import Token from '../tokenizer'
import * as Types from '../types'

function Parse(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value
  descriptor.value = function() {
    console.group()
    console.log(`Start Parse: ${propertyName} Token: ${this.token().value}`)
    const result = method.apply(this, arguments)
    console.log(result)
    console.log(`End Parse: ${propertyName} Token: ${this.token().value}`)
    console.groupEnd()
    return result
  }
}

class Parser {
  lexer: Lexer
  tokenList: Array<Token>
  ast: Types.File
  t: Token
  nextToken = this.tokenGenerator()

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.tokenList = lexer.tokenList.concat([{ token: ';', type: 'symbol' }])
    this.getToken()
    try {
      this.ast = { type: 'File', program: this.Program() }
    } catch (e) {
      if (e.message !== 'ENDTOKEN') throw e
    }
    console.log(this.ast)
  }

  @Parse
  Program(): Types.Program {
    return {
      type: 'Program',
      sourceType: 'script',
      body: this.Statements(),
    }
  }

  @Parse
  Statements(): Array<Types.Statement> {
    const s = this.Statement()
    if (s) return [s, ...this.Statements()]
    else return []
  }

  @Parse
  Statement(): Types.Statement {
    const es = this.ExpressionStatement()
    if (es) {
      return es
    } else {
      return null
    }
  }

  @Parse
  ExpressionStatement(): Types.ExpressionStatement {
    const e = this.Expression()
    if (e) {
      return { type: 'ExpressionStatement', expression: e }
    } else {
      return null
    }
  }

  @Parse
  Expression(): Types.Expression {
    let fe
    if (this.token().value === '(') {
      this.getToken()
      const e = this.Expression()
      if (e) {
        if (this.token().value === ')') {
          this.getToken()
          return e
        }
      }
    } else if ((fe = this.FunctionExpression())) {
      return fe
    } else {
      return null
    }
  }

  @Parse
  FunctionExpression(): Types.FunctionExpression {
    if (this.token().value === 'function') {
      const node = <Types.FunctionExpression>{ type: 'FunctionExpression' }
      this.getToken()
      if (this.token().type === 'identifier') {
        node.id = <Types.Identifier>{ type: 'Identifier', name: this.token().value }
        this.getToken()
        if (this.token().value === '(') {
          this.getToken()
          node.params = this.FunctionParams()
          if (this.token().value === ')') {
            this.getToken()
            node.body = this.BlockStatement()
          }
          return <Types.FunctionExpression>node
        }
      }
    } else return null
  }

  @Parse
  BlockStatement(): Types.BlockStatement {
    const node = <Types.BlockStatement>{ type: 'BlockStatement' }
    if (this.token().value === '{') {
      node.body = this.Statements()
      if (this.token().value === '}') {
        this.getToken()
        return node
      }
    } else return null
  }

  @Parse
  FunctionParams(): Array<Types.Pattern> {
    const i = this.Identifier()
    if (i) {
      if (this.token().value === ',') {
        this.getToken()
        return [i, ...this.FunctionParams()]
      }
    } else return []
  }

  @Parse
  Identifier(): Types.Identifier {
    const i = <Types.Identifier>{ type: 'Identifier' }
    if (this.token().type === 'identifier') {
      i.name = this.token().value
      this.getToken()
      return i
    } else return null
  }

  token(): Token {
    return this.t
  }

  getToken(): Token {
    const next = this.nextToken.next()
    this.t = next.value
    if (next.done) throw Error('ENDTOKEN')
    return this.t
  }

  *tokenGenerator(): IterableIterator<Token> {
    for (const i of this.tokenList) yield i
  }
}

export default Parser
