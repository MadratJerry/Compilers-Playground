import Vertex from './vertex'
import Edge from './edge'

export default class Graph<T, E> {
  map: Map<Vertex<T>, Set<Edge<T, E>>> = new Map()

  addEdge(from: Vertex<T>, to: Vertex<T>, weight: E) {
    const edgeSet = this.map.get(from)
    const newEdge = new Edge<T, E>(from, to, weight)
    if (edgeSet) edgeSet.add(newEdge)
    else this.map.set(from, new Set([newEdge]))
  }
}
