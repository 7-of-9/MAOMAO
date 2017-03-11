/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_TERM, CHANGE_SUB_TERM,
} from './constants';

const initialBreadcrumbState = fromJS([]);


const initialState = fromJS({
  currentTermId: -1,
  breadcrumbs: initialBreadcrumbState,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_TERM:
      {
        const currentTermId = action.data;
        if (state.get('breadcrumbs').filter((item) => item.termId === currentTermId)) {
          return state.set('currentTermId', currentTermId)
            .update('breadcrumbs', (breadcrumbs) => breadcrumbs.pop());
        }
        return state.set('currentTermId', currentTermId)
          .update('breadcrumbs', () => initialBreadcrumbState);
      }
    case CHANGE_SUB_TERM:
      return state.update('breadcrumbs', (breadcrumbs) => breadcrumbs.push(action.data));
    default:
      return state;
  }
}

export default homeReducer;
