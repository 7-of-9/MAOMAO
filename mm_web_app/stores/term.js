import { action, computed, reaction, when, observable } from 'mobx'
import { rootDiscover, termDiscover, getTerm, getAllTopicTree } from '../services/topic'
import logger from '../utils/logger'
import { isSameStringOnUrl } from '../utils/helper'
import _ from 'lodash'

let store = null

class TermStore {
  @observable.shallow discoveries = []
  @observable termsCache = {}
  @observable findTerms = []
  @observable pendings = []
  @observable page = 1
  @observable hasMore = true
  @observable isProcessingTopicTree = false
  @observable preloadProcesses = 0
  terms = []
  tree = []
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
   logger.warn('isLoading', this.pendings.length, this.pendings, this.preloadProcesses)
   return this.pendings.length > 0 || this.preloadProcesses > 0
 }

 @computed get isProcess () {
   logger.warn('isProcess', this.pendings.length, this.pendings)
   return this.pendings.length > 0
 }

 @action setTerms (findTerms) {
   logger.warn('setTerms', findTerms)
   for (let term of findTerms) {
     if (term.child_suggestions || term.child_topics) { this.termsCache[term.term_id] = term }
   }
 }

 @action getTopicTree () {
   logger.warn('getTopicTree')
   if (!this.isProcessingTopicTree && this.tree.length === 0) {
     const allTopics = getAllTopicTree()
     this.isProcessingTopicTree = true
     when(
    () => allTopics.state !== 'pending',
    () => {
      this.isProcessingTopicTree = false
      const { tree } = allTopics.value.data
      this.tree = tree
      _.forEach(tree, term => {
        this.termsCache[term.term_id] = term
        this.preloadTerm(term.term_id)
        _.forEach(term.child_topics, item => {
          this.termsCache[item.term_id] = item
          this.preloadTerm(item.term_id)
        })
      })
      logger.warn('tree', tree)
    })
   }
 }

  @action setCurrentTerms (findTerms) {
    this.findTerms = findTerms
  }

  @action preloadTerm (termId, tracking = true) {
    const termInfo = getTerm(termId)
    if (tracking) {
      this.preloadProcesses += 1
    }
    logger.warn('preloadTerm', termId)
    when(
      () => termInfo.state !== 'pending',
      () => {
        if (termInfo.value.data) {
          const { term } = termInfo.value.data
          this.termsCache[term.term_id] = term
        }
        logger.info('preloadTerm result', termInfo.value.data)
        if (tracking) {
          this.preloadProcesses -= 1
        }
      }
    )
  }

  @action loadNewTerm (termId) {
    const existTerm = this.termsCache[termId]
    logger.warn('loadNewTerm', termId, existTerm)
    const keyCache = `loadNewTerm-${termId}`
    if (
      (!existTerm && _.indexOf(this.pendings, keyCache) === -1) ||
      (
        existTerm &&
        (existTerm.child_suggestions.length === 0 || existTerm.child_topics.length === 0)
      )
    ) {
      const termInfo = getTerm(termId)
      this.pendings.push(keyCache)
      when(
        () => termInfo.state !== 'pending',
        () => {
          if (termInfo.value.data) {
            const { term } = termInfo.value.data
            this.termsCache[term.term_id] = term
          }
          this.pendings = this.pendings.filter(item => item !== keyCache)
          logger.info('loadNewTerm result', this.pendings, termInfo.value.data)
        }
      )
    }

    // preload for children and suggestion
    if (existTerm) {
      _.forEach(existTerm.child_suggestions, ({term_id: termId}) => {
        this.preloadTerm(termId)
      })
      _.forEach(existTerm.child_topics, ({term_id: termId}) => {
        this.preloadTerm(termId)
      })
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
    const keyCache = `getRootDiscover-${userId}-${userHash}-${page}`
    if (_.indexOf(this.pendings, keyCache) === -1) {
      this.pendings.push(keyCache)
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
          this.pendings = this.pendings.filter(item => item !== keyCache)
        }
      )
    }
  }

  @action loadMore () {
    this.page += 1
  }

  @action getTermDiscover (termId) {
    const isExist = _.find(this.terms, item => item.termId === termId)
    const keyCache = `getTermDiscover-${termId}`
    const isProcess = _.indexOf(this.pendings, keyCache) !== -1
    if (!isExist && !isProcess) {
      const termData = termDiscover(termId)
      this.pendings.push(keyCache)
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
          this.pendings = this.pendings.filter(item => item !== keyCache)
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
