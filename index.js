const css = require('sheetify')
var choo = require('choo')

css('normalize.css')

var app = choo()

if (process.env.NODE_ENV === 'production') {
  require('./lib/service-worker')
} else {
  app.use(require('choo-devtools')())
  app.use(require('choo-log')())
}

const FEATURES_URL = 'data.json'

app.use(require('./models/map')())
app.use(require('./models/features')(FEATURES_URL))

app.route('/*', require('./views/main')())

if (!module.parent) app.mount('body')
else module.exports = app
