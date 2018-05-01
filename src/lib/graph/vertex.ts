let hash = 0
export default class Vertex<T> {
  label: T
  hash: number
  constructor(label?: T) {
    this.label = label
    this.hash = hash++
  }

  toString() {
    return this.label || this.hash
  }
}
