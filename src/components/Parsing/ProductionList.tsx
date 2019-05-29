import React from 'react'
import classNames from 'classnames'
import { makeStyles, createStyles } from '@material-ui/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { Productions, production } from '@/lib/grammar'

const ProductionList: React.FC<{ productions: Productions }> = ({ productions }) => {
  return (
    <List component="ul">
      {productions.map((p, i) => (
        <ListItem key={i} id={`production_${i}`}>
          <Typography variant="h5" gutterBottom>
            {i}. {production(p)}
          </Typography>
        </ListItem>
      ))}
    </List>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    productionIndex: {
      margin: '0 4px',
    },
  }),
)

export const ProductionLink = React.forwardRef<HTMLAnchorElement, { index: number; className?: string }>(
  ({ index, className, ...rest }, ref) => {
    const classes = useStyles()
    return (
      <a href={`#production_${index}`} className={classNames(className, classes.productionIndex)} {...rest} ref={ref}>
        {index}
      </a>
    )
  },
)

export default ProductionList
