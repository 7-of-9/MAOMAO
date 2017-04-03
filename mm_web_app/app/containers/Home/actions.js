/*
 *
 * Home actions
 *
 */

import {
  CHANGE_TERM,
  CHANGE_SUB_TERM,
  ACCEPT_INVITE_CODE,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_ERROR,
} from './constants';

export function changeTerm(data) {
  return {
    type: CHANGE_TERM,
    data,
  };
}

export function changeSubTerm(data) {
  return {
    type: CHANGE_SUB_TERM,
    data,
  };
}

export function acceptInviteCode(data) {
  return {
    type: ACCEPT_INVITE_CODE,
    data,
  };
}

export function acceptShareLoaded(data) {
  return {
    type: ACCEPT_INVITE_SUCCESS,
    data,
  };
}

export function acceptShareLoadingError(data) {
  return {
    type: ACCEPT_INVITE_ERROR,
    data,
  };
}
