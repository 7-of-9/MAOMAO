import 'isomorphic-fetch'
import { MAOMAO_API_URL } from '../containers/App/constants'
import { fromPromise } from 'mobx-utils'
/* global fetch */
export function getShareInfo (code) {
  return fromPromise(fetch(`${MAOMAO_API_URL}share/info?share_code=${code}`))
}
