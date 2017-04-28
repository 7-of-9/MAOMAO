import { observable, computed, action } from 'mobx'
import PouchDB from 'pouchdb'
import Pusher from 'pusher-js'
import { isMobileBrowser, isChromeBrowser } from '../utils/detector'
import { PUSHER_KEY, USER_ID, USER_HASH } from '../containers/App/constants'
import { hasInstalledExtension, actionCreator, sendMsgToChromeExtension } from '../utils/chrome'

let store = null

const db = new PouchDB('mmdb')
const dev = process.env.NODE_ENV !== 'production'
Pusher.logToConsole = !!dev
const pusher = new Pusher(PUSHER_KEY, {
  cluster: 'ap1',
  encrypted: true
})

export class CoreStore {
  isMobile = false
  userAgent = {}
  channels = []
  user = null
  @observable isChrome = false
  @observable userHash = ''
  @observable userId = -1
  @observable isInstall = false
  @observable isLogin = false
  constructor (isServer, userAgent, user) {
    this.userAgent = userAgent
    this.user = user
    if (this.user) {
      this.isLogin = true
    }
    this.isMobile = isMobileBrowser(userAgent)
    db.get(USER_ID).then((doc) => {
      const userId = doc.userId
      if (userId && userId > 0) {
        this.userId = userId
        this.isLogin = true
        db.get(USER_HASH).then((doc) => {
          const userHash = doc.userHash
          if (userHash && userHash.length > 0) {
            this.userHash = userHash
          }
        }).catch(() => {
        })
      }
    }).catch(() => {
    })
  }

  @computed get isInstalledOnChromeDesktop () {
    return this.isInstall && this.isChrome && !this.isMobile
  }

  @action checkEnvironment () {
    this.isChrome = !!isChromeBrowser()
    if (this.isChrome) {
      this.isInstall = !!hasInstalledExtension()
    }
  }

  @action login (userId, userHash) {
    db.bulkDocs([
      {
        _id: USER_ID,
        userId: this.userId
      },
      {
        _id: USER_HASH,
        userHash: this.userHash
      }
    ]).then(() => {
    }).catch(() => {
    })
    this.isLogin = true
  }

  @action logout () {
    db.destroy().then(() => {
    }).catch(() => {
    })

    this.isLogin = false
  }

  @action autoLogin (auth) {
    const { isLogin, userId, userHash } = auth
    if (userId > 0) {
      this.isLogin = isLogin
      this.userId = userId
      this.userHash = userHash
      this.login(userId, userHash)
    }
  }

  @action logoutUser () {
    this.logout()
    if (this.isChrome && this.isInstall) {
      sendMsgToChromeExtension(actionCreator('AUTH_LOGOUT', {}))
    }
    this.isLogin = false
    this.userId = -1
    this.userHash = ''
    this.userHistory = null
  }

  @action onSubscribe (channelName, eventName, callback) {
    if (this.channels.indexOf(channelName) === -1) {
      const channel = pusher.subscribe(channelName)
      channel.bind(eventName, (data) => {
        callback(data)
      })
      this.channels.push(channelName)
    }
  }
}

export function initStore (isServer, userAgent = '', user = null) {
  if (isServer && typeof window === 'undefined') {
    return new CoreStore(isServer, userAgent, user)
  } else {
    if (store === null) {
      store = new CoreStore(isServer, userAgent, user)
    }
    return store
  }
}
