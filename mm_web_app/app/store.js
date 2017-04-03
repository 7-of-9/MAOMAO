/**
 * Create the store with asynchronously loaded reducers
 */
import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';
import * as storage from 'redux-storage';
import createLocalStorageEngine from 'redux-storage-engine-localstorage';
import debounce from 'redux-storage-decorator-debounce';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import { hasInstalledExtension } from 'utils/chrome';

const sagaMiddleware = createSagaMiddleware();
const localStorageEngine = createLocalStorageEngine('mm-web-app');
const engine = debounce(localStorageEngine, 1500);

export default function configureStore(initialState = {}, history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    sagaMiddleware,
    routerMiddleware(history),
    storage.createMiddleware(engine),
  ];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(logger);
  }

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    fromJS(initialState),
    composeEnhancers(...enhancers)
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.asyncReducers = {}; // Async reducer registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      import('./reducers').then((reducerModule) => {
        const createReducers = reducerModule.default;
        const nextReducers = createReducers(store.asyncReducers);

        store.replaceReducer(nextReducers);
      });
    });
  }

  const load = storage.createLoader(engine);
  load(store)
      .then((newState) => {
        console.log('Loaded state:', newState);
        // restore previous state
        if (newState.global) {
          store.dispatch({
            type: '@@RESTORE',
            data: {
              user: newState.global.data.googleConnect.user,
              codes: (newState.home && newState.home.codes) || [],
            },
          });
          // TODO: check that user has loged in, we will active the share
        }
      }).catch((err) => console.warn('Failed to load previous state', err));

  return store;
}
