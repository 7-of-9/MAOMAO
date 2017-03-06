import { delay } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import queryString from 'query-string';
import _ from 'lodash';

import request from 'utils/request';
import { LIMIT, CRALWER_API_URL } from 'containers/App/constants';
import { googleNewsLoaded, googleNewsLoadingError } from 'containers/App/actions';
import { makeSelectTerms, makeSelectPageNumber } from 'containers/HomePage/selectors';


function* googleNewsByTerm(term, page) {
  const query = queryString.stringify({
    type: 'google',
    url: `https://www.google.com/search?q=${encodeURI(term)}&tbm=nws&start=${LIMIT * (page - 1)}`,
  });
  const crawlerUrl = `${CRALWER_API_URL}?${query}`;
  try {
    const response = yield call(request, crawlerUrl);
    yield put(googleNewsLoaded(response.result, term));
  } catch (err) {
    yield put(googleNewsLoadingError(err));
  }
}

/**
 * Google news request/response handler
 */
export function* getGoogleNewsResult() {
  // Select terms from store
  const terms = yield select(makeSelectTerms());
  const keyword = terms.join(' ');
  if (keyword === '') {
    yield put(googleNewsLoaded([], terms));
  } else {
    const page = yield select(makeSelectPageNumber());
    yield [
      fork(googleNewsByTerm, keyword, page),
      _.map(terms, (term) => fork(googleNewsByTerm, term, page)),
      call(delay, 500),
    ];
  }
}
