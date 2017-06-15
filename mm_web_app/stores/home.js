import { action, reaction, when, computed, toJS, observable } from 'mobx'
import _ from 'lodash'
import { CoreStore } from './core'
import { normalizedHistoryData } from './schema/history'
import { loginWithGoogle, loginWithFacebook, getUserHistory } from '../services/user'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'
import logger from '../utils/logger'

let store = null

const calcRate = (score, timeOnTab) => {
  const scoreUnit = parseInt(score / 20)
  const timeUnit = parseInt(timeOnTab / (30 * 1000)) // 30 seconds
  const rate = Math.ceil(((scoreUnit > 5 ? 5 : scoreUnit) + (timeUnit > 5 ? 5 : timeUnit)) / 2)
  return rate < 1 ? 1 : rate
}

const customizer = (objValue, srcValue) => {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

const mergeUrls = (urls, newUrls) => {
  const result = urls
  _.forEach(newUrls, newUrl => {
    const existItem = result.find(item => item.id === newUrl.id)
    if (existItem) {
      result.push(_.mergeWith(existItem, newUrl, customizer))
    } else {
      result.push(newUrl)
    }
  })
  return result
}

export class HomeStore extends CoreStore {
  @observable isProcessingRegister = false
  @observable isProcessingHistory = false
  @observable codes = {
    all: null,
    sites: [],
    topics: []
  }
  normalizedData = { entities: {}, result: {} }
  users = []
  topics = []
  urls = []
  googleUser = {}
  facebookUser = {}
  userHistory = { me: {}, shares_received_from: [] }

  constructor (isServer, userAgent, user) {
    super(isServer, userAgent, user)
    reaction(() => this.userHash.length,
      (userHash) => {
        if (userHash > 0) {
          this.getUserHistory()
        }
      })
  }

  @computed get isProcessing () {
    return this.isProcessingRegister || this.isProcessingHistory
  }

  @computed get myStream () {
    const { me } = this.userHistory
    return me
  }

  @computed get friendsStream () {
    const { shares_received_from: sharesReveived } = this.userHistory
    // listen new data and reload all
    const friends = toJS(sharesReveived)
    if (friends.length > 0) {
      friends.forEach(friend => {
        // TODO: Check new data is belong to sharing topics or share all
        this.onSubscribe(`my-friend-stream-${friend.user_id}`, 'process-url', (data) => {
          this.getUserHistory()
        })
      })
    }
    return sharesReveived
  }

  @action googleConnect (info) {
    logger.warn('googleConnect', info)
    const googleConnectResult = loginWithGoogle(info)
    this.isProcessingRegister = true
    when(
      () => googleConnectResult.state !== 'pending',
      () => {
        this.isProcessingRegister = false
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
          sendMsgToChromeExtension(actionCreator('FETCH_CONTACTS', {}))
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
    this.isProcessingRegister = true
    when(
      () => facebookConnectResult.state !== 'pending',
      () => {
        this.isProcessingRegister = false
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
    if (!this.isProcessingHistory) {
      this.isProcessingHistory = true
      const userHistoryResult = getUserHistory(this.userId, this.userHash)
      when(
        () => userHistoryResult.state !== 'pending',
        () => {
          this.userHistory = userHistoryResult.value.data
          const normalizedData = normalizedHistoryData(toJS(this.userHistory))
          logger.warn('normalizedData', normalizedData)
          this.normalizedData = normalizedData

          const { shares_received_from, me } = this.userHistory
          logger.warn('findAllUrlsAndTopics shares_received_from, me', shares_received_from, me)
          const friends = toJS(shares_received_from)
          const { urls: myUrls, topics: myTopics, user_id, fullname, avatar } = toJS(me)
          let urls = []
          let users = []
          let topics = []
          if (myUrls && myUrls.length) {
            urls.push(...myUrls.map(item => ({
              owners: [
                {
                  owner: user_id,
                  hit_utc: item.hit_utc,
                  im_score: item.im_score,
                  time_on_tab: item.time_on_tab,
                  rate: calcRate(item.im_score, item.time_on_tab)
                }
              ],
              id: item.url_id,
              title: item.title,
              href: item.href,
              img: item.img,
              suggestions: item.suggestions
            }
            )))
            users.push({ user_id, fullname, avatar, urlIds: myUrls.map(item => item.url_id) })
            _.forEach(myTopics, item => {
              if (item.term_id > 0 && item.url_ids.length > 0) {
                topics.push({ id: item.term_id, name: item.term_name, urlIds: item.url_ids })
              }
            })
          }

          _.forEach(friends, friend => {
            const { user_id, fullname, avatar, shares: list } = friend
            const urlIds = []
            const userUrls = []
            _.forEach(list, item => {
              userUrls.push(...item.urls.map(item => ({
                owners: [
                  {
                    owner: user_id,
                    hit_utc: item.hit_utc,
                    im_score: item.im_score,
                    time_on_tab: item.time_on_tab,
                    rate: calcRate(item.im_score, item.time_on_tab)
                  }
                ],
                id: item.url_id,
                title: item.title,
                href: item.href,
                img: item.img,
                suggestions: item.suggestions
              }
              )))
              urlIds.push(...item.urls.map(item => item.url_id))
              if (item.topic_name) {
                const existTopic = topics.find(topic => topic.name === item.topic_name)
                if (existTopic) {
                  existTopic.urlIds.push(...item.urls.map(item => item.url_id))
                } else {
                  topics.push({ name: item.topic_name, urlIds: item.urls.map(item => item.url_id) })
                }
              }
            })
            urls = mergeUrls(urls, userUrls)
            users.push({ user_id, fullname, avatar, urlIds })
          })

          this.urls = urls
          this.topics = topics.filter(item => item.urlIds.length > 0)
          this.users = users
          logger.warn('findAllUrlsAndTopics urls, users, topics', urls, users, topics)
          this.isProcessingHistory = false
        }
      )
    }
  }

  @action findUserRating (item, userIds) {
    logger.warn('findUserRating')
    if (userIds.length) {
      const owner = item.owners.find(item => userIds.indexOf(item.owner) !== -1)
      return owner.rate
    }
    return item.owners[0].rate
  }

  @action filterUrls (filterByTopic, filterByUser, rating) {
    logger.warn('filterUrls')
    const topics = toJS(filterByTopic)
    const users = toJS(filterByUser)
    if (topics.length > 0 || users.length > 0) {
      const topicUrlIds = _.map(topics, item => item.value)
      const userUrlIds = _.map(users, item => item.value)
      const userIds = _.map(users, item => item.user_id)
      let foundIds = []
      if (topicUrlIds.length && userUrlIds.length) {
        foundIds = _.intersection(topicUrlIds, userUrlIds)
      } else {
        if (topicUrlIds.length) {
          foundIds = topicUrlIds
        } else {
          foundIds = userUrlIds
        }
      }
      const result = this.urls.filter(item => foundIds.indexOf(item.id) !== -1 && this.findUserRating(item, userIds) >= rating)
      return result
    }
    const result = this.urls.filter(item => item.owners[0].rate >= rating)
    return result
  }

  @action sortByOrdering (sortedUrls, sortBy, sortDirection) {
    logger.warn('sortByOrdering')
    if (sortBy === 'date') {
      return sortDirection === 'desc' ? _.reverse(_.sortBy(sortedUrls, [(url) => _.max(url.owners[0].hit_utc)])) : _.sortBy(sortedUrls, [(url) => url.owners[0].hit_utc])
    } else {
      return sortDirection === 'desc' ? _.reverse(_.sortBy(sortedUrls, [(url) => url.owners[0].rate])) : _.sortBy(sortedUrls, [(url) => url.owners[0].rate])
    }
  }

  @action saveShareCode (type, code) {
    switch (type) {
      case 'all':
        this.codes.all = code
        if (this.isInstall) {
          sendMsgToChromeExtension(actionCreator('SHARE_ALL_SUCCESS', code))
        }
        break
      case 'site':
        this.codes.sites.push(code)
        if (this.isInstall) {
          sendMsgToChromeExtension(actionCreator('SHARE_URL_SUCCESS', code))
        }
        break
      case 'topic':
        this.codes.topics.push(code)
        if (this.isInstall) {
          sendMsgToChromeExtension(actionCreator('SHARE_TOPIC_SUCCESS', code))
        }
        break
      default:
    }
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
