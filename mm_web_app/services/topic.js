import axios from 'axios'
import { fromPromise } from 'mobx-utils'
import { MAOMAO_API_URL } from '../containers/App/constants'

export function getAllTopicTree () {
  const apiUrl = `${MAOMAO_API_URL}topic_tree/get`
  return fromPromise(axios.get(apiUrl))
}
