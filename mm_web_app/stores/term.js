import { action, when, observable } from 'mobx'
import { rootDiscover, termDiscover } from '../services/topic'
import logger from '../utils/logger'
import _ from 'lodash'

let store = null
const MAX_ITEM_PER_PAGE = 50

class TermStore {
  @observable pendings = []
  @observable discoveries = []
  @observable terms = []
  @observable page = 0
  @observable hasMore = true

  @action getRootDiscover (userId, userHash, page) {
    logger.warn('getRootDiscover')
    this.page = page
    this.hasMore = false
    const rootData = rootDiscover(userId, userHash, page)
    this.pendings.push('rootData')
    when(
      () => rootData.state !== 'pending',
      () => {
        if (rootData.value && rootData.value.data) {
          const { discoveries } = rootData.value.data
          logger.warn('getRootDiscover', discoveries)
          if (discoveries.length < MAX_ITEM_PER_PAGE) {
            this.hasMore = false
          } else {
            this.hasMore = true
          }
          _.forEach(discoveries, item => {
            if (!_.includes(this.discoveries, item)) {
              this.discoveries.push(item)
            }
          })
          this.discoveries = _.uniqBy(this.discoveries, 'disc_url_id')
        }
        this.pendings.splice(0, 1)
      }
    )
  }

  @action loadMore () {
    this.page += 1
  }

  @action getTermDiscover (userId, userHash, termId) {
    logger.warn('getTermDiscover')
    const isExist = this.terms.find(item => item.termId === termId)
    const isProcess = this.pendings.indexOf(`termData${termId}`) !== -1
    if (!isExist && !isProcess) {
      const termData = termDiscover(userId, userHash, termId)
      this.pendings.push(`termData${termId}`)
      when(
        () => termData.state !== 'pending',
        () => {
          if (termData.value && termData.value.data) {
            const { discoveries } = termData.value.data
            this.terms.push({
              termId,
              discoveries: _.uniqBy(discoveries, 'disc_url_id') || []
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
