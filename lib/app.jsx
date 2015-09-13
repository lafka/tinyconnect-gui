import React from 'react';
import Mixin from 'react-mixin';

import Router from 'react-router';
import { DefaultRoute, Route, RouteHandler } from 'react-router';

import Backend from './sockjs-backend'

import Landing from './containers/Landing.jsx'
import {Client, Console as ClientConsole, Settings as ClientSettings} from './containers/Client.jsx'

import 'bootswatch-sass/superhero/bootstrap.css'
import './style/app.scss'

class App extends React.Component {
  static getInitialState() {
    var backend = new Backend()

    return {
      backend: backend,
      clients: []
    }
  }

  componentWillMount() {
    this.state.backend.on('clients', function(clients) {
      this.setState({clients: clients})
    }.bind(this))
  }

  render() {
    return (
      <div className="root">
        <RouteHandler clients={this.state.clients} backend={this.state.backend} />
      </div>
    )
  }
}

Mixin.onClass(App, {
  getInitialState: App.getInitialState
})

let routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="landing" handler={Landing} />

    <Route name="client" path="client/:ref" handler={Client}>
      <DefaultRoute name="console" handler={ClientConsole} />
      <Route path="console" handler={ClientConsole} />
      <Route name="settings" path="settings" handler={ClientSettings} />
    </Route>
  </Route>
)

Router.run(routes, (Handler) => React.render(<Handler />, document.getElementById("react")))
