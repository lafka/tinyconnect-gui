import React from 'react';
import Mixin from 'react-mixin';

import {Col, Glyphicon} from 'react-bootstrap'

import ClientList from '../components/ClientList.jsx'


export default class Sidebar extends React.Component {
  static getInitialState() {
    return {
      show: this.props.show || true
    }
  }

  render() {
    if (!this.state.show)
      return (
        <Col xs={1} className="sidebar">
          <img src="lib/images/branding-neg.png" width="115" />
          <a
            className="pull-right btn-default"
            style={{cursor: 'pointer', padding: '7px 20px', background: '#354658'}}
            onClick={this.setState.bind(this, {show: !this.state.show}, null)}
            >
            <Glyphicon glyph="eye-open">&nbsp;</Glyphicon>
            Show
          </a>
        </Col>
      )
    else
      return (
        <Col xs={6} md={4} className="sidebar">
          <div className="branding" style={{paddingRight: 0}}>
            <img src="lib/images/branding-neg.png" width="150" />

            <a
              className="pull-right btn-default"
              style={{cursor: 'pointer', padding: '7px 20px', background: '#354658'}}
              onClick={this.setState.bind(this, {show: !this.state.show}, null)}
              >
              <Glyphicon glyph="eye-close">&nbsp;</Glyphicon>
              Hide
            </a>
          </div>


          <ClientList {...this.props} />
        </Col>
      )
  }
}

Mixin.onClass(Sidebar, {
  getInitialState: Sidebar.getInitialState
})
