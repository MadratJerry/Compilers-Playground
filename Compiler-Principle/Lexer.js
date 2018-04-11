import Token, { tokenizer } from './Token'

const STATE = {
  identifier: 0,
  number: 1,
  operator: 2,
  string: 3,
  commentOrOperator: 4,
  symbol: 5,
  ignore: 6,
}

const errorMap = (() => {
  const map = new Map()
  map['INVALID'] = 'Invalid charactor'
  map['UNEXPECTED'] = 'Unexpected token'
  map['UNTERMINATED'] = 'Unterminated string literal'
  map['ENDFILE'] = 'End of file'
  return map
})()

const dispatchMap = (() => {
  const map = new Map()

  for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
  for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
  for (const i of '$_') map[i] = STATE.identifier
  for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.number
  for (const i of '<>=!~?:&|+-*^%') map[i] = STATE.operator
  for (const i of '/') map[i] = STATE.commentOrOperator
  for (const i of `"'`) map[i] = STATE.string
  for (const i of '#.(){},;') map[i] = STATE.symbol
  for (const i of ' \n') map[i] = STATE.ignore
  return map
})()

/**
 * The Lexer
 * @class Lexer
 */
class Lexer {
  /**
   * Creates an instance of Lexer.
   * @param {String} input
   * @memberof Lexer
   */
  constructor(input = '') {
    this.input = input.split('\n').map(line => line + '\n')
    this.nextChar = this.charGenerater()
    this.tokenList = []
    this.errorList = []
    this.generateFnMap()
    this.analyze()
  }

  /**
   * Generate lexical function map
   * @memberof Lexer
   */
  generateFnMap() {
    this.fnMap = new Map()
    for (const key in STATE) this.fnMap[STATE[key]] = this[key].bind(this)
  }

  /**
   * Get a string from the input
   * @param {Object} l
   * @param {Object} r
   * @returns {String}
   * @memberof Lexer
   */
  getString(l, r) {
    if (l.row === r.row) {
      return this.input[l.row - 1].substring(l.column - 1, r.column - 1)
    } else {
      let str = this.input[l.row - 1].substr(l.column - 1)
      for (let i = l.row; i < r.row - 1; i++) str += this.input[i]
      str += this.input[r.row - 1].substring(0, r.column - 1)
      return str
    }
  }

  identifier() {
    let state = 0
    let l = Lexer.getCopy(this.next.value)
    while (state < 1) {
      switch (state) {
        case 0: {
          const { value } = this.getNext()
          if (dispatchMap[value.c] === STATE.identifier) state = 0
          else state = 1
          break
        }
      }
    }
    return new Token(this.getString(l, this.next.value), l, this.next.value)
  }

  number() {
    let state = 0
    let l = Lexer.getCopy(this.next.value)
    let count = 0
    const endState = 5
    while (state < endState) {
      if (count++ > 16) break
      switch (state) {
        case 0: {
          const { value } = this.getNext()
          if (dispatchMap[value.c] === STATE.number) state = 0
          else if (value.c === 'e') state = 1
          else if (value.c === '.') state = 2
          else throw this.error('UNEXPECTED')
          break
        }
        case 1: {
          const { value } = this.getNext()
          if (dispatchMap[value.c] === STATE.number) state = 3
          else throw this.error('UNEXPECTED')
          break
        }
        case 2: {
          const { value } = this.getNext()
          if (dispatchMap[value.c] === STATE.number) state = 2
          else if (value.c === 'e') state = 1
          break
        }
        case 3: {
          const { value } = this.getNext()
          if (dispatchMap[value.c] === STATE.number) state = 3
          else state = endState
          break
        }
      }
    }
    return new Token(this.getString(l, this.next.value), l, this.next.value)
  }

  operator() {
    let l = Lexer.getCopy(this.next.value)
    const { value } = this.getNext()
    if (dispatchMap[value.c] === STATE.operator) {
      if (tokenizer.operators.includes(this.getString(l, { row: l.row, column: l.column + 2 })))
        return new Token(this.getString(l, this.getNext().value), l, this.next.value)
      else throw this.error('UNEXPECTED')
    } else return new Token(this.getString(l, this.next.value), l, this.next.value)
  }

  string() {
    let state = 0
    let l = Lexer.getCopy(this.next.value)
    const endState = 5
    while (state < endState) {
      switch (state) {
        case 0: {
          if (l.c === '"') state = 1
          else state = 2
          break
        }
        case 1: {
          const { value } = this.getNext()
          if (value.c === '"') state = endState
          else if (value.c === '\n') throw this.error('UNTERMINATED')
          else if (value.c === '\\') state = 3
          break
        }
        case 2: {
          const { value } = this.getNext()
          if (value.c === "'") state = endState
          else if (value.c === '\n') throw this.error('UNTERMINATED')
          else if (value.c === '\\') state = 4
          break
        }
        case 3: {
          const { value } = this.getNext()
          if (value.c === ' ') throw this.error('UNTERMINATED')
          else state = 1
          break
        }
        case 4: {
          const { value } = this.getNext()
          if (value.c === ' ') throw this.error('UNTERMINATED')
          else state = 2
          break
        }
      }
    }
    if (state === endState) this.getNext()
    return new Token(this.getString(l, this.next.value), l, this.next.value)
  }

  commentOrOperator() {
    let state = 0
    let l = Lexer.getCopy(this.next.value)
    const endState = 5
    while (state < endState) {
      switch (state) {
        case 0: {
          const { value } = this.getNext()
          if (value.c === '*') state = 1
          else if (value.c === '/') state = 2
          else if (value.c === '=') state = 3
          else state = endState
          break
        }
        case 1: {
          const { value } = this.getNext()
          if (value.c === '*') state = 4
          else state = 1
          break
        }
        case 2: {
          const { value } = this.getNext()
          if (value.c === '\n') state = endState
          break
        }
        case 3: {
          this.getNext()
          state = endState
          break
        }
        case 4: {
          const { value } = this.getNext()
          if (value.c === '/') {
            this.getNext()
            state = endState
          } else state = 1
        }
      }
    }
    return new Token(this.getString(l, this.next.value), l, this.next.value)
  }

  symbol() {
    let l = Lexer.getCopy(this.next.value)
    return new Token(this.getString(l, this.getNext().value), l, this.next.value)
  }

  ignore() {}

  /**
   * Lexical analyze
   * @memberof Lexer
   */
  analyze() {
    this.getNext()
    while (1) {
      const { value, done } = this.next
      if (done) break
      try {
        const result = this.dispatch(value)
        console.log(result)
        if (!result) this.getNext()
        else this.tokenList.push(result)
      } catch (e) {
        if (errorMap[e.name]) {
          if (e.name === 'ENDFILE') break
          else {
            this.errorList.push({ error: e, char: Lexer.getCopy(this.next.value) })
            this.getNext()
          }
        } else throw e
      }
    }
  }

  /**
   * Dispatch initial state
   * @param {Object} char
   * @memberof Lexer
   */
  dispatch(char) {
    const { fnMap } = this
    const { c } = char
    const state = dispatchMap[c]
    console.log(`dispatch ${state}`)
    if (state === undefined) throw this.error('INVALID')
    else return fnMap[state]()
  }

  /**
   * Throw an error
   * @param {String} name
   * @memberof Lexer
   */
  error(name) {
    const error = new Error()
    error.name = name
    error.message = errorMap[name]
    return error
  }

  /**
   * Get the next char
   * @returns {Object}
   * @memberof Lexer
   */
  getNext() {
    this.next = this.nextChar.next()
    if (this.next.done) throw this.error('ENDFILE')
    return this.next
  }
  /**
   * Char iterator
   * @memberof Lexer
   */
  *charGenerater() {
    let row = 0,
      column = 0
    for (const line of this.input) {
      row++
      column = 0
      for (const i of line) yield { c: i, row, column: ++column }
    }
  }

  /**
   * Get a deep copy
   * @static
   * @param {Object} obj
   * @returns
   * @memberof Lexer
   */
  static getCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
  }
}

export default Lexer
