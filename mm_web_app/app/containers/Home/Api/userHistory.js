import { call, put } from 'redux-saga/effects';
import axios from 'axios';

import { MAOMAO_API_URL } from 'containers/App/constants';
import { userHistoryLoaded, userHistoryLoadingError } from 'containers/App/actions';
import { userHash, userId } from 'utils/simpleAuth';

/* eslint-disable camelcase */
function* getUserHistory() {
  const apiUrl = `${MAOMAO_API_URL}user/streams?user_id=${userId()}&hash=${userHash()}`;
  try {
    const { data } = yield call(axios, {
      method: 'get',
      url: apiUrl,
    });
    yield put(userHistoryLoaded(data));
  } catch (err) {
    yield put(userHistoryLoadingError(err));
  }
}

/**
 * user register/login with google account request/response handler
 */
export function* userHistory() {
  yield call(getUserHistory);
}
