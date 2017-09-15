const d3 = require('d3-request')
const qs = require('querystring')
const css = require('sheetify')
const mapboxgl = require('mapbox-gl')

const Popup = require('./popup')
const layerStyles = require('./styles')

css('mapbox-gl/dist/mapbox-gl.css')

var markerRadius = 10
var popupOffsets = {
  'top': [0, markerRadius],
  'top-left': [0, markerRadius],
  'top-right': [0, markerRadius],
  'bottom': [0, -markerRadius],
  'bottom-left': [0, -markerRadius],
  'bottom-right': [0, -markerRadius],
  'left': [markerRadius, 0],
  'right': [-markerRadius, 0]
}

var data
var pending = 2
// var query = qs.parse(window.location.search, {ignoreQueryPrefix: true})

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var map = window.map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/gmaclennan/cj7ljlyqy8gq52rrptj0zy6w7?fresh=true&optimize=true', // stylesheet location
  center: [-59.4377, 2.6658], // starting position
  zoom: 10, // starting zoom
  hash: true
}).on('load', onLoad)

d3.json('data.json', function (err, _data) {
  if (err) return console.error(err)
  data = addIds(_data)
console.log(data)
  onLoad()
})

function onLoad () {
  if (--pending > 0) return

  var nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'top-left')
  map.addSource('features', {type: 'geojson', data: data})
  map.addLayer(layerStyles.points)
  map.addLayer(layerStyles.pointsHover)

  // Create a popup, but don't add it to the map yet.
  var popup = new Popup(map)

  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] })

    if (features.length) {
      console.log(features)
      map.getCanvas().style.cursor = 'pointer'
      map.setFilter('points-hover', ['==', '_id', features[0].properties._id])
    } else {
      map.getCanvas().style.cursor = ''
      map.setFilter('points-hover', ['==', '_id', ''])
    }
  })

  map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] })

    if (!features.length) return popup.remove()

    var loc = features[0].geometry.coordinates
    popup.popup.options.offset = popupOffsets
    popup.update(features[0].properties)
    popup.setLngLat(loc)
  })
}

function addIds (fc) {
  fc.features.forEach(function (f, i) {
    f.properties._id = i
  })
  return fc
}
