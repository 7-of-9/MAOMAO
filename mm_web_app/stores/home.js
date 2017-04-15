import { action, autorun, observable } from 'mobx'
import * as logger from 'loglevel'
import { userId } from '../utils/simpleAuth'
import { hasInstalledExtension } from '../utils/chrome'

let store = null

export class HomeStore {
  @observable isLogin = false
  @observable isInstall = false

  constructor (isServer, isLogin, isInstall) {
    this.isLogin = isLogin
    this.isInstall = isInstall
  }

  @action checkAuth () {
    userId()
      .then(id => {
        if (id > 0) {
          this.isLogin = true
        } else {
          this.isLogin = false
        }
      })
  }

  @action checkInstall () {
    this.isInstall = hasInstalledExtension()
  }
}

autorun(() => {
  if (store) {
    logger.warn('check isInstall', store.isInstall)
    logger.warn('check isLogin', store.isLogin)
  }
})

export function initStore (isServer, isLogin = false, isInstall = false) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, isLogin, isInstall)
  } else {
    if (store === null) {
      store = new HomeStore(isServer, isLogin, isInstall)
    }
    return store
  }
}
