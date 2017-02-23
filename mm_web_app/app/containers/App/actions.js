/*
 *
 * Homepage actions
 *
 */

import {
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_SEARCH_ERROR,
  GOOGLE_SEARCH_CLEAN,
  YOUTUBE_SEARCH,
  YOUTUBE_SEARCH_SUCCESS,
  YOUTUBE_SEARCH_ERROR,
  YOUTUBE_SEARCH_CLEAN,
} from './constants';

export function googleCleanResult() {
  return {
    type: GOOGLE_SEARCH_CLEAN,
  };
}

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

export function youtubeCleanResult() {
  return {
    type: YOUTUBE_SEARCH_CLEAN,
  };
}

export function youtubeSearch() {
  return {
    type: YOUTUBE_SEARCH,
  };
}

export function youtubeLoaded(data, keyword) {
  return {
    type: YOUTUBE_SEARCH_SUCCESS,
    data,
    keyword,
  };
}

export function youtubeLoadingError(error) {
  return {
    type: YOUTUBE_SEARCH_ERROR,
    error,
  };
}
