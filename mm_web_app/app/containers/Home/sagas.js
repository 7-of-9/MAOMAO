import { take, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { GOOGLE_CONNECT, USER_HISTORY } from 'containers/App/constants';
import { loginWithGoogle } from 'containers/Home/Api/loginWithGoogle';
import { userHistory } from 'containers/Home/Api/userHistory';

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
export function* userHistoryData() {
  const watcher = yield takeLatest(USER_HISTORY, userHistory);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

// All sagas to be loaded
export default [
  googleConnectData,
  userHistoryData,
];
