import { OrderedSet } from 'immutable'
import { observable, action, toJS } from 'mobx'
import { guid } from '../utils/hash'
import logger from '../utils/logger'

let store = null

export class UIStore {
  @observable filterByTopic = []
  @observable filterByUser = []
  @observable page = 0
  @observable rating = 1
  @observable showSignInModal = false
  @observable showAcceptInvite = false
  @observable notifications = OrderedSet()

  @action showSignIn () {
    this.showSignInModal = true
  }

  @action closeModal () {
    this.showSignInModal = false
  }

  @action removeNotification (uuid) {
    this.notifications = this.notifications.filter((item) => item.key !== uuid)
  }

  @action addNotification (msg) {
    const uuid = guid()
    this.notifications = this.notifications.add({
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
