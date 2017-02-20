import { fromJS } from 'immutable';

import appReducer from '../reducer';
import {
  googleSearch,
  googleLoaded,
  googleLoadingError,
} from '../actions';

describe('appReducer', () => {
  let state;
  beforeEach(() => {
    state = fromJS({
      loading: false,
      error: false,
      home: {
        keyword: '',
      },
      google: {},
    });
  });

  it('should return the initial state', () => {
    const expectedResult = state;
    expect(appReducer(undefined, {})).toEqual(expectedResult);
  });

  it('should handle the googleSearch action correctly', () => {
    const expectedResult = state
      .set('loading', true)
      .set('error', false);

    expect(appReducer(state, googleSearch())).toEqual(expectedResult);
  });

  it('should handle the googleLoaded action correctly', () => {
    const fixture = { done: 'okay' };
    const keyword = 'test';
    const expectedResult = state
    .set('loading', false)
    .set('google', fixture);

    expect(appReducer(state, googleLoaded(fixture, keyword))).toEqual(expectedResult);
  });

  it('should handle the googleLoadingError action correctly', () => {
    const fixture = {
      msg: 'Not found',
    };
    const expectedResult = state
      .set('error', fixture)
      .set('loading', false);

    expect(appReducer(state, googleLoadingError(fixture))).toEqual(expectedResult);
  });
});
