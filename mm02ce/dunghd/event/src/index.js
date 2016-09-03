import { wrapStore } from 'react-chrome-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(rootReducer, {});

wrapStore(store, {
  portName: 'maomao-extension',
});
