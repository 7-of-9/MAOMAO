import { action, observable } from 'mobx'
import { CoreStore } from './core'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'
import * as logger from 'loglevel'

let store = null

class DiscoveryStore extends CoreStore {
  @observable terms = []
  @observable page = 1
  @observable youtubePageToken = ''
  @observable googleKnowledgeResult = {}
  @observable youtubeResult = {}

  constructor (isServer, userAgent, terms) {
    super(isServer, userAgent)
    this.terms = terms
  }

  @action changeTerms (terms) {
    this.terms = terms
  }

  @action search (page) {
    this.page = page
    this.googleKnowledgeResult = googleKnowlegeSearchByTerm(this.terms.join(' '), this.page)
    this.youtubeResult = youtubeSearchByKeyword(this.terms.join(' '), this.youtubePageToken)
  }
}

export function initStore (isServer, userAgent = '', terms = []) {
  logger.warn('DiscoveryStore')
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer, userAgent, terms)
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer, userAgent, terms)
    }
    return store
  }
}
