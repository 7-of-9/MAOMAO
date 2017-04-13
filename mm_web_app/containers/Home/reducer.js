/*
 *
 * Home reducer
 *
 */

import { fromJS } from 'immutable'

import { RESTORE, LOGOUT } from '../../containers/App/constants'
import {
   NEW_INVITE_CODE, ACCEPT_INVITE_SUCCESS, ACCEPT_INVITE_ERROR, CHANGE_TERM, CHANGE_FRIEND_STREAM
 } from './constants'

const initialCodesState = fromJS({
  codes: [],
  result: []
})

const initialState = fromJS({
  currentTermId: -1,
  friendStreamId: -1,
  invite: initialCodesState
})

function homeReducer (state = initialState, action) {
  switch (action.type) {
    case LOGOUT:
      return initialState

    case RESTORE: {
      if (action.data.codes && action.data.codes.length) {
        return state.updateIn(['invite', 'codes'], () => action.data.codes)
      }
      return state
    }

    case NEW_INVITE_CODE: {
      if (state.getIn(['invite', 'codes']).includes(action.data)) {
        return state
      }
      return state.updateIn(['invite', 'codes'], (codes) => codes.concat(action.data))
    }

    case ACCEPT_INVITE_ERROR:
    case ACCEPT_INVITE_SUCCESS:
      return state
      .updateIn(['invite', 'codes'], (codes) => codes.filter((item) => item !== action.data.shareCode))
      .updateIn(['invite', 'result'], (result) => result.push(action.data))

    case CHANGE_TERM:
      return state.set('currentTermId', action.data)
              .set('friendStreamId', -1)

    case CHANGE_FRIEND_STREAM:
      return state.set('friendStreamId', action.data)
              .set('currentTermId', -1)

    default:
      return state
  }
}

export default homeReducer
