/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';

const selectHome = (state) => state.get('home');

const makeSelectKeyword = () => createSelector(
  selectHome,
  (homeState) => homeState.get('keyword')
);

const makeSelectPageNumber = () => createSelector(
  selectHome,
  (homeState) => homeState.get('page')
);

export {
  selectHome,
  makeSelectKeyword,
  makeSelectPageNumber,
};
