import React, { useEffect, useState, useRef } from 'react'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import * as d3 from 'd3'
import dagreD3 from 'dagre-d3'
import { parse, State } from '@/lib/automata'
import './index.css'

const Automata = () => {
  const [value, setValue] = useState(``)
  const svgRef = useRef<SVGSVGElement>(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => setValue(target.value)
  useEffect(() => {
    try {
      const fa = parse(value)
      const g = new dagreD3.graphlib.Graph({})
      g.setGraph({ rankdir: 'LR', marginx: 20, marginy: 20 })
      g.graph().transition = selection => selection.transition().duration(500)

      let id = 0
      const indexMap: Map<State, number> = new Map()
      const getId = (s: State): number => {
        if (!indexMap.has(s)) indexMap.set(s, id++)
        return indexMap.get(s)!
      }
      const addEdge = (f: State, t: State, v: string) => {
        g.setNode(getId(f) + '', { shape: 'circle' })
        g.setNode(getId(t) + '', { shape: 'circle' })
        g.setEdge(getId(f) + '', getId(t) + '', {
          label: v,
          curve: d3.curveMonotoneX,
        })
      }
      const visited: Set<State> = new Set()
      const walk = (n: State) => {
        if (visited.has(n)) return
        else visited.add(n)
        const edges = fa.map.get(n)
        if (edges)
          edges.forEach((v, s) => {
            addEdge(n, s, v)
            walk(s)
          })
      }
      walk(fa.start)

      const svg = d3.select(svgRef.current),
        inner = svg.select('g'),
        zoom = d3.zoom().on('zoom', function() {
          inner.attr('transform', d3.event.transform)
        })

      const render = new dagreD3.render()
      // @ts-ignore
      svg.call(zoom)
      // @ts-ignore
      render(inner, g)
    } catch (e) {}
  })

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        Finite Automata
      </Typography>
      <TextField
        id="outlined-name"
        label="Regular Expression"
        value={value}
        onChange={handleChange}
        margin="normal"
        variant="outlined"
        fullWidth
      />
      <Typography variant="h3" gutterBottom>
        NFA
      </Typography>
      <svg width="100%" height="300" ref={svgRef}>
        <g />
      </svg>
    </div>
  )
}

export default Automata
