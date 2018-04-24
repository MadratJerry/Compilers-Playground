const errorMap = (() => {
  const map = new Map()
  map['ENDTOKEN'] = 'End of token'
  return map
})()

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
    this.currentNode = this.ast
    while (true) {
      try {
        this.getNext()
        this.$Program()
      } catch (e) {
        if (e.name === 'ENDTOKEN') break
      }
    }
  }

  $Program() {
    this.currentNode = { parent: this.currentNode, name: 'Program' }
    this.$Element()
  }

  $Element() {
    const { value } = this.next
    if (value.token === 'function') {
      const { value } = this.getNext()
      if (value.type === 'identifier') {
        const { value } = this.getNext()
        if (value.token === '(') {
          this.getNext()
          this.$ParameterListOpt()
          const { value } = this.next
          if (value.token === ')') {
            this.getNext()
            this.$CompoundStatement()
          }
        }
      }
    }
  }

  $ParameterListOpt() {
    this.$ParameterList()
  }

  $ParameterList() {
    const { value } = this.next
    if (value.type === 'identifier') {
    }
  }

  $CompoundStatement() {
    const { value } = this.next
    if (value.token === '{') {
      this.getNext()
      this.$Statements()
    }
  }

  $Statements() {
    this.$Statement()
  }

  $Statement() {
    this.$VariablesOrExpression()
  }

  $VariablesOrExpression() {
    console.log('var')
  }

  error(name) {
    const error = new Error()
    error.name = name
    error.message = errorMap[name]
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
