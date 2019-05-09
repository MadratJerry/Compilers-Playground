import React from 'react'
import useScrollTrigger from '@material-ui/core/useScrollTrigger'
import Slide from '@material-ui/core/Slide'

interface Props {
  onTrigger?: () => void
}
const HideOnScroll = ({ children, onTrigger = () => {} }: React.PropsWithChildren<Props>) => {
  const trigger = useScrollTrigger()
  React.useEffect(() => {
    if (trigger) onTrigger()
  }, [trigger])

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

export default HideOnScroll
