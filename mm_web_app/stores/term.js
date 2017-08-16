import {
  action,
  when,
  observable
 } from 'mobx'
import { rootDiscover, termDiscover } from '../services/topic'
import logger from '../utils/logger'

let store = null

class TermStore {
  @observable pendings = []
  @observable discoveries = []
  @observable terms = []

  @action getRootDiscover (userId, userHash) {
    logger.warn('getRootDiscover')
    const rootData = rootDiscover(userId, userHash)
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

  @action getTermDiscover (userId, userHash, termId) {
    logger.warn('getTermDiscover')
    const isExist = this.terms.find(item => item.termId === termId)
    if (!isExist) {
      const termData = termDiscover(userId, userHash, termId)
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

export function initTermStore (isServer) {
  if (isServer && typeof window === 'undefined') {
    return new TermStore(isServer)
  } else {
    if (store === null) {
      store = new TermStore(isServer)
    }
    return store
  }
}
