import { action, reaction, when, observable } from 'mobx'
import * as logger from 'loglevel'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'

let store = null

class DiscoveryStore {
  @observable terms = []
  @observable page = 1
}

export function initStore (isServer) {
  logger.warn('initStore')
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer)
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer)
    }
    return store
  }
}
