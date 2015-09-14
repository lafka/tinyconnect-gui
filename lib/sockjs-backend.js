import SockJS from 'sockjs-client'
import {EventEmitter} from 'events'
import util from 'util'

export default class SockJSBackend {
  constructor(opts) {
    this._emitter = new EventEmitter()

    // the lol way of extending......
    this.on                 = this._emitter.on.bind(this._emitter)
    this.once               = this._emitter.once.bind(this._emitter)
    this.removeListener     = this._emitter.removeListener.bind(this._emitter)
    this.removeAllListeners = this._emitter.removeAllListeners.bind(this._emitter)
    this.listeners          = this._emitter.listeners.bind(this._emitter)
    this.emit               = this._emitter.emit.bind(this._emitter)

    this.open(opts.remote || 'http://127.0.0.1:6999/ws')
  }

  open(url) {
    this._sockjs = new SockJS(url, null, {
      sessionId: this.clientId.bind(this)
    })
    this._ref = 0
    this._clientid

    this._sockjs.onopen  = this.onOpen.bind(this)
    this._sockjs.onclose = this.onClose.bind(this)
    this._sockjs.onmessage = this.onData.bind(this)
  }

  clientId() {
    return this._clientid = this._clientid || Math.random().toString(36).substr(2, 8)
  }

  getRef() {
    return this._clientid + "#" + ++this._ref
  }

  send(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    console.log('emitting: ', arguments)
    this._sockjs.send(JSON.stringify({
      ev: event,
      ref: this.getRef(),
      arguments: args
    }))
  }

  onOpen() {
    console.log(this._clientid)
    console.log('sockjs/open')
    this.emit('open')
  }

  onClose(args) {
    console.log('sockjs/close')
    this.emit('close', args)
  }

  onData(buf) {
    var json

    try {
      json = JSON.parse(buf.data)
    } catch(e) {
      console.log('err: failed to process event', e.toString())
      console.log(e.stack)
      return
    }

    console.log(json)
    if (!json.ev) {
      console.log('err: data did not contain `ev` parameter')
      return
    }

    this.emit.apply(this._emitter, [json.ev].concat(json.arguments || []))
  }
}
