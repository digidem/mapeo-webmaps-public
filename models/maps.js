const parseFirestore = require('firestore-parser')

module.exports = mapsModel

const events = (mapsModel.events = {
  LOAD: 'maps:load'
})

const API_BASE =
  'https://firestore.googleapis.com/v1beta1/projects/mapeo-webmaps-staging/databases/(default)/documents/'

function mapsModel () {
  return function featuresModel (state, emitter) {
    emitter.on(events.LOAD, function (userId) {
      state.maps = 'loading'
      state.userId = userId
      const url = `${API_BASE}groups/${userId}:runQuery`
      const query = {
        structuredQuery: {
          where: {
            fieldFilter: {
              field: {
                fieldPath: 'public'
              },
              op: 'EQUAL',
              value: {
                booleanValue: true
              }
            }
          },
          from: [
            {
              collectionId: 'maps'
            }
          ]
        }
      }
      window
        .fetch(url, { method: 'POST', body: JSON.stringify(query) })
        .then(response => {
          if (response.status !== 200) throw new Error('Not Found')
          return response.json()
        })
        .then(_data => {
          state.maps = parseMapData(_data) || []
          console.log(state.maps)
          state.notFound = false
          emitter.emit(state.events.RENDER)
        })
        .catch(e => {
          state.maps = []
          state.notFound = true
          emitter.emit(state.events.RENDER)
          console.error(e)
        })
    })
  }
}

function parseMapData (data) {
  return parseFirestore(data)
    .filter(item => item.document && item.document.fields)
    .map(item => ({
      ...item.document.fields,
      id: item.document.name.split('/').pop()
    }))
    .sort((a, b) => {
      if (a.createdAt < b.createdAt) return 1
      if (a.createdAt > b.createdAt) return -1
      return 0
    })
}
