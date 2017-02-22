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
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_ERROR,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_SEARCH_CLEAN,
} from './constants';

// The initial state of the App
const initialState = fromJS({
  loading: false,
  error: false,
  home: {
    keyword: '',
  },
  google: {},
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case GOOGLE_SEARCH:
      return state
        .set('loading', true)
        .set('error', false);
    case GOOGLE_SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('google', action.data);
    case GOOGLE_SEARCH_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    case GOOGLE_SEARCH_CLEAN:
      return state
        .set('google', {});
    default:
      return state;
  }
}

export default appReducer;
