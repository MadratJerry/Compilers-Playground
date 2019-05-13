import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import dagreD3 from 'dagre-d3'
import { bfs, State, FiniteAutomata } from '@/lib/automata'
import { Equal } from '@/lib/enhance'
import './AutomataView.css'

const AutomataView: React.SFC<{
  fa: FiniteAutomata<any> | undefined
  highlight?: Set<string>
  onClick?: () => void
  onFns?: Array<[string, (id: State<any>) => void]>
}> = ({ fa, highlight = new Set(), onClick = () => {}, onFns = [] }) => {
  const svgRef = useRef<SVGSVGElement>(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))

  useEffect(() => {
    if (!fa) {
      svgRef.current.innerHTML = `<g></g>`
      return
    }
    const map: Map<string, State<any>> = new Map()
    const g = new dagreD3.graphlib.Graph({ multigraph: true })
    g.setGraph({ rankdir: 'LR', marginx: 20, marginy: 20 })
    g.graph().transition = selection => selection.transition().duration(500)

    const addEdge = <T extends Equal<T>>(f: State<T>, t: State<T>, v: string) => {
      g.setNode(`${f}`, { shape: 'circle' })
      g.setNode(`${t}`, { shape: 'circle' })
      g.setEdge(
        `${f}`,
        `${t}`,
        {
          label: v,
          curve: d3.curveBasis,
        },
        v,
      )
    }

    bfs(fa, addEdge, s => map.set(`${s}`, s))
    Array.isArray(fa.end)
      ? fa.end.forEach(e => g.setNode(`${e}`, { shape: 'doubleCircle' }))
      : g.setNode(`${fa.end}`, { shape: 'doubleCircle' })
    highlight.forEach(n => g.setNode(n, { style: 'fill: yellow;', ...g.node(n) }))

    const svg = d3.select(svgRef.current),
      inner = svg.select('g'),
      zoom = d3.zoom().on('zoom', function() {
        inner.attr('transform', d3.event.transform)
      })

    const render = new dagreD3.render()
    render.shapes().doubleCircle = function(parent, bbox, node) {
      const { style } = node
      const r = Math.max(bbox.width, bbox.height) / 2
      const shapeSvg = parent.insert('g', ':first-child')
      shapeSvg
        .insert('circle', ':first-child')
        .attr('x', -bbox.width / 2)
        .attr('y', -bbox.height / 2)
        .attr('r', r - 3)
      shapeSvg
        .insert('circle', ':first-child')
        .attr('x', -bbox.width / 2)
        .attr('y', -bbox.height / 2)
        .attr('r', r)
        .attr('style', style)

      node.intersect = (point: any) => dagreD3.intersect.circle(node, r as any, point)

      return shapeSvg
    }
    // @ts-ignore
    svg.call(zoom)
    // @ts-ignore
    render(inner, g)
    svg.on('click', onClick)
    onFns.forEach(([type, listener]) => svg.selectAll('g.node').on(type, id => listener(map.get(id as string)!)))
  }, [fa, highlight])
  return (
    <svg width="100%" height="300" ref={svgRef} className="automata-view">
      <g />
    </svg>
  )
}

export default AutomataView
