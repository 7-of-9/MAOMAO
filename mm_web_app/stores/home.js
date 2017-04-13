import { observable } from 'mobx'
// import { getShareInfo } from './services/share'

let store = null

class HomeStore {
  @observable isLogin = false
  @observable shareCode = ''
  @observable shareInfo = {
    fullName: '',
    urlTitle: '',
    topicTitle: '',
    isShareAll: false
  }
  constructor (isServer, isLogin) {
    this.isLogin = isLogin
  }
}

export function initStore (isServer, isLogin = false) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, isLogin)
  } else {
    if (store === null) {
      store = new HomeStore(isServer, isLogin)
    }
    return store
  }
}
