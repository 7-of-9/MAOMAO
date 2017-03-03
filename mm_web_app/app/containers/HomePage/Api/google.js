import { call, put, select } from 'redux-saga/effects';
import queryString from 'query-string';

import request from 'utils/request';
import { LIMIT, CRALWER_API_URL } from 'containers/App/constants';
import { googleLoaded, googleLoadingError } from 'containers/App/actions';
import { makeSelectTerms, makeSelectPageNumber } from 'containers/HomePage/selectors';

function* googleSearchByTerm(term, page) {
  const query = queryString.stringify({
    type: 'google',
    url: `https://www.google.com/search?q=${encodeURI(term)}&start=${LIMIT * (page - 1)}`,
  });
  const crawlerUrl = `${CRALWER_API_URL}?${query}`;
  try {
    const { result } = yield call(request, crawlerUrl);
    yield put(googleLoaded(result, term));
  } catch (err) {
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
    yield call(googleSearchByTerm, keyword, page);
  }
}
