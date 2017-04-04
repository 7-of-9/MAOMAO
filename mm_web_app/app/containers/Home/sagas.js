import { take, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { GOOGLE_CONNECT, FACEBOOK_CONNECT, USER_HISTORY } from 'containers/App/constants';
import { ACCEPT_INVITE_CODES } from 'containers/Home/constants';
import { loginWithGoogle } from 'containers/Home/Api/loginWithGoogle';
import { loginWithFacebook } from 'containers/Home/Api/loginWithFacebook';
import { userHistory } from 'containers/Home/Api/userHistory';
import { acceptInvite } from 'containers/Home/Api/acceptInvite';

/**
 * Root saga manages watcher lifecycle
 */
export function* googleConnectData() {
  const watcher = yield takeLatest(GOOGLE_CONNECT, loginWithGoogle);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* facebookConnectData() {
  const watcher = yield takeLatest(FACEBOOK_CONNECT, loginWithFacebook);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* userHistoryData() {
  const watcher = yield takeLatest(USER_HISTORY, userHistory);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* acceptInviteData() {
  const watcher = yield takeLatest(ACCEPT_INVITE_CODES, acceptInvite);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

// All sagas to be loaded
export default [
  googleConnectData,
  facebookConnectData,
  acceptInviteData,
  userHistoryData,
];
