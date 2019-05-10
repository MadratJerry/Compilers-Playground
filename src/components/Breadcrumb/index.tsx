import React, { useCallback, useState, useRef } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core/styles'
import Popper from '@material-ui/core/Popper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Zoom from '@material-ui/core/Zoom'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import { routes } from '@/components/Router'
import HideOnScroll from '@/components/HideOnScroll'
import StyledBreadcrumb from './StyledBreadcrumb'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
      position: 'fixed',
      top: 0,
      zIndex: 2,
    },
    poppers: {
      display: 'flex',
      flexDirection: 'column',
      '& *': {
        marginTop: 8,
      },
    },
  }),
)

const CustomizedBreadcrumbs: React.SFC<RouteComponentProps> = ({ history }) => {
  const { pathname } = location
  const classes = useStyles()
  const ref = useRef(null)
  const [open, setOpen] = useState(false)

  const handleClick = (path: string) => () => {
    setOpen(false)
    history.push(path)
  }

  const handleOpen = () => setOpen(!open)

  return (
    <HideOnScroll onTrigger={useCallback(() => setOpen(false), [])}>
      <div className={classes.root}>
        <Breadcrumbs aria-label="Breadcrumb">
          <StyledBreadcrumb component="a" label="Home" onClick={handleClick('/')} />
          {routes
            .filter(({ path }) => path === pathname)
            .map(({ name, path }) => (
              <StyledBreadcrumb
                ref={ref}
                key={name}
                label={name}
                deleteIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={handleClick(path)}
                onDelete={handleOpen}
              />
            ))}
        </Breadcrumbs>
        <Popper id={open ? 'simple-popover' : undefined} open={open} anchorEl={ref.current}>
          <ClickAwayListener onClickAway={handleOpen}>
            <div className={classes.poppers}>
              {routes
                .filter(({ path }) => path !== pathname)
                .map(({ name, path }, i) => (
                  <Zoom key={i} in={open} style={{ transitionDelay: open ? `${i * 50}ms` : '0ms' }}>
                    <StyledBreadcrumb label={name} onClick={handleClick(path)} />
                  </Zoom>
                ))}
            </div>
          </ClickAwayListener>
        </Popper>
      </div>
    </HideOnScroll>
  )
}

export default withRouter(CustomizedBreadcrumbs)
