/*
 *
 * Homepage actions
 *
 */

import {
  CLEAN_SEARCH_RESULT,
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_SEARCH_ERROR,
  GOOGLE_NEWS_SEARCH,
  GOOGLE_NEWS_SEARCH_SUCCESS,
  GOOGLE_NEWS_SEARCH_ERROR,
  GOOGLE_KNOWLEDGE_SEARCH,
  GOOGLE_KNOWLEDGE_SEARCH_SUCCESS,
  GOOGLE_KNOWLEDGE_SEARCH_ERROR,
  YOUTUBE_SEARCH,
  YOUTUBE_SEARCH_SUCCESS,
  YOUTUBE_SEARCH_ERROR,
  REDDIT_SEARCH,
  REDDIT_SEARCH_SUCCESS,
  REDDIT_SEARCH_ERROR,
} from './constants';

export function cleanSearchResult() {
  return {
    type: CLEAN_SEARCH_RESULT,
  };
}

export function googleSearch() {
  return {
    type: GOOGLE_SEARCH,
  };
}

export function googleLoaded(data, terms) {
  return {
    type: GOOGLE_SEARCH_SUCCESS,
    data,
    terms,
  };
}

export function googleLoadingError(error) {
  return {
    type: GOOGLE_SEARCH_ERROR,
    error,
  };
}

export function googleNewsSearch() {
  return {
    type: GOOGLE_NEWS_SEARCH,
  };
}

export function googleNewsLoaded(data, terms) {
  return {
    type: GOOGLE_NEWS_SEARCH_SUCCESS,
    data,
    terms,
  };
}

export function googleNewsLoadingError(error) {
  return {
    type: GOOGLE_NEWS_SEARCH_ERROR,
    error,
  };
}

export function googleKnowledgeSearch() {
  return {
    type: GOOGLE_KNOWLEDGE_SEARCH,
  };
}

export function googleKnowledgeLoaded(data, terms) {
  return {
    type: GOOGLE_KNOWLEDGE_SEARCH_SUCCESS,
    data,
    terms,
  };
}

export function googleKnowledgeLoadingError(error) {
  return {
    type: GOOGLE_KNOWLEDGE_SEARCH_ERROR,
    error,
  };
}

export function youtubeSearch() {
  return {
    type: YOUTUBE_SEARCH,
  };
}

export function youtubeLoaded(data, terms) {
  return {
    type: YOUTUBE_SEARCH_SUCCESS,
    data,
    terms,
  };
}

export function youtubeLoadingError(error) {
  return {
    type: YOUTUBE_SEARCH_ERROR,
    error,
  };
}

export function redditSearch() {
  return {
    type: REDDIT_SEARCH,
  };
}

export function redditLoaded(data, terms) {
  return {
    type: REDDIT_SEARCH_SUCCESS,
    data,
    terms,
  };
}

export function redditLoadingError(error) {
  return {
    type: REDDIT_SEARCH_ERROR,
    error,
  };
}
