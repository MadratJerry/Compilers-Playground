import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Fab from '@material-ui/core/Fab'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import NavagationList from './NavigationList'
import AnimateMenuIcon from './AnimateMenuIcon'

const useStyles = makeStyles(theme => ({
  fab: { position: 'fixed', top: 8, left: 8 },
  popper: { marginTop: theme.spacing.unit },
}))

const NavagationButton = () => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const anchorEl = React.useRef(null) as any

  const handleToggle = () => setOpen(!open)

  const handleClose = (event: React.ChangeEvent<{}>) => {
    if (anchorEl.current.contains(event.target)) return
    setOpen(false)
  }

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
      <Popper open={open} anchorEl={anchorEl.current} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper className={classes.popper}>
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
