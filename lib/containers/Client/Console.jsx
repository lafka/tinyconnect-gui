import React from 'react';
import Mixin from 'react-mixin'

import {PageHeader, Label, Overlay, Alert} from 'react-bootstrap'
import {SplitButton, Button, MenuItem, Glyphicon} from 'react-bootstrap'

import {EventEmitter} from 'events'

import _ from 'lodash'

import Parser from '../../console/parser.js'
import * as formatters from '../../console/formatters.js'
/**
 * The console is a simple line-based bufer with support for input.
 *
 * props:
 *   formatter: ({date: Date, buf: String, channel: _, ...}) => String
 *   parser:    (String) => {date: Date, buf: String, ...}
 *   lines:     [{date: Date, buf: String, ..}, ..]
 *
 * The event emitter consumes the following:
 * `data -> String` - when a line was inputed in the console
 * `line -> Line` - data was received from external source
 *
 */

export default class Console extends React.Component {
  constructor(props) {
    super(props)

    this._emitter = new EventEmitter()

    this.on                 = this._emitter.on.bind(this._emitter)
    this.once               = this._emitter.once.bind(this._emitter)
    this.removeListener     = this._emitter.removeListener.bind(this._emitter)
    this.removeAllListeners = this._emitter.removeAllListeners.bind(this._emitter)
    this.listeners          = this._emitter.listeners.bind(this._emitter)
    this.emit               = this._emitter.emit.bind(this._emitter)

    this.buf = ""
  }

  static getInitialState() {
    var
      startBuf = (this.props.parser || Parser).help || "",
      defaultLines = startBuf.split(/\n/).map(function(buf) {
        return {
          date: new Date(),
          buf: buf,
          channel: 'info'
        }
      })

    return {
      lines: this.props.lines || defaultLines,
      formatter: this.props.formatter || formatters.Ascii,
      formatterLabel: (this.props.formatter || {}).label || formatters.Ascii.label,
      parser: this.props.parser || Parser,
      inputError: {},
      termHeight: 100,
      serialMode: 'pipe'
    }
  }

  handleTerminalBlur() {
    if (this._timer)
      clearInterval(this._timer)

    this._timer = false

    var node = this.refs.caret.getDOMNode()
    node.style.display = 'inline-block'
  }

  handleTerminalFocus() {
    this.refs.term.getDOMNode().focus()

    if (this._timer)
      return

    this._timer = setInterval(function() {
      var node = this.refs.caret.getDOMNode()
      node.style.display = 'none' === node.style.display ? 'inline-block' : 'none'
    }.bind(this), 750)
  }

  handleTerminalKey(ev) {
    if (ev.type === 'keydown' && ev.keyCode === 8) {
      ev.preventDefault()
      this.buf = this.buf.substring(0, this.buf.length - 1)
      this.setState(function(state) {
        return {
          inputError: {}
        }
      }.bind(this))
      return
    }

    if (ev.type !== 'keypress')
      return

    var chr = String.fromCharCode(ev.charCode)
    this.setState(function(state) {
      if ("\r" === chr) {
        if (!this.buf) {
          this.emit('data', "")
          this.buf = ""
          return {inputError: {}}
        }

        var res = this.state.parser(this.buf)

        if (res.error) {
          return {inputError: res}
        } else {
          this.emit('data', res)
          this.buf = ""
          return {inputError: {}}
        }
      } else {
        this.buf += chr
        return {inputError: {}}
      }
    }.bind(this))
  }

  handleData(buf) {
    this.state.lines.push({
      date: new Date(),
      buf: buf,
      channel: 'client'
    })

    this.forceUpdate()
  }



  componentWillMount() {
    this.on('data', this.handleData.bind(this))
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize()
  }

  componentDidUpdate() {
    var termNode = this.refs.term.getDOMNode()
    termNode.scrollTop = termNode.scrollHeight
  }

  componentWillUnmount() {
    if (this._timer)
      clearInterval(this._timer)

    this.removeListener('data', this.handleData.bind(this))
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize(e) {
    var termNode = this.refs.term.getDOMNode()

    this.setState({termHeight: document.body.clientHeight  - 42 - termNode.getBoundingClientRect().top})
  }

  render() {
    const infoChans = ["info"]
    var
      client = this.props.client,
      lines = this.state.lines,
      buf = this.buf,
      formatter = function(line, k) {
        return (
          <div key={k} className={"line channel-" + line.channel}>
            {-1 === _.indexOf(infoChans, line.channel) ?
              this.state.formatter(line) :
              formatters.Ascii(line)}

            {!line.buf && " "}
          </div>
        )
      }.bind(this)


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
    var modes = ['pipe', 'sync']

    var
      bpsTitle = client.port.baudrate + " bps",
      serialMode = this.state.serialMode,
      connected = false

    return (
      <div>
        <PageHeader>Console: {client.name || client.port.uniqueID}</PageHeader>

        <div
          ref="term"
          tabIndex={2}
          className="terminal"
          onFocus={this.handleTerminalFocus.bind(this)}
          onBlur={this.handleTerminalBlur.bind(this)}
          onKeyPress={this.handleTerminalKey.bind(this)}
          onKeyDown={this.handleTerminalKey.bind(this)}
          style={{height: this.state.termHeight + 'px'}}
          >

          <div className="options">
            <SplitButton bsStyle="default" id="baudrates" title={bpsTitle}>
              {_.map(bpsRates, (bps, k) =>
                <MenuItem className={client.port.baudrate === bps && "active" || ""} eventKey={k} key={k}>{bps}</MenuItem>)}
            </SplitButton>

            <SplitButton bsStyle="default" id="tty-mode" title={serialMode}>
              {_.map(modes, (mode, k) =>
                <MenuItem className={serialMode === mode && "active" || ""} eventKey={k} key={k}>{mode}</MenuItem>)}
            </SplitButton>

            {!connected && <Button bsStyle="success">
                <Glyphicon glyph="ok">&nbsp;</Glyphicon>
                Connect
              </Button>}

            {connected && <Button bsStyle="danger">
                <Glyphicon glyph="remove">&nbsp;</Glyphicon>
                Disconnect
              </Button>
            }

            <span className="formats">
              {_.map(_.sortBy(formatters, 'order'), (fmt, k) =>
                <a
                  key={k}
                  onClick={this.setState.bind(this, {formatter: fmt, formatterLabel: fmt.label}, undefined)}
                  className={fmt.label === this.state.formatterLabel && 'active' || ''}
                  >
                  {fmt.label}
                </a>
              )}
            </span>
          </div>

          <div className="output" ref="output">
            {lines.map(formatter)}

            <div className="prompt" ref="prompt">
              <span className="prefix"> > </span>
              <span>{buf}</span>
              <span className="term-caret" ref="caret" />

              <Overlay
                show={!!this.state.inputError.error}
                target={props => React.findDOMNode(this.refs.prompt)}
                placement="bottom"
                container={React.findDOMNode(this.refs.output)}>
                <Alert bsStyle="danger" style={{position:'absolute', marginTop: '-80px', marginLeft: '15px', width: '80%'}}>
                  <b>Input Error:</b> {this.state.inputError.error}
                </Alert>
              </Overlay>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Mixin.onClass(Console, {
  getInitialState: Console.getInitialState
})
