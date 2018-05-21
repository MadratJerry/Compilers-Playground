import Graph from '@/lib/graph'
import { RuleMap } from '@/lib/types'

class LL {
  map: RuleMap
  recursiveHash: Map<string, boolean>
  isRecursive: boolean

  constructor(map: RuleMap) {
    this.map = map
    this.isRecursive = this.checkRecursive()
  }

  private checkRecursive(): boolean {
    const graph = new Graph<string, any>()
    for (const a of this.map) {
      for (const rule of a[1]) {
        const t = rule[0]
        if (typeof t !== 'string' && t.type === 'TERMINAL') graph.addEdge(a[0], t.value, '')
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
