import { action, reaction, when, observable } from 'mobx'
import { HomeStore } from './home'
import { MAOMAO_SITE_URL } from '../containers/App/constants'
import { acceptInvite } from '../services/share'
import { fetchImageSearchByTerm } from '../services/crawler'

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
       if (userHash > 0) {
         this.acceptInviteCode()
       }
     })
  }

  @action searchBgImage () {
    const { topic_title: topicTitle } = this.shareInfo
    if (topicTitle) {
      return fetchImageSearchByTerm(topicTitle, 1)
    }
    return Promise.resolve(`${MAOMAO_SITE_URL}static/images/logo.png`)
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
