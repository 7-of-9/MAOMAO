/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_TERM, CHANGE_SUB_TERM,
} from './constants';

const initialBreadcrumbState = fromJS({
});


const initialState = fromJS({
  currentTermId: -1,
  breadcrumb: initialBreadcrumbState,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_TERM:
      return state.set('currentTermId', action.data)
        .update('breadcrumb', () => initialBreadcrumbState);
    case CHANGE_SUB_TERM:
      return state.set('breadcrumb', action.data);
    default:
      return state;
  }
}

export default homeReducer;
