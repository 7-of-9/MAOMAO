import { observable, computed, action } from 'mobx'
import localforage from 'localforage'
import * as logger from 'loglevel'
import { isMobileBrowser, isChromeBrowser } from '../utils/detector'
import { hasInstalledExtension, actionCreator, sendMsgToChromeExtension } from '../utils/chrome'

let store = null
const USER_ID = 'MM_USER_ID'
const USER_HASH = 'MM_USER_HASH'

export class CoreStore {
  isMobile = false
  userAgent = {}
  @observable isChrome = false
  @observable userHash = ''
  @observable userId = -1
  @observable isInstall = false
  @observable isLogin = false
  constructor (isServer, userAgent) {
    this.userAgent = userAgent
    this.isMobile = isMobileBrowser(userAgent)
    localforage.getItem(USER_ID).then((userId) => {
      logger.warn('userId', userId)
      if (userId && userId > 0) {
        this.userId = userId
        this.isLogin = true
      }
    })
    localforage.getItem(USER_HASH).then((userHash) => {
      logger.warn('userHash', userHash)
      if (userHash && userHash.length > 0) {
        this.userHash = userHash
      }
    })
  }

  @computed get isInstalledOnChromeDesktop () {
    return this.isInstall && this.isChrome && !this.isMobile
  }

  @action checkEnvironment () {
    logger.info('checkEnvironment')
    this.isChrome = !!isChromeBrowser()
    if (this.isChrome) {
      logger.info('hasInstalledExtension', hasInstalledExtension())
      this.isInstall = !!hasInstalledExtension()
    }
  }

  @action login (userId, userHash) {
    localforage.setItem(USER_ID, this.userId)
    localforage.setItem(USER_HASH, this.userHash)
    this.isLogin = true
  }

  @action logout () {
    localforage.setItem(USER_ID, -1)
    localforage.setItem(USER_HASH, '')
    this.isLogin = false
  }

  @action autoLogin (auth) {
    logger.warn('autoLogin', auth)
    const { isLogin, userId, userHash } = auth
    if (userId > 0) {
      this.isLogin = isLogin
      this.userId = userId
      this.userHash = userHash
      this.login(userId, userHash)
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
    this.logout()
  }
}

export function initStore (isServer, userAgent = '') {
  logger.info('init CoreStore')
  if (isServer && typeof window === 'undefined') {
    return new CoreStore(isServer, userAgent)
  } else {
    if (store === null) {
      store = new CoreStore(isServer, userAgent)
    }
    return store
  }
}
