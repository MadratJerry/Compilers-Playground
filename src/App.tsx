import FAGraph from '@/components/FAGraph'
import TokenizerGround from '@/components/TokenizerGround'
import AppBar from '@material-ui/core/AppBar'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Typography from '@material-ui/core/Typography'
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'

function TabContainer({ children, dir }: { children: any; dir: any }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  )
}

const styles = (theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
})

class App extends React.Component<WithStyles<'root'>> {
  state = {
    value: 0,
  }

  handleChange = (event: any, value: any) => {
    this.setState({ value })
  }

  handleChangeIndex = (index: number) => {
    this.setState({ value: index })
  }

  render() {
    const { classes, theme } = this.props

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="FA Ground" />
            <Tab label="Tokenizer Ground" />
            <Tab label="Parser Ground" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction}>
            <FAGraph />
          </TabContainer>
          <TabContainer dir={theme.direction}>
            <TokenizerGround />
          </TabContainer>
          <TabContainer dir={theme.direction}>Item Three</TabContainer>
        </SwipeableViews>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(App)
