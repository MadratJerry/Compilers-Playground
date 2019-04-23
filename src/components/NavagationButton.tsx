import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/styles'
import Fab from '@material-ui/core/Fab'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import NavagationList from '@/components/NavigationList'
import AnimateMenuIcon from '@/components/AnimateMenuIcon'

const useStyles = makeStyles(theme => ({
  fab: { position: 'fixed', top: 8, left: 8, zIndex: 1 },
  popper: { marginTop: theme.spacing.unit, zIndex: 1 },
}))

const NavagationButton = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const anchorEl = useRef<HTMLButtonElement>(null)

  const handleToggle = () => setOpen(!open)

  const handleClose = (event: React.ChangeEvent<{} | Node>) => {
    if (event.target instanceof Node && anchorEl.current && anchorEl.current.contains(event.target)) return

    setOpen(false)
  }

  const handleListClick = () => setOpen(false)

  return (
    <>
      <Fab
        size="small"
        buttonRef={anchorEl}
        aria-owns={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className={classes.fab}
      >
        <AnimateMenuIcon toggle={open} />
      </Fab>
      <Popper
        open={open}
        anchorEl={anchorEl.current}
        transition
        disablePortal
        className={classes.popper}
        onClick={handleListClick}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <NavagationList />
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export default NavagationButton
