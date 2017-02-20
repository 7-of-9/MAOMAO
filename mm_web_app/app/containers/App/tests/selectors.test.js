import { fromJS } from 'immutable';

import {
  selectGlobal,
  makeSelectLoading,
  makeSelectError,
  makeSelectGoogle,
  makeSelectLocationState,
} from 'containers/App/selectors';

describe('selectGlobal', () => {
  it('should select the global state', () => {
    const globalState = fromJS({});
    const mockedState = fromJS({
      global: globalState,
    });
    expect(selectGlobal(mockedState)).toEqual(globalState);
  });
});

describe('makeSelectGoogle', () => {
  const currentUserSelector = makeSelectGoogle();
  it('should select the google data', () => {
    const google = fromJS({});
    const mockedState = fromJS({
      global: {
        google,
      },
    });
    expect(currentUserSelector(mockedState)).toEqual(google);
  });
});

describe('makeSelectLoading', () => {
  const loadingSelector = makeSelectLoading();
  it('should select the loading', () => {
    const loading = false;
    const mockedState = fromJS({
      global: {
        loading,
      },
    });
    expect(loadingSelector(mockedState)).toEqual(loading);
  });
});

describe('makeSelectError', () => {
  const errorSelector = makeSelectError();
  it('should select the error', () => {
    const error = 404;
    const mockedState = fromJS({
      global: {
        error,
      },
    });
    expect(errorSelector(mockedState)).toEqual(error);
  });
});

describe('makeSelectLocationState', () => {
  it('should select the route as a plain JS object', () => {
    const route = fromJS({
      locationBeforeTransitions: null,
    });
    const mockedState = fromJS({
      route,
    });
    expect(makeSelectLocationState()(mockedState)).toEqual(route.toJS());
  });

  it('should return cached js routeState for same concurrent calls', () => {
    const route = fromJS({
      locationBeforeTransitions: null,
    });
    const mockedState = fromJS({
      route,
    });
    const selectLocationState = makeSelectLocationState();

    const firstRouteStateJS = selectLocationState(mockedState);
    expect(selectLocationState(mockedState)).toBe(firstRouteStateJS);
  });
});
