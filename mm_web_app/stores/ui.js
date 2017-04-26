import { OrderedSet } from 'immutable'
import { observable, action } from 'mobx'
import * as logger from 'loglevel'
import { guid } from '../utils/hash'

let store = null

export class UIStore {
  @observable showSignInModal = false
  @observable notifications = OrderedSet()
  @action showSignIn () {
    logger.info('showSignIn')
    this.showSignInModal = true
  }

  @action closeModal () {
    logger.info('closeModal')
    this.showSignInModal = false
  }

  @action removeNotification (uuid) {
    this.notifications = this.notifications.filter((item) => item.key !== uuid)
  }

  @action addNotification (msg) {
    const uuid = guid()
    this.notifications = this.notifications.add({
      message: msg,
      key: uuid,
      action: 'Dismiss',
      onClick: (deactivate) => {
        this.removeNotification(deactivate.key)
      }
    })
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
