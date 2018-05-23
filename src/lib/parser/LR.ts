import Graph from '@/lib/graph'
import { end } from '@/lib/parser/GrammarParser'
import { AnalysisTable, Production, RuleMap, SymbolTable } from '@/lib/types'

class LR {
  map: RuleMap
  symbolTable: SymbolTable
  productions: Array<Production> = []
  terms: Array<Production> = []
  setGraph = new Graph<Set<Production>, string>()
  setStack: Array<Set<Production>> = []
  analysisTable: AnalysisTable = new Map()

  constructor(map: RuleMap, table: SymbolTable) {
    this.map = map
    this.symbolTable = table
    if (map.size === 0 || table.size === 0) return
    this.makeTerms()
    this.DFA()
    this.createAT()
  }

  private makeProductions() {
    for (const a of this.map) {
      for (const rule of a[1]) {
        this.productions.push([a[0], rule])
      }
    }
  }

  private createAT() {
    const table = this.analysisTable
    const terminals = [...this.symbolTable].filter(e => e[1] === 'TERMINAL' || e[1] === 'STRING')
    for (let i = 0; i < this.setStack.length; i++) {
      const map = new Map()
      const s = this.setStack[i]
      const edges = this.setGraph.map.get(s)
      if (edges.size) {
        for (const e of edges) {
          map.set(
            e.weight,
            `${this.symbolTable.get(e.weight) !== 'NONTERMINAL' ? 'S' : ''}${this.setStack.indexOf(e.to)}`,
          )
        }
      } else {
        const p = [...s.values()][0]
        if ((p as Production & { index?: number }).index === 0) map.set(end, 'acc')
        else
          for (const t of terminals) {
            map.set(t[0], `r${(p as Production & { index?: number }).index}`)
          }
      }
      table.set(i, map)
    }
  }

  getDFAGraphviz() {
    const renderSet = (set: Set<Production>) =>
      `"I${this.setStack.indexOf(set)}: ${[...set.values()].map(s => `${s[0]}->${s[1].join('')}`).join('\\n')}"`
    const edges = []
    for (const a of this.setGraph.map) {
      for (const e of a[1]) {
        edges.push(e)
      }
    }

    return `digraph finite_state_machine {
      rankdir=LR;
      size="8,5"
      node [shape = rectangle];
      ${edges.map(e => `${renderSet(e.from)} -> ${renderSet(e.to)} [label = "${e.weight}"];`).join('\n')}
    }`
  }

  private makeTerms() {
    let index = 0
    for (const a of this.map) {
      for (const rule of a[1]) {
        for (let i = 0; i <= rule.length; i++) {
          const term: Production & { index?: number } = [a[0], [...rule.slice(0, i), '.', ...rule.slice(i)]]
          term.index = index
          this.terms.push(term)
        }
        index++
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
