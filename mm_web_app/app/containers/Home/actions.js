/*
 *
 * Home actions
 *
 */

import {
  CHANGE_TERM,
  CHANGE_FRIEND_STREAM,
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

export function changeFriendStream(data) {
  return {
    type: CHANGE_FRIEND_STREAM,
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
