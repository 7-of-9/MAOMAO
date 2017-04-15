import { action, autorun, when, observable } from 'mobx'
import * as logger from 'loglevel'
import { loginWithGoogle, loginWithFacebook } from '../services/user'
import { userId, login, logout } from '../utils/simpleAuth'
import { hasInstalledExtension } from '../utils/chrome'
import { md5hash } from '../utils/hash'

let store = null

export class HomeStore {
  @observable isLogin = false
  @observable isInstall = false
  @observable googleConnectResult = {}
  @observable facebookConnectResult = {}
  googleUser = {}
  facebookUser = {}

  constructor (isServer, isLogin, isInstall) {
    this.isLogin = isLogin
    this.isInstall = isInstall
  }

  @action checkInstallAndAuth () {
    userId()
      .then(id => {
        logger.warn('userId', id)
        if (id > 0) {
          this.isLogin = true
        } else {
          this.isLogin = false
        }
      })
    logger.warn('hasInstalledExtension', hasInstalledExtension())
    this.isInstall = hasInstalledExtension()
  }

  @action googleConnect (info) {
    this.googleConnectResult = loginWithGoogle(info)
    when(
      () => this.googleConnectResult.state !== 'pending',
      () => {
        const { data } = this.googleConnectResult.value
        const userHash = md5hash(info.googleId)
        login(data.id, data.email, userHash)
        this.isLogin = true
        this.googleUser = Object.assign({}, data, { userHash })
        this.userHistory(data.id, userHash)
      }
    )
  }

  @action facebookConnect (info) {
    this.facebookConnectResult = loginWithFacebook(info)
    when(
      () => this.facebookConnectResult.state !== 'pending',
      () => {
        const { data } = this.facebookConnectResult.value
        const userHash = md5hash(info.userID)
        login(data.id, data.email, userHash)
        this.isLogin = true
        this.facebookUser = Object.assign({}, data, { userHash })
        this.userHistory(data.id, userHash)
      }
    )
  }

  @action userHistory (id, hash) {
    logger.warn('userHistory', id, hash)
  }

  @action logoutUser () {
    logout()
    this.isLogin = false
  }
}

autorun(() => {
  if (store && store.isInstall) {
    logger.warn('User is ready')
  }

  if (store && store.isLogin) {
    logger.warn('User has logged in')
  }

  if (store && store.googleConnectResult) {
    logger.warn('googleConnectResult', store.googleConnectResult)
  }
})

export function initStore (isServer, isLogin = false) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, isLogin, false)
  } else {
    if (store === null) {
      store = new HomeStore(isServer, isLogin, hasInstalledExtension())
    }
    return store
  }
}
