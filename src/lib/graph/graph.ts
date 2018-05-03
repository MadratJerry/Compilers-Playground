import Edge from './edge'

export default class Graph<T, E> {
  start?: T | any
  end?: T | any
  map: Map<T, Set<Edge<T, E>>> = new Map()

  addEdge(from: T, to: T, weight: E) {
    const edgeSet = this.map.get(from)
    const newEdge = new Edge<T, E>(from, to, weight)
    if (edgeSet) edgeSet.add(newEdge)
    else this.map.set(from, new Set([newEdge]))
    if (!this.map.get(to)) this.map.set(to, new Set())
  }
}
