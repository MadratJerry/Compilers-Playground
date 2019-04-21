import { AbstractGraph } from '.'

export class Graph<VertexType, ValueType> extends AbstractGraph<VertexType> {
  private readonly _map: Map<number, Map<number, ValueType>> = new Map()

  public addEdge(from: VertexType, to: VertexType, value: ValueType) {
    const fromId = this.getId(from)
    const toId = this.getId(to)

    const edgeMap = this._map.get(fromId)
    if (edgeMap) {
      edgeMap.set(toId, value)
    } else {
      this._map.set(fromId, new Map([[toId, value]]))
    }
  }

  public removeEdge(from: VertexType, to: VertexType) {
    const fromId = this.getId(from)
    const toId = this.getId(to)

    const edgeMap = this._map.get(fromId)
    if (edgeMap) edgeMap.delete(toId)
  }
}
