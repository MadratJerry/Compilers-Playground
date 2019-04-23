import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Parsing from '@/components/Parsing'
import Home from '@/components/Home'
import NavagationButton from '@/components/NavagationButton'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/parsing',
    name: 'Parsing',
    component: Parsing,
  },
]

export default () => {
  return (
    <Router>
      <NavagationButton />
      <div style={{ margin: 48 }}>
        {routes.map((route, i) => (
          <Route key={i} exact path={route.path} component={route.component} />
        ))}
      </div>
    </Router>
  )
}
