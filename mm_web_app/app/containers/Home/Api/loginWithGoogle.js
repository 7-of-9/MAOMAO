import { call, put, select } from 'redux-saga/effects';
import axios from 'axios';

import { MAOMAO_API_URL } from 'containers/App/constants';
import { googleConnectLoaded, googleConnectLoadingError, userHistory } from 'containers/App/actions';
import { acceptInviteCodes } from 'containers/Home/actions';
import { makeSelectGoogleConnect } from 'containers/App/selectors';

import { login, userId } from 'utils/simpleAuth';
import { md5hash } from 'utils/hash';

function* googleConnect(info) {
  const user = {
    email: info.profileObj.email,
    firstName: info.profileObj.familyName,
    lastName: info.profileObj.givenName,
    avatar: info.profileObj.imageUrl,
    google_user_id: info.googleId,
  };
  const apiUrl = `${MAOMAO_API_URL}user/google`;
  try {
    const { data } = yield call(axios, {
      method: 'post',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: user,
    });
    const userHash = md5hash(info.googleId);
    login(data.id, data.email, userHash);
    const userData = Object.assign({}, data, { userHash });
    yield put(googleConnectLoaded(userData));
    yield put(userHistory({ userId: userId() }));
    yield put(acceptInviteCodes());
  } catch (err) {
    yield put(googleConnectLoadingError(err));
  }
}

/**
 * user register/login with google account request/response handler
 */
export function* loginWithGoogle() {
  const data = yield select(makeSelectGoogleConnect());
  const { googleResponse } = data.toJS();
  yield call(googleConnect, googleResponse);
}
