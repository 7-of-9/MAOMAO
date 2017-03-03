import { take, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import {
  GOOGLE_SEARCH, YOUTUBE_SEARCH, GOOGLE_KNOWLEDGE_SEARCH, GOOGLE_NEWS_SEARCH, REDDIT_SEARCH,
 } from 'containers/App/constants';
import { getGoogleSearchResult } from 'containers/HomePage/Api/google';
import { getGoogleNewsResult } from 'containers/HomePage/Api/news';
import { getGoogleKnowledge } from 'containers/HomePage/Api/gknowledge';
import { getYoutubeVideo } from 'containers/HomePage/Api/youtube';
import { getRedditListing } from 'containers/HomePage/Api/reddit';

/**
 * Root saga manages watcher lifecycle
 */
export function* googleSearchData() {
  const watcher = yield takeLatest(GOOGLE_SEARCH, getGoogleSearchResult);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* googleNewsData() {
  const watcher = yield takeLatest(GOOGLE_NEWS_SEARCH, getGoogleNewsResult);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* googleKnowledgeData() {
  const watcher = yield takeLatest(GOOGLE_KNOWLEDGE_SEARCH, getGoogleKnowledge);

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

/**
 * Root saga manages watcher lifecycle
 */
export function* redditData() {
  const watcher = yield takeLatest(REDDIT_SEARCH, getRedditListing);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}
// All sagas to be loaded
export default [
  googleKnowledgeData,
  googleNewsData,
  youtubeData,
  googleSearchData,
  redditData,
];
