const parseFirestore = require('firestore-parser')

module.exports = InfoModel

const events = (InfoModel.events = {
  LOAD: 'info:load'
})

const API_BASE =
  'https://firestore.googleapis.com/v1beta1/projects/mapeo-webmaps/databases/(default)/documents/'

function InfoModel () {
  return function featuresModel (state, emitter) {
    state.info = state.info || {
      mapStyle: 'mapbox://styles/mapbox/outdoors-v11'
    }

    emitter.on(events.LOAD, function (userId, mapId) {
      state.info = {
        mapStyle: 'mapbox://styles/mapbox/outdoors-v11',
        loaded: false
      }
      emitter.emit(state.events.RENDER)
      state.userId = userId
      state.mapId = mapId
      const url = `${API_BASE}groups/${userId}/maps/${mapId}`
      window
        .fetch(url)
        .then(response => {
          if (response.status !== 200) throw new Error('Not Found')
          return response.json()
        })
        .then(_data => {
          const { fields } = parseFirestore(_data)
          if (fields.mapStyle) {
            const styleUrl = new URL(fields.mapStyle)
            const accessToken = styleUrl.searchParams.get('access_token')
            if (accessToken && !fields.accessToken) {
              fields.accessToken = accessToken
            }
            styleUrl.searchParams.delete('access_token')
            fields.mapStyle = styleUrl.toString()
          }
          state.info = {
            ...state.info,
            ...fields,
            loaded: true
          }
          console.log(state.info)
          state.notFound = false
          emitter.emit(state.events.RENDER)
        })
        .catch(e => {
          state.notFound = true
          emitter.emit(state.events.RENDER)
          console.error(e)
        })
    })
  }
}
