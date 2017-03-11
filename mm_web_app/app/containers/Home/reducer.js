/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_TERM, SWITCH_USER,
} from './constants';

const initialState = fromJS({
  currentTermId: -1,
  userId: -1,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_TERM:
      return state.set('currentTermId', action.data);
    case SWITCH_USER:
      return state.set('userId', action.data);
    default:
      return state;
  }
}

export default homeReducer;
