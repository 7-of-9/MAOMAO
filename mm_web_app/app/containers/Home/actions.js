/*
 *
 * Home actions
 *
 */

import {
  CHANGE_TERM,
} from './constants';

export function changeTerm(data) {
  return {
    type: CHANGE_TERM,
    data,
  };
}
