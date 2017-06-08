import { observable, action, toJS } from 'mobx'
import { guid } from '../utils/hash'
import logger from '../utils/logger'

let store = null

export class UIStore {
  @observable onlyMe = false
  @observable sortBy = 'rating'
  @observable sortDirection = 'desc'
  @observable filterByTopic = []
  @observable filterByUser = []
  @observable discoveryTerms = []
  @observable page = 0
  @observable rating = 1
  @observable currentViewer = 'streams'
  @observable showExtensionModal = false
  @observable notifications = []
  shareTopics = []
  shareUrlId = -1

  @action toggleOnlyMe (userId, users) {
    this.onlyMe = !this.onlyMe
    logger.warn('toggleOnlyMe', this.onlyMe, userId, users)
    if (this.onlyMe) {
      const user = users.find(item => item.user_id === userId)
      if (user) {
        this.filterByUser = [{ value: user.urlIds, label: user.fullname, user_id: user.user_id, avatar: user.avatar }]
      }
    } else {
      this.filterByUser = this.filterByUser.filter(item => item.user_id !== userId)
    }
  }

  @action openDiscoveryMode (terms) {
    this.discoveryTerms = terms
    if (terms.length > 0) {
      this.currentViewer = 'discovery'
    } else {
      this.currentViewer = 'streams'
      this.page = 1
    }
  }

  @action openShareTopic (urlId, topic) {
    logger.warn('share topic', urlId, topic)
    this.shareUrlId = urlId
    this.shareTopics = [ { id: `${topic.id}-tld-${topic.name}`, topic_id: topic.id, name: topic.name } ]
    this.currentViewer = 'sharetopic'
  }

  @action displayShareManagement () {
    this.currentViewer = 'share'
  }

  @action backToStreams () {
    this.currentViewer = 'streams'
    this.page = 1
  }

  @action changeSortOrder (type, direction) {
    logger.warn('changeSortOrder', type, direction)
    this.sortBy = type
    this.sortDirection = direction
    this.page = 1
  }

  @action openExtensionModal () {
    this.showExtensionModal = true
  }

  @action closeExtensionModal () {
    this.showExtensionModal = false
  }

  @action removeNotification (uuid) {
    this.notifications = this.notifications.filter((item) => item.key !== uuid)
  }

  @action clearNotifications () {
    this.notifications = []
  }

  @action addNotification (msg) {
    const uuid = guid()
    this.notifications.push({
      message: msg,
      key: uuid,
      action: 'Dismiss',
      onClick: (deactivate) => {
        this.removeNotification(deactivate.key)
      }
    })
  }

  @action removeTopic (topic) {
    logger.info('removeTopic topic', topic)
    const filterByTopic = toJS(this.filterByTopic)
    logger.info('removeTopic filterByTopic', filterByTopic)
    this.filterByTopic = filterByTopic.filter(item => item.label !== topic.label)
    this.page = 1
  }

  @action selectTopic (topic) {
    logger.info('selectTopic', topic, this)
    const filterByTopic = toJS(this.filterByTopic)
    logger.info('selectTopic filterByTopic', filterByTopic)
    if (!filterByTopic.find(item => item.label === topic.name)) {
      this.filterByTopic = filterByTopic.filter(item => item.label !== topic.name).concat([{ value: topic.urlIds, label: topic.name }])
    }
    this.page = 1
  }

  @action removeUser (user) {
    logger.info('removeUser', user, this)
    this.filterByUser = this.filterByUser.filter(item => item.user_id !== user.user_id)
    this.page = 1
  }

  @action selectUser (user) {
    logger.info('selectUser', user, this)
    if (!this.filterByUser.find(item => item.user_id === user.user_id)) {
      this.filterByUser = this.filterByUser.filter(item => item.user_id !== user.user_id).concat([{ value: user.urlIds, label: user.fullname, user_id: user.user_id, avatar: user.avatar }])
    }
    this.page = 1
  }

  @action changeRate (rating) {
    this.rating = rating
    this.page = 1
  }
}

export function initUIStore (isServer) {
  if (isServer && typeof window === 'undefined') {
    return new UIStore(isServer)
  } else {
    if (store === null) {
      store = new UIStore(isServer)
    }
    return store
  }
}
