import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import dagreD3 from 'dagre-d3'
import { bfs, State, FiniteAutomata } from '@/lib/automata'
import { Equal } from '@/lib/enhance'
import './AutomataView.css'

const AutomataView: React.SFC<{ fa: FiniteAutomata<any> | undefined }> = ({ fa }) => {
  const svgRef = useRef<SVGSVGElement>(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))

  useEffect(() => {
    if (!fa) {
      svgRef.current.innerHTML = `<g></g>`
      return
    }
    const g = new dagreD3.graphlib.Graph({})
    g.setGraph({ rankdir: 'LR', marginx: 20, marginy: 20 })
    g.graph().transition = selection => selection.transition().duration(500)

    const addEdge = <T extends Equal<T>>(f: State<T>, t: State<T>, v: string) => {
      g.setNode(`${f}`, { shape: 'circle' })
      g.setNode(`${t}`, { shape: 'circle' })
      g.setEdge(`${f}`, `${t}`, {
        label: v,
        curve: d3.curveBasis,
      })
    }

    bfs(fa, addEdge)
    g.setNode(`${fa.end}`, { shape: 'doubleCircle' })

    const svg = d3.select(svgRef.current),
      inner = svg.select('g'),
      zoom = d3.zoom().on('zoom', function() {
        inner.attr('transform', d3.event.transform)
      })

    const render = new dagreD3.render()
    render.shapes().doubleCircle = function(parent, bbox, node) {
      const r = Math.max(bbox.width, bbox.height) / 2

      parent
        .insert('circle', ':first-child')
        .attr('x', -bbox.width / 2)
        .attr('y', -bbox.height / 2)
        .attr('r', r)
      parent
        .insert('circle', ':first-child')
        .attr('x', -bbox.width / 2)
        .attr('y', -bbox.height / 2)
        .attr('r', r - 3)

      node.intersect = function(point: any) {
        return dagreD3.intersect.circle(node, r as any, point)
      }

      return parent
    }
    // @ts-ignore
    svg.call(zoom)
    // @ts-ignore
    render(inner, g)
  }, [fa])
  return (
    <svg width="100%" height="300" ref={svgRef}>
      <g />
    </svg>
  )
}

export default AutomataView
