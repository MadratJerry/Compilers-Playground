import { IMonarchLanguageJSON, IMonarchLanguage, IMonarchLanguageRule, IMonarchLanguageTokenizer } from './monarchTypes'

export default function compile(json: IMonarchLanguageJSON): IMonarchLanguage {
  const ml: IMonarchLanguage = { tokenizer: {} }

  if (!json.tokenizer || typeof json.tokenizer !== 'object')
    throw new Error(`A language definition must define the 'tokenizer' attribute as an object`)

  for (const state in json.tokenizer) ml.tokenizer[state] = compileState(state, json)

  console.log(ml)
  return json
}

function compileState(state: string, json: IMonarchLanguageJSON): IMonarchLanguageRule[] {
  const rules: IMonarchLanguageRule[] = []
  const ruleList = json.tokenizer[state]

  if (!Array.isArray(ruleList)) throw new Error(`Each state must be an array of rules at {tokenizer.${state}}`)

  for (const rule of ruleList) {
    if (Array.isArray(rule)) {
      const [regex, action] = rule
      rules.push({ regex: compileRegExp(regex, json), action })
    }
  }

  return rules
}

function compileRegExp(regex: RegExp, json: IMonarchLanguageJSON): RegExp {
  const source = regex.source
  return new RegExp(
    source.replace(/@(\w+)/g, (s, attr) => {
      const expression = json[attr]
      let r = ''
      if (typeof expression === 'string') r = expression
      else if (expression && expression instanceof RegExp) r = expression.source
      else if (Array.isArray(expression))
        r = expression.map(word => word.replace(/([$()*+.?\/\\^{}|])/g, '\\$&')).join('|')
      else {
        if (expression === undefined)
          throw new Error(`Language definition does not contain attribute ${attr} used at ${s}`)
        else throw new Error(`Attribute reference ${attr} must be a string or RegExp used at ${s}`)
      }
      return r ? `(?:${r})` : ''
    }),
  )
}
