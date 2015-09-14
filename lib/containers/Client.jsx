import React from 'react';
import { RouteHandler, Link} from 'react-router';
import Mixin from 'react-mixin';

import {Grid, Row, Col} from 'react-bootstrap'
import {PageHeader, Alert, Glyphicon} from 'react-bootstrap'

import Console from './Client/Console.jsx'
import Settings from './Client/Settings.jsx'

import _ from 'lodash'

export {Console, Settings}

export class Client extends React.Component {
  static getInitialState() {
    return {
      client: _.where(this.props.clients, {ref: this.props.params.ref})[0]
    }
  }

  componentWillUpdate(nextProps, nextState) {
     nextProps.client = _.where(nextProps.clients, {ref: nextProps.params.ref})[0]
  }

  renderErr() {
    return (
        <Col xs={6} md={8} className="white-bg full-height">
          <PageHeader>Ooops, no such port</PageHeader>

          <Alert bsStyle="warning">
            <strong>No such serial port</strong>, the port might have been
            removed or you may be using the wrong URL
          </Alert>
        </Col>
    )
  }

  render() {
    var client = this.props.client || this.state.client

    if (!client)
      return this.renderErr()

    return (
      <Col xs={6} md={8} className="full-height">

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
    )
  }
}

Mixin.onClass(Client, {
  getInitialState: Client.getInitialState
})
