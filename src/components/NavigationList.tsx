import React, { useState } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import ListSubheader from '@material-ui/core/ListSubheader'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { routes } from './Router'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
}))

const NavigationList: React.SFC<RouteComponentProps> = ({ location, history }) => {
  const classes = useStyles()

  const handleItemClick = (path: string) => () => {
    history.push(path)
  }

  return (
    <List
      component="nav"
      subheader={<ListSubheader component="div">Compilers Playground</ListSubheader>}
      className={classes.root}
    >
      {routes.map((route, i) => (
        <ListItem key={i} button selected={location.pathname === route.path} onClick={handleItemClick(route.path)}>
          <ListItemText primary={route.name} />
        </ListItem>
      ))}
    </List>
  )
}

export default withRouter(NavigationList)
