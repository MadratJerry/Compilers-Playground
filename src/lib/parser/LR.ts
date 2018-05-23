import Graph from '@/lib/graph'
import { Production, RuleMap, SymbolTable } from '@/lib/types'

class LR {
  map: RuleMap
  symbolTable: SymbolTable
  terms: Array<Production> = []
  setGraph = new Graph<Set<Production>, string>()
  setStack: Array<Set<Production>> = []

  constructor(map: RuleMap, table: SymbolTable) {
    this.map = map
    this.symbolTable = table
    if (map.size === 0 || table.size === 0) return
    this.makeTerms()
    this.DFA()
  }

  private makeTerms() {
    for (const a of this.map) {
      for (const rule of a[1]) {
        for (let i = 0; i <= rule.length; i++) {
          this.terms.push([a[0], [...rule.slice(0, i), '.', ...rule.slice(i)]])
        }
      }
    }
  }

  private DFA() {
    this.setStack = [new Set([this.terms[0], ...this.getExpand(this.terms[0])])]
    for (const a of this.setStack) {
      for (const p of a) {
        const t = p[1]
        const i = t.indexOf('.')
        if (i !== t.length - 1) {
          const next = this.terms[this.terms.indexOf(p) + 1]
          const set = new Set([next, ...this.getExpand(next)])
          let equalSet = null
          for (const s of this.setStack) if (this.isSetEqual(s, set)) equalSet = s
          if (equalSet === null) this.setStack.push((equalSet = set))
          this.setGraph.addEdge(a, equalSet, t[i + 1])
        }
      }
    }
  }

  private isSetEqual(a: Set<Production>, b: Set<Production>) {
    if (a.size === b.size) {
      let i = 0
      for (const p of a) if (b.has(p)) i++
      return a.size === i
    } else return false
  }

  private getExpand(p: Production): Array<Production> {
    const t = p[1]
    const i = t.indexOf('.')
    if (i !== t.length - 1) {
      return this.getTerms(t[i + 1])
    } else return []
  }

  private getTerms(name: string): Array<Production> {
    return this.terms.filter(t => t[0] === name && t[1][0] === '.')
  }
}

export default LR
