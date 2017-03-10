/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_TERM,
} from './constants';

const initialState = fromJS({
  currentTermId: -1,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_TERM:
      return state.set('currentTermId', action.data);
    default:
      return state;
  }
}

export default homeReducer;
