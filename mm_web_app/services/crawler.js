import { fromPromise } from 'mobx-utils'
import axios from 'axios'
import queryString from 'query-string'
import { LIMIT, CRALWER_API_URL } from '../containers/App/constants'

export function googleSearchByTerm (term, page) {
  const query = queryString.stringify({
    type: 'google',
    url: `https://www.google.com/search?q=${encodeURI(term)}&start=${LIMIT * (page - 1)}`
  })
  const crawlerUrl = `${CRALWER_API_URL}?${query}`
  return fromPromise(axios.get(crawlerUrl))
}

export function googleNewsSearchByTerm (term, page) {
  const query = queryString.stringify({
    type: 'google',
    url: `https://www.google.com/search?q=${encodeURI(term)}&tbm=nws&start=${LIMIT * (page - 1)}`
  })
  const crawlerUrl = `${CRALWER_API_URL}?${query}`
  return fromPromise(axios.get(crawlerUrl))
}
