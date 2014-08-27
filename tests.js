var tape = require('tape')
var through = require('through2')
var readable = require('readable-stream')
var continueStream = require('./')

tape('continueStream', function(t) {
  t.plan(3)

  var count = 1

  function next(callback) {
    if (count > 3) return callback()

    var source = through()
    callback(source)

    source.end(++count + '')
  }

  continueStream(next)
    .on('data', function(data) {
      t.equal(data.toString(), count + '')
    })
})

tape('continueStream.obj', function(t) {
  t.plan(3)

  var count = 1

  function next(callback) {
    if (count > 3) return callback()

    var source = through.obj()
    callback(source)

    source.end({count: ++count})
  }

  continueStream.obj(next)
    .on('data', function(data) {
      t.equal(data.count, count)
    })
})

tape('proxy errors', function(t) {
  t.plan(2)

  var stream = through()

  continueStream(function(callback) {
    callback(stream)
  })
    .on('data', function(data) {
      t.equal(data.toString(), 'pugme')
    })
    .on('error', function(err) {
      t.ok(err)
    })

  stream.write('pugme')
  stream.emit('error', new Error('Error should be forwarded'))
})
