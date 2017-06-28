import { action, when, computed, observable } from 'mobx'
import _ from 'lodash'
import { CoreStore } from './core'
import { googleKnowlegeSearchByTerm, youtubeSearchByKeyword } from '../services/google'
import { googleNewsSearchByTerm, googleSearchByTerm } from '../services/crawler'
import { redditListing } from '../services/reddit'
import { twitterSearch } from '../services/twitter'
import { vimeoVideo } from '../services/vimeo'
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
  vimeoResult = []
  @observable pendings = []
  @observable terms = []

  @computed get hasMore () {
    return this.pendings.length === 0 && this.terms.length > 0
  }

  constructor (isServer, userAgent, user, terms) {
    super(isServer, userAgent, user)
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
    this.vimeoResult = []
  }

  @action loadMore () {
    this.page += 1
    this.search()
  }

  @action search () {
    logger.warn('searh terms', this.terms)
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
      const vimeo = vimeoVideo(term, this.page)
      this.pendings.push('vimeo')
      const twitter = twitterSearch(term, this.page)
      this.pendings.push('twitter')

      when(
        () => googleSearch.state !== 'pending',
        () => {
          if (googleSearch.value && googleSearch.value.data) {
            const { result } = googleSearch.value.data
            this.googleResult.push(...(result || []))
            this.pendings.splice(0, 1)
          }
        }
      )

      when(
        () => googleNewsSearch.state !== 'pending',
        () => {
          if (googleNewsSearch.value && googleNewsSearch.value.data) {
            const { result } = googleNewsSearch.value.data
            this.googleNewsResult.push(...(result || []))
            this.pendings.splice(0, 1)
          }
        }
      )

      when(
        () => googleKnowldge.state !== 'pending',
        () => {
          if (googleKnowldge.value && googleKnowldge.value.data) {
            const { itemListElement } = googleKnowldge.value.data
            this.googleKnowledgeResult.push(...(itemListElement || []))
            this.pendings.splice(0, 1)
          }
        }
      )

      when(
        () => youtubeVideo.state !== 'pending',
        () => {
          if (youtubeVideo.value && youtubeVideo.value.data) {
            const { items, nextPageToken } = youtubeVideo.value.data
            this.youtubeResult.push(...(items || []))
            this.youtubePageToken = nextPageToken
            this.pendings.splice(0, 1)
          }
        }
      )

      when(
        () => reddit.state !== 'pending',
        () => {
          if (reddit.value) {
            this.redditResult.push(...(reddit.value || []))
            this.pendings.splice(0, 1)
          }
        }
      )

      when(
        () => vimeo.state !== 'pending',
        () => {
          if (vimeo.value && vimeo.value.data) {
            this.vimeoResult.push(...(vimeo.value.data.data || []))
            this.pendings.splice(0, 1)
          }
        }
      )

      when(
        () => twitter.state !== 'pending',
        () => {
          logger.warn('twitter', twitter.value)
          this.pendings.splice(0, 1)
        }
      )
    })
  }
}

export function initDiscoveryStore (isServer, userAgent = '', user = null, terms = []) {
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer, userAgent, user, terms)
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer, userAgent, user, terms)
    }
    return store
  }
}
