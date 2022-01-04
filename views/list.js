const Nanocomponent = require('nanocomponent')
const html = require('choo/html')
const css = require('sheetify')
const format = require('date-fns/format')

const image = require('./image')

const listClass = css`
  :host header {
    padding: 1rem;
  }
  :host .item {
    padding: 0.667rem 1rem;
    display: block;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid #ccc;
    text-align: left;
  }
  :host .item .image {
    width: 30%;
    float: left;
    margin-right: 0.75em;
  }
  :host .item:hover {
    background-color: #eeeeee;
    cursor: pointer;
  }
  :host .item:focus {
    background-color: #dddddd;
    outline: none;
  }
  :host .item:first-child {
    border-top: 1px solid #ccc;
  }
  :host .missing {
    background-color: #dddddd;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :host .missing img {
    width: 54px;
    height: 46px;
  }
`

module.exports = ListView

function ListView () {
  if (!(this instanceof ListView)) return new ListView()
  this.render = this.render.bind(this)
  Nanocomponent.call(this)
}

ListView.prototype = Object.create(Nanocomponent.prototype)

ListView.prototype.createElement = function (props) {
  this.props = props
  return html`
    <div class="${listClass}">
      <header>
        ${props.title &&
          html`
            <h1>${props.title}</h1>
          `}
        ${props.description &&
          html`
            <p>${props.description} ${props.terms ? html`<a href='#' onclick=${props.onTermsClick}>Terms & Limitations</a>.` : ''}</p>
          `}
      </header>
      <div>
        ${props.features.sort(cmpDate).map(function (f) {
          const fprops = f.properties
          const match = props.features.filter(feat => f.properties._id === feat.properties._id)
          //If there are no-coordinates to zoom to, does nothing
          const hasCoords =  (Array.isArray(match[0].geometry.coordinates)
            && match[0].geometry.coordinates[0] != undefined 
            && match[0].geometry.coordinates[1] != undefined)
         
          return html`
          <button class='item' onclick=${hasCoords ? props.onClick.bind(
            null,
            f.properties._id
          ) :"return"}>
            <div class='image'>
              ${image({ url: fprops.image, showMissing: true })}
            </div>
            <div class='popup-inner'>
              <h2>${fprops.title}</h1>
              ${fprops.date &&
                html`<h3>${format(fprops.date, 'Do MMM YYYY')}</h2>`}
            </div>
          </button>
        `
        })}
      </div>
    </div>
  `
}

// Implement conditional rendering
ListView.prototype.update = function (nextProps) {
  var shouldUpdate = false
  if (
    nextProps.features !== this.props.features ||
    nextProps.title !== this.props.title
  ) {
    shouldUpdate = true
  }
  this.props = nextProps
  return shouldUpdate
}

function cmpDate (a, b) {
  return b.properties.date - a.properties.date
}
