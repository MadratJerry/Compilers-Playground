const tokenizer = {
  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '==',
    '<=',
    '>=',
    '!=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '^',
    '%',
    '<<',
    '>>',
    '>>>',
    '+=',
    '-=',
    '*=',
    '/=',
    '&=',
    '|=',
    '^=',
    '%=',
  ],
}
/**
 * Token
 * @class Token
 */
class Token {
  /**
   * Creates an instance of Token.
   * @param {String} token
   * @param {Object} l
   * @param {Object} r
   * @memberof Token
   */
  constructor(token, l, r) {
    this.token = token
    this.l = l
    this.r = r
  }
}

export default Token
export { tokenizer }
