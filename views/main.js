const html = require('choo/html')
const css = require('sheetify')
const splitRequire = require('split-require')

const ListView = require('./list')
const Popup = require('./popup')
const Modal = require('./modal')
const FeatureModal = require('./feature-modal')
const termsModal = require('./terms-modal')
const mapEvents = require('../models/map').events
const modalsEvents = require('../models/modals').events
const featuresEvents = require('../models/features').events
const infoEvents = require('../models/info').events
const notFound = require('./404')

const mainClass = css`
  :host,
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    font-size: 16px;
  }
  :host h1,
  :host h2,
  :host h3 {
    margin-top: 0;
  }
  :host h1 {
    font-size: 1.6rem;
    margin-bottom: 0.1em;
  }
  :host h2 {
    font-size: 1.1rem;
    margin-bottom: 0.3em;
  }
  :host h3 {
    font-size: 1rem;
    color: #666;
  }
  :host p {
    font-size: 14px;
    line-height: 1.5;
    margin: 0.5em 0;
  }
  :host img {
    display: block;
  }
  :host > .left-column {
    width: 80%;
    max-width: 400px;
    min-width: 300px;
    overflow-y: scroll;
  }
  :host > .right-column {
    top: 0;
    bottom: 0;
    transition: transform 200ms;
    transform: translate(0, 0);
    width: 100%;
    overflow: hidden;
    position: absolute;
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
      0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
  }
  @media screen and (min-width: 50em) {
    :host > .left-column {
      flex: 1;
      overflow-y: scroll;
    }
    :host > .right-column {
      flex: 2;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
        0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
    }
  }
`

module.exports = MainView

const loading = () =>
  html`
    <h1>Loading…</h1>
  `

function MainView (app) {
  let mapView
  const listView = new ListView().render
  const popup = new Popup().render
  const featureModalContainer = new Modal()
  const termsModalContainer = new Modal()
  const featureModal = new FeatureModal()

  if (process.env.NODE_ENV === 'production') {
    splitRequire('./map', function (err, MapView) {
      if (err) return console.error(err)
      mapView = new MapView()
      app.emitter.emit('render')
    })
  } else {
    const MapView = require('./map')
    mapView = new MapView()
  }

  return function mainView (state, emit) {
    if (state.title !== state.info.title && state.info.title) {
      emit(state.events.DOMTITLECHANGE, state.info.title)
    }
    if (
      state.userId !== state.params.userId ||
      state.mapId !== state.params.mapId
    ) {
      emit(featuresEvents.LOAD, state.params.userId, state.params.mapId)
      emit(infoEvents.LOAD, state.params.userId, state.params.mapId)
    }

    if (state.notFound) return notFound()
    return html`
      <div class="${mainClass}">
        <div class="left-column">
          ${
  listView({
    onTermsClick: () => emit(modalsEvents.OPEN_TERMS_MODAL),
    features: state.features,
    onClick: id => emit(mapEvents.ZOOM_TO, id),
    title: state.info && state.info.title,
    description: state.info && state.info.description
  })
}
        </div>
        <div class="right-column">
          ${
  mapView
    ? mapView.render({
      features: state.features,
      zoomFeature: state.zoomFeature,
      popupFeature: state.popupFeature,
      mapStyle: state.info.mapStyle,
      onClick: (feature, map) => {
        if (feature) {
          emit(mapEvents.SHOW_POPUP, { feature: feature, map: map })
          return
        }
        if (state.zoomFeature) {
          emit(mapEvents.CANCEL_ZOOM)
        }
        emit(mapEvents.CLOSE_POPUP)
      },
      onMove: (e, map) => {
        if (state.popupFeature) {
          emit(mapEvents.MOVE_POPUP, { event: e, map: map })
        }
        if (e.originalEvent && state.zoomFeature) {
          emit(mapEvents.CANCEL_ZOOM)
        }
      }
    })
    : loading()
}
          ${
  state.popupFeature &&
              popup({
                feature: state.popupFeature,
                point: state.popupPoint,
                anchor: state.zoomFeature && 'bottom',
                onClick: e =>
                  emit(modalsEvents.OPEN_FEATURE_MODAL, {
                    feature: state.popupFeature,
                    event: e
                  }),
                close: () => emit(mapEvents.CLOSE_POPUP)
              })
}
        </div>
        ${
  featureModalContainer.render({
    open: state.featureModalOpen,
    close: () => {
      emit(modalsEvents.CLOSE_FEATURE_MODAL)
    },
    render: () =>
      featureModal.render({
        feature: state.featureModal,
        close: () => {
          emit(modalsEvents.CLOSE_FEATURE_MODAL)
        }
      })
  })
}
        ${
  termsModalContainer.render({
    open: state.termsModalOpen,
    close: () => emit(modalsEvents.CLOSE_TERMS_MODAL),
    render: () =>
      termsModal({
        close: () => emit(modalsEvents.CLOSE_TERMS_MODAL)
      })
  })
}
      </div>
    `
  }
}
