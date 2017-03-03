import { delay } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import queryString from 'query-string';
import _ from 'lodash';

import request from 'utils/request';
import { LIMIT, CRALWER_API_URL } from 'containers/App/constants';
import { googleLoaded, googleLoadingError } from 'containers/App/actions';
import { makeSelectTerms, makeSelectPageNumber } from 'containers/HomePage/selectors';

function* googleSearchBaseOnTerm(term, page) {
  const query = queryString.stringify({
    type: 'google',
    url: `https://www.google.com/search?q=${encodeURI(term)}&start=${LIMIT * (page - 1)}`,
  });
  const crawlerUrl = `${CRALWER_API_URL}?${query}`;
  try {
    const { result } = yield call(request, crawlerUrl);
    console.log('google result', term, result, page);
    yield put(googleLoaded(result, term));
  } catch (err) {
    console.log('google result error', err, term, page);
    yield put(googleLoadingError(err));
  }
}

/**
 * Google search request/response handler
 */
export function* getGoogleSearchResult() {
  // Select terms from store
  const terms = yield select(makeSelectTerms());
  const keyword = terms.join(' ');
  if (keyword === '') {
    yield put(googleLoaded([], terms));
  } else {
    const page = yield select(makeSelectPageNumber());
    const asyncCall = [];
    _.forEach(terms, (term) => {
      asyncCall.push(fork(googleSearchBaseOnTerm, term, page));
    });
    asyncCall.push(call(delay, 1000));
    const response = yield asyncCall;
    console.log('response', response);
  }
}
