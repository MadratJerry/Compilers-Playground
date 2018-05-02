let hash = 0
export default class Vertex<T> {
  label: T
  constructor(label?: T) {
    this.label = label
  }

  toString() {
    return this.label
  }
}
