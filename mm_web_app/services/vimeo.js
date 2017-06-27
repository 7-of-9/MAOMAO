import axios from 'axios'
import { fromPromise } from 'mobx-utils'
import { VIMEO_TOKEN } from '../containers/App/constants'

export function vimeoVideo (keyword, page = 1, limit = 10) {
  const VIMEO_URL = `https://api.vimeo.com/videos?page=${page}&per_page=${limit}&query=${keyword}&sort=relevant`
  return fromPromise(axios({
    method: 'get',
    url: VIMEO_URL,
    headers: {
      Authorization: `Bearer ${VIMEO_TOKEN}`
    }
  }))
}
