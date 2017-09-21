const d3 = require('d3-request/build/d3-request.js')

module.exports = FeaturesModel

function FeaturesModel (url) {
  return function featuresModel (state, emitter) {
    state.features = state.features || []
    d3.json(url, function (err, _data) {
      if (err) return console.error(err)
      state.features = parseDates(addIds(_data)).features
      emitter.emit(state.events.RENDER)
    })
  }
}

function parseDates (fc) {
  fc.features.forEach(function (f) {
    f.properties.date = new Date(f.properties.date.split('T')[0])
  })
  return fc
}

function addIds (fc) {
  fc.features.forEach(function (f, i) {
    f.properties._id = i
  })
  return fc
}
