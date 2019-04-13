import { hot } from 'react-hot-loader'
import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import Home from './Home'

const theme = createMuiTheme({ typography: { useNextVariants: true } })

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Home />
  </ThemeProvider>
)

export default (process.env.NODE_ENV === 'development' ? hot(module)(App) : App)
