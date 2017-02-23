import { take, call, put, select, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { GOOGLE_API_KEY, GOOGLE_SEARCH, YOUTUBE_SEARCH } from 'containers/App/constants';
import { googleLoaded, googleLoadingError, youtubeLoaded, youtubeLoadingError } from 'containers/App/actions';

import request from 'utils/request';
import { makeSelectKeyword, makeSelectPageNumber } from 'containers/HomePage/selectors';
import { makeSelectYoutube } from 'containers/App/selectors';

const LIMIT = 5;

/**
 * Google Knowledge request/response handler
 */
export function* getGoogleKnowledge() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  const page = yield select(makeSelectPageNumber());
  const requestURL = `https://kgsearch.googleapis.com/v1/entities:search?query=${keyword}&key=${GOOGLE_API_KEY}&limit=${LIMIT * page}&indent=True`;

  try {
    const result = yield call(request, requestURL);
    yield put(googleLoaded(result, keyword));
  } catch (err) {
    yield put(googleLoadingError(err));
  }
}


/**
 * Google Youtube request/response handler
 */
export function* getYoutubeVideo() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  const youtubeState = yield select(makeSelectYoutube());
  const pageToken = youtubeState.nextPageToken || '';
  const requestURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${keyword}&key=${GOOGLE_API_KEY}&maxResults=${LIMIT}&pageToken=${pageToken}`;

  try {
    const result = yield call(request, requestURL);
    yield put(youtubeLoaded(result, keyword));
  } catch (err) {
    yield put(youtubeLoadingError(err));
  }
}


/**
 * Root saga manages watcher lifecycle
 */
export function* googleData() {
  const watcher = yield takeLatest(GOOGLE_SEARCH, getGoogleKnowledge);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* youtubeData() {
  const watcher = yield takeLatest(YOUTUBE_SEARCH, getYoutubeVideo);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}
// All sagas to be loaded
export default [
  googleData,
  youtubeData,
];
