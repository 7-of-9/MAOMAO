import { call, put, select } from 'redux-saga/effects';
import axios from 'axios';

import { MAOMAO_API_URL } from 'containers/App/constants';
import { userHistoryLoaded, userHistoryLoadingError } from 'containers/App/actions';
import { makeSelectGoogleConnect } from 'containers/App/selectors';

function* getUserHistory(userId, userHash) {
  const apiUrl = `${MAOMAO_API_URL}users/home?user_id=${userId}&hash=${userHash}`;
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
  const data = yield select(makeSelectGoogleConnect());
  const { user } = data.toJS();
  yield call(getUserHistory, user.id);
}
