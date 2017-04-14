import { observable } from 'mobx'
import * as logger from 'loglevel'
import { HomeStore } from './home'
let store = null

class InviteStore extends HomeStore {
  @observable isLogin = false
  @observable isInstall = false
  @observable shareCode = ''
  @observable shareInfo = {}

  constructor (isServer, shareCode, shareInfo, isLogin, isInstall) {
    super(isServer, isLogin, isInstall)
    this.shareCode = shareCode
    this.shareInfo = shareInfo
  }
}

export function initStore (isServer, shareCode = '', shareInfo = {}, isLogin = false, isInstall = false) {
  logger.warn('init InviteStore')
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, shareCode, shareInfo, isLogin, isInstall)
  } else {
    if (store === null) {
      store = new InviteStore(isServer, shareCode, shareInfo, isLogin, isInstall)
    }
    return store
  }
}
