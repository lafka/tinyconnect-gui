import React from 'react';
import Mixin from 'react-mixin';

import {PageHeader, Glyphicon} from 'react-bootstrap'

import {Modal, Input, ButtonInput} from 'react-bootstrap'

export default class Settings extends React.Component {
  static getInitialState() {
    return {
      settings: {},
      modal: true
    }
  }

  render() {
    return (
      <div className="settings">

        <Modal
          className="modal-wait"
          show={this.state.modal}
          onHide={this.setState.bind(this, {modal: false})}>

          <Modal.Header closeButton>
            <Glyphicon glyph="info-sign">&nbsp;</Glyphicon>
            Settings is currently unavailable
          </Modal.Header>

          <Modal.Body>
            Saving settings are not available in this version of Tinyconnect.
            The options below are the ones in use, but you can not currently change them.
          </Modal.Body>
        </Modal>

        <PageHeader>Settings</PageHeader>


        <form>
          <h4>Application settings</h4>

          <Input
            type="text"
            value={this.props.backendOpts.remote}
            label="Backend Service"
            disabled
            placeholder="URL for websockets backend" />

          <h4>TCP Settings</h4>
          <Input
            type="text"
            value={(this.props.settings.tcpchan || {}).host}
            label="Upstream Hostname"
            disabled
            placeholder="Hostname for upstream connection" />

          <Input
            type="text"
            value={(this.props.settings.tcpchan || {}).port}
            label="Upstream Port"
            disabled
            placeholder="Port for upstream connection" />

          <h4>Serialport Settings</h4>
          <Input
            type="text"
            value={(this.props.settings.serialchan || {}).baudrate}
            label="Default Baudrate"
            disabled
            placeholder="Default Baudrate" />

          <ButtonInput
            disabled
            type="submit"
            value="Save Settings" />
        </form>
      </div>
    )
  }
}

Mixin.onClass(Settings, {
  getInitialState: Settings.getInitialState
})
