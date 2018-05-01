import Vertex from './vertex'

export default class Edge<T, E> {
  from: Vertex<T>
  to: Vertex<T>
  weight: E
  constructor(from: Vertex<T>, to: Vertex<T>, weight: E) {
    this.from = from
    this.to = to
    this.weight = weight
  }
}
