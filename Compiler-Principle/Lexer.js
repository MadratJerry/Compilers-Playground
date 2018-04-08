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

const dispatchMap = (() => {
  const map = new Map()

  for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
  for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
  for (const i of '$_') map[i] = STATE.identifier
  for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) map[String.fromCharCode(i)] = STATE.identifier
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
    this.input = input
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
    for (const key in STATE) {
      this.fnMap[STATE[key]] = this[key]
    }
  }

  identifier() {}

  number() {}

  operator() {}

  string() {}

  commentOrOperator() {}

  character() {}

  symbol() {}

  ignore() {}

  /**
   * Lexical analyze
   * @memberof Lexer
   */
  analyze() {
    const { nextChar } = this

    while (1) {
      const { value: char, done } = nextChar.next()
      if (done) break
      const { c } = char
      this.dispatch(c)
    }
  }

  /**
   * Dispatch initial state
   * @param {String} c
   * @memberof Lexer
   */
  dispatch(c) {
    const { fnMap } = this
    fnMap[dispatchMap[c]]()
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
    for (const i of this.input) {
      if (i === '\n') {
        row++
        column = 0
      }
      yield { c: i, row, column }
      column++
    }
  }
}

export default Lexer
