import Vertex from './vertex'

export default class Edge<T, E> {
  from: T
  to: T
  weight: E
  constructor(from: T, to: T, weight: E) {
    this.from = from
    this.to = to
    this.weight = weight
  }
}
