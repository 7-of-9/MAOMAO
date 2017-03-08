
import { fromJS } from 'immutable';
import extensionReducer from '../reducer';

describe('extensionReducer', () => {
  it('returns the initial state', () => {
    expect(extensionReducer(undefined, {})).toEqual(fromJS({}));
  });
});
