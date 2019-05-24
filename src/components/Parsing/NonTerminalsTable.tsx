import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import { Grammar, Symbol } from '@/lib/grammar'
import ProductionLink, { production } from './ProductionLink'

export const set = (s: Set<Symbol>) => (s.size ? [...s].join(' , ') : '∅')

export const series = (start: number, end: number): Array<number> => {
  const s = []
  for (; start < end; start++) s.push(start)
  return s
}

const NonTerminalsTable: React.SFC<{ grammar: Grammar }> = ({ grammar }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align="left">Symbol</TableCell>
          <TableCell align="left">Nullable</TableCell>
          <TableCell align="left">First</TableCell>
          <TableCell align="left">Follow</TableCell>
          <TableCell align="left">Productions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[...grammar.nonTerminals().values()].map(n => (
          <TableRow key={n}>
            <TableCell component="th" scope="row">
              {n}
            </TableCell>
            <TableCell>{grammar.nullable(n) ? 'True' : 'False'}</TableCell>
            <TableCell>{set(grammar.first(n))}</TableCell>
            <TableCell>{set(grammar.follow(n))}</TableCell>
            <TableCell>
              {series(...grammar.getProductionsIndex(n)!).map(i => (
                <Tooltip key={i} title={production(grammar.getProductions()[i])} placement="top-start">
                  <ProductionLink index={i} />
                </Tooltip>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default NonTerminalsTable
