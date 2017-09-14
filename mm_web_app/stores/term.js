import { action, computed, reaction, when, observable } from 'mobx'
import { rootDiscover, termDiscover, getTerm } from '../services/topic'
import { isSameStringOnUrl } from '../utils/helper'
import logger from '../utils/logger'
import _ from 'lodash'

let store = null
// const MAX_ITEM_PER_PAGE = 120

class TermStore {
  @observable pendings = []
  @observable discoveries = []
  @observable page = 1
  @observable hasMore = true
  @observable findTerms = []
  terms = []
  userId = -1
  userHash = ''
  termsInfo = { terms: [] }

  constructor (isServer, findTerms, termsInfo) {
    this.findTerms = findTerms
    this.termsInfo = termsInfo
    reaction(() => this.page,
    (page) => {
      if (this.userId > 0) {
        logger.warn('reaction to page', page, this.userId, this.userHash)
        if (page === 1) {
          this.discoveries = []
        }
        this.getRootDiscover(this.userId, this.userHash, page)
      }
    })
  }

 @computed get isLoading () {
   return this.pendings.length > 0
 }

  @action setCurrentTerms (findTerms) {
    this.findTerms = findTerms
  }

  @action addNewTerm (newTerm) {
    if (!this.termsInfo.terms.find(item => isSameStringOnUrl(item.term_name, newTerm.term_name))) {
      this.termsInfo.terms.push(newTerm)
      const termInfo = getTerm(newTerm.term_id)
      when(
        () => termInfo.state !== 'pending',
        () => {
          if (termInfo.value.data) {
            const { term } = termInfo.value.data
            const terms = this.termsInfo.terms.filter(item => !isSameStringOnUrl(item.term_name, term.term_name))
            this.termsInfo.terms = [...terms, term]
          }
        }
      )
    }
  }

  @action getRootDiscover (userId, userHash, page) {
    logger.info('getRootDiscover', userId, userHash, page)
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
          logger.info('getRootDiscover result', discoveries)
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

  @action getTermDiscover (termId) {
    const isExist = _.find(this.terms, item => item.termId === termId)
    const isProcess = _.indexOf(this.pendings, `termData${termId}`) !== -1
    if (!isExist && !isProcess) {
      const termData = termDiscover(termId)
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

export function initTermStore (isServer, findTerms = [], termsInfo = { terms: [] }) {
  if (isServer && typeof window === 'undefined') {
    return new TermStore(isServer, findTerms, termsInfo)
  } else {
    if (store === null) {
      store = new TermStore(isServer, findTerms, termsInfo)
    }
    return store
  }
}
