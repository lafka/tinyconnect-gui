import React from 'react'
import Mixin from 'react-mixin'
import {Glyphicon, Modal} from 'react-bootstrap'

export default class BackendConnectionError extends React.Component {
  static defaultProps: {
    show: false,
    reason: ''
  }

  componentWillReceiveProps(newProps) {
    this.setState({show: newProps.show})
  }

  componentWillMount() {
    this.setState({show: this.props.show})
  }

  render() {
    return (
      <Modal
        className="modal-error"
        show={null === this.state.show ? this.props.show : this.state.show}
        onHide={this.setState.bind(this, {show: false})}>

        <Modal.Header closeButton>
          <Glyphicon glyph="warning-sign">&nbsp;</Glyphicon>

          Backend connection failed.
        </Modal.Header>

        <Modal.Body>
          <p>
            Failed to connect to backend <code>{this.props.backendOpts.remote}</code>.
          </p>

          <p style={{display: this.props.backendState.reason ? 'inherit' : 'none'}}>
            <em><strong>Reason:</strong> {this.props.backendState.reason}</em>
          </p>
        </Modal.Body>
      </Modal>
    )
  }
}

Mixin.onClass(BackendConnectionError, {
  getInitialState: BackendConnectionError.getDefaultState
})
