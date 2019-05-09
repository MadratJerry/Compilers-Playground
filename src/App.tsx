import { hot } from 'react-hot-loader'
import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import Router from '@/components/Router'

const theme = createMuiTheme()

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  )
}

export default (process.env.NODE_ENV === 'development' ? hot(module)(App) : App)
