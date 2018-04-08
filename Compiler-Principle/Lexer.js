import Token from './Token'

const STATE = {
  identifier: 0,
  number: 1,
  operator: 2,
  string: 3,
  commentOrOperator: 4,
  character: 5,
  symbol: 6,
  ignore: 7,
}

const ERROR = {
  INVALID: 'Invalid charactor',
  UNEXPECTED: 'Unexpected token',
}

const dispatchMap = (() => {
  const map = new Map()

  for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
  for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
  for (const i of '$_') map[i] = STATE.identifier
  for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.number
  for (const i of '<>=!~?:&|+-*^%') map[i] = STATE.operator
  for (const i of '/') map[i] = STATE.commentOrOperator
  for (const i of '"') map[i] = STATE.string
  for (const i of "'") map[i] = STATE.character
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
      return this.input[l.row].substring(l.column, r.column)
    } else {
      let str = this.input[l.row]
      for (let i = l.row + 1; i < r.row; i++) str += this.input[i]
      str += this.input[r.row]
      return str
    }
  }

  identifier() {
    let count = 0
    let state = 0
    let l = Lexer.getCopy(this.next.value)
    while (state < 1) {
      if (count++ > 16) return
      switch (state) {
        case 0:
          this.next = this.nextChar.next()
          const { value } = this.next
          if (dispatchMap[value.c] === STATE.identifier) state = 0
          else state = 1
          break
      }
    }
    return { ok: true, value: new Token(this.getString(l, this.next.value), l.row, l.column) }
  }

  number() {}

  operator() {}

  string() {}

  commentOrOperator() {}

  character() {}

  symbol() {
    let l = Lexer.getCopy(this.next.value)
    this.next = this.nextChar.next()
    return { ok: true, value: new Token(this.getString(l, this.next.value), l.row, l.column) }
  }

  ignore() {}

  /**
   * Lexical analyze
   * @memberof Lexer
   */
  analyze() {
    const { nextChar } = this

    this.next = nextChar.next()
    while (1) {
      const { value, done } = this.next
      if (done) break
      const result = this.dispatch(value)
      console.log(result)
      if (!result) this.next = nextChar.next()
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
    if (state === undefined) return { ok: false, value: { error: ERROR.INVALID, char } }
    else return fnMap[state]()
  }

  output() {
    return ''
  }

  /**
   * Char iterator
   * @memberof Lexer
   */
  *charGenerater() {
    let row = 0,
      column = 0
    for (const line of this.input) {
      column = 0
      for (const i of line) {
        yield { c: i, row, column }
        column++
      }
      row++
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
