
import {
changeTerms,
 } from '../actions';
import {
  CHANGE_TERM,
} from '../constants';

describe('Home actions', () => {
  describe('Change terms', () => {
    it('has a type of CHANGE_TERM', () => {
      const fixture = 'George Bush';
      const expected = {
        type: CHANGE_TERM,
        terms: 'George Bush',
      };
      expect(changeTerms(fixture)).toEqual(expected);
    });
  });
});
