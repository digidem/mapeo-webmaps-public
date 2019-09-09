const css = require('sheetify')
var choo = require('choo')

css('normalize.css')

var app = choo()

if (process.env.NODE_ENV === 'production') {
  require('./lib/service-worker')
} else {
  app.use(require('choo-devtools')())
}

app.use(require('./models/map')())
app.use(require('./models/features')())
app.use(require('./models/modals')())
app.use(require('./models/info')())

app.route('/groups/:userId/maps/:mapId', require('./views/main')(app))
app.route('/*', require('./views/404')())

module.exports = app.mount('#root')
