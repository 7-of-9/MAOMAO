import { action, reaction, when, observable } from 'mobx'
import { rootDiscover, termDiscover } from '../services/topic'
import logger from '../utils/logger'
import _ from 'lodash'

let store = null
// const MAX_ITEM_PER_PAGE = 120

class TermStore {
  @observable pendings = []
  @observable discoveries = []
  @observable page = 0
  @observable hasMore = true
  terms = []
  userId = -1
  userHash = ''

  constructor () {
    reaction(() => this.page,
    (page) => {
      if (this.userId > 0) {
        this.getRootDiscover(this.userId, this.userHash, page)
      }
    })
  }

  @action getRootDiscover (userId, userHash, page) {
    logger.warn('getRootDiscover', userId, userHash, page)
    this.page = page
    this.userId = userId
    this.userHash = userHash
    this.hasMore = false
    const rootData = rootDiscover(userId, userHash, page)
    this.pendings.push('rootData')
    when(
      () => rootData.state !== 'pending',
      () => {
        if (rootData.value && rootData.value.data) {
          const { discoveries } = rootData.value.data
          logger.warn('getRootDiscover result', discoveries)
          if (discoveries.length === 0) {
            this.hasMore = false
          } else {
            this.hasMore = true
          }
          _.forEach(discoveries, item => {
            if (!_.includes(this.discoveries, item)) {
              this.discoveries.push(item)
              // preload data for terms
              // this.getTermDiscover(userId, userHash, item.main_term_id)
              // this.getTermDiscover(userId, userHash, item.sub_term_id)
              // if (item.main_term_related_suggestions_term_ids && item.main_term_related_suggestions_term_ids.length) {
              //   _.forEach(item.main_term_related_suggestions_term_ids, termId => {
              //     this.getTermDiscover(userId, userHash, termId)
              //   })
              // }
            }
          })
          this.discoveries = _.uniqBy(this.discoveries, 'url')
        }
        this.pendings.splice(0, 1)
      }
    )
  }

  @action loadMore () {
    this.page += 1
  }

  @action getTermDiscover (userId, userHash, termId) {
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
              discoveries: _.uniqBy(discoveries, 'url') || []
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
