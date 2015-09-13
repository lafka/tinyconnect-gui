import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap'
import {PageHeader} from 'react-bootstrap'

import Sidebar from './../components/Sidebar.jsx'

export default class Landing extends React.Component {
  render() {
    return (
      <Grid className="landing" fluid={true} className="full-height">
        <Row className="full-height">
          <Sidebar {...this.props} />

          <Col xs={6} md={8} className="white-bg full-height">
            <Col lg={7} md={12} xs={12}>
              <PageHeader>Tinyconnect</PageHeader>

              <p className="lead">
              </p>
            </Col>
          </Col>
        </Row>
      </Grid>
    )
  }
}

