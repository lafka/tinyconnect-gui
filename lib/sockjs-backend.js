import SockJS from 'sockjs-client'
import {EventEmitter} from 'events'
import util from 'util'
import Q from 'q'

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
    this._promises = {}
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
    var
      ref,
      args = Array.prototype.slice.call(arguments, 1)


    this._sockjs.send(JSON.stringify({
      ev: event,
      ref: ref = this.getRef(),
      arguments: args
    }))

    this._promises[ref] = Q.defer()

    return this._promises[ref].promise
  }

  onOpen() {
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

    if (!json.ev) {
      console.log('err: data did not contain `ev` parameter', json)
      return
    }

    if (this._promises[json.ref]) {
      if (json.error)
        this._promises[json.ref].reject(json)
      else
        this._promises[json.ref].resolve(json)

      delete this._promises[json.ref]
    }

    if (!json.ev.match(/^r:/))
      this.emit.apply(this._emitter, [json.ev].concat(json.arguments || []))
  }
}
