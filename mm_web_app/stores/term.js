import {
  action,
  reaction,
  when,
  observable
 } from 'mobx'
import { CoreStore } from './core'
import { rootDiscover, termDiscover } from '../services/topic'
import logger from '../utils/logger'

let store = null

class TermStore extends CoreStore {
  @observable pendings = []
  @observable discoveries = []
  @observable terms = []

  constructor (isServer, userAgent, user) {
    super(isServer, userAgent, user)
    reaction(() => this.userHash.length,
      (userHash) => {
        if (userHash > 0) {
          this.getRootDiscover()
        }
      })
  }

  @action getRootDiscover () {
    logger.warn('getRootDiscover')
    const rootData = rootDiscover(this.userId, this.userHash)
    this.pendings.push('rootData')
    when(
      () => rootData.state !== 'pending',
      () => {
        if (rootData.value && rootData.value.data) {
          const { discoveries } = rootData.value.data
          this.discoveries = discoveries || []
        }
        this.pendings.splice(0, 1)
      }
    )
  }

  @action getTermDiscover (termId) {
    logger.warn('getTermDiscover')
    const isExist = this.terms.find(item => item.termId === termId)
    if (!isExist) {
      const termData = termDiscover(this.userId, this.userHash, termId)
      this.pendings.push('termData')
      when(
        () => termData.state !== 'pending',
        () => {
          if (termData.value && termData.value.data) {
            const { discoveries } = termData.value.data
            this.terms.push({
              termId,
              discoveries: discoveries || []
            })
          }
          this.pendings.splice(0, 1)
        }
      )
    }
  }
}

export function initTermStore (isServer, userAgent = '', user = null) {
  if (isServer && typeof window === 'undefined') {
    return new TermStore(isServer, userAgent, user)
  } else {
    if (store === null) {
      store = new TermStore(isServer, userAgent, user)
    }
    return store
  }
}
