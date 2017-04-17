import { action, when, observable } from 'mobx'
import * as logger from 'loglevel'
import { HomeStore } from './home'
import { acceptInvite } from '../services/share'

let store = null

class InviteStore extends HomeStore {
  @observable shareCode = ''
  @observable acceptInviteResult = {}
  @observable inviteResult = {}
  @observable shareInfo = {}

  @action acceptInviteCode () {
    logger.warn('acceptInviteCode', this.shareCode)
    this.acceptInviteResult = acceptInvite(this.userId, this.userHash, this.shareCode)
    when(
      () => this.acceptInviteResult.state !== 'pending',
      () => {
        this.inviteResult = this.acceptInviteResult.value
        this.getUserHistory()
        logger.warn('inviteResult', this.inviteResult)
      }
    )
  }

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
