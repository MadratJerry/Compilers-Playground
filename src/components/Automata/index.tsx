import React, { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { parse, dfa, FiniteAutomata } from '@/lib/automata'
import AutomataView from './AutomataView'

const useStyles = makeStyles(() => ({
  error: {
    color: '#f44336',
  },
  expression: {
    marginLeft: 14,
  },
}))

const Automata = () => {
  const classes = useStyles()
  const [value, setValue] = useState(``)
  const [error, setError] = useState<Error | null>(null)
  const [fa, setFa] = useState<Array<FiniteAutomata<any>>>([])

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => setValue(target.value)
  useEffect(() => {
    if (!value) {
      setFa([])
      setError(null)
      return
    }
    try {
      const nfa = parse(value)
      setFa([nfa, dfa(nfa)])
      setError(null)
    } catch (e) {
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
      <AutomataView fa={fa[0]} />
      <Typography variant="h3" gutterBottom>
        DFA
      </Typography>
      <AutomataView fa={fa[1]} />
    </div>
  )
}

export default Automata
