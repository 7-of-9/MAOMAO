import { observable } from 'mobx'
import * as logger from 'loglevel'
import { HomeStore } from './home'
let store = null

class InviteStore extends HomeStore {
  @observable shareCode = ''
  @observable shareInfo = {}

  constructor (isServer, shareCode, shareInfo, isLogin) {
    super(isServer, isLogin, false)
    this.shareCode = shareCode
    this.shareInfo = shareInfo
  }
}

export function initStore (isServer, shareCode = '', shareInfo = {}, isLogin = false) {
  logger.warn('init InviteStore')
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, shareCode, shareInfo, isLogin)
  } else {
    if (store === null) {
      store = new InviteStore(isServer, shareCode, shareInfo, isLogin)
    }
    return store
  }
}
