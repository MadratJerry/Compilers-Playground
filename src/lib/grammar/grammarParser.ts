import { Token, Monarch } from '@/lib/tokenizer'
import { LL1Parser, IASTNode } from '@/lib/parser'
import { LL1Grammar } from './ll1Grammar'
import { $end, $accept } from '.'
import { Productions } from './grammarTypes'

interface ASTNode extends IASTNode<ASTNode> {
  t?: unknown[]
}

const monarch = new Monarch({
  expressions: {},
  tokenizer: {
    root: [[/".*?"/, 'string'], [/\w+'*/, 'symbol'], [/[:|;]/, 'operator'], [/[ \t\r\n]+/, 'white']],
  },
})

const grammar = new LL1Grammar([
  [`E`, [`P`, `E`]],
  [`E`, []],
  [`P`, [`S`, `":"`, `AS`, `";"`]],
  [`AS`, [`A`, `AS'`]],
  [`AS'`, [`"|"`, `AS`]],
  [`AS'`, []],
  [`A`, [`S`, `A`]],
  [`A`, []],
  [`S`, [`symbol`]],
  [`S`, [`string`]],
])

const parser = new LL1Parser(grammar)

function dfs(node: ASTNode) {
  if (node.children) node.children.forEach(n => dfs(n))
  walk(node)
  return node
}

function walk(node: ASTNode) {
  if (node.symbol instanceof Token) {
    node.t = [node.symbol.token]
  } else if (node.symbol === `S`) {
    node.t = node.children![0].t
  } else if (node.symbol === `A` && node.children) {
    if (node.children.length === 2) {
      const [s, a] = node.children
      node.t = s.t!.concat(a.t)
    } else node.t = []
  } else if (node.symbol === `AS'` && node.children) {
    if (node.children.length === 2) {
      node.t = node.children[1].t
    } else node.t = []
  } else if (node.symbol === `AS` && node.children) {
    const [a, as] = node.children
    node.t = [a.t, ...as.t!]
  } else if (node.symbol === `P` && node.children) {
    const [s, , as] = node.children
    node.t = as.t!.map(a => [...s.t!, a])
  } else if (node.symbol === `E` && node.children) {
    if (node.children.length === 2) {
      const [p, e] = node.children
      node.t = p.t!.concat(e.t)
    } else node.t = []
  } else if (node.symbol === $accept) {
    node.t = node.children![0].t
  }
}

export function parse(text: string): Productions {
  return <Productions>dfs(
    parser.parse(
      monarch
        .tokenize(text)
        .filter(t => t.type !== 'white')
        .concat(new Token(0, $end, $end)),
    ),
  ).t
}
