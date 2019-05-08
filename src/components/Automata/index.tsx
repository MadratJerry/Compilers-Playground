import React, { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import * as d3 from 'd3'
import dagreD3 from 'dagre-d3'
import { parse, State, bfs, dfa } from '@/lib/automata'
import './index.css'

const useStyles = makeStyles(theme => ({
  error: {
    color: '#f44336',
  },
  expression: {
    marginLeft: 14,
  },
}))

const Automata = () => {
  const classes = useStyles()
  const [value, setValue] = useState(`(a|b)*abb`)
  const [error, setError] = useState<Error | null>(null)
  const svgRef = useRef<SVGSVGElement>(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => setValue(target.value)
  useEffect(() => {
    if (!value) {
      svgRef.current.innerHTML = `<g></g>`
      setError(null)
      return
    }
    try {
      const fa = parse(value)
      const g = new dagreD3.graphlib.Graph({})
      g.setGraph({ rankdir: 'LR', marginx: 20, marginy: 20 })
      g.graph().transition = selection => selection.transition().duration(500)

      const addEdge = (f: State, t: State, v: string) => {
        g.setNode(f.id + '', { shape: 'circle' })
        g.setNode(t.id + '', { shape: 'circle' })
        g.setEdge(f.id + '', t.id + '', {
          label: v,
          curve: d3.curveMonotoneX,
        })
      }

      bfs(fa, addEdge)
      dfa(fa)

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
      setError(null)
    } catch (e) {
      console.log(e)
      setError(e)
    }
  }, [value])

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        Finite Automata
      </Typography>
      <TextField
        error={error === null ? false : true}
        id="outlined-name"
        label="Regular Expression"
        value={value}
        onChange={handleChange}
        margin="normal"
        variant="outlined"
        fullWidth
      />
      <Typography
        variant="subtitle1"
        gutterBottom
        className={classNames(classes.expression, { [classes.error]: error !== null })}
      >
        {error === null ? '' : error.message}
      </Typography>
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
