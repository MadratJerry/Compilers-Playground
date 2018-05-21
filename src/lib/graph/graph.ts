import Edge from './edge'

type degree = { in: number; out: number }
export default class Graph<T, E> {
  start?: T | any
  end?: T | any
  map: Map<T, Set<Edge<T, E>>> = new Map()
  degreeMap: Map<T, degree> = new Map()
  edgeCount: number = 0

  addEdge(from: T, to: T, weight: E) {
    this.edgeCount++
    this.addOut(from)
    this.addIn(to)
    const edgeSet = this.map.get(from)
    const newEdge = new Edge<T, E>(from, to, weight)
    if (edgeSet) edgeSet.add(newEdge)
    else this.map.set(from, new Set([newEdge]))
    if (!this.map.get(to)) this.map.set(to, new Set())
  }

  removeEdge(from: T, to: T) {
    const edgeSet = this.map.get(from)
    if (edgeSet) {
      for (const e of edgeSet)
        if (e.to === to) {
          this.edgeCount--
          edgeSet.delete(e)
          this.subOut(from)
          this.subIn(e.to)
        }
    }
  }

  isEmpty(): boolean {
    return this.edgeCount === 0
  }

  private addIn(node: T) {
    if (this.degreeMap.get(node)) this.degreeMap.get(node).in++
    else this.degreeMap.set(node, { in: 1, out: 0 })
  }

  private addOut(node: T) {
    if (this.degreeMap.get(node)) this.degreeMap.get(node).out++
    else this.degreeMap.set(node, { in: 0, out: 1 })
  }

  private subIn(node: T) {
    this.degreeMap.get(node).in--
  }

  private subOut(node: T) {
    this.degreeMap.get(node).out--
  }
}
