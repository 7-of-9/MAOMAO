
import {
changeKeyword,
 } from '../actions';
import {
  CHANGE_KEYWORD,
} from '../constants';

describe('Home actions', () => {
  describe('Change keyword', () => {
    it('has a type of CHANGE_KEYWORD', () => {
      const fixture = 'George Bush';
      const expected = {
        type: CHANGE_KEYWORD,
        keyword: 'George Bush',
      };
      expect(changeKeyword(fixture)).toEqual(expected);
    });
  });
});
