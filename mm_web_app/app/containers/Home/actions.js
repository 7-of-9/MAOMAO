/*
 *
 * Home actions
 *
 */

import {
  CHANGE_TERM,
  CHANGE_SUB_TERM,
  NEW_INVITE_CODE,
  ACCEPT_INVITE_CODES,
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

export function newInviteCode(data) {
  return {
    type: NEW_INVITE_CODE,
    data,
  };
}

export function acceptInviteCodes() {
  return {
    type: ACCEPT_INVITE_CODES,
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
