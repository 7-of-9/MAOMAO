import { action, reaction, when, whyRun, computed, intercept, toJS, observable } from 'mobx'
import _ from 'lodash'
import * as logger from 'loglevel'
import { CoreStore } from './core'
import { normalizedHistoryData } from './schema/history'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'

let store = null

const TIME_TO_RELOAD = 5 * 60 * 1000 // 5 mins

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
      logger.warn('fetch new user history on every', TIME_TO_RELOAD, ' miliseconds.')
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
        const normalizedData = normalizedHistoryData(toJS(this.userHistory))
        // checking realtime history (new urls)
        const { entities: { shareLists, urls } } = normalizedData
        if (this.normalizedData) {
          const { entities: { shareLists: oldShareLists } } = this.normalizedData
          let newUrls = []
          _.forOwn(shareLists, (shareList, key) => {
            logger.warn('key', key, shareList, shareList.urls.length, oldShareLists[key].urls.length)
            if (shareList.urls.length !== oldShareLists[key].urls.length) {
              // TODO: find new urls and send notify (2 cases: installed extension or not)
              newUrls = newUrls.concat(shareList.urls.slice(oldShareLists[key].urls.length))
            }
          })

          logger.warn('newUrls', newUrls)
          if (newUrls.length) {
            _.forEach(newUrls, (urlId) => {
              sendMsgToChromeExtension(actionCreator('NOTIFY_MESSAGE', { title: 'New sharing URL', message: urls[urlId].title }))
            })
          }
        }

        this.normalizedData = normalizedData
        this.counter += 1
        logger.warn('normalizedData', this.normalizedData)
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
