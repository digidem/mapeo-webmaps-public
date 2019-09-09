const parseFirestore = require('firestore-parser')

module.exports = FeaturesModel

const events = FeaturesModel.events = {
  LOAD: 'features:load'
}

const API_BASE = 'https://firestore.googleapis.com/v1beta1/projects/mapeo-webmaps/databases/(default)/documents/'
const IMAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/mapeo-webmaps.appspot.com/o/'

function FeaturesModel () {
  return function featuresModel (state, emitter) {
    state.features = state.features || []

    emitter.on(events.LOAD, function (userId, mapId) {
      state.features = []
      emitter.emit(state.events.RENDER)
      state.userId = userId
      state.mapId = mapId
      const url = `${API_BASE}groups/${userId}/maps/${mapId}/observations`
      window.fetch(url).then(response => response.json()).then(_data => {
        state.features = parse(_data, userId)
        emitter.emit(state.events.RENDER)
      }).catch(console.error)
    })
  }
}

function parse (firestoreData, userId) {
  try {
    return parseFirestore(firestoreData).documents.map(function (doc) {
      const f = doc.fields
      f.properties.date = new Date(f.properties.date.split('T')[0])
      const imageId = f.properties.image
      if (imageId) {
        f.properties.image = `${IMAGE_BASE}images%2F${userId}%2Foriginal%2F${f.properties.image}?alt=media`
      } else {
        delete f.properties.image
      }
      return f
    })
  } catch (e) {
    console.error(e)
  }
}
