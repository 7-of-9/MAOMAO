import { take, call, put, select, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import queryString from 'query-string';
import snoowrap from 'snoowrap';
import {
  GOOGLE_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET,
  GOOGLE_SEARCH, YOUTUBE_SEARCH, GOOGLE_KNOWLEDGE_SEARCH, GOOGLE_NEWS_SEARCH, REDDIT_SEARCH,
 } from 'containers/App/constants';
import {
  googleKnowledgeLoaded, googleKnowledgeLoadingError, youtubeLoaded, youtubeLoadingError,
  googleLoaded, googleLoadingError, googleNewsLoaded, googleNewsLoadingError,
  redditLoaded, redditLoadingError,
 } from 'containers/App/actions';

import request from 'utils/request';
import { makeSelectKeyword, makeSelectPageNumber } from 'containers/HomePage/selectors';
import { makeSelectYoutube } from 'containers/App/selectors';

const LIMIT = 10;
const CRALWER_API_URL = 'https://dunghd.stdlib.com/crawler@dev/';

// Use reddit-oauth-helper to create an permanent token
/* eslint new-cap: ["error", { "newIsCap": false }]*/
const r = new snoowrap({
  userAgent: 'webapp:maomao:v0.0.1 (by u/dunghd)',
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: '69838591-jrgIILLyZ9z8M_5Z7pQXqXwZ2Z4',
});
r.config({ debug: true });

/**
 * Google search request/response handler
 */
export function* getGoogleSearchResult() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  if (keyword === '') {
    yield put(googleLoaded([], keyword));
  } else {
    const page = yield select(makeSelectPageNumber());
    const query = queryString.stringify({
      type: 'google',
      url: `https://www.google.com/search?q=${encodeURI(keyword)}&start=${LIMIT * (page - 1)}`,
    });
    const crawlerUrl = `${CRALWER_API_URL}?${query}`;
    try {
      const response = yield call(request, crawlerUrl);
      yield put(googleLoaded(response.result, keyword));
    } catch (err) {
      yield put(googleLoadingError(err));
    }
  }
}

/**
 * Google news request/response handler
 */
export function* getGoogleNewsResult() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  if (keyword === '') {
    yield put(googleNewsLoaded([], keyword));
  } else {
    const page = yield select(makeSelectPageNumber());
    const query = queryString.stringify({
      type: 'google',
      url: `https://www.google.com/search?q=${encodeURI(keyword)}&tbm=nws&start=${LIMIT * (page - 1)}`,
    });
    const crawlerUrl = `${CRALWER_API_URL}?${query}`;
    try {
      const response = yield call(request, crawlerUrl);
      yield put(googleNewsLoaded(response.result, keyword));
    } catch (err) {
      yield put(googleNewsLoadingError(err));
    }
  }
}

/**
 * Google Knowledge request/response handler
 */
export function* getGoogleKnowledge() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  if (keyword === '') {
    yield put(googleKnowledgeLoaded([], keyword));
  } else {
    const page = yield select(makeSelectPageNumber());
    const buildQuery = queryString.stringify({
      query: keyword,
      key: GOOGLE_API_KEY,
      limit: LIMIT * page,
      indent: 'True',
    });
    const requestURL = `https://kgsearch.googleapis.com/v1/entities:search?${buildQuery}`;
    try {
      const result = yield call(request, requestURL);
      yield put(googleKnowledgeLoaded(result.itemListElement || [], keyword));
    } catch (err) {
      yield put(googleKnowledgeLoadingError(err));
    }
  }
}


/**
 * Google Youtube request/response handler
 */
export function* getYoutubeVideo() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  if (keyword === '') {
    yield put(youtubeLoaded({ nextPageToken: '', youtubeVideos: [] }, keyword));
  } else {
    const youtubeState = yield select(makeSelectYoutube());
    const pageToken = youtubeState.get('nextPageToken') || '';
    // Youtube API support those types: video, channel and playlist
    // For testing purpose, we will get only video
    const buildQuery = queryString.stringify({
      q: keyword,
      key: GOOGLE_API_KEY,
      maxResults: LIMIT,
      part: 'snippet',
      type: 'video',
      pageToken,
    });
    const requestURL = `https://www.googleapis.com/youtube/v3/search?${buildQuery}`;

    try {
      const result = yield call(request, requestURL);
      yield put(youtubeLoaded({ nextPageToken: result.nextPageToken, youtubeVideos: result.items || [] }, keyword));
    } catch (err) {
      yield put(youtubeLoadingError(err));
    }
  }
}

function redditSearchBaseOneKeyword(keyword, page) {
  return r.search({
    query: keyword,
    relevance: 'top',
    limit: LIMIT * page,
  });
}

/**
 * Reddit handler
 */
export function* getRedditListing() {
  // Select keyword from store
  const keyword = yield select(makeSelectKeyword());
  if (keyword === '') {
    yield put(redditLoaded([], keyword));
  } else {
    try {
      const page = yield select(makeSelectPageNumber());
      const result = yield call(redditSearchBaseOneKeyword, keyword, page);
      yield put(redditLoaded(result, keyword));
    } catch (err) {
      yield put(redditLoadingError(err));
    }
  }
}


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
