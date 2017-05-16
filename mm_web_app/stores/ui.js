import { OrderedSet } from 'immutable'
import { observable, action } from 'mobx'
import { guid } from '../utils/hash'

let store = null

export class UIStore {
  @observable myStream = {
    page: 0,
    currentTermId: -1
  }
  @observable friendStream = {
    filterByTopic: [],
    filterByUser: [],
    page: 0,
    rating: 1
  }
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
    this.friendStream.filterByTopic = this.friendStream.filterByTopic.filter(item => item.name !== topic.name)
    this.friendStream.page = 1
  }

  @action selectTopic (topic) {
    if (!this.friendStream.filterByTopic.find(item => item.label === topic.name)) {
      this.friendStream.filterByTopic = this.friendStream.filterByTopic.filter(item => item.label !== topic.name).concat([{ value: topic.urlIds, label: topic.name }])
    }
    this.friendStream.page = 1
  }

  @action removeUser (user) {
    this.friendStream.filterByUser = this.friendStream.filterByUser.filter(item => item.user_id !== user.user_id)
    this.friendStream.page = 1
  }

  @action selectUser (user) {
    if (!this.friendStream.filterByUser.find(item => item.user_id === user.user_id)) {
      this.friendStream.filterByUser = this.friendStream.filterByUser.filter(item => item.user_id !== user.user_id).concat([{ value: user.urlIds, label: user.fullname, user_id: user.user_id, avatar: user.avatar }])
    }
    this.friendStream.page = 1
  }

  @action changeRate (rating) {
    this.friendStream.rating = rating
    this.friendStream.page = 1
  }
}

export function initUIStore (isServer, userAgent = '') {
  if (isServer && typeof window === 'undefined') {
    return new UIStore(isServer)
  } else {
    if (store === null) {
      store = new UIStore(isServer)
    }
    return store
  }
}
