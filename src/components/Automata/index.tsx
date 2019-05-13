import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { makeStyles, createStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { parse, dfa, FiniteAutomata, mfa, DFAState, MFAState, NFAState, State } from '@/lib/automata'
import AutomataView from './AutomataView'

const useStyles = makeStyles(() =>
  createStyles({
    error: {
      color: '#f44336',
    },
    expression: {
      marginLeft: 14,
    },
  }),
)

const Automata = () => {
  const classes = useStyles()
  const [value, setValue] = useState(``)
  const [error, setError] = useState<Error | null>(null)
  const [fa, setFa] = useState<Array<FiniteAutomata<any>>>([])
  const [highlights, setHighlights] = useState<Array<Set<string>>>([])

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => setValue(target.value)

  const handleHighlightClean = () => setHighlights([])
  const handleNFAFns: Array<[string, (id: State<any>) => void]> = [
    ['mouseover', (s: NFAState) => setHighlights([new Set([`${s}`]), new Set(), new Set()])],
  ]

  const handleDFAFns: typeof handleNFAFns = [
    ['mouseover', (s: DFAState) => setHighlights([new Set([...s.id].map(n => `${n}`)), new Set([`${s}`]), new Set()])],
  ]

  const handleMFAFns: typeof handleNFAFns = [
    ['mouseover', (s: MFAState) => setHighlights([new Set(), new Set([...s.id].map(n => `${n}`)), new Set([`${s}`])])],
  ]

  useEffect(() => {
    if (!value) {
      setFa([])
      setError(null)
      return
    }
    try {
      const NFA = parse(value)
      const DFA = dfa(NFA)
      const MFA = mfa(DFA)
      setFa([NFA, DFA, MFA])
      setHighlights([])
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [value])

  return (
    <div>
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
      <AutomataView fa={fa[0]} highlight={highlights[0]} onFns={handleNFAFns} onClick={handleHighlightClean} />
      <Typography variant="h3" gutterBottom>
        DFA
      </Typography>
      <AutomataView fa={fa[1]} highlight={highlights[1]} onFns={handleDFAFns} onClick={handleHighlightClean} />
      <Typography variant="h3" gutterBottom>
        MFA
      </Typography>
      <AutomataView fa={fa[2]} highlight={highlights[2]} onFns={handleMFAFns} onClick={handleHighlightClean} />
    </div>
  )
}

export default Automata
