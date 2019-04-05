import React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  box: {
    width: 18,
    '& span:last-child': {
      marginBottom: 0,
    },
  },
  line: {
    display: 'block',
    width: '100%',
    borderRadius: 4,
    height: 2,
    backgroundColor: '#000',
    marginBottom: 3,
    transition: 'all 0.3s ease-in-out',
  },
  [1]: { transform: 'translateY(5px) rotate(-45deg)' },
  [2]: { opacity: 0 },
  [3]: { transform: 'translateY(-5px) rotate(45deg)' },
}))

const AnimateMenuIcon: React.SFC<{ toggle: boolean }> = ({ toggle }) => {
  const classes = useStyles()

  return (
    <div className={classes.box}>
      {[1, 2, 3].map(i => (
        <span key={i} className={classNames(classes.line, { [classes[i]]: toggle })} />
      ))}
    </div>
  )
}

export default AnimateMenuIcon
