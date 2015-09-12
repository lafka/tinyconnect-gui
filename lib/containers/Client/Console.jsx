import React from 'react';

export default class Console extends React.Component {
  render() {
    return (
      <div>
        CONSOLE
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    )
  }
}
