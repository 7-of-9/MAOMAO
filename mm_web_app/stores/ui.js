import { observable, action, toJS } from 'mobx'
import { guid } from '../utils/hash'
import logger from '../utils/logger'

let store = null

export class UIStore {
  /* app header component - show modal */
  @observable showSignInModal = false
  @observable showExtensionModal = false
  /* homepage filter */
  @observable onlyMe = false
  @observable sortBy = 'rating'
  @observable sortDirection = 'desc'
  @observable filterByTopic = []
  @observable filterByUser = []
  @observable discoveryTerms = []
  @observable discoverySuggestionTerms = []
  @observable rating = 1
  @observable page = 1
  @observable currentViewer = 'streams'
  /* landing page */
  @observable selectedTopics = []
  @observable currentTermId = ''
  @observable currentTermTitle = ''
  @observable currentTermImage = ''
  @observable treeLevel = 1
  /* animation type */
  @observable animationType = 'LTR'
  /* notification compnent */
  @observable notifications = []
  /* discover mode */
  @observable discoveryUrlId = -1
  @observable discoveryTermId = -1
  @observable isSplitView = false
  selectedDiscoveryItem = {}
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

  @action toggleSelectTopic (isSelect, termId, termName, img) {
    logger.warn('toggleSelectTopic', isSelect, termId, termName, img)
    if (isSelect) {
      const isExist = this.selectedTopics.length > 0 && this.selectedTopics.find(item => item.termId === termId)
      if (!isExist) {
        this.selectedTopics.push({termId, termName, img})
      }
    } else {
      this.selectedTopics = this.selectedTopics.filter(item => item.termId !== termId)
    }
  }

  @action selectChildTopics (topics) {
    logger.warn('toggleSelectTopic', topics)
    if (topics && topics.length) {
      topics.forEach(topic => {
        const { topic_id: termId, topic_name: termName, img } = topic
        const isExist = this.selectedTopics.length > 0 && this.selectedTopics.find(item => item.termId === termId)
        if (!isExist) {
          this.selectedTopics.push({termId, termName, img})
        }
      })
    }
  }

  @action selectTopicTree (termId, termName = '', img = '', inc = 1) {
    logger.warn('selectTopicTree', termId)
    this.currentTermId = termId
    this.currentTermTitle = termName
    this.currentTermImage = img
    this.treeLevel += inc
    if (inc > 0) {
      this.animationType = 'RTL'
    } else {
      this.animationType = 'LTR'
    }
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

  @action selectDiscoveryItem (item) {
    this.discoveryUrlId = item.disc_url_id
    this.selectedDiscoveryItem = item
    this.animationType = 'RTL'
  }

  @action selectDiscoveryTerm (termId) {
    this.isSplitView = termId > 0
    this.discoveryTermId = termId
  }

  @action toggleSplitView (isSelect) {
    this.isSplitView = isSelect
  }

  @action backToRootDiscovery () {
    this.discoveryUrlId = -1
    this.discoveryTermId = -1
    this.selectedDiscoveryItem = {}
    this.animationType = 'LTR'
    this.isSplitView = false
  }

  @action clean () {
    this.selectedDiscoveryItem = {}
    this.currentTermId = ''
    this.selectedTopics = []
    this.shareTopics = []
    this.shareUrlId = -1
    this.userId = -1
    this.title = 'Sign In'
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
