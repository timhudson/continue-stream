var continueStream = require('./')
var request = require('request')
var pumpify = require('pumpify')
var JSONStream = require('JSONStream')

var page = 0

function next(callback, previousStream) {
  if (page >= 4) return callback()

  var req = request({
    url: 'https://api.github.com/repos/joyent/node/events?page=' + (++page),
    headers: {'user-agent': 'pug'}
  })

  var stream = pumpify.obj(req, JSONStream.parse('*'))

  callback(stream)
}

continueStream.obj(next)
  .on('data', function(data) {
    console.log(data.created_at)
  })
