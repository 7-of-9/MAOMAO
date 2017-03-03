/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_TERM,
  NEXT_PAGE,
  RESET_PAGE,
} from './constants';

const initialState = fromJS({
  terms: [],
  page: 1,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_TERM:
      return state.set('terms', action.terms);
    case NEXT_PAGE:
      return state.set('page', Number(state.get('page') + 1));
    case RESET_PAGE:
      return state.set('page', 1);
    default:
      return state;
  }
}

export default homeReducer;
