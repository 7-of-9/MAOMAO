import { action, reaction, when, computed, toJS, observable } from 'mobx'
import _ from 'lodash'
import { CoreStore } from './core'
import { normalizedHistoryData } from './schema/history'
import { loginWithGoogle, loginWithFacebook, testInternalUser, getUserHistory } from '../services/user'
import { safeBrowsingLoockup } from '../services/google'
import { getAllTopicTree, addBulkTopics } from '../services/topic'
import { sendMsgToChromeExtension, actionCreator } from '../utils/chrome'
import { md5hash } from '../utils/hash'
import logger from '../utils/logger'

let store = null

const calcRate = (score, timeOnTab) => {
  const scoreUnit = parseInt(score / 30)
  const timeUnit = parseInt(timeOnTab / (30 * 1000)) // 30 seconds
  const rate = Math.ceil(((scoreUnit > 5 ? 5 : scoreUnit) + (timeUnit > 5 ? 5 : timeUnit)) / 2)
  return rate < 1 ? 1 : rate
}

function flattenTopics (topics, counter = 0) {
  const result = []
  _.forEach(topics, item => {
    result.push({ level: counter, id: item.term_id, name: item.term_name, urlIds: item.url_ids, suggestions: item.suggestions })
    if (item.child_topics && item.child_topics.length) {
      result.push(...flattenTopics(item.child_topics, counter + 1))
    }
  })
  return result
}

export class HomeStore extends CoreStore {
  @observable isProcessingRegister = false
  @observable isProcessingTopicTree = false
  @observable isProcessingHistory = false
  @observable pendings = []
  @observable codes = {
    all: null,
    sites: [],
    topics: []
  }
  normalizedData = { entities: {}, result: {} }
  user = {}
  tree = []
  users = []
  topics = []
  firstLevelTopics = []
  urls = []
  owners = []
  googleUser = {}
  facebookUser = {}
  userHistory = { mine: {}, received: [], topics: [] }

  constructor (isServer, userAgent, user, isHome = true) {
    super(isServer, userAgent, user)
    this.user = user
    reaction(() => this.userHash.length,
      (userHash) => {
        if (userHash > 0 && isHome) {
          this.getUserHistory()
        }
      })
  }

  @computed get isLoading () {
    return this.pendings.length > 0
  }

  @computed get isProcessing () {
    return this.isProcessingRegister || this.isProcessingHistory || this.isProcessingTopicTree
  }

  @computed get myStream () {
    const { mine: me } = this.userHistory
    return me
  }

  @computed get friendsStream () {
    const { received: sharesReveived } = this.userHistory
    // listen new data and reload all
    const friends = toJS(sharesReveived)
    if (friends.length > 0) {
      _.forEach(friends, friend => {
        // TODO: Check new data is belong to sharing topics or share all
        this.onSubscribe(`my-friend-stream-${friend.user_id}`, 'process-url', (data) => {
          this.getUserHistory()
        })
      })
    }
    return sharesReveived
  }

  @action saveTopics (ids) {
    logger.info('saveTopics', ids)
    if (ids && ids.length > 0) {
      const saveTopicRequest = addBulkTopics(this.userId, this.userHash, ids)
      when(
          () => saveTopicRequest.state !== 'pending',
          () => {
            logger.info('saveTopics result', saveTopicRequest.data)
          }
        )
    }
  }

  @action internalLogin (callback) {
    logger.info('internalLogin')
    const registerNewUser = testInternalUser()
    this.isProcessingRegister = true
    when(
      () => registerNewUser.state !== 'pending',
      () => {
        this.isProcessingRegister = false
        const { data } = registerNewUser.value
        const userHash = md5hash(data.id)
        this.isLogin = true
        this.userId = data.id
        this.userHash = userHash
        this.user = Object.assign({}, data, {name: `${data.firstname} ${data.lastname}`, picture: 'http://maomaoweb.azurewebsites.net/static/images/no-avatar.png'})
        // send data to chrome extension
        if (this.isInstalledOnChromeDesktop) {
          sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: data.id }))
          sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
            info: {
              ...data,
              name: `${data.firstname} ${data.lastname}`,
              picture: 'http://maomaoweb.azurewebsites.net/static/images/no-avatar.png'
            }
          }))
          sendMsgToChromeExtension(actionCreator('USER_AFTER_LOGIN', { userId: data.id }))
          sendMsgToChromeExtension(actionCreator('PRELOAD_SHARE_ALL', { userId: data.id }))
        }
        this.login(this.userId, this.userHash)
        callback && callback(Object.assign({}, this.user, {userHash}))
      }
    )
  }

  @action retrylLoginForInternalUser (user) {
    logger.info('retrylLoginForInternalUser', user)
    const { id, userHash } = user
    this.isLogin = true
    this.userId = id
    this.userHash = userHash
    this.user = user
    if (this.isInstalledOnChromeDesktop) {
      sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: id }))
      sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
        info: user
      }))
      sendMsgToChromeExtension(actionCreator('USER_AFTER_LOGIN', { userId: id }))
      sendMsgToChromeExtension(actionCreator('PRELOAD_SHARE_ALL', { userId: id }))
    }
    this.login(this.userId, this.userHash)
  }

  @action googleConnect (info, callback) {
    logger.info('googleConnect', info)
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
        this.user = Object.assign({}, data, {
          name: info.name,
          email: info.email || data.email,
          picture: info.picture
        })
        // send data to chrome extension
        if (this.isInstalledOnChromeDesktop) {
          sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: info.google_user_id }))
          sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
            googleUserId: info.google_user_id,
            googleToken: info.accessToken,
            info: {
              ...data,
              name: info.name,
              email: info.email || data.email,
              picture: info.picture
            }
          }))
          sendMsgToChromeExtension(actionCreator('USER_AFTER_LOGIN', { userId: data.id }))
          sendMsgToChromeExtension(actionCreator('PRELOAD_SHARE_ALL', { userId: data.id }))
          sendMsgToChromeExtension(actionCreator('FETCH_CONTACTS', {}))
        }
        this.login(this.userId, this.userHash)
        callback && callback(this.user)
      }
    )
  }

  @action facebookConnect (info, callback) {
    logger.info('facebookConnect', info)
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
        this.user = Object.assign({}, data, {
          name: info.name,
          email: info.email || data.email,
          picture: info.picture
        })
        // send data to chrome extension
        if (this.isInstalledOnChromeDesktop) {
          sendMsgToChromeExtension(actionCreator('USER_HASH', { userHash: info.fb_user_id }))
          sendMsgToChromeExtension(actionCreator('AUTH_FULFILLED', {
            facebookUserId: info.fb_user_id,
            facebookToken: info.accessToken,
            info: {
              ...data,
              name: info.name,
              email: info.email || data.email,
              picture: info.picture
            }
          }))
          sendMsgToChromeExtension(actionCreator('USER_AFTER_LOGIN', { userId: data.id }))
          sendMsgToChromeExtension(actionCreator('PRELOAD_SHARE_ALL', { userId: data.id }))
        }
        this.login(this.userId, this.userHash)
        callback && callback(this.user)
      }
    )
  }

  @action getTopicTree () {
    logger.info('getTopicTree')
    if (!this.isProcessingTopicTree) {
      const allTopics = getAllTopicTree()
      this.isProcessingTopicTree = true
      when(
      () => allTopics.state !== 'pending',
      () => {
        this.isProcessingTopicTree = false
        this.tree = allTopics.value.data.tree || []
        logger.info('getTopicTree', this.tree)
      })
    }
  }

  @action getUserHistory () {
    logger.info('getUserHistory')
    if (!this.isProcessingHistory) {
      this.isProcessingHistory = true
      const userHistoryResult = getUserHistory(this.userId, this.userHash)
      when(
        () => userHistoryResult.state !== 'pending',
        () => {
          if (userHistoryResult.state === 'fulfilled') {
            this.userHistory = userHistoryResult.value.data
            const normalizedData = normalizedHistoryData(toJS(this.userHistory))
            logger.info('normalizedData', normalizedData)
            this.normalizedData = normalizedData

            const { received, mine, topics } = this.userHistory
            const friends = toJS(received)
            const { urls: myUrls, user_id, fullname, avatar } = toJS(mine)
            let urls = []
            let users = []
            let owners = []
            if (myUrls && myUrls.length) {
              urls.push(..._.map(myUrls, item => ({
                url_id: item.url_id,
                title: item.title,
                href: item.href,
                img: item.img
              }
              )))
              _.forEach(myUrls, item => {
                owners.push({
                  owner: user_id,
                  url_id: item.url_id,
                  hit_utc: item.hit_utc,
                  im_score: item.im_score,
                  time_on_tab: item.time_on_tab,
                  rate: calcRate(item.im_score, item.time_on_tab)
                })
              })
              users.push({ user_id, fullname, avatar, urlIds: _.map(myUrls, item => item.url_id) })
            }

            _.forEach(friends, friend => {
              const { user_id, fullname, avatar, shares: list } = friend
              const urlIds = []
              _.forEach(list, item => {
                urls.push(..._.map(item.urls, item => ({
                  url_id: item.url_id,
                  title: item.title,
                  href: item.href,
                  img: item.img
                }
              )))
                _.forEach(item.urls, item => {
                  owners.push({
                    owner: user_id,
                    url_id: item.url_id,
                    hit_utc: item.hit_utc,
                    im_score: item.im_score,
                    time_on_tab: item.time_on_tab,
                    rate: calcRate(item.im_score, item.time_on_tab)
                  })
                })
                urlIds.push(..._.map(item.urls, item => item.url_id))
              })
              users.push({ user_id, fullname, avatar, urlIds })
            })
            this.urls = _.uniqBy(urls, 'url_id')
            this.topics = flattenTopics(topics)
            this.firstLevelTopics = _.map(topics, item => ({ id: item.term_id, name: item.term_name, urlIds: item.url_ids, suggestions: item.suggestions }))
            this.users = users
            this.owners = _.uniqBy(owners, (item) => `${item.owner}-${item.url_id}`)
            logger.info('findAllUrlsAndTopics urls, users, topics', this.urls, this.users, this.topics, this.owners)
          }
          this.checkSafeUrls()
        }
      )
    }
  }

  @action checkSafeUrls () {
    logger.info('safeBrowsingLoockup', this.urls)
    const urls = toJS(this.urls)
    const MAX_ITEM = 500
    const totalPage = urls.length / MAX_ITEM
    if (urls.length === 0) {
      this.isProcessingHistory = false
    }
    for (let counter = 0; counter < totalPage; counter += 1) {
      const safeCheckResult = safeBrowsingLoockup(urls.slice(counter * MAX_ITEM, MAX_ITEM * (counter + 1)).map(item => item.href))
      when(
          () => safeCheckResult.state !== 'pending',
          () => {
            if (safeCheckResult.state === 'fulfilled') {
              const { matches } = safeCheckResult.value.data
              if (matches) {
                const ingoreUrls = _.map(matches, item => item && item.threat && item.threat.url)
                logger.info('safeBrowsingLoockup ingoreUrls', ingoreUrls)
                this.urls = _.filter(urls, item => _.indexOf(ingoreUrls, item.href) === -1)
              }
            }
            this.isProcessingHistory = false
          }
      )
    }
  }

  @action findUserRating (item, userIds) {
    logger.info('findUserRating')
    if (userIds.length) {
      const owner = _.find(item.owners, item => _.indexOf(userIds, item.owner) !== -1)
      return owner.rate
    }
    return item.owners[0].rate
  }

  @action filterUrls (filterByTopic, filterByUser, rating) {
    logger.info('filterUrls')
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
      const result = _.filter(this.urls, item => _.indexOf(foundIds, item.id) !== -1 && this.findUserRating(item, userIds) >= rating)
      return result
    }
    const result = _.filter(this.urls, item => item.owners[0].rate >= rating)
    return result
  }

  @action sortByOrdering (sortedUrls, sortBy, sortDirection) {
    logger.info('sortByOrdering')
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

export function initStore (isServer, userAgent, user, isHome = true) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, userAgent, user, isHome)
  } else {
    if (store === null) {
      store = new HomeStore(isServer, userAgent, user, isHome)
    }
    return store
  }
}
