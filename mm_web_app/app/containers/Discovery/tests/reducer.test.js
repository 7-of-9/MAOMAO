
import { fromJS } from 'immutable';
import homeReducer from '../reducer';
import {
  changeTerms,
} from '../actions';

describe('homeReducer', () => {
  let state;
  beforeEach(() => {
    state = fromJS({
      terms: '',
      page: 1,
    });
  });

  it('should return the initial state', () => {
    const expectedResult = state;
    expect(homeReducer(undefined, {})).toEqual(expectedResult);
  });

  it('should handle the changeTerms action correctly', () => {
    const fixture = 'React';
    const expectedResult = state.set('terms', fixture);

    expect(homeReducer(state, changeTerms(fixture))).toEqual(expectedResult);
  });
});
