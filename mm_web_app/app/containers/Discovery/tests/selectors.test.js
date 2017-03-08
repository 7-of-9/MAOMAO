import { fromJS } from 'immutable';

import {
  selectHome,
  makeSelectTerms,
} from '../selectors';

const terms = 'September 11';

describe('selectHome', () => {
  it('should select the home state', () => {
    const homeState = fromJS({
      terms,
    });
    const mockedState = fromJS({
      home: homeState,
    });
    expect(selectHome(mockedState)).toEqual(homeState);
  });
});

describe('makeSelectTerms', () => {
  const termsSelector = makeSelectTerms();
  it('should select the terms', () => {
    const mockedState = fromJS({
      home: {
        terms,
      },
    });
    expect(termsSelector(mockedState)).toEqual(terms);
  });
});
