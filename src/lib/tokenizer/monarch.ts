import { IMonarchLanguage, IMonarchLanguageJSON, IMonarchState, IMonarchLanguageRule } from './monarchTypes'
import compile from './monarchCompile'
import Token from './token'

class Monarch {
  private readonly _ml: IMonarchLanguage
  private readonly stack: IMonarchState[] = []

  constructor(json: IMonarchLanguageJSON) {
    this._ml = compile(json)

    const { tokenizer } = this._ml
    this.stack.push({ name: Object.keys(tokenizer)[0] })
  }

  tokenize(text: string): Token[] {
    const state = this.stack[this.stack.length - 1].name
    const { tokenizer } = this._ml
    const tokenList: Token[] = []

    for (let index = 0, lastIndex = 0; ; index = lastIndex) {
      for (const rule of tokenizer[state]) {
        const type = rule[1]
        const re = new RegExp(rule[0].source, 'g')
        re.lastIndex = index
        const match = re.exec(text)

        if (match && match.index == index) {
          tokenList.push(new Token(match.index, match[0], type))
          lastIndex = re.lastIndex
          break
        }
      }
      if (lastIndex === index) break
    }

    return tokenList
  }

  private groupCount(re: RegExp): number {
    const nonEscape = re.source.replace(
      new RegExp('.*+?^=!:${}()|[]/\\'.replace(/./g, '\\\\\\$&|') + '\\[.*\\]', 'g'),
      '',
    )

    // TODO: There may be a better solution
    const groupMatchRE = /\(\?\:|\)|\(/g
    let groupRegexp = ''
    for (let m = groupMatchRE.exec(nonEscape); m !== null; m = groupMatchRE.exec(nonEscape)) groupRegexp += m[0]
    const groupResult = new RegExp(`${groupRegexp}`).exec('')

    return groupResult ? groupResult.length - 1 : 0
  }
}

export default Monarch
