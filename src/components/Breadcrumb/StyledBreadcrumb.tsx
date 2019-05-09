import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core/styles'
import { emphasize } from '@material-ui/core/styles/colorManipulator'
import Chip, { ChipProps } from '@material-ui/core/Chip'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.grey[100],
      height: 24,
      color: theme.palette.grey[800],
      fontWeight: theme.typography.fontWeightRegular,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.grey[300],
      },
      '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.grey[300], 0.12),
      },
    },
  }),
)

const StyledBreadcrumb = React.forwardRef((props: ChipProps, ref) => {
  const classes = useStyles()
  return <Chip {...props} className={classes.root} ref={ref} />
}) as typeof Chip

export default StyledBreadcrumb
