import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { routes } from '@/components/Router'

const Home: React.SFC<RouteComponentProps> = ({ history }) => {
  const handleClick = (path: string) => () => {
    history.push(path)
  }

  return (
    <>
      <Typography variant="h1" gutterBottom>
        Compilers Playground
      </Typography>
      {routes.map(({ path, name }) => (
        <Typography variant="h2" gutterBottom key={name}>
          <Link color="inherit" onClick={handleClick(path)}>
            {name}
          </Link>
        </Typography>
      ))}
    </>
  )
}

export default Home
