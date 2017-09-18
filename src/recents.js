const yo = require('yo-yo')
const css = require('sheetify')
const assign = require('object-assign')
const format = require('date-fns/format')

const buttonClass = css`
  :host {
    padding: 0.667rem 1rem;
    display: block;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid #ccc;
    text-align: left;
  }
  :host .embed-responsive {
    width: 30%;
    float: left;
    margin-right: 0.75em;
  }
  :host .embed-responsive:before {
    padding-top: 66.67%;
  }
  :host:hover {
    background-color: #eeeeee;
    cursor: pointer;
  }
  :host:focus {
    background-color: #dddddd;
    outline: none;
  }
  :host:first-child {
    border-top: 1px solid #ccc;
  }
`

const recentsClass = css`
  :host {
    font-size: 16px;
  }
  :host header {
    padding: 1rem;
  }
  :host h1, :host h2, :host h3 {
    margin-top: 0;
  }
  :host h1 {
    font-size: 1.6em;
    margin-bottom: 0.1em;
  }
  :host h2 {
    font-size: 1.5em;
    margin-bottom: 0.3em;
  }
  :host h3 {
    font-size: 1.3em;
    color: #666;
  }
  :host p {
    font-size: 14px;
    line-height: 1.5;
    margin: 0.5em 0;
  }
`

const missingClass = css`
  :host {
    background-color: #dddddd;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :host > img {
    width: 54px;
    height: 46px;
  }
`

module.exports = recents

function recents (fc, onClick) {
  return yo`<div class='recents ${recentsClass}'>
    <header>
      <h1>Monitoring Reports</h1>
      <p>These reports from the Wapichan monitoring team document some of the key threats
      and impacts to our ancestral territory from illegal mining and crossings into our territory
      to steal cattle and illegally fish and hunt. The monitoring team has also been documenting
      important resources and cultural sites throughout our territory.</p>
    </header>
    <div>
      ${fc.features.sort(cmpDate).map(function (f) {
        const props = f.properties
        return yo`
          <button class='${buttonClass}' onclick=${onClick.bind(null, f.properties._id)}>
            ${image(props.image)}
            <div class='popup-inner'>
              <h2>${props.title}</h1>
              ${props.date && yo`<h3>${format(props.date, 'Do MMM YYYY')}</h2>`}
            </div>
          </button>
        `
      })}
    </div>
  </div>`
}

function image (url) {
  return yo`<div class='embed-responsive'>
    ${url ? yo`<img class='embed-responsive-item' src=${url} />`
    : yo`<div class='embed-responsive-item ${missingClass}'><img src='images/missing.png' /></div>`}
  </div>`
}

function cmpDate (a, b) {
  return b.properties.date - a.properties.date
}
