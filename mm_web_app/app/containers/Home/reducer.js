/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_TERM, CHANGE_SUB_TERM, ACCEPT_INVITE_CODE,
} from './constants';

const initialBreadcrumbState = fromJS([]);
const initialCodesState = fromJS([]);

const initialState = fromJS({
  currentTermId: -1,
  breadcrumbs: initialBreadcrumbState,
  codes: initialCodesState,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case '@@RESTORE': {
      if (action.data.codes && action.data.codes.length) {
        return state.update('codes', () => fromJS(action.data.codes));
      }
      return state;
    }

    case ACCEPT_INVITE_CODE:
      return state.update('codes', (codes) => [].concat(codes, action.data));

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
