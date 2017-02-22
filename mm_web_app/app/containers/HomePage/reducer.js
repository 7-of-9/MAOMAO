/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_KEYWORD,
  NEXT_PAGE,
  RESET_PAGE,
} from './constants';

const initialState = fromJS({
  keyword: '',
  page: 1,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_KEYWORD:
      return state.set('keyword', action.keyword);
    case NEXT_PAGE:
      return state.set('page', Number(state.get('page') + 1));
    case RESET_PAGE:
      return state.set('page', 1);
    default:
      return state;
  }
}

export default homeReducer;
