import { observable, computed, action } from 'mobx'
import Pusher from 'pusher-js'
import { isMobileBrowser, browserName } from '../utils/detector'
import { PUSHER_KEY } from '../containers/App/constants'
import { hasInstalledExtension, actionCreator, sendMsgToChromeExtension } from '../utils/chrome'
import logger from '../utils/logger'
import { downloadPhoto } from '../utils/google'

let store = null

const dev = process.env.NODE_ENV !== 'production'
Pusher.logToConsole = !!dev

export class CoreStore {
  isMobile = false
  userAgent = {}
  channels = []
  user = null
  pusher = null
  browserName = ''
  @observable.ref contacts = []
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
    this.browserName = browserName()
  }

  @computed get isInstalledOnChromeDesktop () {
    return this.isInstall && this.isChrome && !this.isMobile
  }

  @action resetData () {
    this.contacts = []
    this.channels = []
  }

  @action checkEnvironment () {
    this.isChrome = this.browserName === 'chrome'
    logger.warn('browserName', this.browserName)
  }

  @action checkInstall () {
    if (this.isChrome && !this.isMobile) {
      const checkInstall = !!hasInstalledExtension()
      if (checkInstall !== this.isInstall) {
        this.isInstall = checkInstall
        if (this.isInstall && this.isChrome && !this.isMobile && this.userId < 0) {
          sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
            if (error) {
              logger.warn('WEB_CHECK_AUTH error', error)
            } else {
              this.autoLogin(data.payload)
            }
          })
        }
      }
    }
    logger.info('checkInstall isChrome, isMobile, isInstalledOnChromeDesktop', this.isChrome, this.isMobile, this.isInstalledOnChromeDesktop)
  }

  @action checkGoogleContacts () {
    logger.warn('checkGoogleContacts')
    if (this.isInstall && this.userId > 0) {
      sendMsgToChromeExtension(actionCreator('WEB_GOOGLE_CONTACTS', {}), (error, data) => {
        if (error) {
          logger.warn('WEB_GOOGLE_CONTACTS error', error)
        } else {
          this.contacts = data.payload
          logger.warn('contacts', this.contacts)
        }
      })
    }
  }

  @action saveGoogleContacts (contacts, googleToken, googleUserId) {
    logger.warn('saveGoogleContacts', contacts, googleToken, googleUserId)
    this.contacts = contacts
    if (this.isInstall) {
      downloadPhoto(googleToken, googleUserId)
    }
  }

  @action login (userId, userHash) {
    this.userId = userId
    this.userHash = userHash
    this.isLogin = true
  }

  @action logout () {
    this.userId = -1
    this.userHash = ''
    this.isLogin = false
    this.resetData()
  }

  @action autoLogin (auth) {
    const { userId, userHash, info } = auth
    if (userId > 0) {
      this.isLogin = true
      this.user = info
      this.login(userId, userHash)
    }
  }

  @action logoutUser () {
    if (this.isInstall && this.isChrome && !this.isMobile) {
      sendMsgToChromeExtension(actionCreator('AUTH_LOGOUT', {}))
    }
    this.logout()
  }

  @action onSubscribe (channelName, eventName, callback) {
    if (this.channels.indexOf(channelName) === -1) {
      logger.warn('channelName', channelName)
      if (!this.pusher) {
        this.pusher = new Pusher(PUSHER_KEY, {
          cluster: 'ap1',
          encrypted: true
        })
      }
      const channel = this.pusher.subscribe(channelName)
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
