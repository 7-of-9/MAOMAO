import { action, reaction, when, whyRun, computed, intercept, observable, toJS } from 'mobx'
import * as logger from 'loglevel'
// import { fromJS } from 'immutable'
import { CoreStore } from './core'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'

let store = null

const TIME_TO_RELOAD = 60000

export class HomeStore extends CoreStore {
  @observable googleConnectResult = {}
  @observable facebookConnectResult = {}
  @observable userHistoryResult = {}
  @observable currentTermId = -1
  @observable friendStreamId = -1
  @observable googleUser = {}
  @observable facebookUser = {}
  @observable userHistory = {me: {}, shares: []}
  counter = 0

  constructor (isServer, userAgent) {
    super(isServer, userAgent)
    reaction(() => this.userHash.length,
     (userHash) => {
       whyRun()
       if (userHash > 0) {
         logger.warn('yeah... getUserHistory')
         this.getUserHistory()
       }
     })
    setInterval(() => {
      logger.warn('fetch new user history on every', TIME_TO_RELOAD, ' seconds.')
      if (this.counter > 0 && this.userHash.length > 0) {
        this.getUserHistory()
      }
    }, TIME_TO_RELOAD)
  }

  @computed get myStream () {
    const { me } = this.userHistory
    logger.warn('myStream', me)
    return me
  }

  @computed get friendsStream () {
    const { shares } = this.userHistory
    logger.warn('friendsStream', shares)
    return shares
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
        logger.warn('isInstalledOnChromeDesktop', this.isInstalledOnChromeDesktop)
        if (this.isInstalledOnChromeDesktop) {
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
        } else {
          this.login(this.userId, this.userHash)
          this.getUserHistory()
        }
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
        logger.warn('isInstalledOnChromeDesktop', this.isInstalledOnChromeDesktop)
        if (this.isInstalledOnChromeDesktop) {
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
        } else {
          this.login(this.userId, this.userHash)
          this.getUserHistory()
        }
      }
    )
  }

  @action getUserHistory () {
    logger.info('getUserHistory', this.userId, this.userHash)
    this.userHistoryResult = getUserHistory(this.userId, this.userHash)
    const disposer = intercept(this, 'userHistory', (change) => {
      whyRun()
      logger.warn('observe userHistory: from', change.object.value, 'to', change.newValue)
      if (!change.newValue) {
        logger.warn('getUserHistory not found new data')
        return null
      }

      if (change.newValue === change.object.value) {
        logger.warn('getUserHistory same data, ingore this')
        return null
      }
      logger.warn('getUserHistory accept new data')
      return change
    })
    when(
      () => this.userHistoryResult.state !== 'pending',
      () => {
        this.userHistory = this.userHistoryResult.value.data
        logger.info('userHistory', this.userHistory)
        this.counter += 1
        disposer()
      }
    )
  }
}

export function initStore (isServer, userAgent) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, userAgent)
  } else {
    if (store === null) {
      store = new HomeStore(isServer, userAgent)
    }
    return store
  }
}
