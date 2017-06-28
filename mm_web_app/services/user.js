import axios from 'axios'
import { fromPromise } from 'mobx-utils'
import { MAOMAO_API_URL } from '../containers/App/constants'

export function testInternalUser () {
  const apiUrl = `${MAOMAO_API_URL}user/test`
  return fromPromise(axios({
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  }))
}

export function loginWithGoogle (info) {
  const names = info.name.split(' ')
  const firstName = names[0]
  const lastName = names.slice(1, names.length).join(' ')
  const user = {
    email: info.email,
    firstName,
    lastName,
    avatar: info.picture,
    google_user_id: info.google_user_id
  }
  const apiUrl = `${MAOMAO_API_URL}user/google`

  return fromPromise(axios({
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    data: user
  }))
}

export function loginWithFacebook (info) {
  const names = info.name.split(' ')
  const firstName = names[0]
  const lastName = names.slice(1, names.length).join(' ')

  const user = {
    email: info.email,
    firstName,
    lastName,
    avatar: info.picture,
    fb_user_id: info.fb_user_id
  }
  const apiUrl = `${MAOMAO_API_URL}user/fb`
  return fromPromise(axios({
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    data: user
  }))
}

export function getUserHistory (id, hash) {
  const apiUrl = `${MAOMAO_API_URL}user/homepage?user_id=${id}&hash=${hash}`
  return fromPromise(axios.get(apiUrl))
}
