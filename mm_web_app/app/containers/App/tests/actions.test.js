import {
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_SEARCH_ERROR,
} from '../constants';

import {
  googleSearch,
  googleLoaded,
  googleLoadingError,
} from '../actions';

describe('App Actions', () => {
  describe('googleSearch', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: GOOGLE_SEARCH,
      };

      expect(googleSearch()).toEqual(expectedResult);
    });
  });

  describe('googleLoaded', () => {
    it('should return the correct type and the passed result', () => {
      const data = {};
      const terms = 'test';
      const expectedResult = {
        type: GOOGLE_SEARCH_SUCCESS,
        data,
        terms,
      };

      expect(googleLoaded(data, terms)).toEqual(expectedResult);
    });
  });

  describe('googleLoadingError', () => {
    it('should return the correct type and the error', () => {
      const fixture = {
        msg: 'Something went wrong!',
      };
      const expectedResult = {
        type: GOOGLE_SEARCH_ERROR,
        error: fixture,
      };

      expect(googleLoadingError(fixture)).toEqual(expectedResult);
    });
  });
});
