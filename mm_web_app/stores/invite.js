import { action, reaction, when, observable } from 'mobx'
import * as logger from 'loglevel'
import { HomeStore } from './home'
import { acceptInvite } from '../services/share'
import { hasInstalledExtension } from '../utils/chrome'

let store = null

class InviteStore extends HomeStore {
  @observable shareCode = ''
  @observable acceptInviteResult = {}
  @observable inviteResult = {}
  @observable shareInfo = {}

  constructor (isServer, userAgent, shareCode, shareInfo) {
    super(isServer, userAgent)
    this.shareCode = shareCode
    this.shareInfo = shareInfo
    reaction(() => this.userHash.length,
     (userHash) => {
       if (userHash > 0) {
         logger.warn('yeah... acceptInviteCode')
         this.acceptInviteCode()
       }
     })
  }

  @action checkInstall () {
    logger.warn('hasInstalledExtension', hasInstalledExtension())
    if (this.isChrome && !this.isMobile) {
      this.isInstall = hasInstalledExtension()
    }
  }

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
}

export function initStore (isServer, userAgent = '', shareCode = '', shareInfo = {}) {
  logger.warn('init InviteStore')
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, userAgent, shareCode, shareInfo)
  } else {
    if (store === null) {
      store = new InviteStore(isServer, userAgent, shareCode, shareInfo)
    }
    return store
  }
}
