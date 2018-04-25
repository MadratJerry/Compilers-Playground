const errorMap = new Map(Object.entries({ ENDTOKEN: 'End of token' }))

class Parser {
  /**
   * Creates an instance of Parser.
   * @param {Lexer} lexer The Lexer instance
   * @memberof Parser
   */
  constructor(lexer) {
    // Filter comments
    this.tokenList = lexer.tokenList.filter(token => token.getType() !== 'comment')
    this.nextToken = this.tokenGenerator()
    this.ast = { type: 'File' }
    this.parse()
  }

  parse() {
    while (true) {
      try {
        this.getNext()
        this.ast.program = this.$Program()
      } catch (e) {
        if (e.name === 'ENDTOKEN') break
        else throw e
      }
    }
    console.log(this.ast)
  }

  $Program() {
    const program = { type: 'Program' }
    program.body = this.$Statements()
    return program
  }

  $Statements() {
    const statements = []
    const ExpressionStatement = this.$ExpressionStatement()
    const BlockStatement = this.$BlockStatement()
    const Declarations = this.$Declarations()
    if (ExpressionStatement) statements.push(ExpressionStatement)
    if (BlockStatement) statements.push(BlockStatement)
    if (Declarations) statements.push(...Declarations)
    console.log(statements)
    return []
    if (statements.length === 0) return []
    else return statements.concat(this.$Statements())
  }

  $ExpressionStatement() {
    const node = {}
    node.expression = this.$Expression()
    if (node.expression) return node
  }

  $Expression() {
    let node
    const { value } = this.next
    if (value.token === '(') {
      this.getNext()
      node = this.$Expression()
      const { value } = this.next
      if (value.token === ')') {
        this.getNext()
      }
    } else node = this.$FunctionExpression()
    return node
  }

  $FunctionExpression() {
    const node = this.$FunctionDeclaration()
    node.type = 'FunctionExpression'
    return node
  }

  $Declarations() {
    return [this.$FunctionDeclaration()]
  }

  $FunctionDeclaration() {
    const node = { type: 'FunctionDeclaration' }
    const { value } = this.next
    if (value.token === 'function') {
      const { value } = this.getNext()
      if (value.type === 'identifier') {
        node.id = this.next.value.token
        const { value } = this.getNext()
        if (value.token === '(') {
          this.getNext()
          node.params = this.$Patterns()
          const { value } = this.next
          if (value.token === ')') {
            this.getNext()
            this.$BlockStatement()
          }
        }
      }
    }
    return node
  }

  $Patterns() {
    const patterns = []
    const identifier = this.$Identifier()
    if (identifier) patterns.push(identifier)
    const { value } = this.next
    if (value.token === ',') this.getNext()
    return patterns.length === 0 ? patterns : patterns.concat(this.$Patterns())
  }

  $Identifier() {
    const { value } = this.next
    if (value.type === 'identifier') {
      this.getNext()
      return { type: 'Identifier', name: value.token }
    }
  }

  $BlockStatement() {
    const node = { type: 'BlockStatement' }
    const { value } = this.next
    if (value.token === '{') {
      this.getNext()
      node.body = this.$Statements()
      const { value } = this.getNext()
      if (value.token === '}') {
        this.getNext()
      }
    }
    return node
  }

  error(name) {
    const error = new Error()
    error.name = name
    error.message = errorMap.get(name)
    return error
  }

  getNext() {
    this.next = this.nextToken.next()
    if (this.next.done) throw this.error('ENDTOKEN')
    return this.next
  }

  /**
   * Token iterator
   * @memberof Parser
   */
  *tokenGenerator() {
    for (let i = 0; i < this.tokenList.length; i++) {
      yield this.tokenList[i]
    }
  }
}

export default Parser
