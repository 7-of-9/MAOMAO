
import { fromJS } from 'immutable';
import homeReducer from '../reducer';
import {
  changeKeyword,
} from '../actions';

describe('homeReducer', () => {
  let state;
  beforeEach(() => {
    state = fromJS({
      keyword: '',
      page: 1,
    });
  });

  it('should return the initial state', () => {
    const expectedResult = state;
    expect(homeReducer(undefined, {})).toEqual(expectedResult);
  });

  it('should handle the changeKeyword action correctly', () => {
    const fixture = 'React';
    const expectedResult = state.set('keyword', fixture);

    expect(homeReducer(state, changeKeyword(fixture))).toEqual(expectedResult);
  });
});
