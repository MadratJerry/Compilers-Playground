import {
  IMonarchLanguageJSON,
  IMonarchLanguage,
  IMonarchLanguageAction,
  IExpandedMonarchLanguageAction,
  IExpandedMonarchLanguageRule,
} from './monarchTypes'

export default function compile(json: IMonarchLanguageJSON): IMonarchLanguage {
  const ml: IMonarchLanguage = { tokenizer: {} }

  if (!json.tokenizer || typeof json.tokenizer !== 'object')
    throw new Error(`A language definition must define the 'tokenizer' attribute as an object`)

  for (const state in json.tokenizer) ml.tokenizer[state] = compileState(state, json)

  console.log(ml)
  return json
}

function compileState(state: string, json: IMonarchLanguageJSON): IExpandedMonarchLanguageRule[] {
  const rules: IExpandedMonarchLanguageRule[] = []
  const ruleList = json.tokenizer[state]

  if (!Array.isArray(ruleList)) throw new Error(`Each state must be an array of rules at {tokenizer.${state}}`)

  for (const rule of ruleList) {
    if (Array.isArray(rule)) {
      const [regex, action] = rule
      rules.push({ regex: compileRegExp(regex, json), action: compileAction(action) })
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

function compileAction(action: IMonarchLanguageAction): IExpandedMonarchLanguageAction {
  if (!action) {
    return { token: '' }
  } else if (typeof action === 'string') {
    return { token: action }
  } else if (Array.isArray(action)) {
    const compiledActions = []
    for (const actionN of action) compiledActions.push(compileAction(actionN))
    return { group: compiledActions }
  } else if (action.token || action.token === '') {
    if (typeof action.token !== 'string') throw new Error(`A 'token' attribute must be of type string`)
    return { token: action.token }
  } else if (action.cases) {
    const newAction = { cases: {} }
    for (const key in action.cases) {
      newAction.cases[key] = compileAction(action.cases[key])
    }
    return newAction
  } else
    throw new Error(`An action must be a string, an object with 'token' or 'cases' attribute, or an array of actions.`)
}
