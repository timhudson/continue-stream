# continue-stream

Lazily merge multiple streams in to a single stream. `continueStream` can also
be thought of as a pagination stream.

```
npm install continue-stream
```

[![build status](http://img.shields.io/travis/timhudson/continue-stream.svg?style=flat)](http://travis-ci.org/timhudson/continue-stream)

## Usage

Pass `continueStream` a function that provides a new stream to it's callback.
This function will be called on initialization and after each stream has ended.
If the callback is called without any arguments the `continueStream` will end.

``` js
var continueStream = require('continue-stream')
var request = require('request')

var page = 1

function next(callback, previousStream) {
  if (page >= 4) return callback()

  var stream = request({
    url: 'https://api.github.com/repos/joyent/node/events?page=' + (page++),
    headers: {'user-agent': 'pug'}
  })

  callback(stream)
}

continueStream(next)
  .pipe(process.stdout)

```

Or you can use `continueStream.obj` as a convenience for `objectMode`

```
var continueStream = require('continue-stream')
var request = require('request')
var pumpify = require('pumpify')
var JSONStream = require('JSONStream')

var page = 1

function next(callback, previousStream) {
  if (page >= 4) return callback()

  var req = request({
    url: 'https://api.github.com/repos/joyent/node/events?page=' + (page++),
    headers: {'user-agent': 'pug'}
  })

  var stream = pumpify.obj(req, JSONStream.parse('*'))

  callback(stream)
}

continueStream.obj(next)
  .on('data', function(data) {
    console.log(data)
  })
```

A good use case for this is paginated requests. Need to read the last `n`
pages of a feed and want all items piped through a single stream? That is
exactly what the last example is showing.

## License

MIT
