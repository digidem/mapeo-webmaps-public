const html = require('choo/html')
const css = require('sheetify')

const imageClass = css`
  :host {
    height: 0;
    position: relative;
    width: 100%;
  }
  :host.ratio-4x3 {
    padding-bottom: 75%;
  }
  :host > * {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
  :host > *.missing {
    background-size: 66.67%;
    background-color: #dddddd;
  }
`
module.exports = image

const MISSING_URL = 'assets/missing.png'

function image (props) {
  const ratio = props.ratio || '4x3'
  if (!props.url && !props.showMissing) return null
  return html`<div class='${imageClass} ratio-${ratio}' onclick=${props.onClick}>
    <div style='background-image: url(${props.url || MISSING_URL})' class='${props.url ? '' : 'missing'}'></div>
  </div>`
}
