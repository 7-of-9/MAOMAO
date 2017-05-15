import { action, reaction, when, computed, toJS, observable } from 'mobx'
import { CoreStore } from './core'
import { normalizedHistoryData } from './schema/history'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'
import logger from '../utils/logger'

let store = null

export class HomeStore extends CoreStore {
  normalizedData = {}
  @observable isProcessing = false
  @observable googleUser = {}
  @observable facebookUser = {}
  @observable userHistory = {me: {}, shares: []}

  constructor (isServer, userAgent, user) {
    super(isServer, userAgent, user)
    reaction(() => this.userHash.length,
     (userHash) => {
       if (userHash > 0) {
         this.getUserHistory()
       }
     })
  }

  @computed get myStream () {
    const { me } = this.userHistory
    return me
  }

  @computed get friendsStream () {
    const { shares } = this.userHistory
    // listen new data and reload all
    const friends = toJS(shares)
    if (friends.length > 0) {
      friends.forEach(friend => {
        // TODO: Check new data is belong to sharing topics or share all
        this.onSubscribe(`my-friend-stream-${friend.user_id}`, 'process-url', (data) => {
          this.getUserHistory()
        })
      })
    }
    return shares
  }

  @action googleConnect (info) {
    logger.warn('googleConnect', info)
    const googleConnectResult = loginWithGoogle(info)
    this.isProcessing = true
    when(
      () => googleConnectResult.state !== 'pending',
      () => {
        this.isProcessing = false
        const { data } = googleConnectResult.value
        const userHash = md5hash(info.google_user_id)
        this.isLogin = true
        this.userId = data.id
        this.userHash = userHash
        this.googleUser = Object.assign({}, data, { userHash }, info)
        this.user = {
          name: info.name,
          email: info.email || data.email,
          picture: info.picture
        }
        // send data to chrome extension
        if (this.isInstalledOnChromeDesktop) {
          sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: info.google_user_id }))
          sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
            googleUserId: info.google_user_id,
            googleToken: info.accessToken,
            info: {
              name: info.name,
              email: info.email || data.email,
              picture: info.picture
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
    logger.warn('facebookConnect', info)
    const facebookConnectResult = loginWithFacebook(info)
    this.isProcessing = true
    when(
      () => facebookConnectResult.state !== 'pending',
      () => {
        this.isProcessing = false
        const { data } = facebookConnectResult.value
        const userHash = md5hash(info.fb_user_id)
        this.userId = data.id
        this.userHash = userHash
        this.isLogin = true
        this.facebookUser = Object.assign({}, data, { userHash }, info)
        this.user = {
          name: info.name,
          email: info.email || data.email,
          picture: info.picture
        }
        // send data to chrome extension
        if (this.isInstalledOnChromeDesktop) {
          sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: info.fb_user_id }))
          sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
            facebookUserId: info.fb_user_id,
            facebookToken: info.accessToken,
            info: {
              name: info.name,
              email: info.email || data.email,
              picture: info.picture
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
    this.isProcessing = true
    const userHistoryResult = getUserHistory(this.userId, this.userHash)
    when(
      () => userHistoryResult.state !== 'pending',
      () => {
        this.isProcessing = false
        this.userHistory = userHistoryResult.value.data
        const normalizedData = normalizedHistoryData(toJS(this.userHistory))
        logger.warn('normalizedData', normalizedData)
        this.normalizedData = normalizedData
      }
    )
  }
}

export function initStore (isServer, userAgent, user) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, userAgent, user)
  } else {
    if (store === null) {
      store = new HomeStore(isServer, userAgent, user)
    }
    return store
  }
}
