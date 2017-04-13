import { observable } from 'mobx'
let store = null

class InviteStore {
  @observable isLogin = false
  @observable isInstall = false
  @observable shareCode = ''
  constructor (isServer, shareCode, isLogin, isInstall) {
    this.shareCode = shareCode
    this.isLogin = isLogin
    this.isLogin = isInstall
  }
}

export function initStore (isServer, shareCode = '', isLogin = false, isInstall = false) {
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, shareCode, isLogin, isInstall)
  } else {
    if (store === null) {
      store = new InviteStore(isServer, shareCode, isLogin, isInstall)
    }
    return store
  }
}
