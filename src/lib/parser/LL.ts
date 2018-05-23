import Graph from '@/lib/graph'
import { accept, end } from '@/lib/parser/GrammarParser'
import Tokenizer, { Token } from '@/lib/tokenizer'
import {
  ASTNode,
  Firsts,
  Follows,
  ForecastingTable,
  Production,
  RuleMap,
  RuleTerm,
  SymbolTable,
  epsilon,
} from '@/lib/types'

class LL {
  map: RuleMap
  symbolTable: SymbolTable
  forecastingTable: ForecastingTable = new Map()
  productions: Array<Production> = []
  firsts: Firsts = new Map()
  follows: Follows = new Map()
  recursiveHash: Map<string, boolean>
  isRecursive: boolean = true
  private ready: boolean = false

  constructor(map: RuleMap, table: SymbolTable) {
    this.map = map
    this.symbolTable = table
    if (map.size === 0 || table.size === 0) return
    // Add start -> first nonterminal
    this.map.get(accept)[0][1] = end
    this.isRecursive = this.checkRecursive()
    if (!this.isRecursive) {
      this.makeProductions()
      this.firstSet()
      this.followSet()
      this.createForecastTable()
      this.ready = true
    }
  }

  private createForecastTable() {
    const terminals = [...this.symbolTable].filter(e => e[1] === 'TERMINAL' || e[1] === 'STRING')
    for (const t of [...this.symbolTable].filter(e => e[1] === 'NONTERMINAL'))
      this.forecastingTable.set(t[0], new Map(terminals.map(t => [t[0], []] as any)))
    for (const p of this.productions) {
      const first = this.getFirst(p[1])
      const follow = this.getFollow(p[0])
      if (first.has(epsilon))
        for (const t of terminals) if (follow.has(t[0])) this.forecastingTable.get(p[0]).set(t[0], p)
      for (const t of terminals) if (first.has(t[0])) this.forecastingTable.get(p[0]).set(t[0], p)
    }
  }

  private makeProductions() {
    for (const a of this.map) {
      for (const rule of a[1]) {
        this.productions.push([a[0], rule])
      }
    }
  }

  private firstSet() {
    for (const a of this.map) this.firsts.set(a[0], new Set())
    for (const a of this.map) {
      this.getFirst(a[0])
    }
  }

  private followSet() {
    for (const a of this.map) this.follows.set(a[0], new Set())
    for (const a of this.map) this.getFollow(a[0])
  }

  private getFollow(term: string): Set<RuleTerm> {
    const follow = this.follows.get(term)
    if (follow.size) return follow
    for (const a of this.map) {
      for (const rule of a[1]) {
        for (let i = 0; i < rule.length; i++) {
          const t = rule[i]
          if (t === term) {
            const firsts = this.getFirst(rule.slice(i + 1, rule.length))
            for (const f of firsts) follow.add(f)
            if (firsts.has(epsilon)) for (const f of this.getFollow(a[0])) follow.add(f)
            follow.delete(epsilon)
          }
        }
      }
    }
    return follow
  }

  private getFirst(term: string | Array<string>): Set<RuleTerm> {
    if (Array.isArray(term)) {
      if (term.length) return this.getFirst(term[0])
      else return new Set([epsilon])
    }
    if (this.symbolTable.get(term) === 'STRING' || this.symbolTable.get(term) === 'TERMINAL' || term === epsilon)
      return new Set([term])
    const first = this.firsts.get(term)
    if (first.size) return first
    const rules = this.map.get(term)
    for (const rule of rules) {
      if (rule.length) {
        const t = rule[0]
        this.getFirst(t).forEach(f => first.add(f))
      }
    }
    return first
  }

  private checkRecursive(): boolean {
    const graph = new Graph<string, any>()
    for (const a of this.map) {
      for (const rule of a[1]) {
        const t = rule[0]
        if (t && this.symbolTable.get(t) === 'NONTERMINAL') graph.addEdge(a[0], t, '')
      }
    }
    const stack = []
    for (const d of graph.degreeMap) if (d[1].in === 0) stack.push(d[0])
    while (stack.length !== 0) {
      const top = stack.pop()
      for (const e of graph.map.get(top)) graph.removeEdge(top, e.to)
      for (const d of graph.degreeMap) if (d[1].in === 0 && d[1].out) stack.push(d[0])
    }
    return !graph.isEmpty()
  }

  parse(code: string, tokenizer: Tokenizer) {
    if (!this.ready) return
    const sddFn = (sdd: string) => ($$: ASTNode, $: Array<ASTNode>) => {
      try {
        let _
        eval(sdd)
        return _
      } catch (e) {
        throw $$
      }
    }
    const root = {
      value: accept,
      type: 'NONTERMINAL',
      children: [],
      parent: null,
    } as ASTNode
    const stack = [root]

    tokenizer.parse(code)
    const tokens = [...tokenizer.tokens, { value: end }] as Array<Token>
    let index = 0

    while (stack.length) {
      const top = stack.pop()
      const token = tokens[index]
      if (top.type !== 'NONTERMINAL' && (top.value === token.type || top.value === token.value)) {
        top.token = token
        index++
      } else if (top.type !== 'NONTERMINAL') console.log('error')
      else {
        const p =
          this.forecastingTable.get(top.value).get(token.type) || this.forecastingTable.get(top.value).get(token.value)
        if (!p) console.log('Unexpected token')
        else {
          top.fn = sddFn((p[1] as Array<string> & { sdd?: string }).sdd || '')
          top.children = [...p[1]]
            .filter(t => t !== epsilon)
            .map(t => ({ value: t, type: this.symbolTable.get(t), parent: top, children: [] }))
          ;[...top.children].reverse().forEach(t => stack.push(t))
        }
      }
    }
    const SD = (root: ASTNode): any => {
      if (root.type === 'NONTERMINAL') root.children.forEach(c => SD(c))
      if (root.fn) return root.fn(root, root.children)
    }
    const result = SD(root)
    return result
  }
}

export default LL
