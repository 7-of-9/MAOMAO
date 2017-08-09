import { observable, action, toJS } from 'mobx'
import { guid } from '../utils/hash'
import logger from '../utils/logger'

let store = null

export class UIStore {
  @observable showSignInModal = false
  @observable showExtensionModal = false
  @observable onlyMe = false
  @observable sortBy = 'rating'
  @observable sortDirection = 'desc'
  @observable filterByTopic = []
  @observable filterByUser = []
  @observable discoveryTerms = []
  @observable discoverySuggestionTerms = []
  @observable rating = 1
  @observable currentViewer = 'streams'
  @observable selectedTopics = []
  @observable currentTopicId = ''
  @observable currentTopicTitle = ''
  @observable treeLevel = 1
  @observable notifications = []
  @observable page = 1
  shareTopics = []
  shareUrlId = -1
  userId = -1
  title = 'Sign In'

  @action toggleOnlyMe (userId, users) {
    logger.warn('toggleOnlyMe', userId, users)
    this.onlyMe = !this.onlyMe
    if (this.onlyMe) {
      this.userId = userId
    }

    if (this.onlyMe) {
      const user = users.find(item => item.user_id === userId)
      if (user) {
        this.filterByUser = [{ value: user.urlIds, label: user.fullname, user_id: user.user_id, avatar: user.avatar }]
      }
    } else {
      this.filterByUser = this.filterByUser.filter(item => item.user_id !== userId)
    }
  }

  @action toggleSelectTopic (isSelect, topicId, topicName) {
    logger.warn('toggleSelectTopic', isSelect, topicId, topicName)
    if (isSelect) {
      this.selectedTopics.push({topicId, topicName})
    } else {
      this.selectedTopics = this.selectedTopics.filter(item => item.topicId !== topicId)
    }
  }

  @action selectTopicTree (topicId, topicName = '', inc = 1) {
    logger.warn('selectTopicTree', topicId)
    this.currentTopicId = topicId
    this.currentTopicTitle = topicName
    this.treeLevel += inc
  }

  @action openDiscoveryMode (terms, suggestions) {
    this.discoveryTerms = terms
    if (terms.length > 0) {
      this.discoverySuggestionTerms = suggestions
      this.currentViewer = 'discovery'
    } else {
      this.currentViewer = 'streams'
      this.page = 1
      this.discoverySuggestionTerms = []
    }
  }

  @action openShareTopic (urlId, selectedTopic, otherTopics) {
    logger.warn('share topic', urlId, selectedTopic, otherTopics)
    this.shareUrlId = urlId
    this.shareTopics = [ { id: `${selectedTopic.id}-tld-${selectedTopic.name}`, topic_id: selectedTopic.id, name: selectedTopic.name } ]
    otherTopics.forEach((topic) => {
      if (topic.id !== selectedTopic.id) {
        this.shareTopics.push({ id: `${topic.id}-beta-${topic.name}`, topic_id: topic.id, name: topic.name })
      }
    })
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

  @action toggleSignIn (isShow, title = 'Sign In') {
    this.showSignInModal = isShow
    this.title = title
  }

  @action openExtensionModal () {
    this.showExtensionModal = true
  }

  @action closeExtensionModal () {
    this.showExtensionModal = false
  }

  @action removeNotification (uuid) {
    if (this.notifications) {
      this.notifications = this.notifications.filter((item) => item && item.key !== uuid)
    } else {
      this.clearNotifications()
    }
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
    if (this.filterByUser.length <= 1) {
      this.onlyMe = !!this.filterByUser.find(item => item.user_id === this.userId)
    }
    this.page = 1
  }

  @action selectUser (user) {
    logger.info('selectUser', user, this)
    if (!this.filterByUser.find(item => item.user_id === user.user_id)) {
      this.filterByUser = this.filterByUser.filter(item => item.user_id !== user.user_id).concat([{ value: user.urlIds, label: user.fullname, user_id: user.user_id, avatar: user.avatar }])
    }
    if (this.filterByUser.length > 1) {
      this.onlyMe = false
    }
    this.page = 1
  }

  @action changeRate (rating) {
    this.rating = rating
    this.page = 1
  }

  @action nextPage () {
    logger.warn('nextPage')
    this.page += 1
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
