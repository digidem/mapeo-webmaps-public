const d3 = require('d3-request/build/d3-request.js')
const qs = require('querystring')
const css = require('sheetify')
const mapboxgl = require('mapbox-gl')
const yo = require('yo-yo')

const Popup = require('./popup')
const styles = require('./styles')
const recents = require('./recents')

css('mapbox-gl/dist/mapbox-gl.css')

const INITIAL_BOUNDS = [[-65, -5], [-52, 12]]
const TERRITORY_BOUNDS = [[-60,1.74], [-58.09,3.36]]

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err)
    })
  })
}

var data
var pending = 2
// var query = qs.parse(window.location.search, {ignoreQueryPrefix: true})

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var map = window.map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/gmaclennan/cj7ljlyqy8gq52rrptj0zy6w7?fresh=true&optimize=true', // stylesheet location
  center: [-59.4377, 2.6658], // starting position
  zoom: 5.5, // starting zoom
  dragRotate: false
}).on('load', onLoad)

map.fitBounds(INITIAL_BOUNDS, {easing: function () { return 1 }})

d3.json('data.json', function (err, _data) {
  if (err) return console.error(err)
  data = parseDates(addIds(_data))
  yo.update(document.getElementsByClassName('recents')[0], recents(data, onClickRecent))
  onLoad()
})

function onClickRecent (id) {
  const features = data.features.filter(function (f) {
    return f.properties._id === id
  })
  if (!features.length) return
  const loc = features[0].geometry.coordinates
  map.flyTo({
    center: loc,
    zoom: 12.5
  })
  popup.update(features[0].properties)
  popup.setLngLat(loc)
}

// Create a popup, but don't add it to the map yet.
  var popup = new Popup(map)


function onLoad () {
  if (--pending > 0) return

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')
  map.addSource('features', {type: 'geojson', data: data})
  map.addSource('bing', styles.bingSource)
  map.addLayer(styles.points)
  map.addLayer(styles.pointsHover)
  map.addLayer(styles.bing, 'landcover_crop')

  map.fitBounds(TERRITORY_BOUNDS, {padding: 20, speed: 0.4})

  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] })

    if (features.length) {
      map.getCanvas().style.cursor = 'pointer'
      map.setFilter('points-hover', ['==', '_id', features[0].properties._id])
    } else {
      map.getCanvas().style.cursor = ''
      var filteredId = map.getFilter('points-hover')[2]
      if (!popup.isOpen() || popup.id !== filteredId) {
        map.setFilter('points-hover', ['==', '_id', ''])
      }
    }
  })

  map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] })
    if (!features.length) return popup.remove()

    var loc = features[0].geometry.coordinates
    popup.update(features[0].properties)
    popup.setLngLat(loc)
  })
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
