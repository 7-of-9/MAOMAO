import { action, when, computed, observable } from 'mobx'
import { CoreStore } from './core'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'
import { googleNewsSearchByTerm, googleSearchByTerm } from '../services/crawler'
import { redditListing } from '../services/reddit'
import _ from 'lodash'
import logger from '../utils/logger'

let store = null

class DiscoveryStore extends CoreStore {
  youtubePageToken = ''
  page = 0
  youtubeResult = []
  redditResult = []
  googleResult = []
  googleNewsResult = []
  googleKnowledgeResult = []
  @observable pendings = []
  @observable terms = []

  @computed get hasMore () {
    return this.pendings.length === 0 && this.terms.length > 0
  }

  constructor (isServer, userAgent, terms) {
    super(isServer, userAgent)
    this.terms = terms
  }

  @action changeTerms (terms) {
    this.terms = terms
    if (this.terms.length === 0) {
      this.page = 0
      this.youtubePageToken = ''
    }
    this.redditResult = []
    this.googleResult = []
    this.googleNewsResult = []
    this.googleKnowledgeResult = []
    this.youtubeResult = []
  }

  @action loadMore () {
    this.page += 1
    logger.warn('yeah... load page', this.page)
    this.search()
  }

  @action search () {
    logger.warn('yeah... search')
    _.forEach(this.terms, (term) => {
      const googleSearch = googleSearchByTerm(term, this.page)
      this.pendings.push('google')
      const googleNewsSearch = googleNewsSearchByTerm(term, this.page)
      this.pendings.push('news')
      const googleKnowldge = googleKnowlegeSearchByTerm(term, this.page)
      this.pendings.push('knowledge')
      const youtubeVideo = youtubeSearchByKeyword(term, this.youtubePageToken)
      this.pendings.push('youtube')
      const reddit = redditListing(term, this.page)
      this.pendings.push('reddit')

      when(
        () => googleSearch.state !== 'pending',
        () => {
          logger.info('Got googleSearchs', term, googleSearch.value)
          const { result } = googleSearch.value.data
          this.googleResult.push(...result || [])
          this.pendings.splice(0, 1)
        }
      )

      when(
        () => googleNewsSearch.state !== 'pending',
        () => {
          logger.info('Got googleNewsSearchs', term, googleNewsSearch.value)
          const { result } = googleNewsSearch.value.data
          this.googleNewsResult.push(...result || [])
          this.pendings.splice(0, 1)
        }
      )

      when(
        () => googleKnowldge.state !== 'pending',
        () => {
          logger.info('Got googleKnowldges', term, googleKnowldge.value)
          const { itemListElement } = googleKnowldge.value.data
          this.googleKnowledgeResult.push(...itemListElement || [])
          this.pendings.splice(0, 1)
        }
      )

      when(
        () => youtubeVideo.state !== 'pending',
        () => {
          logger.info('Got youtubeVideos', term, youtubeVideo.value)
          const { items, nextPageToken } = youtubeVideo.value.data
          this.youtubeResult.push(...items || [])
          this.youtubePageToken = nextPageToken
          this.pendings.splice(0, 1)
        }
      )

      when(
        () => reddit.state !== 'pending',
        () => {
          logger.info('Got reddit', term, reddit.value)
          this.redditResult.push(...reddit.value || [])
          this.pendings.splice(0, 1)
        }
      )
    })
  }
}

export function initStore (isServer, userAgent = '', terms = []) {
  logger.info('DiscoveryStore')
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer, userAgent, terms)
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer, userAgent, terms)
    }
    return store
  }
}
