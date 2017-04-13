import { takeLatest } from 'redux-saga/effects'
import { GOOGLE_CONNECT, FACEBOOK_CONNECT, USER_HISTORY } from '../../containers/App/constants'
import { ACCEPT_INVITE_CODES } from '../../containers/Home/constants'
import { loginWithGoogle } from '../../containers/Home/Api/loginWithGoogle'
import { loginWithFacebook } from '../../containers/Home/Api/loginWithFacebook'
import { userHistory } from '../../containers/Home/Api/userHistory'
import { acceptInvite } from '../../containers/Home/Api/acceptInvite'

/**
 * Root saga manages watcher lifecycle
 */
export function * googleConnectData () {
  yield takeLatest(GOOGLE_CONNECT, loginWithGoogle)
}

/**
 * Root saga manages watcher lifecycle
 */
export function * facebookConnectData () {
  yield takeLatest(FACEBOOK_CONNECT, loginWithFacebook)
}

/**
 * Root saga manages watcher lifecycle
 */
export function * userHistoryData () {
  yield takeLatest(USER_HISTORY, userHistory)
}

/**
 * Root saga manages watcher lifecycle
 */
export function * acceptInviteData () {
  yield takeLatest(ACCEPT_INVITE_CODES, acceptInvite)
}

// All sagas to be loaded
export default [
  googleConnectData,
  facebookConnectData,
  acceptInviteData,
  userHistoryData
]
