
module.exports = ModalsModel

const events = ModalsModel.events = {
  OPEN_FEATURE_MODAL: 'modals:open_feature',
  CLOSE_FEATURE_MODAL: 'modals:close_feature',
  OPEN_TERMS_MODAL: 'modals:open_terms',
  CLOSE_TERMS_MODAL: 'modals:close_terms'
}

function ModalsModel () {
  return function modalsModel (state, emitter) {
    emitter.on(events.OPEN_FEATURE_MODAL, function (payload) {
      state.featureModal = payload.feature
      state.featureModalOpen = true
      emitter.emit(state.events.RENDER)
    })
    emitter.on(events.CLOSE_FEATURE_MODAL, function () {
      state.featureModalOpen = false
      emitter.emit(state.events.RENDER)
    })
    emitter.on(events.OPEN_TERMS_MODAL, function (payload) {
      state.termsModalOpen = true
      emitter.emit(state.events.RENDER)
    })
    emitter.on(events.CLOSE_TERMS_MODAL, function () {
      state.termsModalOpen = false
      emitter.emit(state.events.RENDER)
    })
  }
}
