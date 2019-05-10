import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Parsing from '@/components/Parsing'
import Home from '@/components/Home'
import Automata from '@/components/Automata'
import Tokenizer from '@/components/Tokenizer'
import Breadcrumbs from '@/components/Breadcrumb'

export const routes = [
  {
    path: '/automata',
    name: 'Finite Automata',
    component: Automata,
  },
  {
    path: '/tokenizer',
    name: 'Tokenizer',
    component: Tokenizer,
  },
  {
    path: '/parsing',
    name: 'Parsing',
    component: Parsing,
  },
]

export default () => {
  return (
    <>
      <Router>
        <Breadcrumbs />
        <div style={{ margin: 48 }}>
          <Route exact path="/" component={Home} />
          {routes.map((route, i) => (
            <Route
              key={i}
              exact
              path={route.path}
              render={props => (
                <>
                  <Typography variant="h1" gutterBottom>
                    {route.name}
                  </Typography>
                  {React.createElement(route.component, props)}
                </>
              )}
            />
          ))}
        </div>
      </Router>
    </>
  )
}
