var Readable = require('readable-stream')
var eos = require('end-of-stream')
var util = require('util')

util.inherits(ContinueStream, Readable)

function ContinueStream(next, options) {
  if (!(this instanceof ContinueStream))
    return new ContinueStream(next, options)

  Readable.call(this, options)

  this.next = next
  this.nextStream()
}

ContinueStream.prototype.nextStream = function() {
  this.next(function(err, source) {
    if (err) return this.emit('error', err)
    if (!source) return this.push(null)
    if (!source._readableState) source = new Readable().wrap(source)

    this._source = source

    eos(source, function(err) {
      if (err) return this.emit('error', err)
      this.nextStream()
    }.bind(this))

    source.on('readable', function() {
      this._forward()
    }.bind(this))

  }.bind(this), this._source)
}

ContinueStream.prototype._read = function() {
  this._drained = true
  this._forward()
}

ContinueStream.prototype._forward = function() {
  if (this._forwarding || !this._source || !this._drained) return
  this._forwarding = true

  var data
  while ((data = this._source.read()) !== null) {
    this._drained = this.push(data)
  }

  this._forwarding = false
}

module.exports = ContinueStream

module.exports.obj = function(next, options) {
  options = options || {}
  options.objectMode = true
  options.highWaterMark = 16
  return ContinueStream(next, options)
}
