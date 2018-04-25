const errorMap = new Map([['ENDTOKEN', 'End of token']])

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
    this.ast.program = []
    this.parse()
  }

  parse() {
    while (true) {
      try {
        this.getNext()
        this.ast.program.push(this.$Program())
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
    return [...this.$Declarations()]
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
    const { value } = this.next
    if (value.token === '{') {
      this.getNext()
      this.$Statements()
    }
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
