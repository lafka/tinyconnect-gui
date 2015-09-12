import React from 'react'
import Mixin from 'react-mixin'

import { Link } from 'react-router';

import {Button, Alert, Nav} from 'react-bootstrap'
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
    return (
      <NavItemLink key={k} to="client" params={{ref: client.ref}}>
        {client.name || client.port.uniqueID || client.port.path}
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
      clients = _.where(this.props.clients, _.pick(filters, (f) => f))

    return (
      <div className="client-list">
        <h4>Serial Ports</h4>

        {clients.length > 0 &&
          <Nav bsStyle='pills'>
            {clients.map(this.renderClientLi)}
          </Nav>}

        {this.props.clients.length == 0 && <Alert>No clients available</Alert>}
        {(this.props.clients.length > 0 && clients.length == 0) && <Alert>No clients found matching your filter</Alert>}

        <div className="filters align-bottom">
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
