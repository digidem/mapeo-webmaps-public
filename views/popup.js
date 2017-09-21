const Nanocomponent = require('nanocomponent')
const html = require('choo/html')
const css = require('sheetify')
const format = require('date-fns/format')

const image = require('./image')

const popupClass = css`
  :host {
    position: absolute;
    transform: translate(0, 0);
    will-change: transform;
    pointer-events: none;
    width: 300px;
    display: flex;
  }
  :host.anchor-top,
  :host.anchor-top-left,
  :host.anchor-top-right {
      -webkit-flex-direction: column;
      flex-direction: column;
  }
  :host.anchor-bottom,
  :host.anchor-bottom-left,
  :host.anchor-bottom-right {
      -webkit-flex-direction: column-reverse;
      flex-direction: column-reverse;
  }
  :host.anchor-left {
      -webkit-flex-direction: row;
      flex-direction: row;
  }
  :host.anchor-right {
      -webkit-flex-direction: row-reverse;
      flex-direction: row-reverse;
  }
  :host .popup-tip {
    cursor: pointer;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    z-index: 1;
  }
  :host.anchor-top .popup-tip {
    -webkit-align-self: center;
    align-self: center;
    border-top: none;
    border-bottom-color: #fff;
  }
  :host.anchor-top-left .popup-tip {
      -webkit-align-self: flex-start;
      align-self: flex-start;
      border-top: none;
      border-left: none;
      border-bottom-color: #fff;
  }
  :host.anchor-top-right .popup-tip {
      -webkit-align-self: flex-end;
      align-self: flex-end;
      border-top: none;
      border-right: none;
      border-bottom-color: #fff;
  }
  :host.anchor-bottom .popup-tip {
      -webkit-align-self: center;
      align-self: center;
      border-bottom: none;
      border-top-color: #fff;
  }
  :host.anchor-bottom-left .popup-tip {
      -webkit-align-self: flex-start;
      align-self: flex-start;
      border-bottom: none;
      border-left: none;
      border-top-color: #fff;
  }
  :host.anchor-bottom-right .popup-tip {
      -webkit-align-self: flex-end;
      align-self: flex-end;
      border-bottom: none;
      border-right: none;
      border-top-color: #fff;
  }
  :host.anchor-left .popup-tip {
      -webkit-align-self: center;
      align-self: center;
      border-left: none;
      border-right-color: #fff;
  }
  :host.anchor-right .popup-tip {
      -webkit-align-self: center;
      align-self: center;
      border-right: none;
      border-left-color: #fff;
  }
  :host .popup-close-button {
      background-color: rgba(0,0,0,0.3);
      font-size: 20px;
      color: #ffffff;
      position: absolute;
      right: 0;
      top: 0;
      border: none;
      border-radius: 0 3px 0 0;
      cursor: pointer;
      z-index: 99;
  }
  :host .popup-close-button:hover {
      background-color: rgba(0,0,0,0.5);
      color: #dddddd;
  }
  :host .popup-close-button:focus {
      outline: none;
  }
  :host .popup-content {
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    pointer-events: auto;
    background-color: #ffffff;
    position: relative;
  }
  :host .popup-text {
    padding: 10px;
  }
`

module.exports = Popup

function Popup () {
  if (!(this instanceof Popup)) return new Popup()
  this.state = {}
  this.render = this.render.bind(this)
  Nanocomponent.call(this)
}

Popup.prototype = Object.create(Nanocomponent.prototype)

Popup.prototype.createElement = function (props) {
  this.props = props = props || {}
  const point = props.point || {x: 0, y: 0}
  const fProps = props.feature && props.feature.properties
  const s = this.state
  const anchor = props.anchor || getPopupAnchor(point, s.width, s.height, s.parentWidth, s.parentHeight)
  return html`
    <div class='${popupClass} anchor-${anchor}' style='${getPopupTransform(anchor, point)}'>
      <div class='popup-tip'></div>
      <div class='popup-content'>
        <button class='popup-close-button' type='button' aria-label='Close popup' onclick=${props.close}>×</button>
        ${(fProps.image && image({url: fProps.image}))}
        <div class='popup-text'>
          <h2>${fProps.title}</h1>
          ${fProps.date && html`<h3>${format(fProps.date, 'Do MMM YYYY')}</h2>`}
          ${fProps.description && html`<p>${fProps.description}</p>`}
        </div>
      </div>
    </div>
  `
}

Popup.prototype.load = function (el) {
  this.state.width = el.offsetWidth
  this.state.height = el.offsetHeight
  this.state.parentWidth = el.offsetParent.offsetWidth
  this.state.parentHeight = el.offsetParent.offsetHeight
  this.rerender()
}

Popup.prototype.update = function (nextProps) {
  return pointHasChanged(nextProps.point, this.props.point)
}

function getPopupAnchor (pos, popupWidth, popupHeight, mapWidth, mapHeight) {
  let anchor
  if (pos.y < popupHeight) {
    anchor = ['top']
  } else if (pos.y > mapHeight - popupHeight) {
    anchor = ['bottom']
  } else {
    anchor = []
  }

  if (pos.x < popupWidth / 2) {
    anchor.push('left')
  } else if (pos.x > mapWidth - popupWidth / 2) {
    anchor.push('right')
  }

  if (anchor.length === 0) {
    anchor = 'bottom'
  } else {
    anchor = anchor.join('-')
  }
  return anchor
}

const anchorTranslate = {
  'top': 'translate(-50%,0)',
  'top-left': 'translate(0,0)',
  'top-right': 'translate(-100%,0)',
  'bottom': 'translate(-50%,-100%)',
  'bottom-left': 'translate(0,-100%)',
  'bottom-right': 'translate(-100%,-100%)',
  'left': 'translate(0,-50%)',
  'right': 'translate(-100%,-50%)'
}

function getPopupTransform (anchor, point) {
  anchor = anchor || 'bottom'
  const x = roundToDp(point.x)
  const y = roundToDp(point.y)
  return `transform: ${anchorTranslate[anchor]} translate(${x}px, ${y}px);`
}

function pointHasChanged (p1, p2) {
  if (roundToDp(p1.x) !== roundToDp(p2.x)) return true
  if (roundToDp(p1.y) !== roundToDp(p2.y)) return true
  return false
}

function roundToDp (num) {
  const dp = window.devicePixelRatio || 1
  return (num * dp).toFixed() / dp
}
