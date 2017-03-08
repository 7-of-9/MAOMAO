import { createSelector } from 'reselect';

/**
 * Direct selector to the extension state domain
 */
const selectExtensionDomain = () => (state) => state.get('extension');

/**
 * Other specific selectors
 */


/**
 * Default selector used by Extension
 */

const makeSelectExtension = () => createSelector(
  selectExtensionDomain(),
  (substate) => substate.toJS()
);

export default makeSelectExtension;
export {
  selectExtensionDomain,
};
