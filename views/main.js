const html = require('choo/html')
const css = require('sheetify')

const MapView = require('./map')
const ListView = require('./list')
const Popup = require('./popup')
const Modal = require('./modal')
const FeatureModal = require('./feature-modal')
const mapEvents = require('../models/map').events
const modalsEvents = require('../models/modals').events

const TITLE = 'Wapichan Monitoring'

const mainClass = css`
  :host {
    font-family: system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
      "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    font-size: 16px;
  }
  :host h1, :host h2, :host h3 {
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
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14),
      0 1px 10px 0 rgba(0, 0, 0, .12),
      0 2px 4px -1px rgba(0, 0, 0, .4);
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
      box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14),
        0 1px 10px 0 rgba(0, 0, 0, .12),
        0 2px 4px -1px rgba(0, 0, 0, .4);
    }
  }
`

module.exports = MainView

function MainView () {
  const mapView = new MapView().render
  const listView = new ListView().render
  const popup = new Popup().render
  const modal = new Modal()
  const featureModal = new FeatureModal()

  return function mainView (state, emit) {
    if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
    return html`
      <div class='${mainClass}'>
        <div class='left-column'>
          ${listView({
            features: state.features,
            onClick: (id) => emit(mapEvents.ZOOM_TO, id)
          })}
        </div>
        <div class='right-column'>
          ${mapView({
            features: state.features,
            zoomFeature: state.zoomFeature,
            popupFeature: state.popupFeature,
            onClick: (feature, map) => {
              if (feature) {
                emit(mapEvents.SHOW_POPUP, {feature: feature, map: map})
                return
              }
              if (state.zoomFeature) {
                emit(mapEvents.CANCEL_ZOOM)
              }
              emit(mapEvents.CLOSE_POPUP)
            },
            onMove: (e, map) => {
              if (state.popupFeature) {
                emit(mapEvents.MOVE_POPUP, {event: e, map: map})
              }
              if (e.originalEvent && state.zoomFeature) {
                emit(mapEvents.CANCEL_ZOOM)
              }
            }
          })}
          ${state.popupFeature && popup({
            feature: state.popupFeature,
            point: state.popupPoint,
            anchor: state.zoomFeature && 'bottom',
            onClick: (e) => emit(modalsEvents.OPEN_FEATURE_MODAL, {feature: state.popupFeature, event: e}),
            close: () => emit(mapEvents.CLOSE_POPUP)
          })}
        </div>
        ${modal.render({
          open: state.featureModalOpen,
          close: () => {
            emit(modalsEvents.CLOSE_FEATURE_MODAL)
          },
          render: () => featureModal.render({
            feature: state.featureModal,
            close: () => {
              emit(modalsEvents.CLOSE_FEATURE_MODAL)
            }
          })
        })}
      </div>
    `
  }
}
