import Graph from '@/lib/graph'
import { Firsts, Production, RuleMap, RuleTerm } from '@/lib/types'

class LL {
  map: RuleMap
  productions: Array<Production>
  firsts: Firsts = new Map()
  recursiveHash: Map<string, boolean>
  isRecursive: boolean = true

  constructor(map: RuleMap) {
    this.map = map
    this.isRecursive = this.checkRecursive()
    if (!this.isRecursive) {
      this.firstSet()
    }
  }

  private firstSet() {
    for (const a of this.map) this.firsts.set(a[0], new Set())
    for (const a of this.map) {
      this.getFirst(a[0])
    }
  }

  private getFirst(term: string): Set<RuleTerm> {
    const first = this.firsts.get(term)
    if (first.size) return first
    const rules = this.map.get(term)
    for (const rule of rules) {
      if (rule.length) {
        const t = rule[0]
        if (typeof t === 'string' || t.type === 'TERMINAL') first.add(t)
        else if (t.type === 'NONTERMINAL') this.getFirst(t.value).forEach(f => first.add(f))
      }
    }
    return first
  }

  private checkRecursive(): boolean {
    const graph = new Graph<string, any>()
    for (const a of this.map) {
      for (const rule of a[1]) {
        const t = rule[0]
        if (t && typeof t !== 'string' && t.type === 'NONTERMINAL') graph.addEdge(a[0], t.value, '')
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
