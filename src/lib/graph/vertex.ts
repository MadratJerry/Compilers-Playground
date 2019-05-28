export class Vertex<T = unknown, E = unknown> {
  public value: T
  public out: Set<[this, E]> = new Set()

  public constructor(value: T) {
    this.value = value
  }

  static connect(from: Vertex, to: Vertex, value?: unknown) {
    from.out.add([to, value])
  }
}
