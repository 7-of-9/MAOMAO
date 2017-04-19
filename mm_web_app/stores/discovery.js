import { action, reaction, when, observable } from 'mobx'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'
import * as logger from 'loglevel'

let store = null

class DiscoveryStore {
  @observable terms = []
  @observable page = 1

  @action changeTerms (terms) {
    this.terms = terms
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
