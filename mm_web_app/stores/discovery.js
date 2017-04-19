import { action, observable } from 'mobx'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'
import * as logger from 'loglevel'

let store = null

class DiscoveryStore {
  @observable terms = []
  @observable page = 1
  @observable youtubePageToken = ''
  @observable googleKnowledgeResult = {}
  @observable youtubeResult = {}

  @action changeTerms (terms) {
    this.terms = terms
  }

  @action search (page) {
    this.page = page
    this.googleKnowledgeResult = googleKnowlegeSearchByTerm(this.terms.join(' '), this.page)
    this.youtubeResult = youtubeSearchByKeyword(this.terms.join(' '), this.youtubePageToken)
  }

  constructor (isServer, terms) {
    this.terms = terms
  }
}

export function initStore (isServer, terms = []) {
  logger.warn('DiscoveryStore')
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer, terms)
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer, terms)
    }
    return store
  }
}
