import Graph from '@/lib/graph'
import { Firsts, Follows, Production, RuleMap, RuleTerm, SymbolTable } from '@/lib/types'

class LL {
  map: RuleMap
  table: SymbolTable
  productions: Array<Production> = []
  firsts: Firsts = new Map()
  follows: Follows = new Map()
  recursiveHash: Map<string, boolean>
  isRecursive: boolean = true

  constructor(map: RuleMap, table: SymbolTable) {
    this.map = map
    this.table = table
    this.isRecursive = this.checkRecursive()
    if (!this.isRecursive) {
      this.makeProductions()
      this.firstSet()
      this.followSet()
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
  }

  private getFirst(term: string): Set<RuleTerm> {
    const first = this.firsts.get(term)
    if (first.size) return first
    const rules = this.map.get(term)
    for (const rule of rules) {
      if (rule.length) {
        const t = rule[0]
        if (this.table.get(t) === 'STRING' || this.table.get(t) === 'TERMINAL') first.add(t)
        else if (this.table.get(t) === 'NONTERMINAL') {
          this.getFirst(t).forEach(f => first.add(f))
        }
      }
    }
    return first
  }

  private checkRecursive(): boolean {
    const graph = new Graph<string, any>()
    for (const a of this.map) {
      for (const rule of a[1]) {
        const t = rule[0]
        if (t && this.table.get(t) === 'NONTERMINAL') graph.addEdge(a[0], t, '')
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
}

export default LL
