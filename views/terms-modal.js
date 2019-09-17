const css = require('sheetify')
const html = require('choo/html')
const modalClass = css`
  :host {
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 45px,
      rgba(0, 0, 0, 0.22) 0px 10px 18px;
    width: 100vw;
    max-width: 500px;
    background-color: white;
    animation-name: tdFadeIn;
    animation-duration: 0.3s;
    animation-fill-mode: both;
    padding: 1.5em;
  }
  :host-context(.closing) {
    animation-name: tdFadeOut;
  }
  :host h2 {
    margin-top: 0;
  }
  :host p {
    margin-bottom: 0.5em;
    line-height: 1.5;
  }
  :host .actions {
    text-align: right;
  }
  :host button {
    border: none;
    background: none;
    padding: 0.5em 1em;
    display: inline-block;
    height: 36px;
    padding: 0 16px;
    cursor: pointer;
  }
  :host button:hover {
    background-color: #cccccc;
  }
  :host button:focus {
    outline: none;
  }
`
module.exports = termsModal

function termsModal (props) {
  return html`
    <div class="${modalClass}">
      <h2>Terms and Limitations</h2>
      <p>${props.terms}</p>
      <div class="actions"><button onclick="${props.close}">CLOSE</button></div>
    </div>
  `
}
