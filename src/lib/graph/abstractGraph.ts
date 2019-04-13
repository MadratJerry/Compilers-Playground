export default abstract class AbstractGraph<VertexType> {
  private _id: number = 0
  private readonly _vertexMap: Map<VertexType, number> = new Map()

  public abstract addEdge(from: VertexType, to: VertexType, value: unknown): void

  public abstract removeEdge(from: VertexType, to: VertexType): void

  protected getId(v: VertexType): number {
    const id = this._vertexMap.get(v)
    return id !== undefined ? id : this._vertexMap.set(v, this._id) && this._id++
  }
}
