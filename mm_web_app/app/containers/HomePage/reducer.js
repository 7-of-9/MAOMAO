/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_KEYWORD,
} from './constants';

const initialState = fromJS({
  keyword: '',
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_KEYWORD:
      return state.set('keyword', action.keyword);
    default:
      return state;
  }
}

export default homeReducer;
