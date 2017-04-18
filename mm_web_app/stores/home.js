import { action, reaction, when, observable } from 'mobx'
import * as logger from 'loglevel'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { hasInstalledExtension, sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
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
    reaction(() => this.userHash.length,
     (userHash) => {
       if (userHash > 0) {
         logger.warn('yeah...')
         this.getUserHistory()
         this.acceptInviteCode()
       }
     })
  }

  @action checkInstall () {
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
        this.isLogin = true
        this.userId = data.id
        this.userHash = userHash
        this.googleUser = Object.assign({}, data, { userHash }, {
          name: info.profileObj.name,
          email: info.profileObj.email || data.email,
          picture: info.profileObj.imageUrl
        })
        // send data to chrome extension
        sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: info.googleId }))
        sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
          googleUserId: info.googleId,
          googleToken: info.accessToken,
          info: {
            name: info.profileObj.name,
            email: info.profileObj.email || data.email,
            picture: info.profileObj.imageUrl
          }
        }))
        sendMsgToChromeExtension(actionCreator('USER_AFTER_LOGIN', { userId: data.id }))
        sendMsgToChromeExtension(actionCreator('PRELOAD_SHARE_ALL', { userId: data.id }))
        sendMsgToChromeExtension(actionCreator('FETCH_CONTACTS', { }))
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
        this.userId = data.id
        this.userHash = userHash
        this.isLogin = true
        this.facebookUser = Object.assign({}, data, { userHash }, {
          name: info.name,
          email: info.email || data.email,
          picture: info.picture.data.url
        })
        // send data to chrome extension
        sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: info.userID }))
        sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
          facebookUserId: info.userID,
          facebookToken: info.accessToken,
          info: {
            name: info.name,
            email: info.email || data.email,
            picture: info.picture.data.url
          }
        }))
        sendMsgToChromeExtension(actionCreator('USER_AFTER_LOGIN', { userId: data.id }))
        sendMsgToChromeExtension(actionCreator('PRELOAD_SHARE_ALL', { userId: data.id }))
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
    const { isLogin, userId, userHash } = auth
    if (userId > 0) {
      this.isLogin = isLogin
      this.userId = userId
      this.userHash = userHash
    }
  }

  @action logoutUser () {
    sendMsgToChromeExtension(actionCreator('AUTH_LOGOUT', {}))
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
