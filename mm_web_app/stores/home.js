import { action, reaction, when, computed, toJS, observable } from 'mobx'
import _ from 'lodash'
import { CoreStore } from './core'
import { normalizedHistoryData } from './schema/history'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'
import logger from '../utils/logger'

let store = null

export class HomeStore extends CoreStore {
  @observable isProcessing = false
  @observable googleUser = {}
  @observable facebookUser = {}
  @observable urls = []
  @observable users = []
  @observable topics = []
  userHistory = {me: {}, shares: []}
  normalizedData = {}

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

  @action findAllUrlsAndTopics () {
    const { shares, me } = this.userHistory
    const friends = toJS(shares)
    const { urls: myUrls, topics: myTopics, user_id, fullname, avatar } = toJS(me)
    if (myUrls && myUrls.length) {
      const maxScore = _.maxBy(myUrls, 'im_score')
      this.urls.push(...myUrls.map(item => ({...item, rate: Math.floor(item.im_score * 4 / maxScore.im_score) + 1})))
      this.users.push({ user_id, fullname, avatar, urlIds: myUrls.map(item => item.id) })
      _.forEach(myTopics, item => {
        if (item.term_id > 0 && item.url_ids.length > 0) {
          this.topics.push({ name: item.term_name, urlIds: item.url_ids })
        }
      })
    }

    _.forEach(friends, friend => {
      const { user_id, fullname, avatar, list } = friend
      const urlIds = []
      const userUrls = []
      _.forEach(list, item => {
        userUrls.push(...item.urls)
        urlIds.push(...item.urls.map(item => item.id))
        if (item.topic_name) {
          const existTopic = this.topics.find(item => item.name === item.topic_name)
          if (existTopic) {
            existTopic.urlIds.push(...item.urls.map(item => item.id))
          } else {
            this.topics.push({ name: item.topic_name, urlIds: item.urls.map(item => item.id) })
          }
        }
      })
      const maxScore = _.maxBy(userUrls, 'im_score')
      this.urls.push(...userUrls.map(item => ({...item, rate: Math.floor(item.im_score * 4 / maxScore.im_score) + 1})))
      this.users.push({ user_id, fullname, avatar, urlIds })
    })

    this.topics = _.uniqBy(this.topics, (item) => `${item.name}-${item.urlIds.length}`)
    return { urls: this.urls, users: this.users, topics: this.topics }
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
    logger.warn('getUserHistory')
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
        this.findAllUrlsAndTopics()
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
