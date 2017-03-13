var tape = require('tape')
var through = require('through2')
var readable = require('readable-stream')
var concat = require('concat-stream')
var continueStream = require('./')

tape('continueStream', function(t) {
  t.plan(1)

  var count = 0

  function next(callback) {
    if (count === 3) return callback()

    var source = through()
    callback(null, source)

    source.end(++count + '')
  }

  continueStream(next)
    .pipe(concat(function (data) {
      t.equal(data.toString(), '123')
    }))
})

tape('continueStream.obj', function(t) {
  t.plan(1)

  var count = 0

  function next(callback) {
    if (count === 3) return callback()

    var source = through.obj()
    callback(null, source)

    source.end({count: ++count})
  }

  continueStream.obj(next)
    .pipe(concat(function (data) {
      t.deepEqual(data, [
        {count: 1},
        {count: 2},
        {count: 3}
      ])
    }))
})

tape('callback errors', function(t) {
  t.plan(1)

  function next(callback) {
    process.nextTick(function() {
      callback(new Error('THWACK'))
    })
  }

  continueStream(next)
    .on('error', function(err) {
      t.equal(err.message, 'THWACK')
    })
})

tape('proxy errors', function(t) {
  t.plan(2)

  var stream = through()

  continueStream(function(callback) {
    callback(null, stream)
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
