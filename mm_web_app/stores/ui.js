import { observable, action } from 'mobx'
import * as logger from 'loglevel'

let store = null

export class UIStore {
  @observable showSignInModal = false
  @observable showSignUpModal = false

  @action showSignIn () {
    logger.info('showSignIn')
    this.showSignInModal = true
    this.showSignUpModal = false
  }

  @action showSignUp () {
    logger.info('showSignUp')
    this.showSignUpModal = true
    this.showSignInModal = false
  }

  @action closeModal () {
    logger.info('closeModal')
    this.showSignUpModal = false
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
