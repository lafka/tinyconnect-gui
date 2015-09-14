import React from 'react';
import Mixin from 'react-mixin';

import Router from 'react-router';
import { DefaultRoute, Route, RouteHandler } from 'react-router';

import {Grid, Row, Col} from 'react-bootstrap'

import Backend from './sockjs-backend'

import Sidebar from './components/Sidebar.jsx'

import Landing from './containers/Landing.jsx'
import About from './containers/About.jsx'
import Settings from './containers/Settings.jsx'
import {Client, Console as ClientConsole, Settings as ClientSettings} from './containers/Client.jsx'

import 'bootswatch-sass/superhero/bootstrap.css'
import './style/app.scss'

class App extends React.Component {
  static getInitialState() {
    var backendOpts = {
      remote: 'http://127.0.0.1:6999/ws',
    }

    var backend = new Backend(backendOpts)

    backend.on('open', function() {
      backend.send('clients')
      backend.send('settings')
    })

    backend.on('close', function(args) {
      console.log('close/args', args)
    })

    return {
      backendOpts: backendOpts,
      backend: backend,
      clients: [],
      settings: {},
      activegrid: 'expanded',
      grid: {
        expanded: {
          sidebar: {
            xs: 6,
            md: 4
          },
          main: {
            xs: 6,
            md: 8
          }
        },
        compact: {
          sidebar: {
            xs: 1,
            md: 1
          },
          main: {
            xs: 11,
            md: 11
          }
        }
      }
    }
  }

  componentWillMount() {
    this.state.backend.on('clients',  (clients) => this.setState({clients: clients}))
    this.state.backend.on('settings', (settings) => this.setState({settings: settings}))
  }

  handleSidebarResize(grid) {
    this.setState({activegrid: grid})
  }

  render() {
    var sizes = this.state.grid[this.state.activegrid]

    return (
      <Grid fluid={true} className="root full-height">
        <Row className="full-height">
          <Col xs={sizes.sidebar.xs} md={sizes.sidebar.md} className="full-height">
            <Sidebar
              clients={this.state.clients}
              grid={this.state.activegrid}
              onResize={this.handleSidebarResize.bind(this)} />
          </Col>

          <Col xs={sizes.main.xs} md={sizes.main.md} className="full-height">
            <RouteHandler {...this.state} {...this.props} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

Mixin.onClass(App, {
  getInitialState: App.getInitialState
})

let routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="landing" handler={Landing} />
    <Route name="about" handler={About} />
    <Route name="settings" handler={Settings} />

    <Route name="client" path="client/:ref" handler={Client}>
      <DefaultRoute name="console" handler={ClientConsole} />
      <Route path="client-console" handler={ClientConsole} />
      <Route name="client-settings" path="settings" handler={ClientSettings} />
    </Route>
  </Route>
)

Router.run(routes, (Handler) => React.render(<Handler />, document.getElementById("react")))
