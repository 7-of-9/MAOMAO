import { delay } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import _ from 'lodash';
import snoowrap from 'snoowrap';

import { LIMIT, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } from 'containers/App/constants';
import { redditLoaded, redditLoadingError } from 'containers/App/actions';
import { makeSelectTerms, makeSelectPageNumber } from 'containers/HomePage/selectors';


// Use reddit-oauth-helper to create an permanent token
/* eslint new-cap: ["error", { "newIsCap": false }]*/
const r = new snoowrap({
  userAgent: 'webapp:maomao:v0.0.1 (by u/dunghd)',
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: '69838591-jrgIILLyZ9z8M_5Z7pQXqXwZ2Z4',
});
r.config({ debug: true });


function* redditSearchByTerm(term, page) {
  const { result, error } = yield call(redditListing, term, page);
  if (result) {
    yield put(redditLoaded(result, term));
  } else {
    yield put(redditLoadingError(error));
  }
}

function redditListing(keyword, page) {
  return r.search({
    query: keyword,
    relevance: 'top',
    limit: LIMIT * page,
  }).then((result) => ({ result }))
  .catch((error) => ({ error }));
}

/**
 * Reddit handler
 */
export function* getRedditListing() {
  // Select terms from store
  const terms = yield select(makeSelectTerms());
  const keyword = terms.join(' ');
  if (keyword === '') {
    yield put(redditLoaded([], terms));
  } else {
    const page = yield select(makeSelectPageNumber());
    const asyncCall = [];
    _.forEach(terms, (term) => {
      asyncCall.push(fork(redditSearchByTerm, term, page));
    });
    asyncCall.push(call(delay, 500));
    yield asyncCall;
  }
}
