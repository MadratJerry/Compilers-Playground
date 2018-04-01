import Token from './Token'

/**
 * The lexer
 * @class Lexer
 */
class Lexer {
  /**
   * Creates an instance of Lexer.
   * @param {String} text
   * @memberof Lexer
   */
  constructor(text) {
    this.text = text
    this.tokenList = []
    this.parse()
  }

  /**
   * Parse the text
   */
  parse() {
    this.text.split('\n').map((line, index) => {
      this.line = line
      for (let i = 0, j, k, len = line.length; i < len; ) {
        ;[i, j, k] = this.dispatcher(i)
        if (k !== null) {
          const token = new Token(index, i, k)
          this.tokenList.push(token)
        }
        i = i + j
      }
    })
  }

  /**
   * The dispatcher
   * @param {Number} i
   * @returns {Number}
   */
  dispatcher(i) {
    const c = this.line.charAt(i)
    if (c == ' ') return [i, 1, null]
    if ('#'.indexOf(c) != -1) return [i, 1, c]
    if (c == '"') return this.identifyString(i)
    if (c == "'") return this.identifyChar(i)
    if (Lexer.isDigit(c)) return this.identifyDigit(i)
    if (Lexer.isLetter(c)) return this.identifyWord(i)
    if ('><=!'.indexOf(c) != -1) return this.identifySymbol(i)
    return [i, 1, c]
  }

  identifyChar(l) {
    let r = l,
      c,
      state = 0
    while (state < 2) {
      switch (state) {
        case 0:
          r += 2
          state = 1
          break
        case 1:
          c = this.line.charAt(r++)
          if (c == "'") {
            state = 2
            r++
          } else state = 3
          break
      }
    }

    if (state == 3) return [l, 1, "'"]
    else return [l, r - l - 1, this.line.substring(l, r - 1)]
  }

  identifySymbol(l) {
    let r = l,
      c,
      state = 0
    let count = 0
    while (state < 2) {
      if (count++ > 10) break
      switch (state) {
        case 0:
          r++
          state = 1
          break
        case 1:
          c = this.line.charAt(r++)
          if (c == '=') {
            state = 2
            r++
          } else state = 3
          break
      }
    }
    return [l, r - l - 1, this.line.substring(l, r - 1)]
  }

  identifyString(l) {
    let r = l,
      c,
      state = 0
    while (state < 2) {
      switch (state) {
        case 0:
          c = this.line.charAt(r++)
          if (c == '"') state = 1
          else state = 2
          break
        case 1:
          c = this.line.charAt(r++)
          if (c == '"') {
            state = 2
            r++
          } else if (c == '') state = 3
          else state = 1
          break
      }
    }

    if (state == 3) return [l, 1, '"']
    else return [l, r - l - 1, this.line.substring(l, r - 1)]
  }

  identifyWord(l) {
    let r = l,
      c,
      state = 0
    while (state != 1) {
      switch (state) {
        case 0:
          c = this.line.charAt(r++)
          if (Lexer.isLetter(c)) state = 0
          else state = 1
          break
      }
    }
    return [l, r - l - 1, this.line.substring(l, r - 1)]
  }

  identifyDigit(l) {
    let r = l,
      c,
      state = 0
    while (state != 1) {
      switch (state) {
        case 0:
          c = this.line.charAt(r++)
          if (Lexer.isDigit(c)) state = 0
          else state = 1
          break
      }
    }
    return [l, r - l - 1, this.line.substring(l, r - 1)]
  }

  /**
   * Whether a letter
   * @static
   * @param {String} c
   * @returns {Boolean}
   * @memberof Lexer
   */
  static isLetter(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
  }

  /**
   * Whether a digit
   * @static
   * @param {String} c
   * @returns {Boolean}
   * @memberof Lexer
   */
  static isDigit(c) {
    return c >= '0' && c <= '9'
  }

  output() {
    return this.tokenList.map(t => t.toString()).join('\n')
  }
}

export default Lexer
