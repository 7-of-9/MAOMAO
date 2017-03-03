import { delay } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import queryString from 'query-string';
import _ from 'lodash';

import request from 'utils/request';
import { LIMIT, GOOGLE_API_KEY } from 'containers/App/constants';
import { googleKnowledgeLoaded, googleKnowledgeLoadingError } from 'containers/App/actions';
import { makeSelectTerms, makeSelectPageNumber } from 'containers/HomePage/selectors';

function* googleKnowlegeBaseOnTerm(term, page) {
  const buildQuery = queryString.stringify({
    query: term,
    key: GOOGLE_API_KEY,
    limit: LIMIT * page,
    indent: 'True',
  });
  const requestURL = `https://kgsearch.googleapis.com/v1/entities:search?${buildQuery}`;
  try {
    const result = yield call(request, requestURL);
    yield put(googleKnowledgeLoaded(result.itemListElement || [], term));
  } catch (err) {
    yield put(googleKnowledgeLoadingError(err));
  }
}

/**
 * Google Knowledge request/response handler
 */
export function* getGoogleKnowledge() {
  // Select terms from store
  const terms = yield select(makeSelectTerms());
  const keyword = terms.join('');
  if (keyword === '') {
    yield put(googleKnowledgeLoaded([], terms));
  } else {
    const page = yield select(makeSelectPageNumber());
    const asyncCall = [];
    _.forEach(terms, (term) => {
      asyncCall.push(fork(googleKnowlegeBaseOnTerm, term, page));
    });
    asyncCall.push(call(delay, 500));
    yield asyncCall;
  }
}
