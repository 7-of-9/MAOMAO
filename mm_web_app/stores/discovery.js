import { action, reaction, when, observable } from 'mobx'
import { CoreStore } from './core'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'
import { googleNewsSearchByTerm, googleSearchByTerm } from '../services/crawler'
import { redditListing } from '../services/reddit'
import _ from 'lodash'
import * as logger from 'loglevel'

let store = null

class DiscoveryStore extends CoreStore {
  @observable terms = []
  @observable page = 1
  @observable youtubePageToken = ''
  @observable redditResult = []
  @observable googleResult = []
  @observable googleNewsResult = []
  @observable googleKnowledgeResult = []
  @observable youtubeResult = []

  constructor (isServer, userAgent, terms) {
    super(isServer, userAgent)
    this.terms = terms
    reaction(() => this.terms.length,
     (terms) => {
       this.page = 1
       this.youtubePageToken = ''
       this.redditResult = []
       this.googleResult = []
       this.googleNewsResult = []
       this.googleKnowledgeResult = []
       this.youtubeResult = []
       if (terms > 0) {
         logger.warn('yeah... search')
         this.search()
       }
     })
    reaction(() => this.page,
     (page) => {
       logger.warn('yeah... load page', page)
       if (page > 1 && this.terms.length() > 0) {
         this.search()
       }
     })
  }

  @action changeTerms (terms) {
    this.terms = terms
  }

  @action loadMore () {
    this.page += 1
  }

  @action search () {
    _.forEach(this.terms, (term) => {
      const googleSearch = googleSearchByTerm(term, this.page)
      const googleNewsSearch = googleNewsSearchByTerm(term, this.page)
      const googleKnowldge = googleKnowlegeSearchByTerm(term, this.page)
      const youtubeVideo = youtubeSearchByKeyword(term, this.youtubePageToken)
      const reddit = redditListing(term, this.page)

      when(
        () => googleSearch.state !== 'pending',
        () => {
          logger.info('Got googleSearchs', term, googleSearch.value)
          const { result } = googleSearch.value.data
          this.googleResult.push(...result || [])
        }
      )

      when(
        () => googleNewsSearch.state !== 'pending',
        () => {
          logger.info('Got googleNewsSearchs', term, googleNewsSearch.value)
          const { result } = googleNewsSearch.value.data
          this.googleNewsResult.push(...result || [])
        }
      )

      when(
        () => googleKnowldge.state !== 'pending',
        () => {
          logger.info('Got googleKnowldges', term, googleKnowldge.value)
          const { itemListElement } = googleKnowldge.value.data
          this.googleKnowledgeResult.push(...itemListElement || [])
        }
      )

      when(
        () => youtubeVideo.state !== 'pending',
        () => {
          logger.info('Got youtubeVideos', term, youtubeVideo.value)
          const { items, nextPageToken } = youtubeVideo.value.data
          this.youtubeResult.push(...items || [])
          this.youtubePageToken = nextPageToken
        }
      )

      when(
        () => reddit.state !== 'pending',
        () => {
          logger.info('Got reddit', term, reddit.value)
          this.redditResult.push(...reddit.value || [])
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
