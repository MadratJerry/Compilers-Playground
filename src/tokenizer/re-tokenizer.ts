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
          let l = m.index
          for (const key of captureMap.keys()) {
            list.push(...captureMap.get(key)(m[key], index + l))
            l += m[key] ? m[key].length : 0
          }
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
          group.reduce((l: number, g: any, i: number) => {
            list.push(...this.parseAction(g)(m[i + 1]), index + m[i + 1] ? m[i + 1].length : 0)
            return l + m[i + 1] ? m[i + 1].length : 0
          }, 0)
          return list
        }
      }
    } else if (typeof a === 'string') {
      return (s: any, index: number = 0) => (s ? [{ input: s, start: index, end: s.length + index, type: a }] : [])
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
      const bs = (index: number, isEnd: boolean) => {
        let l = 0,
          r = lineMap.length - 1,
          mid: number
        while (true) {
          if (l > r) {
            mid = l - 1
            break
          }
          mid = Math.floor((l + r) / 2)
          if (lineMap[mid] > index) r = mid - 1
          else if (lineMap[mid] < index) l = mid + 1
          else {
            mid -= isEnd ? 1 : 0
            break
          }
        }
        return mid
      }
      const startLine = bs(start, false)
      const endLine = bs(end, true)
      result.start = { line: startLine, column: start - lineMap[startLine] }
      result.end = { line: endLine, column: end - lineMap[endLine] }
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
