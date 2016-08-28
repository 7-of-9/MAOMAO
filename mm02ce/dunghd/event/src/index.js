import {createStore} from 'redux';
import rootReducer from './reducers';

import {wrapStore} from 'react-chrome-redux';

const store = createStore(rootReducer, {}, window.devToolsExtension && window.devToolsExtension() );

wrapStore(store, {
    portName: 'maomao-extension'
});