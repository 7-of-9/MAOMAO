/**
 * Homepage selectors
 */

import { createSelector } from 'reselect'

const selectDiscovery = (state) => state.get('discovery')

const makeSelectTerms = () => createSelector(
  selectDiscovery,
  (discoveryState) => discoveryState.get('terms').toJS()
)

const makeSelectPageNumber = () => createSelector(
  selectDiscovery,
  (discoveryState) => discoveryState.get('page')
)

export {
  selectDiscovery,
  makeSelectTerms,
  makeSelectPageNumber
}
