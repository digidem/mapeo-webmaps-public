const assign = require('object-assign')

const points = {
  id: 'points',
  type: 'circle',
  source: 'features',
  paint: {
    // make circles larger as the user zooms from z12 to z22
    'circle-radius': {
      'base': 1.5,
      'stops': [[7, 5], [18, 25]]
    },
    'circle-color': {
      'property': 'type',
      'type': 'categorical',
      'stops': [
        ['mining', '#d95f02'],
        ['crossing', '#7570b3'],
        ['monitoring', '#1b9e77']
      ]
    },
    'circle-opacity': 0.75,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 0.9
  }
}

const pointsHover = {
  id: 'points-hover',
  type: 'circle',
  source: 'features',
  filter: ['==', '_id', ''],
  paint: assign({}, points.paint, {
    'circle-opacity': 1,
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 1
  })
}

const bingSource = {
  type: 'raster',
  tiles: [
    'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869'
  ],
  minzoom: 12,
  maxzoom: 21,
  tileSize: 256
}

const bing = {
  id: 'bing',
  type: 'raster',
  source: 'bing',
  paint: {
    'raster-fade-duration': 500,
    'raster-opacity': {
      stops: [
        [12, 0],
        [12.5, 0.75]
      ]
    }
  }
}

module.exports = {
  points: points,
  pointsHover: pointsHover,
  bingSource: bingSource,
  bing: bing
}
