import { observable, computed, action } from 'mobx'
import * as logger from 'loglevel'
import { isMobileBrowser, isChromeBrowser } from '../utils/detector'
import { hasInstalledExtension, actionCreator, sendMsgToChromeExtension } from '../utils/chrome'

let store = null

export class CoreStore {
  isMobile = false
  userAgent = {}
  @observable isChrome = true
  @observable userHash = ''
  @observable userId = -1
  @observable isInstall = false
  @observable isLogin = false
  constructor (isServer, userAgent) {
    this.userAgent = userAgent
    this.isMobile = isMobileBrowser(userAgent)
  }

  @computed get isInstalledOnChromeDesktop () {
    return this.isInstall && this.isChrome && !this.isMobile
  }

  @action checkEnvironment () {
    logger.warn('checkEnvironment')
    this.isChrome = isChromeBrowser()
    if (this.isChrome) {
      this.isInstall = hasInstalledExtension()
    }
  }

  @action autoLogin (auth) {
    logger.warn('autoLogin', auth)
    const { isLogin, userId, userHash } = auth
    if (userId > 0) {
      this.isLogin = isLogin
      this.userId = userId
      this.userHash = userHash
    }
  }

  @action logoutUser () {
    if (this.isChrome && this.isInstall) {
      sendMsgToChromeExtension(actionCreator('AUTH_LOGOUT', {}))
    }
    this.isLogin = false
    this.userId = -1
    this.userHash = ''
    this.userHistory = null
  }
}

export function initStore (isServer, userAgent = '') {
  logger.warn('init CoreStore')
  if (isServer && typeof window === 'undefined') {
    return new CoreStore(isServer, userAgent)
  } else {
    if (store === null) {
      store = new CoreStore(isServer, userAgent)
    }
    return store
  }
}
