import React from 'react'
import classNames from 'classnames'
import { makeStyles, createStyles } from '@material-ui/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import { LL1Parser } from '@/lib/parser'
import { ProductionLink } from './ProductionList'
import { production } from '@/lib/grammar'

const useStyles = makeStyles(
  // FIXME: The styles order
  createStyles({
    conflict: {
      backgroundColor: '#f44336',
      display: 'inline-flex',
    },
  }),
)

const LL1ParsingTable: React.SFC<{
  parser: LL1Parser
  onClickLink?: (e: React.MouseEvent<HTMLDivElement>) => void
}> = ({ parser, onClickLink = () => {} }) => {
  const classes = useStyles()

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
              <TableCell
                align="left"
                key={t}
                className={classNames({
                  [classes.conflict]:
                    parser
                      .getPredictiveTable()
                      .get(n)!
                      .get(t)!.length > 1,
                })}
              >
                {parser
                  .getPredictiveTable()
                  .get(n)!
                  .get(t)!
                  .map(i => (
                    <Tooltip key={i} title={production(parser.getGrammar().getProductions()[i])} placement="top-start">
                      <div onClick={onClickLink}>
                        <ProductionLink index={i} />
                      </div>
                    </Tooltip>
                  ))}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default LL1ParsingTable
