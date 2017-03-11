/*
 *
 * Home actions
 *
 */

import {
  CHANGE_TERM,
  CHANGE_SUB_TERM,
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
