const css = require('sheetify')
const html = require('choo/html')
const modalClass = css`
  :host {
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 45px, rgba(0, 0, 0, 0.22) 0px 10px 18px;
    width: 100vw;
    max-width: 500px;
    background-color: white;
    animation-name: tdFadeIn;
    animation-duration: .3s;
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
  return html`<div class='${modalClass}'>
    <h2>Terms and Limitations</h2>
    <p>
      This map platform displays informaton collected by the SRDC local
      community mointors from 2013–16. It is meant to show some examples and does
      not contain all the reports gathered by the monitoring team, which number
      over 100 sites. The site is work in progress and is still under a process of refinement.
    </p>
    <div class='actions'><button onclick=${props.close}>CLOSE</button></div>
  </div>`
}
