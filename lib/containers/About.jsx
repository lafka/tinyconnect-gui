import React from 'react';
import {PageHeader} from 'react-bootstrap'

export default class About extends React.Component {
  render() {
    return (
      <div className="about">
        <PageHeader>About Tinyconnect</PageHeader>

        <p className="lead">
          <b>TinyConnect</b> is the software used to connect your local Tiny Mesh devices
          to the Tiny Mesh Cloud™; using your computer as the proxy.
        </p>

        <h4>Disclaimer</h4>
        <p>
          You agree to the Terms of Service of the Tiny Mesh Cloud™ service when using the software.<br />
          This software is licensed under BSD, information about the licenses of the dependencies
          can be found in the source tree located at <a href="https://tiny-mesh.com/tinymesh/tinyconnect-gui">our GitHub profile</a>
        </p>

        <p>
          BSD © 2015 <a href="https://tiny-mesh.com">Tiny Mesh AS</a>
        </p>
      </div>
    )
  }
}


