import Vertex from './vertex'
import Edge from './edge'

export default class Graph<T, E> {
  private vertexMap: Map<T, Vertex<T>> = new Map()
  map: Map<Vertex<T>, Set<Edge<T, E>>> = new Map()

  addEdge(from: T, to: T, weight: E) {
    const edgeSet = this.map.get(this.getVertex(from))
    const newEdge = new Edge<T, E>(this.getVertex(from), this.getVertex(to), weight)
    if (edgeSet) edgeSet.add(newEdge)
    else this.map.set(this.getVertex(from), new Set([newEdge]))
  }

  getVertex(v: T) {
    let vertex = this.vertexMap.get(v)
    if (!vertex) {
      vertex = new Vertex(v)
      this.vertexMap.set(v, vertex)
    }
    return vertex
  }
}
