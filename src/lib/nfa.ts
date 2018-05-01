import Graph, { Vertex } from './graph'

const epsilon = 'ε'

export default class NFA extends Graph<number, string> {
  symbol: string
  start: Vertex<number>
  end: Vertex<number>

  constructor(symbol: string) {
    super()
    this.symbol = symbol
    this.start = new Vertex()
    this.end = new Vertex()
    this.addEdge(this.start, this.end, symbol)
  }

  closure() {
    const start = new Vertex<number>()
    const end = new Vertex<number>()
    this.addEdge(start, this.start, epsilon)
    this.addEdge(start, end, epsilon)
    this.addEdge(this.end, end, epsilon)
    this.addEdge(this.end, this.start, epsilon)
    this.start = start
    this.end = end
  }

  concat(nfa: NFA) {
    if (!nfa) return
    nfa.map.forEach((v, k) => this.map.set(k, v))
    this.map.get(nfa.start).forEach(e => this.addEdge(this.end, e.to, e.weight))
    this.map.delete(nfa.start)
    this.end = nfa.end
  }

  union(nfa: NFA) {
    if (!nfa) return
    const start = new Vertex<number>()
    const end = new Vertex<number>()
    nfa.map.forEach((v, k) => this.map.set(k, v))
    this.addEdge(start, this.start, epsilon)
    this.addEdge(start, nfa.start, epsilon)
    this.addEdge(this.end, end, epsilon)
    this.addEdge(nfa.end, end, epsilon)
    this.start = start
    this.end = end
  }

  showGraphviz() {
    console.group()
    let s: any = []
    this.map.forEach(v => {
      v.forEach(e => s.push(`${e.from} -> ${e.to} [ label = "${e.weight}" ];`))
    })
    console.log(`
  digraph finite_state_machine {
  rankdir=LR;
  size="8,5"
  node [shape = doublecircle]; ${this.end};
  node [shape = circle];
  ${s.join('\n')}
}`)
    console.groupEnd()
  }
}
