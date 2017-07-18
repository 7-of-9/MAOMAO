import { fromPromise } from 'mobx-utils'
import axios from 'axios'
import queryString from 'query-string'
import { LIMIT, GOOGLE_API_KEY } from '../containers/App/constants'

/**
 * Google knowledge search base on term
 * @param string term
 * @param number page
 * @return promise object
 */
export function googleKnowlegeSearchByTerm (term, page) {
  const buildQuery = queryString.stringify({
    query: term,
    key: GOOGLE_API_KEY,
    limit: LIMIT * page,
    indent: 'True'
  })
  const requestURL = `https://kgsearch.googleapis.com/v1/entities:search?${buildQuery}`
  return fromPromise(axios.get(requestURL))
}

/**
 * Search youtube by keyword and page token
 * @param string keyword
 * @param number pageToken
 * @return promise object
 */
export function youtubeSearchByKeyword (keyword, pageToken) {
  const buildQuery = queryString.stringify({
    q: keyword,
    key: GOOGLE_API_KEY,
    maxResults: LIMIT,
    part: 'snippet',
    type: 'video',
    pageToken
  })
  const requestURL = `https://www.googleapis.com/youtube/v3/search?${buildQuery}`
  return fromPromise(axios.get(requestURL))
}

/**
 * Checking the urls is safe or not
 * @param array urls
 */
export function safeBrowsingLoockup (urls = []) {
  const requestURL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`
  return fromPromise(axios({
    method: 'post',
    url: requestURL,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      client: {
        clientId: 'mmweb',
        clientVersion: '1.0.0'
      },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: urls.map(item => ({ url: item }))
      }
    }
  }))
}
