import { LL1Grammar, $end, $accept } from '@/lib/grammar'
import { LL1Parser, IASTNode } from '@/lib/parser'
import { Token, Monarch } from '@/lib/tokenizer'
import { closure, union, concat, FiniteAutomata } from './finiteAutomata'
import { labelIndex } from './algorithm'

interface ASTNode extends IASTNode<ASTNode> {
  t?: string
}

const monarch = new Monarch({
  expressions: {},
  tokenizer: {
    root: [[/\w/, 'symbol'], [/([|*()])/, '$operator']],
  },
})

const grammar = new LL1Grammar([
  // [`E`, [`E`, `T`]],
  // [`E`, [`E`, `"|"`, `T`]],
  // [`E`, [`T`]],
  [`E`, [`T`, `E'`]],
  [`E'`, [`T`, `E'`]],
  [`E'`, [`"|"`, `T`, `E'`]],
  [`E'`, []],
  // [`T`, [`T`, `"*"`]],
  // [`T`, [`F`]],
  [`T`, [`F`, `T'`]],
  [`T'`, [`"*"`, `T'`]],
  [`T'`, []],
  [`F`, [`"("`, `E`, `")"`]],
  [`F`, [`symbol`]],
])

const parser = new LL1Parser(grammar)

function dfs(node: ASTNode) {
  // console.group(typeof node.symbol === 'string' ? node.symbol : node.symbol.token)
  if (node.children) node.children.forEach(n => dfs(n))
  walk(node)
  // console.groupEnd()
  return node
}

function walk(node: ASTNode) {
  if (node.symbol instanceof Token && node.children === undefined) {
    node.t = node.symbol.token
  } else if (node.symbol === `T` && node.children) {
    const [a, b] = node.children
    node.t = '(' + a.t + b.t + ')'
  } else if (node.symbol === `E'` && node.children) {
    if (node.children.length === 3) {
      const [a, b, c] = node.children
      node.t = '' + a.t + b.t + c.t
    } else if (node.children.length === 2) {
      const [a, b] = node.children
      node.t = '(' + a.t + b.t + ')'
    } else if (node.children.length === 0) node.t = ''
  } else if (node.symbol === `T'` && node.children) {
    node.t = node.children.map(n => n.t).join('')
  } else if (node.symbol === `F` && node.children) {
    node.t = node.children.map(n => n.t).join('')
  } else if (node.symbol === 'E' && node.children) {
    node.t = node.children.map(n => n.t).join('')
  } else if (node.symbol === $accept && node.children) {
    node.t = '(' + node.children[0].t + ')'
  }
}

function convert(str: string): FiniteAutomata {
  const stack: Array<string | FiniteAutomata> = []
  str.split('').forEach(s => {
    if (s === '(' || s === '|') stack.push(s)
    else if (s === '*') {
      stack.push(closure(<FiniteAutomata>stack.pop()))
    } else if (s === ')') {
      let a = <FiniteAutomata>stack.pop()
      while (true) {
        const top = stack.pop()
        if (top === '(') break
        else if (top === '|') a = union(<FiniteAutomata>stack.pop(), a)
        else a = concat(<FiniteAutomata>top, a)
      }
      stack.push(a)
    } else {
      stack.push(new FiniteAutomata(s))
    }
  })
  return <FiniteAutomata>stack[0]
}

export function parse(text: string): FiniteAutomata {
  return labelIndex(convert(dfs(parser.parse(monarch.tokenize(text).concat([new Token(0, $end, $end)]))).t!))
}
