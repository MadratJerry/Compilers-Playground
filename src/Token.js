const tokenizer = {
  keyword: [
    'boolean',
    'break',
    'byte',
    'case',
    'catch',
    'char',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'double',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'final',
    'finally',
    'float',
    'for',
    'function',
    'goto',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'int',
    'interface',
    'long',
    'let',
    'native',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'short',
    'static',
    'super',
    'switch',
    'synchronized',
    'this',
    'throw',
    'throws',
    'transient',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'volatile',
    'while',
    'with',
  ],
  operator: [
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

const tokenMap = (() => {
  const map = new Map()
  for (const key in tokenizer) tokenizer[key].forEach(token => (map[token] = key))
  return map
})()

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
  constructor(token, l, r, type = undefined) {
    this.token = token
    this.l = l
    this.r = r
    this.type = type
  }

  getType() {
    return tokenMap[this.token] || this.type
  }
}

export default Token
export { tokenizer }
