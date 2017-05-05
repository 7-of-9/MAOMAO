import { LIMIT, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } from '../containers/App/constants'
import { fromPromise } from 'mobx-utils'
const REDIDT_REFRESH_TOKEN = '69838591-jrgIILLyZ9z8M_5Z7pQXqXwZ2Z4'

// Use reddit-oauth-helper to create an permanent token
/* eslint new-cap: ["error", { "newIsCap": false }] */
/* global snoowrap */
const r = new snoowrap({
  userAgent: 'webapp:maomao:v0.0.3 (by u/dunghd)',
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: REDIDT_REFRESH_TOKEN
})
r.config({ debug: true })

export function redditListing (keyword, page) {
  return fromPromise(r.search({
    query: keyword,
    relevance: 'top',
    limit: LIMIT * page
  }))
}
