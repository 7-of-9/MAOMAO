import { observable, computed, action } from 'mobx'
import PouchDB from 'pouchdb'
import Pusher from 'pusher-js'
import * as logger from 'loglevel'
import { isMobileBrowser, isChromeBrowser } from '../utils/detector'
import { hasInstalledExtension, actionCreator, sendMsgToChromeExtension } from '../utils/chrome'

let store = null
const USER_ID = 'MM_USER_ID'
const USER_HASH = 'MM_USER_HASH'
const PUSHER_KEY = '056a3bc19f7b681fd6fb'
const db = new PouchDB('mmdb')

Pusher.logToConsole = true
const pusher = new Pusher(PUSHER_KEY, {
  cluster: 'ap1',
  encrypted: true
})

export class CoreStore {
  isMobile = false
  userAgent = {}
  channels = []
  @observable isChrome = false
  @observable userHash = ''
  @observable userId = -1
  @observable isInstall = false
  @observable isLogin = false
  constructor (isServer, userAgent) {
    this.userAgent = userAgent
    this.isMobile = isMobileBrowser(userAgent)
    db.get(USER_ID).then((doc) => {
      const userId = doc.userId
      logger.warn('userId', userId)
      if (userId && userId > 0) {
        this.userId = userId
        this.isLogin = true
      }
    }).catch((err) => {
      logger.info('guest', err)
    })
    db.get(USER_HASH).then((doc) => {
      const userHash = doc.userHash
      logger.warn('userHash', userHash)
      if (userHash && userHash.length > 0) {
        this.userHash = userHash
      }
    }).catch((err) => {
      logger.info('guest', err)
    })
  }

  @computed get isInstalledOnChromeDesktop () {
    return this.isInstall && this.isChrome && !this.isMobile
  }

  @action checkEnvironment () {
    logger.info('checkEnvironment')
    this.isChrome = !!isChromeBrowser()
    if (this.isChrome) {
      logger.info('hasInstalledExtension', hasInstalledExtension())
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
    ]).then((response) => {
      logger.warn('save db', response)
    }).catch((err) => {
      logger.error(err)
    })
    this.isLogin = true
  }

  @action logout () {
    db.get(USER_ID).then((doc) => {
      db.remove(doc)
    }).then((response) => {
      logger.warn('clear USER_ID')
    }).catch((err) => {
      logger.error(err)
    })

    db.get(USER_HASH).then((doc) => {
      db.remove(doc)
    }).then((response) => {
      logger.warn('clear USER_HASH')
    }).catch((err) => {
      logger.error(err)
    })

    this.isLogin = false
  }

  @action autoLogin (auth) {
    logger.warn('autoLogin', auth)
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

export function initStore (isServer, userAgent = '') {
  logger.info('init CoreStore')
  if (isServer && typeof window === 'undefined') {
    return new CoreStore(isServer, userAgent)
  } else {
    if (store === null) {
      store = new CoreStore(isServer, userAgent)
    }
    return store
  }
}
