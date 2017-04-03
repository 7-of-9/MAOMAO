/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable';
import { RESTORE } from 'containers/App/constants';
import {
  CHANGE_TERM, CHANGE_SUB_TERM, ACCEPT_INVITE_CODE,
} from './constants';

const initialBreadcrumbState = fromJS([]);
const initialCodesState = fromJS({
  codes: [],
  result: [],
});

const initialState = fromJS({
  currentTermId: -1,
  breadcrumbs: initialBreadcrumbState,
  invite: initialCodesState,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case RESTORE: {
      if (action.data.codes && action.data.codes.length) {
        return state.updateIn(['invite', 'codes'], () => fromJS(action.data.codes));
      }
      return state;
    }

    case ACCEPT_INVITE_CODE: {
      if (state.getIn(['invite', 'codes']).includes(action.data)) {
        return state;
      }
      return state.updateIn(['invite', 'codes'], (codes) => [].concat(codes, action.data));
    }

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
