import axios from 'axios'
import { fromPromise } from 'mobx-utils'

export function twitterSearch (keyword, maxId) {
  const apiUrl = '/api/twitter'
  return fromPromise(axios({
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      keyword,
      maxId
    }
  }))
}
