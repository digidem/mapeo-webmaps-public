const css = require('sheetify')
const html = require('choo/html')
const format = require('date-fns/format')
const Nanocomponent = require('nanocomponent')

const modalClass = css`
  @keyframes tdFadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes tdFadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  :host {
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 45px,
      rgba(0, 0, 0, 0.22) 0px 10px 18px;
    animation-name: tdFadeIn;
    animation-duration: 0.3s;
    animation-fill-mode: both;
  }
  :host img {
    max-width: 100vw;
    max-height: 100vh;
    display: block;
    background-size: 100% 100%;
  }
  :host .text {
    display: none;
  }
  @media screen and (min-width: 50em) {
    :host .text {
      display: block;
    }
    :host img {
      max-width: 95vw;
      max-height: 95vh;
    }
  }
  @media screen and (min-width: 80em) {
    :host img {
      max-width: 90vw;
      max-height: 90vh;
    }
  }
  :host button {
    background-color: rgba(0, 0, 0, 0.3);
    font-size: 30px;
    color: #ffffff;
    position: absolute;
    right: 0;
    top: 0;
    border: none;
    padding: 0 12px 5px;
    cursor: pointer;
    z-index: 99;
  }
  :host button:hover {
    background-color: rgba(0, 0, 0, 0.5);
    color: #dddddd;
  }
  :host button:focus {
    outline: none;
  }
  :host .text {
    background-color: rgba(0, 0, 0, 0.5);
    max-width: 400px;
    width: 100%;
    padding: 1em;
    color: #eeeeee;
    position: absolute;
    left: 0;
    bottom: 0;
    text-shadow: 1px 1px 1px black;
  }
  :host .text h2 {
    margin: 0 0 0.2em;
  }
  :host .text h3 {
    color: #cccccc;
    margin: 0;
  }
  :host .text p {
    line-height: 1.5;
    margin: 0.75em 0 0.25em 0;
  }
  :host-context(.closing) {
    animation-name: tdFadeOut;
  }
`

module.exports = FeatureModal

function FeatureModal () {
  if (!(this instanceof FeatureModal)) return new FeatureModal()
  this._resizeImage = this._resizeImage.bind(this)
  Nanocomponent.call(this)
}

const proto = (FeatureModal.prototype = Object.create(Nanocomponent.prototype))

proto.createElement = function (props) {
  this.props = props
  if (!this.dim)
    return html`
      <div></div>
    `
  const fProps = props.feature ? props.feature.properties : {}
  return html`
    <div class="${modalClass}">
      <button
        class="close"
        type="button"
        aria-label="Close popup"
        onclick=${props.close}
      >
        ×
      </button>
      <img
        src="${fProps.image}"
        style="background-image: url(${fProps.image}); width: ${this
          .dim[0]}px; height: ${this.dim[1]}px;"
      />
      <div class="text">
        <h2>${fProps.title}</h2>
        ${fProps.date && html`<h3>${format(fProps.date, 'Do MMM YYYY')}</h2>`}
        ${fProps.description &&
          html`
            <p>${fProps.description}</p>
          `}
      </div>
    </div>
  `
}

proto.update = function (nextProps) {
  return nextProps.feature !== this.props.feature
}

proto.load = function () {
  window.addEventListener('resize', this._resizeImage)
  this.preview = new window.Image()
  this.preview.onload = this._onPreviewLoad.bind(this)
  this.preview.src =
    this.props.feature &&
    this.props.feature.properties &&
    this.props.feature.properties.image
}

proto.unload = function () {
  window.removeEventListener('resize', this._resizeImage)
}

proto._onPreviewLoad = function () {
  this.preview.onload = null
  this._resizeImage()
}

proto._resizeImage = function () {
  if (!this.preview) return
  const vWidth = document.documentElement.clientWidth
  const vHeight = document.documentElement.clientHeight
  const ratio = this.preview.naturalWidth / this.preview.naturalHeight
  if (ratio >= vWidth / vHeight) {
    this.dim = [vWidth, vWidth / ratio]
  } else {
    this.dim = [ratio * vHeight, vHeight]
  }
  this.rerender()
}
