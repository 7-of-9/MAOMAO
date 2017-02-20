import { take, call, put, select, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { GOOGLE_API_KEY, GOOGLE_SEARCH } from 'containers/App/constants';
import { googleLoaded, googleLoadingError } from 'containers/App/actions';

import request from 'utils/request';
import { makeSelectKeyword } from 'containers/HomePage/selectors';

const LIMIT = 10;

/**
 * Google Knowledge request/response handler
 */
export function* getGoogleKnowledge() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  const requestURL = `https://kgsearch.googleapis.com/v1/entities:search?query=${keyword}&key=${GOOGLE_API_KEY}&limit=${LIMIT}&indent=True`;

  try {
    const result = yield call(request, requestURL);
    yield put(googleLoaded(result, keyword));
  } catch (err) {
    yield put(googleLoadingError(err));
  }
}


/**
 * Root saga manages watcher lifecycle
 */
export function* googleData() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  const watcher = yield takeLatest(GOOGLE_SEARCH, getGoogleKnowledge);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}
// All sagas to be loaded
export default [
  googleData,
];
