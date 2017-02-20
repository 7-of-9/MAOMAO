import { fromJS } from 'immutable';

import {
  selectHome,
  makeSelectKeyword,
} from '../selectors';

const keyword = 'September 11';

describe('selectHome', () => {
  it('should select the home state', () => {
    const homeState = fromJS({
      keyword,
    });
    const mockedState = fromJS({
      home: homeState,
    });
    expect(selectHome(mockedState)).toEqual(homeState);
  });
});

describe('makeSelectKeyword', () => {
  const keywordSelector = makeSelectKeyword();
  it('should select the keyword', () => {
    const mockedState = fromJS({
      home: {
        keyword,
      },
    });
    expect(keywordSelector(mockedState)).toEqual(keyword);
  });
});
