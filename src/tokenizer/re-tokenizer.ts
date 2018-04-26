import Token from './token'

class LexicalDefinition {
  regex: RegExp
  captureMap: Map<number, string> = new Map()
  constructor(def: object) {
    Object.entries(def).reduce((c, e) => {
      const [name, regex] = e
      const groups = LexicalDefinition.getGroups(regex.source)
      for (let i = c; i <= c + groups; i++) this.captureMap.set(i, name)
      return c + groups + 1
    }, 1)
    this.regex = new RegExp(
      Object.values(def)
        .map(r => `(${r.source})`)
        .join('|'),
      'g',
    )
  }

  // How many capturing groups in regular expression
  static getGroups(s: string): number {
    let ignore = false,
      pass = false,
      count = 0

    // Because each regular expression is correct, so just count the left bracket
    for (const i of s) {
      if (ignore) ignore = false
      else if (i === ']') pass = false
      else if (pass) continue
      else if (i === '[') pass = true
      else if (i === '\\') ignore = true
      else if (i === '(') count++
    }

    // Remove the non-capturing group
    return count - s.split('(?:').length + 1
  }
}

const ld = new LexicalDefinition({
  Identifiers: /([a-zA-Z_\$][\w\$]*)(\s*)(:?)/,
  Brackets: /[{}()\[\]]/,
  Delimiter: /[;,.]/,
  Symbols: /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
})

class RETokenizer {
  text: string
  tokens: Array<Token> = []
  constructor(text: string) {
    this.text = text
    this.match()
    console.log(this.tokens)
  }

  match() {
    for (let m = ld.regex.exec(this.text); m != null; m = ld.regex.exec(this.text)) {
      this.tokens.push(
        new Token(
          m[0],
          { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
          ld.captureMap.get(m.lastIndexOf(m[0])),
        ),
      )
    }
  }
}

export default RETokenizer
