import React, { useState } from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import Modal from '@material-ui/core/Modal'
import Table from '@material-ui/core/Table'
import Button from '@material-ui/core/Button'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Paper from '@material-ui/core/Paper'
import { Grammar, LL1Grammar } from '@/lib/grammar'
import LL1ParsingTable from './LL1ParsingTable'
import { LL1Parser } from '@/lib/parser'

const useStyles = makeStyles(
  createStyles({
    paper: {
      position: 'absolute',
      width: '80%',
      maxHeight: '80%',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%)`,
      overflow: 'scroll',
    },
  }),
)

const ParsingTable: React.FC<{ grammar: Grammar }> = ({ grammar }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const ll1Grammar = new LL1Grammar(grammar)

  const handleClose = () => setOpen(false)

  const handleOpen = () => setOpen(true)

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>LL(1)</TableCell>
          <TableCell style={{ color: ll1Grammar.error() === null ? '' : '#f44336' }}>
            {ll1Grammar.error() === null ? 'The grammar is LL(1).' : ll1Grammar.error()!.message}
          </TableCell>
          <TableCell onClick={handleOpen}>
            <Button color="primary">Parsing Table</Button>
          </TableCell>
          <Modal open={open} onClose={handleClose}>
            <Paper className={classes.paper}>
              <LL1ParsingTable parser={new LL1Parser(ll1Grammar)} onClickLink={handleClose} />
            </Paper>
          </Modal>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default ParsingTable
