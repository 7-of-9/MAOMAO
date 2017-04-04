import { call, put, select } from 'redux-saga/effects';
import axios from 'axios';

import { MAOMAO_API_URL } from 'containers/App/constants';
import { facebookConnectLoaded, facebookConnectLoadingError, userHistory } from 'containers/App/actions';
import { acceptInviteCodes } from 'containers/Home/actions';
import { makeSelectFacebookConnect } from 'containers/App/selectors';

import { login, userId } from 'utils/simpleAuth';
import { md5hash } from 'utils/hash';

function* facebookConnect(info) {
  const names = info.name.split(' ');
  const firstName = names[0];
  const lastName = names.slice(1, names.length).join(' ');

  const user = {
    email: info.email,
    firstName,
    lastName,
    avatar: info.picture.data.url,
    fb_user_id: info.userID,
  };
  const apiUrl = `${MAOMAO_API_URL}user/fb`;
  try {
    const { data } = yield call(axios, {
      method: 'post',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: user,
    });
    const userHash = md5hash(info.userID);
    login(data.id, data.email, userHash);
    const userData = Object.assign({}, data, { userHash });
    yield put(facebookConnectLoaded(userData));
    yield put(userHistory(userId()));
    yield put(acceptInviteCodes());
  } catch (err) {
    yield put(facebookConnectLoadingError(err));
  }
}

/**
 * user register/login with facebook account request/response handler
 */
export function* loginWithFacebook() {
  const data = yield select(makeSelectFacebookConnect());
  const { facebookResponse } = data.toJS();
  yield call(facebookConnect, facebookResponse);
}
