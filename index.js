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
  this.next(function(source) {
    if (!source) return this.push(null)
    if (!source._readableState) source = new Readable().wrap(source)

    this._source = source

    eos(source, function(err) {
      if (err) return this.emit('error', err)
      this.nextStream()
    }.bind(this))

    source.on('readable', function() {
      this.read(0)
      this.readFromSource()
    }.bind(this))

  }.bind(this), this._source)
}

ContinueStream.prototype._read = function(n) {
  if (this._source) this.readFromSource(n)
}

ContinueStream.prototype.readFromSource = function(n) {
  var chunk = this._source.read()
  if (chunk) this.push(chunk)
}

module.exports = ContinueStream

module.exports.obj = function(next, options) {
  options = options || {}
  options.objectMode = true
  options.highWaterMark = 16
  return ContinueStream(next, options)
}
