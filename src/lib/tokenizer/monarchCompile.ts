import {
  ICompiledMonarchLanguage,
  IMonarchLanguage,
  IMonarchLanguageAction,
  ICompiledMonarchLanguageAction,
  ICompiledMonarchLanguageRule,
  IMonarchLanguageExpressions,
} from './monarchTypes'

const builtInExpressions = {
  default: /^.*$/,
  ['']: /^.*$/,
  ['@']: /^.*$/,
}

export function compile(json: IMonarchLanguage): ICompiledMonarchLanguage {
  const ml: ICompiledMonarchLanguage = { tokenizer: {} }

  if (!json.tokenizer || typeof json.tokenizer !== 'object')
    throw new Error(`A language definition must define the 'tokenizer' attribute as an object`)

  for (const state in json.tokenizer) ml.tokenizer[state] = compileState(state, json)

  return ml
}

function compileState(state: string, json: IMonarchLanguage): ICompiledMonarchLanguageRule[] {
  const rules: ICompiledMonarchLanguageRule[] = []
  const ruleList = json.tokenizer[state]

  if (!Array.isArray(ruleList)) throw new Error(`Each state must be an array of rules at {tokenizer.${state}}`)

  for (const rule of ruleList) {
    if (Array.isArray(rule)) {
      const [regex, action] = rule
      rules.push({ regex: compileRegExp(regex, json.expressions), action: compileAction(action, json.expressions) })
    }
  }

  return rules
}

function compileRegExp(regex: RegExp | string, expressions: IMonarchLanguageExpressions): RegExp {
  const source = typeof regex === 'string' ? regex : regex.source
  return new RegExp(
    source.replace(/@(\w+)/g, (s, attr) => {
      const expression = expressions[attr] || builtInExpressions[attr]
      let r = ''
      if (typeof expression === 'string') r = expression
      else if (expression && expression instanceof RegExp) r = expression.source
      else if (Array.isArray(expression)) r = expression.map(escapeRegExp).join('|')
      else {
        if (expression === undefined)
          throw new Error(`Language definition does not contain expression ${attr} used at ${s}`)
        else throw new Error(`Attribute reference ${attr} must be a string or RegExp used at ${s}`)
      }
      return r ? `(?:${r})` : ''
    }),
  )
}

function compileAction(
  action: IMonarchLanguageAction,
  expressions: IMonarchLanguageExpressions,
): ICompiledMonarchLanguageAction {
  if (!action) {
    return { token: '' }
  } else if (typeof action === 'string') {
    return { token: action }
  } else if (Array.isArray(action)) {
    const compiledActions = []
    for (const actionN of action) compiledActions.push(compileAction(actionN, expressions))
    return { group: compiledActions }
  } else if (action.token || action.token === '') {
    if (typeof action.token !== 'string') throw new Error(`A 'token' attribute must be of type string`)
    return { token: action.token }
  } else if (action.cases) {
    const newAction = { cases: [] as ICompiledMonarchLanguageRule[] }
    for (const key in action.cases) {
      newAction.cases.push({
        regex: compileRegExp(`^(?:${key})$`, expressions),
        action: compileAction(action.cases[key], expressions),
      })
    }
    return newAction
  } else
    throw new Error(`An action must be a string, an object with 'token' or 'cases' attribute, or an array of actions.`)
}

function escapeRegExp(string: string): string {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$&')
}
