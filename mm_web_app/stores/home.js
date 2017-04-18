import { action, autorun, when, observable } from 'mobx'
import * as logger from 'loglevel'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { userId, userHash, login, logout } from '../utils/simpleAuth'
import { hasInstalledExtension, sendMsgToChromeExtension } from '../utils/chrome'
import { md5hash } from '../utils/hash'

let store = null

export class HomeStore {
  @observable googleConnectResult = {}
  @observable facebookConnectResult = {}
  @observable userHistoryResult = {}
  @observable userId = -1
  @observable currentTermId = -1
  @observable friendStreamId = -1
  @observable isLogin = false
  @observable isInstall = false
  @observable userHash = ''
  @observable googleUser = {}
  @observable facebookUser = {}
  @observable userHistory = null

  constructor (isServer, isLogin, isInstall) {
    this.isLogin = isLogin
    this.isInstall = isInstall
    autorun(() => {
      if (this.isInstall) {
        logger.warn('User is ready')
      }
      if (this.isLogin) {
        logger.warn('User has logged in')
      }
    })
    when(() => this.isInstall && this.userId > 0 && this.userHash.length > 0,
     () => {
       logger.warn('yeah...')
       this.getUserHistory()
       this.acceptInviteCode()
     })
  }

  @action checkInstallAndAuth () {
    userId()
      .then(id => {
        this.userId = id
        logger.warn('userId', this.userId)
        if (id > 0) {
          this.isLogin = true
        } else {
          this.isLogin = false
        }
      })
    userHash()
      .then(hash => {
        this.userHash = hash
        logger.warn('userHash', this.userHash)
      })
    logger.warn('hasInstalledExtension', hasInstalledExtension())
    this.isInstall = hasInstalledExtension()
  }

  @action acceptInviteCode () {
    logger.warn('acceptInviteCode')
  }

  @action googleConnect (info) {
    this.googleConnectResult = loginWithGoogle(info)
    when(
      () => this.googleConnectResult.state !== 'pending',
      () => {
        const { data } = this.googleConnectResult.value
        const userHash = md5hash(info.googleId)
        login(data.id, data.email, userHash)
        this.userId = data.id
        this.userHash = userHash
        this.isLogin = true
        this.googleUser = Object.assign({}, data, { userHash })
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
        this.userId = data.id
        this.userHash = userHash
        this.isLogin = true
        this.facebookUser = Object.assign({}, data, { userHash })
      }
    )
  }

  @action getUserHistory () {
    logger.warn('getUserHistory', this.userId, this.userHash)
    this.userHistoryResult = getUserHistory(this.userId, this.userHash)
    when(
      () => this.userHistoryResult.state !== 'pending',
      () => {
        this.userHistory = this.userHistoryResult.value.data
        logger.warn('userHistory', this.userHistory)
      }
    )
  }

  @action autoLogin (auth) {
    logger.warn('autoLogin', auth)
    const { isLogin, userId, userHash, info: { email } } = auth
    login(userId, email, userHash)
    this.isLogin = isLogin
    this.userId = userId
    this.userHash = userHash
    this.getUserHistory()
  }

  @action logoutUser () {
    logout()
    sendMsgToChromeExtension({type: 'AUTH_LOGOUT'})
    this.isLogin = false
    this.userId = -1
    this.userHash = ''
    this.userHistory = null
  }
}

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
