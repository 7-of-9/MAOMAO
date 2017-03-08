/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';

const selectHome = (state) => state.get('home');

const makeSelectTerms = () => createSelector(
  selectHome,
  (homeState) => homeState.get('terms')
);

const makeSelectPageNumber = () => createSelector(
  selectHome,
  (homeState) => homeState.get('page')
);

export {
  selectHome,
  makeSelectTerms,
  makeSelectPageNumber,
};
