const html = require('choo/html')
const notFound = require('./404')
const css = require('sheetify')

const mapsEvents = require('../models/maps').events

const loaderClass = css`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  :host > div {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
  }
  :host > div > div {
    position: absolute;
    top: 27px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #fdd;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  :host > div div:nth-child(1) {
    left: 6px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  :host > div div:nth-child(2) {
    left: 6px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  :host > div div:nth-child(3) {
    left: 26px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  :host > div div:nth-child(4) {
    left: 45px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(19px, 0);
    }
  }
`

const mapsClass = css`
  :host {
    max-width: 640px;
    margin: 0 auto;
  }
  h2 {
    margin: 1.2em 0 0.4em 0;
  }
  p {
    margin-top: 0;
  }
`

function loader () {
  return html`
    <div class="${loaderClass}">
      <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  `
}

module.exports = function AllMaps (state, emit) {
  emit(state.events.DOMTITLECHANGE, 'Mis Mapas')
  if (state.userId !== state.params.userId || !state.maps) {
    emit(mapsEvents.LOAD, state.params.userId)
  }

  if (state.maps === 'loading') {
    return loader()
  }

  if (state.notFound || !state.maps.length) return notFound()
  const baseUrl = `/groups/${state.userId}/maps/`
  return html`
    <div class="${mapsClass}">
      ${
  state.maps.map(
    map => html`
            <h2><a href="${baseUrl}${map.id}">${map.title}</a></h2>
            <p>${map.description}</p>
          `
  )
}
    </div>
  `
}
