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
      serialMode: 'pipe',
    }
  }

  componentWillMount() {
    this.on('data', this.handleData.bind(this))
    this.props.backend.on('client.data:' + this.props.client.ref, this.handleClientData.bind(this))
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize()
  }

  componentDidUpdate() {
    var outputNode = this.refs.output.getDOMNode()
    outputNode.scrollTop = outputNode.scrollHeight
  }

  componentWillUnmount() {
    if (this._timer)
      clearInterval(this._timer)

    this.removeListener('data', this.handleClientData.bind(this))
    window.removeEventListener('resize', this.handleResize);

    this.props.backend.removeListener('client.data:' + this.props.client.ref, this.handleClientData.bind(this))
  }

  componentWillReceiveProps(nextProps) {
    var
      states = this.props.states,
      available =           (states[0] || {}).available,
      downConn =            (states[0] || {}).port,
      upConn =              (states[0] || {}).remote,
      previouslyAvailable = (states[1] || {}).available,
      previouslyDownConn =  (states[1] || {}).port,
      previouslyUpConn =    (states[1] || {}).remote

    if (available && false === previouslyAvailable)
      this.log('Serial port was added back', 'link')
    if (downConn && false === previouslyDownConn)
      this.log('Serial port connection established', 'link')
    if (upConn && false === previouslyUpConn)
      this.log('Connected to Tiny Mesh Cloud', 'link')

    if (!available && true === previouslyAvailable)
      this.log('Serial Port device was removed', 'link')
    if (!upConn && true === previouslyUpConn)
      this.log('Connection to Tiny Mesh Cloud lost', 'link')
    if (!downConn && true === previouslyDownConn)
      this.log('Serial Port connection was lost', 'link')
  }

  handleResize(e) {
    var
      termNode = this.refs.term.getDOMNode(),
      optsNode = this.refs.options.getDOMNode(),
      outputNode = this.refs.output.getDOMNode()

    var termHeight
    this.setState({
      termHeight: termHeight = document.body.clientHeight  - 42 - termNode.getBoundingClientRect().top,
      outputHeight: termHeight
    })

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
          this.props.backend.send('client.write', this.props.client.ref, res)
            .done((res) => console.log('write OK', res),
                  (res) => this.log(res, 'error', 'Write Failed: '))
          return {inputError: {}}
        }
      } else {
        this.buf += chr
        return {inputError: {}}
      }
    }.bind(this))
  }

  handleClientData(buf, channel, meta) {
    if ('Buffer' !== buf.type) {
      console.log('ERROR got non-buffer client data')
      return
    }

    this.handleData(new Buffer(buf.data), channel, meta)
  }

  handleData(buf, channel, meta) {
    this.state.lines.push({
      date: new Date(),
      buf: buf,
      channel: channel || 'client',
      meta: meta
    })

    this.forceUpdate()
  }

  log(res, channel, prefix) {
    var buf = _.isString(res) ? res : _.reduce(_.omit(res, 'at'), (acc, v, k) => acc + ", " + k + ": " + v, "").replace(/^, /, '')
    this.state.lines.push({
      date: res.at || new Date(),
      buf: (prefix || "") + buf,
      channel: channel || 'error'
    })

    this.forceUpdate()
  }


  setMode(mode) {
    this.props.backend.send('client.mode', this.props.client.ref, mode)
      .done(
       (res) => this.setState({serialMode: mode}),
       (res) => this.log(res, 'error')
      )
  }


  connect() {
    switch (this.state.serialMode) {
      case 'pipe':
        this.props.backend.send('client.connect', this.props.client.ref, ['tcp', 'serial'], 'pipe')
          .done(
             (res) => console.log('connect pipe', res),
             (res) => this.log(res, 'error')
          )
        break

      case 'sync':
        this.props.backend.send('client.connect', this.props.client.ref, ['tcp'], 'sync')
          .done(
             (res) => console.log('connect sync', res),
             (res) => this.log(res, 'error')
          )
        break

      default:
        this.setState({serialModeErr: true})
        break;;
    }
  }

  disconnect() {
    this.props.backend.send('client.disconnect')
      .done(
       (res) => console.log('disconnect', res),
       (res) => this.log(res, 'error')
      )
  }


  /**
   *  returns the connection state of the expectancy.
   *  Will be of type: [`state`, `missing-up`, `missing-down`]
   */
  syncState(client) {
    if (client.port.connected && !client.remote.connected)
     return ['up', [], []]
    else if (client.port.connected && client.remote.connected)
      return ['excessive', [], ['tcp']]
    else if (!client.port.connected && client.remote.connected)
      return ['excessive', ['serial'], ['tcp']]
    else
      return ['down', ['tcp'], []]
  }

  pipeState(client) {
    if (client.port.connected && client.remote.connected)
     return ['up', [], []]
    else if (client.port.connected && !client.remote.connected)
      return ['partial', ['tcp'], []]
    else if (!client.port.connected && client.remote.connected)
      return ['partial', ['serial'], []]
    else
      return ['down', ['serial', 'tcp'], []]
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

    var connState = {
      'pipe':  this.pipeState(client),
      'sync': this.syncState(client)
    }

    var
      bpsTitle = client.port.baudrate + " bps",
      serialMode = this.state.serialMode,
      connected = connState[serialMode][0]

    // for connection actions

    var ctx = this
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

          <div className="options" ref="options">
            <SplitButton bsStyle="default" id="baudrates" title={bpsTitle}>
              {_.map(bpsRates, (bps, k) =>
                <MenuItem className={client.port.baudrate === bps && "active" || ""} eventKey={k} key={k}>{bps}</MenuItem>)}
            </SplitButton>

            <SplitButton bsStyle="default" id="tty-mode" title={serialMode}>
              {_.map(modes, (mode, k) =>
                <MenuItem
                  onSelect={ctx.setMode.bind(ctx, mode)}
                  className={serialMode === mode && "active" || ""}
                  eventKey={k}
                  key={k}
                  >{mode}</MenuItem>)}
            </SplitButton>

              <Button
                onClick={this.connect.bind(this)}
                bsStyle="success">

                <Glyphicon glyph="ok">&nbsp;</Glyphicon>
                Connect
              </Button>

              <Button
                onClick={this.disconnect.bind(this)}
                bsStyle="danger">
                <Glyphicon glyph="remove">&nbsp;</Glyphicon>
                Disconnect
              </Button>


            {'pipe' === serialMode && <span>&nbsp;TCP: {this.props.states[0].remote ? 'up' : 'down'} </span>}
            <span>&nbsp;Serial: {this.props.states[0].port ? 'up' : 'down'}</span>

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

          <div
            className="output"
            ref="output"
            style={{height: this.state.outputHeight + 'px'}}
            >

            {lines.map(formatter)}

            <div className="prompt" ref="prompt">
              <span className="prefix"> # </span>
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
