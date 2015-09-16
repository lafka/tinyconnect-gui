import React from 'react';
import {Col, PageHeader} from 'react-bootstrap'

export default class Landing extends React.Component {
  render() {
    return (
      <Col lg={7} md={12} xs={12} className="landing">
        <PageHeader>Tinyconnect</PageHeader>

        <p className="lead">
          This application is used to connect your Tiny Mesh devices to the
          Tiny Mesh Cloud. By following a few simple steps you will be able to
          start using the Tiny Mesh Platform.
        </p>

        <h4>Getting Started</h4>
        <p>
          The setup should be automatic but there are a few scenarios we need
          some action from you to setup the device.
        </p>
        <ol>
          <li>Pick the device you want to connect from the menu on the left side</li>
          <li>Press the connect button in the console</li>
          <li>If everything is working communication will be initiated, otherwise a setup guide will help you</li>
        </ol>

        <hr />

        <h5>Note for Windows users</h5>
        <p>
          <em>Make sure you have the FTDI drivers install, in newer version this
          can happend automatically</em>.<br />

          If you there is no change in the menu on the left side when you plug
          the gateway device in or out you are most likely lacking the drivers.

          You can download the drivers from <a href="http://www.ftdichip.com/Drivers/VCP.htm">the FTDI website</a>
        </p>
      </Col>
    )
  }
}

