import { action, reaction, when, observable, whyRun, toJS } from 'mobx'
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

  constructor (isServer, userAgent, user, shareCode, shareInfo) {
    super(isServer, userAgent, user)
    this.shareCode = shareCode
    this.shareInfo = shareInfo
    reaction(() => this.userHash.length,
     (userHash) => {
       whyRun()
       if (userHash > 0) {
         this.acceptInviteCode()
       }
     })
    this.searchBgImage()
  }

  @action checkInstall () {
    if (this.isChrome && !this.isMobile) {
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
          const { result } = bgImageResult.value.data
          const images = toJS(result.filter(item => item.img && item.img.length > 0))
          if (images.length > 0) {
            this.bgImage = images[Math.floor(Math.random() * images.length)].img
          }
        }
      )
    }
  }

  @action acceptInviteCode () {
    this.acceptInviteResult = acceptInvite(this.userId, this.userHash, this.shareCode)
    when(
      () => this.acceptInviteResult.state !== 'pending',
      () => {
        this.inviteResult = this.acceptInviteResult.value
        this.getUserHistory()
      }
    )
  }
}

export function initStore (isServer, userAgent = '', user = null, shareCode = '', shareInfo = {}) {
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, userAgent, user, shareCode, shareInfo)
  } else {
    if (store === null) {
      store = new InviteStore(isServer, userAgent, user, shareCode, shareInfo)
    }
    return store
  }
}
