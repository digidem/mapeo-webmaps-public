const Nanocomponent = require('nanocomponent')
const html = require('choo/html')
const css = require('sheetify')
const mapboxgl = require('mapbox-gl')
const assert = require('assert')

const styles = require('../lib/map-styles')

mapboxgl.accessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

const mapClass = css`
  :host {
    position: absolute;
    height: 100%;
    width: 100%;
  }
  .mapboxgl-ctrl-group > button.mapboxgl-ctrl-compass {
    display: none;
  }
`

const fitBoundsClass = css`
  :host {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
`

const FLY_TO_ZOOM = 12.5
const DEG_PER_PIXEL = 360 / Math.pow(2, FLY_TO_ZOOM) / 512

class FitBoundsControl {
  constructor (onClick) {
    this.onClick = onClick
  }

  onAdd (map) {
    this._container = html`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button
          class="mapboxgl-ctrl-icon ${fitBoundsClass}"
          type="button"
          title="Zoom to data"
          aria-label="Zoom to data"
          onclick="${this.onClick}"
        ></button>
      </div>
    `
    return this._container
  }

  onRemove () {
    this._container.parentNode.removeChild(this._container)
  }
}

module.exports = MapView

function MapView () {
  if (!(this instanceof MapView)) return new MapView()
  this.state = {
    features: [],
    hoveredId: null,
    clickedId: null
  }
  this.render = this.render.bind(this)
  Nanocomponent.call(this)
}

MapView.prototype = Object.create(Nanocomponent.prototype)

MapView.prototype.createElement = function (props) {
  // this.emit = emit
  this.props = props
  return html`
    <div class="${mapClass}"></div>
  `
}

MapView.prototype.load = function (el) {
  const map = (this.map = window.map = new mapboxgl.Map({
    container: el,
    style: this.props.mapStyle, // stylesheet location
    dragRotate: false
  }).on('load', () => {
    this.state.loaded = true
    this._setupLayers()

    if (this.props.features && this.props.features.length) {
      this.fitBounds(this.props.features)
      this._hasDoneInitialZoom = true
    }

    map.on('mousemove', 'points', e => {
      this.state.hoveredId = e.features[0].properties._id
      map.getCanvas().style.cursor = 'pointer'
      map.setFilter('points-hover', [
        'in',
        '_id',
        e.features[0].properties._id,
        this.state.clickedId || ''
      ])
    })

    map.on('mouseleave', 'points', e => {
      this.state.hoveredId = null
      map.getCanvas().style.cursor = ''
      map.setFilter('points-hover', [
        'in',
        '_id',
        this.state.clickedId !== null ? this.state.clickedId : ''
      ])
    })

    map.on('click', 'points', e => {
      this.state.clickedId = e.features[0].properties._id
      map.setFilter('points-hover', ['in', '_id', this.state.clickedId])
      this.props.onClick(e.features[0], map)
    })

    map.on('click', () => {
      if (this.state.hoveredId !== null) return
      this.props.onClick()
      this.state.clickedId = null
      map.setFilter('points-hover', ['in', '_id', ''])
    })

    map.on('move', e => this.props.onMove(e, map))
  }))

  map.addControl(new mapboxgl.NavigationControl(), 'top-left')
  map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80 }))
  map.addControl(
    new FitBoundsControl(() =>
      this.fitBounds(this.props.features, { speed: 1 })
    ),
    'top-left'
  )
}

// Implement conditional rendering
MapView.prototype.update = function (nextProps) {
  const map = this.map
  const zoomFeature = nextProps.zoomFeature
  const popupFeature = nextProps.popupFeature

  if (zoomFeature && zoomFeature !== this.props.zoomFeature) {
    const mapHeight = map.getContainer().offsetHeight
    const coords = zoomFeature.geometry.coordinates
    this.state.clickedId = zoomFeature.properties._id
    this._ready(() =>
      map.setFilter('points-hover', ['in', '_id', this.state.clickedId])
    )
    map.flyTo({
      center: [coords[0], coords[1] + (mapHeight / 4) * DEG_PER_PIXEL],
      zoom: FLY_TO_ZOOM
    })
    nextProps.onMove({}, map)
  }

  const hoveredId = this.state.hoveredId !== null ? this.state.hoveredId : ''
  if (popupFeature) {
    this._ready(() =>
      map.setFilter('points-hover', [
        'in',
        '_id',
        hoveredId,
        popupFeature.properties._id
      ])
    )
  } else {
    this.state.clickedId = null
    this._ready(() => map.setFilter('points-hover', ['in', '_id', hoveredId]))
  }

  if (nextProps.features !== this.props.features) {
    this._ready(function () {
      map.getSource('features').setData(featureCollection(nextProps.features))
    })
    if (!this._hasDoneInitialZoom) {
      this.fitBounds(nextProps.features)
      this._hasDoneInitialZoom = true
    }
  }

  if (nextProps.mapStyle !== this.props.mapStyle) {
    this._setMapStyle(nextProps.mapStyle + '?fresh=true')
  }

  this.props = nextProps

  // never render
  return false
}

const defaultFitBoundsOpts = {
  padding: 40,
  speed: 0.4,
  maxZoom: 12
}

MapView.prototype.fitBounds = function (features, opts) {
  this.map.fitBounds(getBounds(features), {
    ...defaultFitBoundsOpts,
    ...opts
  })
}

MapView.prototype._setMapStyle = function (styleUrl) {
  const map = this.map
  if (!map.style || !map.style._loaded) {
    return map.once('style.load', () => this._setMapStyle(styleUrl))
  }
  map.setStyle(styleUrl)
  this._setupLayers()
}

MapView.prototype._ready = function (cb) {
  if (this.state.loaded) {
    process.nextTick(cb)
  } else {
    this.map.on('load', cb)
  }
}

MapView.prototype._setupLayers = function () {
  const map = this.map
  if (!map.style || !map.style._loaded) {
    return map.once('style.load', () => this._setupLayers())
  }
  if (!map.getSource('features')) {
    map.addSource('features', {
      type: 'geojson',
      data: featureCollection(this.props.features || []),
      buffer: 0
    })
  }
  if (!map.getSource('bing')) map.addSource('bing', styles.bingSource)
  if (!map.getLayer(styles.points.id)) map.addLayer(styles.points)
  if (!map.getLayer(styles.pointsHover.id)) map.addLayer(styles.pointsHover)

  const replaceableBingLayer = map.getLayer('mapeo-bing-layer')

  if (!replaceableBingLayer) return
  map.setLayoutProperty('mapeo-bing-layer', 'visibility', 'none')

  styles.bing.minzoom = replaceableBingLayer.minzoom || 0
  styles.bing.maxzoom = replaceableBingLayer.maxzoom || 22

  if (map.getLayer(styles.bing.id)) map.removeLayer(styles.bing.id)
  map.addLayer(styles.bing, 'mapeo-bing-layer')
  const opacity = map.getPaintProperty('mapeo-bing-layer', 'background-opacity')
  map.setPaintProperty(styles.bing.id, 'raster-opacity', opacity)
}

function featureCollection (features) {
  assert(Array.isArray(features), 'features must be an array')
  return {
    type: 'FeatureCollection',
    features: features
  }
}

function getBounds (features = []) {
  const extent = [[-180, -85], [180, 85]]
  for (const { geometry: { coordinates: [lon, lat] = [] } = {} } of features) {
    if (lon == null || lat == null) continue
    if (extent[0][0] < lon) extent[0][0] = lon
    if (extent[0][1] < lat) extent[0][1] = lat
    if (extent[1][0] > lon) extent[1][0] = lon
    if (extent[1][1] > lat) extent[1][1] = lat
  }
  return extent
}
