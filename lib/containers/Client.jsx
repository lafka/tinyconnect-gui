import React from 'react';
import { RouteHandler, Link} from 'react-router';
import Mixin from 'react-mixin';

import {Grid, Row, Col} from 'react-bootstrap'
import {PageHeader, Alert, Glyphicon} from 'react-bootstrap'

import ClientList from '../components/ClientList.jsx'

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
      <Grid className="landing" fluid={true} className="full-height">
        <Row className="full-height">
          <Col xs={6} md={4} className="sidebar">
            <div className="branding">
              <img src="lib/images/branding-neg.png" width="150" />
            </div>

            <ClientList {...this.props} />
          </Col>

          <Col xs={6} md={8} className="white-bg full-height">
            <PageHeader>Ooops, no such port</PageHeader>

            <Alert bsStyle="warning">
              <strong>No such serial port</strong>, the port might have been
              removed or you may be using the wrong URL
            </Alert>
          </Col>
        </Row>
      </Grid>
    )
  }

  render() {
    var client = this.props.client

    if (!client)
      return this.renderErr()

    return (
      <Grid className="landing" fluid={true} className="full-height">
        <Row className="full-height">
          <Col xs={6} md={4} className="sidebar">
            <div className="branding">
              <img src="lib/images/branding-neg.png" width="150" />
            </div>

            <ClientList {...this.props} />
          </Col>

          <Col xs={6} md={8} className="white-bg full-height">

            <div className="inner-nav pull-right">
              <Link className="tab" to="console"  params={{ref: client.ref}}>
                <Glyphicon glyph="transfer">&nbsp;</Glyphicon>
                Console
              </Link>

              <Link className="tab" to="settings" params={{ref: client.ref}}>
                <Glyphicon glyph="cog">&nbsp;</Glyphicon>
                Settings
              </Link>
            </div>

            <div>
              <PageHeader>Some Port</PageHeader>

              <RouteHandler client={this.props.client} />
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
}

Mixin.onClass(Client, {
  getInitialState: Client.getInitialState
})
