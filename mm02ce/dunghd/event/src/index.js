import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import aliases from './aliases';
import rootReducer from './reducers';

const middleware = [
  alias(aliases),
  thunkMiddleware,
];

const store = createStore(rootReducer, {}, applyMiddleware(...middleware));

wrapStore(store, {
  portName: 'maomao-extension',
});
