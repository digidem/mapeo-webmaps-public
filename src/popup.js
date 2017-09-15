const yo = require('yo-yo')
const css = require('sheetify')
const mapboxgl = require('mapbox-gl')
const assign = require('object-assign')
const format = require('date-fns/format')

var popupStyle = css`
  .embed-responsive {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    overflow: hidden;
  }
  .embed-responsive::before {
    display: block;
    content: "";
  }
  .embed-responsive .embed-responsive-item,
  .embed-responsive embed,
  .embed-responsive iframe,
  .embed-responsive object,
  .embed-responsive video {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  :host {
    width: 300px;
    background-color: white;
  }
  :host .embed-responsive-16by9:before {
    padding-top: 66.67%;
  }
  :host img {
    object-fit: cover;
  }
  :host > .popup-inner {
    padding: 10px;
  }
  :host iframe {
    display: block;
  }

  :host h1 {
    font-size: 1.5em;
    line-height: 1.3;
    margin-bottom: 0.1em;
    margin-top: 0;
  }
  :host h2 {
    margin-top: 0;
    font-size: 1.25em;
    color: grey;
  }
  :host p {
    margin-bottom: 0.5em;
  }
`

// Clear previous IMG before updating to new image
// Avoids initial load of previous popup image before new image loads
var yoOptions = {
  onBeforeElUpdated: function (fromEl) {
    if (fromEl.tagName.toUpperCase() === 'IMG') {
      fromEl.src = ''
    }
  }
}

module.exports = Popup

function Popup (map, opts) {
  if (!(this instanceof Popup)) return new Popup(map, opts)
  this.map = map
  this.popup = new mapboxgl.Popup(assign({
    closeButton: true
  }, opts))
  this.popupNode = yo`<div class=${popupStyle}></div>`
  this.popup.setDOMContent(this.popupNode)
}

Popup.prototype.update = function (props) {
  var node = yo`<div class='${popupStyle}'>
      ${(props.image && image(props.image))}
    <div class='popup-inner'>
      <h1>${props.title}</h1>
      ${props.date && yo`<h2>${format(new Date(props.date), 'Do MMM YYYY')}</h2>`}
      ${props.description && yo`<p>${props.description}</p>`}
    </div>
  </div>`
  yo.update(this.popupNode, node, yoOptions)
}

Popup.prototype.remove = function () {
  this.popup.remove()
}

Popup.prototype.setLngLat = function (lngLat) {
  this.popup.setLngLat(lngLat).addTo(this.map)
}

function image (url) {
  if (!url) return ''
  return yo`<div class='embed-responsive embed-responsive-16by9'>
    <img class='embed-responsive-item' src=${url} />
  </div>`
}
