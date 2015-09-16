import React from 'react';

import {Col, Glyphicon} from 'react-bootstrap'

import {Nav, NavItem} from 'react-bootstrap'
import {NavItemLink} from 'react-router-bootstrap'

import ClientList from '../components/ClientList.jsx'


export default class Sidebar extends React.Component {
  resize(gridtype) {
    this.props.onResize(gridtype)
  }

  render() {
    return (
      <div className={"sidebar sidebar-" + this.props.grid}>
        <div className="branding">
          <img src={require("../images/branding-neg.png")} width={'compact' === this.props.grid ? 70 : 150}/>

          <a
            className="only-expanded btn-default pull-right"
            style={{padding: '7px 15px', cursor: 'pointer'}}
            onClick={this.resize.bind(this, 'compact')}>

            <Glyphicon glyph="eye-close">&nbsp;</Glyphicon>
            <span className="only-expanded">Compact</span>
          </a>

        </div>

        <div className="nav-list">
            {'compact' === this.props.grid &&
              <a
                className="btn-default btn-block"
                style={{padding: '10px 15px', cursor: 'pointer'}}
                onClick={this.resize.bind(this, 'expanded')}>
                <Glyphicon glyph="eye-open">&nbsp;</Glyphicon>
                Expand
              </a>}

          <ClientList {...this.props} />

          <hr className="only-expanded" />

          <Nav bsStyle="pills" className="align-bottom">
            <NavItemLink to="/" title="Overview">
              <Glyphicon glyph="home">&nbsp;</Glyphicon>
              Overview
            </NavItemLink>
            <NavItemLink to="/settings" title="Settings">
              <Glyphicon glyph="cog">&nbsp;</Glyphicon>
              Settings
            </NavItemLink>
            <NavItemLink to="/about" title="About">
              <Glyphicon glyph="info-sign">&nbsp;</Glyphicon>
              About
            </NavItemLink>
          </Nav>
        </div>
      </div>
    )
  }
}
