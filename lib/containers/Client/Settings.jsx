import React from 'react';
import Mixin from 'react-mixin';

import {Grid, Row, Col} from 'react-bootstrap'
import {PageHeader, Glyphicon} from 'react-bootstrap'

import {Modal, Input, ButtonInput, Button} from 'react-bootstrap'

import _ from 'lodash'

export default class Settings extends React.Component {
  static getInitialState() {
    return {
      patch: {},
      modal: false
    }
  }

  setField(ev) {
    this.setState({
      patch: _.set(this.state.patch,
                   ev.target.name,
                  ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value)
    })
  }

  patchClient(patch) {
    this.props.backend.send('client.update', this.props.client.ref, patch)
      .done(
        (client) => this.props.notify({
            expire: 7500,
            glyph: 'info-sign',
            content: <span><strong>Client updated was succesfull</strong></span>
          }),
        (err) => this.props.notify({
            expire: 0,
            glyph: 'warning-sign',
            content: <span><strong>Failed to update client:</strong> <em>{err.error}</em></span>
          })
      )
  }

  render() {
    var
      client = this.props.client,
      patch = this.state.patch

    var bpsRates = [
      2400,
      4800,
      9600,
      14400,
      19200,
      28800,
      38400,
      56700,
      76800,
      115200,
      230400
    ]

    return (
      <div className="client-settings">
        <PageHeader>Settings</PageHeader>

        <Modal
          className="modal-wait"
          show={this.state.modal}
          onHide={this.setState.bind(this, {modal: false})}>

          <Modal.Header closeButton>
            <Glyphicon glyph="info-sign">&nbsp;</Glyphicon>
            Settings is currently unavailable
          </Modal.Header>

          <Modal.Body>
            Saving client settings are not available in this version of Tinyconnect.
            The options below are the ones in use, but you can not currently change them.
          </Modal.Body>
        </Modal>

        <form>
          <Grid fluid={true}>
            <Row>
              <Col xs={12} md={6}>
                <h4>Client Settings</h4>
                <Input
                  type="text"
                  value={patch.name || client.name || client.port.uniqueID}
                  label="Name"
                  name="name"
                  onChange={this.setField.bind(this)}
                  placeholder="Serialport name" />

                <Input
                  type="text"
                  value={client.port.path}
                  label="Serialport"
                  disabled
                  placeholder="Serialport path" />

                <Input
                  type="checkbox"
                  label="Autoconnect Port"
                  name="autoconnect"
                  checked={undefined !== patch.autoconnect ? patch.autoconnect : client.autoconnect}
                  onChange={this.setField.bind(this)}
                  readOnly />

                <Input
                  type="checkbox"
                  label="Persist Port between sessions"
                  name="persist"
                  checked={undefined !== patch.persist ? patch.persist : client.persist}
                  onChange={this.setField.bind(this)}
                  readOnly />
              </Col>

              <Col xs={12} md={6}>
                <h4>Client Settings</h4>
                <Input
                  type="text"
                  value={client.entity.nid}
                  name="entity.nid"
                  label="Network ID (NID)"
                  disabled
                  placeholder="Network ID..." />

                <Input
                  type="text"
                  value={client.entity.sid}
                  label="System ID (SID)"
                  name="entity.sid"
                  disabled
                  placeholder="1.0.0.0" />

                <Input
                  type="text"
                  label="Unique ID (UID)"
                  value={client.entity.uid}
                  name="entity.uid"
                  placeholder="1.0.0.0"
                  disabled />

                <span>Provisioning is disabled</span>&nbsp;
                <Button bsStyle="info" className="pull-right" disabled>Provision Device</Button>
              </Col>
            </Row>


            <hr />

            <Row>
              <Col xs={12} md={6}>
                <h4>TCP Settings</h4>
                <Input
                  type="text"
                  value={(patch.remote || {}).host || client.remote.host}
                  label="Upstream Hostname"
                  name="remote.hostname"
                  onChange={this.setField.bind(this)}
                  placeholder="Hostname for upstream connection" />

                <Input
                  type="text"
                  value={(patch.remote || {}).port || client.remote.port}
                  label="Upstream Port"
                  name="remote.port"
                  onChange={this.setField.bind(this)}
                  placeholder="Port for upstream connection" />
              </Col>

              <Col xs={12} md={6}>
                <h4>Serialport Settings</h4>
                <Input
                  type="select"
                  label="Client Baudrate"
                  name="port.baudrate"
                  onChange={this.setField.bind(this)}
                  value={(patch.port || {}).baudrate || client.port.baudrate}
                  placeholder="Client Baudrate">

                  {bpsRates.map((bps, k) => <option key={k} value={bps}>{bps}</option>)}
                </Input>
              </Col>
            </Row>

            <hr />

            <Row>
              <Col xs={12}>
                <Button
                  bsStyle="info"
                  className="pull-right"
                  onClick={this.patchClient.bind(this, this.state.patch)}
                  >

                  Save Changes
                </Button>
              </Col>
            </Row>
          </Grid>
        </form>

      </div>
    )
  }
}

Mixin.onClass(Settings, {
  getInitialState: Settings.getInitialState
})
