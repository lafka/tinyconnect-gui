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
      states: [this.clientState(client)]
    }
  }

  clientState(client) {
    if (!client)
      return

    return {
      at: new Date(),
      available: client.available,
      port: client.port.connected,
      remote: client.remote.connected
    }
  }

  componentWillReceiveProps(nextProps) {
    var
      client = _.where(nextProps.clients, {ref: nextProps.params.ref})[0],
      states = this.state.states;

    if (client) {
      states.unshift(this.clientState(client))

      this.setState({
        client: client,
        states: states
      })
    } else {
      this.setState({
        client: client
      })
    }
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

  render() {
    var
      client = this.props.client || this.state.client,
      states = this.state.states,
      previouslyAvailable = undefined === states[1] || states[1].available

    if (!client)
      return this.renderErr()

    return (
      <div>

        {!client.available &&
              <Alert bsStyle="warning" style={{marginLeft: '-15px'}}>
                 <Glyphicon glyph="warning-sign">&nbsp;</Glyphicon>
                 <strong>Warning: </strong> the serial port was removed. The client
                 have been disconnected. Re-insert the serial port to resume communication.
              </Alert>}

        {(client.available && !previouslyAvailable) &&
            <Expire delay={7500}>
              <Alert bsStyle="success" style={{marginLeft: '-15px'}}>
                 <Glyphicon glyph="info-sign">&nbsp;</Glyphicon>
                 Serial port connected again.
              </Alert>
            </Expire>}
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


                <RouteHandler client={client} />
              </Row>
            </Grid>
          </Col>
        </Row>
      </Grid>
      </div>
    )
  }
}

Mixin.onClass(Client, {
  getInitialState: Client.getInitialState
})
