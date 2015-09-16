import React from 'react'
import Mixin from 'react-mixin'

import { Link } from 'react-router';

import {Button, Alert, Nav, Glyphicon} from 'react-bootstrap'
import {NavItemLink} from 'react-router-bootstrap'

export default class ClientList extends React.Component {
  static getInitialState() {
    var filter = this.props.filter || {}
    return {
      filter: {
        available: undefined === filter.available ? true  : this.props.filter.available,
        active:    undefined === filter.active    ? false : this.props.filter.active
      }
    }
  }

  renderClientLi(client, k) {
    var name

    if ('expanded' === this.props.grid)
      name = client.name || client.port.uniqueID || client.port.path
    else
      name = client.name || client.port.path.replace(/.*\//, '')

    return (
      <NavItemLink key={k} to="client" params={{ref: client.ref}}>
        <Glyphicon glyph="hdd">&nbsp;</Glyphicon>
        {name}
      </NavItemLink>
    )
  }

  toggleFilter(filter, ev) {
    var patch = this.state.filter
    patch[filter] = ! patch[filter]

    this.setState({filter: patch})
  }

  render() {
    var
      filters = this.state.filter,
      activeClient = this.props.client,
      clients = _.filter(this.props.clients, function(client) {
        return _.isMatch(client, {ref: (activeClient || {}).ref}) || _.pick(filters, _.identity)
      })

    return (
      <div className="nav-list">
        <h4 className="only-expanded" style={{paddingLeft: '15px'}}>Serial Ports</h4>

        {clients.length > 0 &&
          <Nav bsStyle='pills'>
            {clients.map(this.renderClientLi.bind(this))}
          </Nav>}

        {this.props.clients.length == 0 && <Alert>No clients available</Alert>}
        {(this.props.clients.length > 0 && clients.length == 0) && <Alert>No clients found matching your filter</Alert>}

        <div className="filters only-expanded">
          <h4>Filters</h4>

          <p>
            <a
              className={"btn btn-" + (filters.available ? 'success' : 'default')}
              onClick={this.toggleFilter.bind(this, 'available')}
              >
              Only available
            </a>&nbsp;

            <a
              className={"btn btn-" + (filters.active ? 'success' : 'default')}
              onClick={this.toggleFilter.bind(this, 'active')}
              >
              Only active
            </a>
          </p>
        </div>
      </div>
    )
  }
}

Mixin.onClass(ClientList, {
  getInitialState: ClientList.getInitialState
})
