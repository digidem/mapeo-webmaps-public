const Nanocomponent = require('nanocomponent')
const morph = require('nanomorph')
const html = require('choo/html')
const css = require('sheetify')
const omit = require('lodash/omit')

const modalClass = css`
  @keyframes tdFadeBackgroundIn {
    0% { background-color: rgba(0,0,0,0); }
    100% { background-color: rgba(0,0,0,0.8); }
  }
  @keyframes tdFadeBackgroundOut {
    0% { background-color: rgba(0,0,0,0.8); }
    100% { background-color: rgba(0,0,0,0); }
  }
  :host {
    font-family: system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
      "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  }
  :host(.open) {
    z-index: 9999;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 100%;
    overflow-y: scroll;
    animation-name: tdFadeBackgroundIn;
    animation-duration: .3s;
    animation-fill-mode: both;
  }
  :host(.closing) {
    animation-name: tdFadeBackgroundOut;
    pointer-events: none;
  }
  :host > div {
    position: relative;
  }
  :host > div:focus {
    outline: none;
  }
`

module.exports = ModalPortal

function ModalPortal () {
  if (!(this instanceof ModalPortal)) return new ModalPortal()
  this.portal = html`<div></div>`
  this.modal = new Modal()
  document.body.appendChild(this.portal)
}

ModalPortal.prototype.render = function (props) {
  morph(this.portal, this.modal.render(props))
  return null
}

function Modal () {
  if (!(this instanceof Modal)) return new Modal()
  this.state = {}
  this._onOpened = this._onOpened.bind(this)
  this._onClosed = this._onClosed.bind(this)
  this._onClick = this._onClick.bind(this)
  this._onKeyDown = this._onKeyDown.bind(this)
  Nanocomponent.call(this)
}

const proto = Modal.prototype = Object.create(Nanocomponent.prototype)

proto.createElement = function (props) {
  this.props = props
  // Don't remove from the DOM while it's still closing
  const open = props.open || this.state.closing
  const childProps = omit(props, ['render', 'open'])
  return html`
    <div class='${modalClass} ${open ? 'open' : ''}' onclick=${this._onClick}>
      ${open ? html`<div onkeydown=${this._onKeyDown} tabindex='-1'>${props.render(childProps)}</div>` : null}
    </div>
  `
}

proto.load = function (el) {
  el.childNodes[0] && el.childNodes[0].focus()
}

proto.update = function (nextProps) {
  // Wasn't open, now it is
  if (!this.props.open && nextProps.open) {
    this.state.opening = true
    this.state.closing = false
  }
  // Was open, now it's closed
  if (this.props.open && !nextProps.open) this.state.closing = true
  return true
}

proto.afterupdate = function (el) {
  el.childNodes[0] && el.childNodes[0].focus()
  if (this.state.opening) {
    el.classList.add('open', 'opening')
    el.addEventListener('animationend', this._onOpened, false)
  }
  if (this.state.closing) {
    this.state.opening = false
    el.classList.remove('opening')
    el.classList.add('closing')
    el.removeEventListener('animationend', this._onOpened)
    el.addEventListener('animationend', this._onClosed, false)
  }
}

proto._onOpened = function (e) {
  this.element.removeEventListener('animationend', this._onOpened)
  this.state.opening = false
  this.element.classList.remove('opening')
}

proto._onClosed = function (e) {
  if (e.target !== this.element) return
  e.target.removeEventListener('animationend', this._onClosed)
  this.element.classList.remove('open')
  this.state.closing = false
  this.rerender()
}

proto._onClick = function (e) {
  if (e.target !== this.element) return
  this.props.close()
}

proto._onKeyDown = function (e) {
  if (e.key === 'Escape') this.props.close()
}
