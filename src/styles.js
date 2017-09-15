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
      'property': '__mf_color',
      'type': 'identity'
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

module.exports = {
  points: points,
  pointsHover: pointsHover
}
