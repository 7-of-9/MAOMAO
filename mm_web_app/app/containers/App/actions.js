/*
 *
 * Homepage actions
 *
 */

import {
  CLEAN_SEARCH_RESULT,
  GOOGLE_CRAWLER,
  GOOGLE_CRAWLER_SUCCESS,
  GOOGLE_CRAWLER_ERROR,
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_SEARCH_ERROR,
  YOUTUBE_SEARCH,
  YOUTUBE_SEARCH_SUCCESS,
  YOUTUBE_SEARCH_ERROR,
} from './constants';

export function cleanSearchResult() {
  return {
    type: CLEAN_SEARCH_RESULT,
  };
}

export function crawlerGoogleSearch() {
  return {
    type: GOOGLE_CRAWLER,
  };
}

export function crawlerGoogleLoaded(data, keyword) {
  return {
    type: GOOGLE_CRAWLER_SUCCESS,
    data,
    keyword,
  };
}

export function crawlerGoogleLoadingError(error) {
  return {
    type: GOOGLE_CRAWLER_ERROR,
    error,
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
