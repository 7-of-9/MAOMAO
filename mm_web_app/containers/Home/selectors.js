import { createSelector } from 'reselect'

/**
 * Direct selector to the home state domain
 */
const selectHomeDomain = () => (state) => state.get('home')

/**
 * Default selector used by Home
 */

const makeSelectHome = () => createSelector(
  selectHomeDomain(),
  (substate) => substate.toJS()
)

const makeSelectInviteCodes = () => createSelector(
  selectHomeDomain(),
  (substate) => substate.get('invite').toJS()
)

export default makeSelectHome
export {
  selectHomeDomain,
  makeSelectInviteCodes
}
