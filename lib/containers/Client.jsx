import React from 'react';
import { RouteHandler, Link} from 'react-router';
import Mixin from 'react-mixin';

import {Grid, Row, Col} from 'react-bootstrap'
import {PageHeader, Alert, Glyphicon} from 'react-bootstrap'

import Console from './Client/Console.jsx'
import Settings from './Client/Settings.jsx'

import {Expire} from '../Components.jsx'

import _ from 'lodash'

export {Console, Settings}

export class Client extends React.Component {
  static getInitialState() {
    var client = _.where(this.props.clients, {ref: this.props.params.ref})[0]
    return {
      client: client,
      states: client ? [this.clientState(client)] : []
    }
  }

  clientState(client) {
    if (!client)
      return

    return {
      at: new Date(),
      available: client.available,
      port: true === client.port.connected,
      remote: true === client.remote.connected
    }
  }

  componentWillReceiveProps(nextProps) {
    var
      client = _.where(nextProps.clients, {ref: nextProps.params.ref})[0],
      states = this.state.states;

    if (client) {
      var newState = this.clientState(client)

      if (!_.eq(_.omit(newState, 'at'), _.omit(states[0], 'at')))
        states.unshift(newState)

      this.setState({
        client: client,
        states: states.slice(0, 10)
      })
    } else {
      this.setState({
        client: client
      })
    }
  }

  render() {
    var
      client = this.props.client || this.state.client,
      states = this.state.states,
      available =           (states[0] || {}).available,
      downConn =            (states[0] || {}).port,
      upConn =              (states[0] || {}).remote,
      previouslyAvailable = (states[1] || {}).available,
      previouslyDownConn =  (states[1] || {}).port,
      previouslyUpConn =    (states[1] || {}).remote

    if (!client)
      return this.renderErr()

    var alert = this.state.alert;

    if (available && false === previouslyAvailable)
      alert = { content: <span>Serial port was added back</span>, style: 'success', expire: 7500, glyph: 'info-sign' }
    if (downConn && false === previouslyDownConn)
      alert = { content: <span>Serial port connection established</span>, style: 'success', expire: 7500, glyph: 'info-sign' }
    if (upConn && false === previouslyUpConn)
      alert = { content: <span>Connected to Tiny Mesh Cloud</span>, style: 'success', expire: 7500, glyph: 'info-sign' }

    if (!available && true === previouslyAvailable)
      alert = { content: <span>Serial Port device was removed</span>, style: 'danger', expire: 0, glyph: 'warning-sign' }
    if (!upConn && true === previouslyUpConn)
      alert = { content: <span>Connection to Tiny Mesh Cloud lost</span>, style: 'danger', expire: 0, glyph: 'warning-sign' }
    if (!downConn && true === previouslyDownConn)
      alert = { content: <span>Serial Port connection was lost</span>, style: 'danger', expire: 0, glyph: 'warning-sign' }

    return (
      <div>
        {alert &&
            <Expire delay={alert.expire}>
              <Alert bsStyle={alert.style} style={{marginLeft: '-15px'}}>
                 <Glyphicon glyph={alert.glyph}>&nbsp;</Glyphicon>

                 {alert.content || null}
              </Alert>
            </Expire> || <div style={{padding: '15px', marginBottom: '21px', border: '1px solid transparent'}}>&nbsp;</div>}
      <Grid
        fluid={true}
        className="client">

        <Row>
          <Col xs={12} md={11} lg={10} className="full-height">
            <Grid fluid={true} className="full-height">
              <div className="inner-nav pull-right" style={{zIndex: 2, position: 'relative'}}>
                <Link className="tab" to="console"  params={{ref: client.ref}}>
                  <Glyphicon glyph="transfer">&nbsp;</Glyphicon>
                  Console
                </Link>

                <Link className="tab" to="client-settings" params={{ref: client.ref}}>
                  <Glyphicon glyph="cog">&nbsp;</Glyphicon>
                  Settings
                </Link>
              </div>

              <Row className="full-height" style={{zIndex: 1, position: 'relative'}}>


                <RouteHandler
                  client={client}
                  states={states}
                  backend={this.props.backend}
                  notify={(alert) => this.state.alert !== alert && this.setState({alert: alert})}
                  />
              </Row>
            </Grid>
          </Col>
        </Row>
      </Grid>
      </div>
    )
  }

  renderErr() {
    return (
        <Col xs={12} md={11} lg={10} className="full-height">
          <PageHeader>Ooops, no such port</PageHeader>

          <Alert bsStyle="warning">
            <strong>No such serial port</strong>, the port might have been
            removed or you may be using the wrong URL
          </Alert>
        </Col>
    )
  }
}

Mixin.onClass(Client, {
  getInitialState: Client.getInitialState
})
