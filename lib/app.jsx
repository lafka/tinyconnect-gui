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

import {BackendConnectionError} from './errors.jsx'

import 'bootswatch-sass/superhero/bootstrap.css'
import './style/app.scss'

class App extends React.Component {
  static getInitialState() {
    var backendOpts = {
      remote: 'http://127.0.0.1:6999/ws',
    }

    var backend = new Backend(backendOpts)

    var closeHandle
    backend.on('open', function() {
      backend.removeListener('close', closeHandle)

      backend.on('close', function(args) {
        this.setState({
          backendState: {
            state: 'down',
            reason: args.reason
          }
        })
      }.bind(this))

      backend.send('clients').done( (ev) => this.setState({clients: ev.clients}) )
      backend.send('settings').done((ev) => this.setState({settings: ev.settings}))
      backend.on('client.state', function(client) {
        this.setState(function(prevState) {
          var idx = _.findIndex(prevState.clients, {ref: client.ref})

          if (idx >= 0)
            prevState.clients[idx] = client

          return {clients: prevState.clients}
        })
      }.bind(this))

      // rebind on close
    }.bind(this))

    backend.on('close', closeHandle = function(args) {
      this.setState({
        backendState: {
          state: 'down',
          reason: args.reason
       }
      })
    }.bind(this))

    return {
      backendOpts: backendOpts,
      backend: backend,
      backendState: {},
      clients: [],
      settings: {},
      activegrid: 'expanded',
      grid: {
        expanded: {
          sidebar: {
            xs: 5,
            md: 4,
            lg: 3
          },
          main: {
            xs: 7,
            md: 8,
            lg: 9
          }
        },
        compact: {
          sidebar: {
            xs: 4,
            md: 2,
            lg: 1
          },
          main: {
            xs: 8,
            md: 10,
            lg: 11
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

    var ctx = this
    return (
      <Grid
        fluid={true}
        className="root full-height">

        <Row className="full-height">
          <Col
            xs={sizes.sidebar.xs}
            md={sizes.sidebar.md}
            lg={sizes.sidebar.lg}
            style={{zIndex: 2, paddingLeft: 0}}
            className="full-height sidebar-container">

            <Sidebar
              clients={this.state.clients}
              grid={this.state.activegrid}
              onResize={this.handleSidebarResize.bind(this)} />
          </Col>

          <Col
            xs={sizes.main.xs}
            md={sizes.main.md}
            lg={sizes.main.lg}
            style={{zIndex: 1, padding: 0}}
            className="full-height content">

            <BackendConnectionError
              show={'down' === ctx.state.backendState.state}
              backendState={ctx.state.backendState}
              backendOpts={ctx.state.backendOpts} />

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
