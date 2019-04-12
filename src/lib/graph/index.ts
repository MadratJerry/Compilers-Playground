class Graph<T, E> {
  private _id: number = 0
  map: Map<number, Map<number, E | undefined>> = new Map()
  vertexHash: Map<T, number> = new Map()

  public addEdge(from: T, to: T, value?: E) {
    const fromId = this.getId(from)
    const toId = this.getId(to)

    const edgeMap = this.map.get(fromId)
    if (edgeMap) {
      edgeMap.set(toId, value)
    } else {
      this.map.set(fromId, new Map([[toId, value]]))
    }
  }

  public removeEdge(from: T, to: T) {
    const fromId = this.getId(from)
    const toId = this.getId(to)

    const edgeMap = this.map.get(fromId)
    if (edgeMap) edgeMap.delete(toId)
  }

  private getId(v: T): number {
    const id = this.vertexHash.get(v)
    return id !== undefined ? id : this.vertexHash.set(v, this._id) && this._id++
  }
}

export default Graph
