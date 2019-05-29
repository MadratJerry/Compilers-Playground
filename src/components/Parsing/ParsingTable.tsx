import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { Grammar, LL1Grammar } from '@/lib/grammar'

const ParsingTable: React.FC<{ grammar: Grammar }> = ({ grammar }) => {
  const ll1Grammar = new LL1Grammar(grammar)

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>LL(1)</TableCell>
          <TableCell style={{ color: ll1Grammar.error() === null ? '' : '#f44336' }}>
            {ll1Grammar.error() === null ? 'The grammar is LL(1).' : ll1Grammar.error()!.message}
          </TableCell>
          <TableCell>Parsing Table</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default ParsingTable
