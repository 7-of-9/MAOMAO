import { Twitter } from 'twitter-node-client'
import { fromPromise } from 'mobx-utils'
import { LIMIT, TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_TOKEN, TWITTER_TOKEN_SECRET } from '../containers/App/constants'

export function twitterSearch (keyword, page) {
  const twitter = new Twitter({
    consumerKey: TWITTER_API_KEY,
    consumerSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_TOKEN,
    accessTokenSecret: TWITTER_TOKEN_SECRET
  })
  return fromPromise(new Promise((resolve, reject) => {
    twitter.getSearch({
      q: keyword, count: page * LIMIT, result_type: 'recent'
    },
     (error) => reject(error),
     (tweets) => resolve(tweets))
  }))
}
