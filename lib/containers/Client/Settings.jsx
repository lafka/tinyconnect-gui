import React from 'react';
import Mixin from 'react-mixin';

import {Grid, Row, Col} from 'react-bootstrap'
import {PageHeader, Glyphicon} from 'react-bootstrap'

import {Modal, Input, ButtonInput, Button} from 'react-bootstrap'

export default class Settings extends React.Component {
  static getInitialState() {
    return {
      patch: {},
      modal: true
    }
  }

  render() {
    var client = this.props.client
    console.log(client)

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
                  value={client.port.name || client.port.uniqueID}
                  label="Name"
                  disabled
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
                  value={client.autoconnect}
                  readOnly />

                <Input
                  type="checkbox"
                  label="Persist Port between sessions"
                  value={client.persist}
                  readOnly />
              </Col>

              <Col xs={12} md={6}>
                <h4>Client Settings</h4>
                <Input
                  type="text"
                  value={client.entity.nid}
                  label="Network ID (NID)"
                  disabled
                  placeholder="Network ID..." />

                <Input
                  type="text"
                  value={client.entity.sid}
                  label="System ID (SID)"
                  disabled
                  placeholder="1.0.0.0" />

                <Input
                  type="text"
                  label="Unique ID (UID)"
                  value={client.entity.uid}
                  placeholder="1.0.0.0"
                  disabled />

                <Button bsStyle="info" disabled>Provision Device</Button>
              </Col>
            </Row>


          <hr />

            <Row>
              <Col xs={12} md={6}>
                <h4>TCP Settings</h4>
                <Input
                  type="text"
                  value={this.props.client.remote.host}
                  label="Upstream Hostname"
                  disabled
                  placeholder="Hostname for upstream connection" />

                <Input
                  type="text"
                  value={this.props.client.remote.port}
                  label="Upstream Port"
                  disabled
                  placeholder="Port for upstream connection" />
              </Col>

              <Col xs={12} md={6}>
                <h4>Serialport Settings</h4>
                <Input
                  type="text"
                  value={this.props.client.port.baudrate}
                  label="Client Baudrate"
                  disabled
                  placeholder="Client Baudrate" />
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <ButtonInput
                  disabled
                  type="submit"
                  value="Update Client" />
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
