import Lexer from './Lexer'

const map = new Map()
const code = [
  'auto',
  'short',
  'int',
  'long',
  'float',
  'double',
  'char',
  'struct',
  'union',
  'enum',
  'typedef',
  'const',
  'unsigned',
  'signed',
  'extern',
  'register',
  'static',
  'volatile',
  'void',
  'if',
  'else',
  'switch',
  'case',
  'for',
  'do',
  'while',
  'goto',
  'continue',
  'break',
  'default',
  'sizeof',
  'return',
  '+',
  '-',
  '*',
  '/',
  '<',
  '>',
  '<=',
  '>=',
  '==',
  '!=',
  '=',
  ';',
  ',',
  "'",
  '//',
  '/*',
  '*/',
  ':',
  '(',
  ')',
  '.',
  '#',
  '{',
  '}',
]

code.forEach((c, i) => (map[c] = i))

/**
 * Token
 * @class Token
 */
class Token {
  /**
   * Creates an instance of Token.
   * @param {Number} line
   * @param {Number} column
   * @param {String} string
   * @memberof Token
   */
  constructor(line, column, string) {
    this.line = line
    this.column = column
    this.string = string
  }

  toString() {
    let id = map[this.string]
    if (!id) {
      if (Lexer.isDigit(this.string[0])) id = 100
      if (Lexer.isLetter(this.string[0])) id = 101
      if (this.string[0] == '"') id = 102
      if (this.string[0] == "'") id = 103
    }
    return `${this.line} ${this.column} ${this.string} ${id}`
  }
}

export default Token
