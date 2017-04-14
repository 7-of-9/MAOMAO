import { fromPromise } from 'mobx-utils'
import { MAOMAO_API_URL } from '../containers/App/constants'
import request from '../utils/request'
export function getShareInfo (code) {
  return fromPromise(request(`${MAOMAO_API_URL}share/info?share_code=${code}`))
}
