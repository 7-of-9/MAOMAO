import { observable } from 'mobx'

let store = null

class DiscoveryStore {
  @observable tags = []
}

export function initStore (isServer) {
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer)
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer)
    }
    return store
  }
}
