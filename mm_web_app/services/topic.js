import axios from 'axios'
import { fromPromise } from 'mobx-utils'
import queryString from 'query-string'
import { MAOMAO_API_URL } from '../containers/App/constants'

export function getAllTopicTree () {
  const apiUrl = `${MAOMAO_API_URL}topic_tree/get`
  return fromPromise(axios.get(apiUrl))
}

/* eslint-disable camelcase */
export function addBulkTopics (user_id, hash, t = []) {
  const apiUrl = `${MAOMAO_API_URL}user_topics/bulkadd?${queryString.stringify({user_id, hash, t})}`
  return fromPromise(axios.get(apiUrl))
}
