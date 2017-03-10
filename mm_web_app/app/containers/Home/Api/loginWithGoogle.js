import { call, put, select } from 'redux-saga/effects';
import axios from 'axios';

import { MAOMAO_API_URL } from 'containers/App/constants';
import { googleConnectLoaded, googleConnectLoadingError } from 'containers/App/actions';
import { makeSelectGoogleConnect } from 'containers/App/selectors';


function* googleConnect(info) {
  const user = {
    email: info.profileObj.email,
    firstName: info.profileObj.familyName,
    lastName: info.profileObj.givenName,
    avatar: info.profileObj.imageUrl,
    google_user_id: info.googleId,
  };
  const apiUrl = `${MAOMAO_API_URL}users/google`;
  try {
    const { data } = yield call(axios, {
      method: 'post',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    yield put(googleConnectLoaded(data));
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
