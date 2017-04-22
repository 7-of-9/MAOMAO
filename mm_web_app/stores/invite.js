import { action, reaction, when, observable, whyRun, toJS } from 'mobx'
import * as logger from 'loglevel'
import { HomeStore } from './home'
import { acceptInvite } from '../services/share'
import { googleImageSearchByTerm } from '../services/crawler'
import { hasInstalledExtension } from '../utils/chrome'

let store = null

class InviteStore extends HomeStore {
  @observable shareCode = ''
  @observable bgImage = ''
  @observable acceptInviteResult = {}
  @observable inviteResult = {}
  @observable shareInfo = {}

  constructor (isServer, userAgent, shareCode, shareInfo) {
    super(isServer, userAgent)
    this.shareCode = shareCode
    this.shareInfo = shareInfo
    reaction(() => this.userHash.length,
     (userHash) => {
       whyRun()
       if (userHash > 0) {
         logger.warn('yeah... acceptInviteCode')
         this.acceptInviteCode()
       }
     })
  }

  @action checkInstall () {
    if (this.isChrome && !this.isMobile) {
      logger.info('hasInstalledExtension', hasInstalledExtension())
      this.isInstall = !!hasInstalledExtension()
    }
  }

  @action searchBgImage () {
    const { topic_title: topicTitle } = this.shareInfo
    if (topicTitle) {
      const bgImageResult = googleImageSearchByTerm(topicTitle, 1)
      when(
        () => bgImageResult.state !== 'pending',
        () => {
          logger.info('bgImageResult', bgImageResult.value)
          const { result } = bgImageResult.value.data
          const images = toJS(result.filter(item => item.img && item.img.length > 0))
          logger.info('images', images)
          if (images.length > 0) {
            this.bgImage = images[Math.floor(Math.random() * images.length)].img
          }
          logger.warn('bgImage', this.bgImage)
        }
      )
    }
  }

  @action acceptInviteCode () {
    logger.info('acceptInviteCode', this.shareCode)
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
  logger.info('init InviteStore')
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, userAgent, shareCode, shareInfo)
  } else {
    if (store === null) {
      store = new InviteStore(isServer, userAgent, shareCode, shareInfo)
    }
    return store
  }
}
