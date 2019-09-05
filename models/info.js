const d3 = require('d3-request/build/d3-request.js')
const parseFirestore = require('firestore-parser')

module.exports = InfoModel

const events = InfoModel.events = {
  LOAD: 'info:load'
}

const API_BASE = 'https://firestore.googleapis.com/v1beta1/projects/mapeo-webmaps/databases/(default)/documents/'

function InfoModel () {
  return function featuresModel (state, emitter) {
    state.info = state.info || []

    emitter.on(events.LOAD, function (userId, mapId) {
      state.info = []
      emitter.emit(state.events.RENDER)
      state.userId = userId
      state.mapId = mapId
      const url = `${API_BASE}groups/${userId}/maps/${mapId}`
      d3.json(url, function (err, _data) {
        if (err) return console.error(err)
        state.info = parseFirestore(_data).fields
        emitter.emit(state.events.RENDER)
      })
    })
  }
}
