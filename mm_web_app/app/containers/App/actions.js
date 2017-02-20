/*
 *
 * Homepage actions
 *
 */

import {
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_SEARCH_ERROR,
} from './constants';

export function googleSearch() {
  return {
    type: GOOGLE_SEARCH,
  };
}

export function googleLoaded(data, keyword) {
  return {
    type: GOOGLE_SEARCH_SUCCESS,
    data,
    keyword,
  };
}

export function googleLoadingError(error) {
  return {
    type: GOOGLE_SEARCH_ERROR,
    error,
  };
}
