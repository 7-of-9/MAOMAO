/*
 * AppReducer
 *
 * The reducer takes care of our data. Using actions, we can change our
 * application state.
 * To add a new action, add it to the switch statement in the reducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return state.set('yourStateVariable', true);
 */

import { fromJS } from 'immutable';

import {
  CLEAN_SEARCH_RESULT,
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_ERROR,
  GOOGLE_SEARCH_SUCCESS,
  YOUTUBE_SEARCH,
  YOUTUBE_SEARCH_ERROR,
  YOUTUBE_SEARCH_SUCCESS,
} from './constants';

const initialGoogleState = {};
const initialYoutubeState = {
  nextPageToken: '',
};

// The initial state of the App
const initialState = fromJS({
  loading: false,
  error: false,
  home: {
    keyword: '',
  },
  google: initialGoogleState,
  youtube: initialYoutubeState,
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case YOUTUBE_SEARCH:
    case GOOGLE_SEARCH:
      return state
        .set('loading', true)
        .set('error', false);
    case GOOGLE_SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('google', action.data);
    case YOUTUBE_SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('youtube', action.data);
    case GOOGLE_SEARCH_ERROR:
    case YOUTUBE_SEARCH_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    case CLEAN_SEARCH_RESULT:
      return state.set('google', initialGoogleState)
        .set('youtube', initialYoutubeState);
    default:
      return state;
  }
}

export default appReducer;
