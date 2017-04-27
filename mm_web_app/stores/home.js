import { action, reaction, when, whyRun, computed, intercept, toJS, observable } from 'mobx'
import _ from 'lodash'
import { CoreStore } from './core'
import { normalizedHistoryData } from './schema/history'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'
import logger from '../utils/logger'

let store = null

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
  normalizedData = null

  constructor (isServer, userAgent, user) {
    super(isServer, userAgent, user)
    reaction(() => this.userHash.length,
     (userHash) => {
       whyRun()
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
    this.googleConnectResult = loginWithGoogle(info)
    when(
      () => this.googleConnectResult.state !== 'pending',
      () => {
        const { data } = this.googleConnectResult.value
        const userHash = md5hash(info.google_user_id)
        this.isLogin = true
        this.userId = data.id
        this.userHash = userHash
        this.googleUser = Object.assign({}, data, { userHash }, info)
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
    this.facebookConnectResult = loginWithFacebook(info)
    when(
      () => this.facebookConnectResult.state !== 'pending',
      () => {
        const { data } = this.facebookConnectResult.value
        const userHash = md5hash(info.fb_user_id)
        this.userId = data.id
        this.userHash = userHash
        this.isLogin = true
        this.facebookUser = Object.assign({}, data, { userHash }, info)
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
    this.userHistoryResult = getUserHistory(this.userId, this.userHash)
    const disposer = intercept(this, 'userHistory', (change) => {
      whyRun()
      if (!change.newValue) {
        return null
      }

      if (change.newValue === change.object.value) {
        return null
      }

      return change
    })
    when(
      () => this.userHistoryResult.state !== 'pending',
      () => {
        this.userHistory = this.userHistoryResult.value.data
        const normalizedData = normalizedHistoryData(toJS(this.userHistory))
        // checking realtime history (new urls)
        const { entities: { shareLists, urls } } = normalizedData
        if (this.normalizedData) {
          const { entities: { shareLists: oldShareLists } } = this.normalizedData
          let newUrls = []
          _.forOwn(shareLists, (shareList, key) => {
            if (shareList.urls.length !== oldShareLists[key].urls.length) {
              // TODO: find new urls and send notify (2 cases: installed extension or not)
              newUrls = newUrls.concat(shareList.urls.slice(oldShareLists[key].urls.length))
            }
          })

          if (newUrls.length) {
            _.forEach(newUrls, (urlId) => {
              sendMsgToChromeExtension(actionCreator('NOTIFY_MESSAGE', { title: 'New sharing URL', message: urls[urlId].title }))
            })
          }
        }

        this.normalizedData = normalizedData
        this.counter += 1
        disposer()
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
