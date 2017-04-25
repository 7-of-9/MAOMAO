import { observable, action } from 'mobx'
import * as logger from 'loglevel'

let store = null

export class UIStore {
  @observable showSignInModal = false

  @action showSignIn () {
    logger.info('showSignIn')
    this.showSignInModal = true
  }

  @action closeModal () {
    logger.info('closeModal')
    this.showSignInModal = false
  }
}

export function initUIStore (isServer, userAgent = '') {
  logger.info('init UIStore')
  if (isServer && typeof window === 'undefined') {
    return new UIStore(isServer)
  } else {
    if (store === null) {
      store = new UIStore(isServer)
    }
    return store
  }
}
