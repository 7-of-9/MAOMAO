import { action, computed, reaction, when, observable } from 'mobx'
import { rootDiscover, termDiscover, getTerm, getAllTopicTree } from '../services/topic'
import logger from '../utils/logger'
import { isSameStringOnUrl } from '../utils/helper'
import _ from 'lodash'

let store = null

class TermStore {
  @observable pendings = []
  @observable discoveries = []
  @observable page = 1
  @observable hasMore = true
  @observable isProcessingTopicTree = false
  @observable findTerms = []
  tree = []
  terms = []
  termsCache = {}
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

 @action setTerms (findTerms) {
   for (let term of findTerms) {
     this.termsCache[term.term_id] = term
   }
 }

 @action getTopicTree (preload = false) {
   logger.warn('getTopicTree')
   if (!this.isProcessingTopicTree) {
     const allTopics = getAllTopicTree()
     this.isProcessingTopicTree = true
     when(
    () => allTopics.state !== 'pending',
    () => {
      this.isProcessingTopicTree = false
      const { tree } = allTopics.value.data
      this.tree = tree
      logger.warn('tree', tree)
      // preload 2 level
      if (preload) {
        _.forEach(tree, term => {
          this.termsCache[term.term_id] = term
          this.preloadTerm(term.term_id)
          _.forEach(term.child_topics, item => {
            this.termsCache[item.term_id] = item
            this.preloadTerm(item.term_id)
          })
        })
      }
    })
   }
 }

  @action setCurrentTerms (findTerms) {
    this.findTerms = findTerms
  }

  @action preloadTerm (termId) {
    const termInfo = getTerm(termId)
    logger.warn('preloadTerm', termId)
    when(
      () => termInfo.state !== 'pending',
      () => {
        if (termInfo.value.data) {
          const { term } = termInfo.value.data
          this.termsCache[term.term_id] = term
        }
        logger.info('preloadTerm result', termInfo.value.data)
      }
    )
  }

  @action loadNewTerm (termId) {
    if (!this.termsCache[termId] && this.pendings.indexOf(termId) === -1) {
      const termInfo = getTerm(termId)
      this.pendings.push(termId)
      logger.warn('loadNewTerm', termId)
      when(
        () => termInfo.state !== 'pending',
        () => {
          if (termInfo.value.data) {
            const { term } = termInfo.value.data
            this.termsCache[term.term_id] = term
          }
          this.pendings.splice(_.indexOf(this.pendings, termId), 1)
          logger.info('loadNewTerm result', this.pendings, termInfo.value.data)
        }
      )
    }
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
