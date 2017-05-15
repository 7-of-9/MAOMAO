import { OrderedSet } from 'immutable'
import { observable, action } from 'mobx'
import { guid } from '../utils/hash'

let store = null

export class UIStore {
  @observable myStream = {
    page: 0,
    currentTermId: -1
  }
  @observable friendStream = {
    page: 0,
    rating: 1
  }
  @observable showSignInModal = false
  @observable showAcceptInvite = false
  @observable notifications = OrderedSet()
  @action showSignIn () {
    this.showSignInModal = true
  }

  @action closeModal () {
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
  if (isServer && typeof window === 'undefined') {
    return new UIStore(isServer)
  } else {
    if (store === null) {
      store = new UIStore(isServer)
    }
    return store
  }
}
