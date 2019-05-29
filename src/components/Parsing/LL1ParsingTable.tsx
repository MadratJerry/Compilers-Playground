import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import { LL1Parser } from '@/lib/parser'
import { ProductionLink } from './ProductionList'
import { production } from '@/lib/grammar'

const LL1ParsingTable: React.SFC<{ parser: LL1Parser }> = ({ parser }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          {[
            ...parser
              .getGrammar()
              .terminals()
              .values(),
          ].map(t => (
            <TableCell key={t} align="left">
              {t}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          ...parser
            .getGrammar()
            .nonTerminals()
            .values(),
        ].map(n => (
          <TableRow key={n}>
            <TableCell component="th" scope="row">
              {n}
            </TableCell>
            {[
              ...parser
                .getGrammar()
                .terminals()
                .values(),
            ].map(t => (
              <TableCell align="left" key={t}>
                <Tooltip
                  title={production(
                    parser.getGrammar().getProductions()[
                      parser!
                        .getPredictiveTable()
                        .get(n)!
                        .get(t)!
                    ],
                  )}
                  placement="top-start"
                >
                  <ProductionLink
                    index={
                      parser!
                        .getPredictiveTable()
                        .get(n)!
                        .get(t)!
                    }
                  />
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default LL1ParsingTable
