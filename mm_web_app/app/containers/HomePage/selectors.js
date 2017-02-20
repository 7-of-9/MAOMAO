/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';

const selectHome = (state) => state.get('home');

const makeSelectKeyword = () => createSelector(
  selectHome,
  (homeState) => homeState.get('keyword')
);

export {
  selectHome,
  makeSelectKeyword,
};
