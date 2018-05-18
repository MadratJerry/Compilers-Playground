import { Token } from '@/tokenizer'

class LexicalDefinition {
  tokenizer: Function
  constructor(d: any) {
    this.tokenizer = this.parseAction(d.tokenizer)
  }

  private parseAction(a: any) {
    if (Array.isArray(a)) {
      const regex = new RegExp(a.map(({ regex }) => `(${regex.source})`).join('|'), 'g')
      const captureMap = new Map()
      a.reduce((g, { regex, action, group }) => {
        if (action) captureMap.set(g, this.parseAction(action))
        else if (group) group.forEach((gp: any, i: number) => captureMap.set(g + i + 1, this.parseAction(gp)))
        return g + LexicalDefinition.getGroups(regex) + 1
      }, 1)
      return (s: string, index: number = 0) => {
        const list: Array<any> = []
        for (let m = regex.exec(s); m != null; m = regex.exec(s)) {
          m.forEach(
            (s: any, i: number) => (captureMap.get(i) ? list.push(...captureMap.get(i)(s, index + m.index)) : 0),
          )
        }
        return list
      }
    } else if (typeof a === 'object') {
      const { regex, action, group } = a
      return (s: any, index: number = 0): any => {
        const m = regex.exec(s)
        if (action) return this.parseAction(action)(m[0], index + m.index)
        else if (group) {
          const list: Array<any> = []
          group.forEach((g: any, i: number) => list.push(...this.parseAction(g)(m[i + 1]), index + m.index))
          return list
        }
      }
    } else if (typeof a === 'string') {
      return (s: any, index: number = 0) => {
        if (s) {
          console.log(`${s} ${a} ${index}`)
          return [{ input: s, start: index, end: s.length + index, type: a }]
        }
        return []
      }
    }
  }

  // How many capturing groups in regular expression
  static getGroups(regex: RegExp): number {
    const s = regex.source
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

class RETokenizer {
  ld: LexicalDefinition
  text: string
  tokens: Array<Token> = []
  constructor(defObj: Object) {
    this.ld = new LexicalDefinition(defObj)
  }

  parse(text: string) {
    this.text = text
    const lineText: Array<string> = text.split('\n').map(line => line + '\n')
    const lineMap: Array<number> = []
    let beginIndex = 0
    for (const t of lineText) {
      lineMap.push(beginIndex)
      beginIndex += t.length
    }
    lineMap.push(beginIndex)
    const getLoc = (start: number, end: number) => {
      const result = { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
      let o1 = false,
        o2 = false
      for (let i = 1; i < lineMap.length; i++) {
        if (o2 && o2) break
        if (start >= lineMap[i - 1] && start <= lineMap[i]) {
          result.end = { line: i - 1, column: end - lineMap[i - 1] }
          o1 = true
        }
        if (end >= lineMap[i - 1] && end <= lineMap[i]) {
          result.end = { line: i - 2, column: end - lineMap[i - 1] }
          o2 = true
        }
      }
      return result
    }
    this.tokens = this.ld.tokenizer(this.text).map(({ input, start, end, type }: any) => {
      const token = new Token(input, start, end, type)
      token.loc = getLoc(start, end)
      return token
    })
  }
}

export default RETokenizer
