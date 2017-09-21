
module.exports = MapModel

const events = MapModel.events = {
  SHOW_POPUP: 'popup:show',
  CLOSE_POPUP: 'popup:close',
  MOVE_POPUP: 'popup:move',
  ZOOM_TO: 'features:zoom_to',
  CANCEL_ZOOM: 'features:cancel_zoom'
}

function MapModel () {
  return function mapModel (state, emitter) {
    emitter.on(events.SHOW_POPUP, function (payload) {
      state.popupFeature = payload.feature
      state.popupPoint = payload.map.project(payload.feature.geometry.coordinates)
      emitter.emit(state.events.RENDER)
    })

    emitter.on(events.CLOSE_POPUP, function () {
      state.popupFeature = null
      state.popupPoint = null
      emitter.emit(state.events.RENDER)
    })

    emitter.on(events.MOVE_POPUP, function (payload) {
      if (!state.popupFeature) return
      state.popupPoint = payload.map.project(state.popupFeature.geometry.coordinates)
      emitter.emit(state.events.RENDER)
    })

    emitter.on(events.ZOOM_TO, function (id) {
      const match = state.features.filter(f => id === f.properties._id)
      state.zoomFeature = match.length ? match[0] : null
      state.popupFeature = state.zoomFeature
      emitter.emit(state.events.RENDER)
    })

    emitter.on(events.CANCEL_ZOOM, function () {
      state.zoomFeature = null
      emitter.emit(state.events.RENDER)
    })
  }
}
