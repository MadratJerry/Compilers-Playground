import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import ListSubheader from '@material-ui/core/ListSubheader'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

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

const NavigationList = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(true)

  const handleClick = () => setOpen(!open)

  return (
    <List
      component="nav"
      subheader={<ListSubheader component="div">Compilers Playground</ListSubheader>}
      className={classes.root}
    >
      <ListItem button>
        <Link to="/">
          <ListItemText primary="Home" />
        </Link>
      </ListItem>
      <ListItem button>
        <Link to="/parsing">
          <ListItemText primary="Parsing" />
        </Link>
      </ListItem>
      <ListItem button onClick={handleClick}>
        <ListItemText primary="Other" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemText primary="Starred" />
          </ListItem>
        </List>
      </Collapse>
    </List>
  )
}

export default NavigationList
