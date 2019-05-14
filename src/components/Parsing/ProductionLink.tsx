import React from 'react'
import classNames from 'classnames'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Production, epsilon } from '@/lib/grammar'

export const production = (p: Production | undefined): string =>
  p ? `${p[0]} -> ${p[1].length ? p[1].join(' ') : epsilon}` : ``

const useStyles = makeStyles(() =>
  createStyles({
    productionIndex: {
      margin: '0 4px',
    },
  }),
)

const ProductionLink = React.forwardRef<HTMLAnchorElement, { index: number; className?: string }>(
  ({ index, className, ...rest }, ref) => {
    const classes = useStyles()
    return (
      <a href={`#production_${index}`} className={classNames(className, classes.productionIndex)} {...rest} ref={ref}>
        {index}
      </a>
    )
  },
)

export default ProductionLink
