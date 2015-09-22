import React from 'react';
import Mixin from 'react-mixin';

import Router from 'react-router';
import { DefaultRoute, Route, RouteHandler } from 'react-router';

import {Grid, Row, Col} from 'react-bootstrap'

import Sidebar from './components/Sidebar.jsx'

import Landing from './containers/Landing.jsx'
import About from './containers/About.jsx'
import Settings from './containers/Settings.jsx'
import {Client, Console as ClientConsole, Settings as ClientSettings} from './containers/Client.jsx'

import {BackendConnectionError} from './errors.jsx'

import Q from 'q'

import 'bootswatch-sass/superhero/bootstrap.css'
import './style/app.scss'
import '../index.html'

class App extends React.Component {
  static getInitialState() {

    var backendOpts = {}

    return {
      backendOpts: backendOpts,
      backend: null,
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
            xs: 2,
            md: 1,
            lg: 1
          },
          main: {
            xs: 10,
            md: 11,
            lg: 11
          }
        }
      }
    }
  }

  handleSidebarResize(grid) {
    this.setState({activegrid: grid})
  }

  componentWillMount() {
    // try to setup the backend if available
    this.setupBackend()
      .then(function(backend) {
        this.setState({backend: backend})

        backend.on('clients',  (clients) => this.setState({clients: clients}))
        backend.on('settings', (settings) => this.setState({settings: settings}))

        backend.send('clients')
          .done( (clients) => this.setState({clients: clients}) )
        backend.send('settings')
          .done((settings) => this.setState({settings: settings}))

        backend.on('client.state', function(client) {
          this.setState(function(prevState) {
            var idx = _.findIndex(prevState.clients, {ref: client.ref})

            if (idx >= 0)
              prevState.clients[idx] = client

            return {clients: [].concat(prevState.clients)}
          })
        }.bind(this))

        backend.on('close', function(arg) {
          this.setState({
            backendState: {
              state: 'down',
              reason: arg.reason
            }
          })
        }.bind(this))
      }.bind(this))
  }

  setupBackend(opts) {
    if (this.state.backend)
      this.state.backend.close()

    var
      closeHandle,
      openHandle,
      defered = Q.defer(),
      backend = new this.props.backend(opts)

    backend.once('close', closeHandle = function(arg) {
      console.log('backend closed', arguments)
      backend.removeListener('open', openHandler)
      this.setState({
        backendState: {
          state: 'down',
          reason: arg.reason
        }
      })

      defered.reject(arg.reason)
    })

    backend.once('ready', openHandle = function() {
      backend.removeListener('close', closeHandle)

      this.setState({
        backendState: {
          state: 'up',
          reason: null
        }
      })

      defered.resolve(backend)
    }.bind(this))

    return defered.promise

//
//    var
//      closeHandler,
//      openHandler,
//      backend = new Backend(opts)
//
//    backend.once('close', closeHandler = function(arg) {
//      backend.removeListener('open', openHandler)
//      this.setState({
//        backendState: {
//          state: 'down',
//          reason: arg.reason
//        }
//      })
//
//      defered.reject(arg.reason)
//    }.bind(this))
//
//    backend.once('open', openHandler = function() {
//      backend.removeListener('close', closeHandler)
//
//      defered.resolve()
//    }.bind(this))

//
//    var backend = new Backend(_.extend({keypair: this.state.backendOpts}))
//
//    var closeHandle
//    backend.on('open', function() {
//      backend.removeListener('close', closeHandle)
//
//      console.log(keys)
//      backend.send('AUTH', '')
//
//      backend.on('close', function(args) {
//        this.setState({
//          backendState: {
//            state: 'down',
//            reason: args.reason
//          }
//        })
//      }.bind(this))
//
//      this.state.backend.on('clients',  (clients) => this.setState({clients: clients}))
//      this.state.backend.on('settings', (settings) => this.setState({settings: settings}))
//
//      backend.send('clients').done( (ev) => this.setState({clients: ev.clients}) )
//      backend.send('settings').done((ev) => this.setState({settings: ev.settings}))
//      backend.on('client.state', function(client) {
//        this.setState(function(prevState) {
//          var idx = _.findIndex(prevState.clients, {ref: client.ref})
//
//          if (idx >= 0)
//            prevState.clients[idx] = client
//
//          return {clients: prevState.clients}
//        })
//      }.bind(this))
//
//      // rebind on close
//    }.bind(this))
//
//    backend.on('close', closeHandle = function(args) {
//      this.setState({
//        backendState: {
//          state: 'down',
//          reason: args.reason
//       }
//      })
//    }.bind(this))
//
//    this.setState({backend: backend})

    return defered.promise
  }

  setBackendURL(url) {
    return this.setupBackend(_.extend({remote: url}, this.state.backendOpts))
  }

  render() {
    var sizes = this.state.grid[this.state.activegrid]

    var ctx = this

    //if (!this.state.backend) {
    //  return (
    //    <LoadingPage
    //      backendOpts={this.state.backendOpts}
    //      setBackend={this.setBackendURL.bind(this)}>
    //      {crypto}
    //    </LoadingPage>
    //  )
    //} else if (this.state.backend) {
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

              <RouteHandler {...this.state} />
            </Col>
          </Row>
        </Grid>
      )
    //}
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


// magically insert the backend provided by the server
window.onload = function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = '/remote.js';

    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(script, insertAt);

    script.onload = () =>
      Router.run(routes, (Handler) => React.render(<Handler backend={window.Backend} />, document.getElementById("react")))
}
