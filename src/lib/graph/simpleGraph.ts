import { AbstractGraph } from '.'

export class SimpleGraph<VertexType> extends AbstractGraph<VertexType> {
  private readonly _map: Map<number, Set<number>> = new Map()

  public addEdge(from: VertexType, to: VertexType) {
    const fromId = this.getId(from)
    const toId = this.getId(to)

    const vertexSet = this._map.get(fromId)
    if (vertexSet) {
      vertexSet.add(toId)
    } else {
      this._map.set(fromId, new Set([toId]))
    }
  }

  public removeEdge(from: VertexType, to: VertexType) {
    const fromId = this.getId(from)
    const toId = this.getId(to)

    const vertexSet = this._map.get(fromId)
    if (vertexSet) vertexSet.delete(toId)
  }
}
