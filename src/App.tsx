import { hot } from 'react-hot-loader'
import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import Parsing from '@/components/Parsing'
import Home from '@/components/Home'
import NavagationButton from '@/components/NavagationButton'

const theme = createMuiTheme({ typography: { useNextVariants: true } })

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavagationButton />
        <div style={{ margin: 48 }}>
          <Route exact path="/" component={Home} />
          <Route path="/parsing" component={Parsing} />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default (process.env.NODE_ENV === 'development' ? hot(module)(App) : App)
