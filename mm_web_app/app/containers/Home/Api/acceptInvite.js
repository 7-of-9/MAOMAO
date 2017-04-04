import { delay } from 'redux-saga';
import { call, fork, put, select } from 'redux-saga/effects';
import axios from 'axios';
import _ from 'lodash';
import { MAOMAO_API_URL } from 'containers/App/constants';
import { acceptShareLoaded, acceptShareLoadingError } from 'containers/Home/actions';
import { userHash, userId } from 'utils/simpleAuth';
import { makeSelectInviteCodes } from 'containers/Home/selectors';

function* acceptInviteCode(shareCode) {
  const apiUrl = `${MAOMAO_API_URL}share/accept?user_id=${userId()}&hash=${userHash()}&share_code=${shareCode}`;
  try {
    const { data } = yield call(axios, {
      method: 'get',
      url: apiUrl,
    });
    yield put(acceptShareLoaded({ shareCode, ...data }));
  } catch (error) {
    yield put(acceptShareLoadingError({ shareCode, error }));
  }
}

/**
 * user accept/share handler
 */
export function* acceptInvite() {
  const invite = yield select(makeSelectInviteCodes());
  const { codes } = invite;
  yield [
    _.map(codes, (shareCode) => fork(acceptInviteCode, shareCode)),
    call(delay, 500),
  ];
}
