import Token from './token'
class SyntaxDefinition {
  private re: RegExp
  name: string
  groups: number

  constructor(name: string, regexp: RegExp) {
    this.re = regexp
    this.name = name
    this.groups = SyntaxDefinition.getGroups(this.re.source)
  }

  static getGroups(s: string): number {
    const stack: Array<string> = []
    let ignore = false,
      pass = false,
      top,
      count = 0
    for (const i of s) {
      if (ignore) ignore = false
      else if (i === ']') pass = false
      else if (pass) continue
      else if (i === '[') pass = true
      else if (i === '\\') ignore = true
      else if (i === '(') {
        stack.push(i)
        top = i
      } else if (i === ')' && top === '(') {
        stack.pop()
        top = stack[stack.length - 1]
        count++
      }
    }
    return count
  }

  static merge(sds: Array<SyntaxDefinition>): RegExp {
    return new RegExp(sds.map(s => `(${s.re.source})`).join('|'), 'g')
  }
}

const sds: Array<SyntaxDefinition> = [
  new SyntaxDefinition('Identifiers', /([a-zA-Z_\$][\w\$]*)(\s*)(:?)/),
  new SyntaxDefinition('Brackets', /[{}()\[\]]/),
  new SyntaxDefinition('Delimiter', /[;,.]/),
]

const re = SyntaxDefinition.merge(sds)

class RETokenizer {
  text: string
  tokens: Array<Token> = []
  constructor(text: string) {
    this.text = text
    this.match()
  }

  match() {
    for (let m = re.exec(this.text); m != null; m = re.exec(this.text)) {
      console.log(m)
    }
  }
}

export default RETokenizer
