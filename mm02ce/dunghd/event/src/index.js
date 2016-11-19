import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';

import aliases from './aliases';
import rootReducer from './reducers';

const middleware = [
  alias(aliases),
  thunkMiddleware,
];
const composeEnhancers = composeWithDevTools({ realtime: true });

const store = createStore(rootReducer, {}, composeEnhancers(
  applyMiddleware(...middleware)
));

wrapStore(store, {
  portName: 'maomao-extension',
});

// ctx menu handler

function onClickHandler(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
  switch (info.menuItemId) {
    case 'mm-btn-logout':
      console.log('trigger logout');
      const data = {
        type: 'AUTH_LOGOUT',
        payload: {},
      };
      store.dispatch(data);
      break;
    default:
      console.log('No processing for this ctx menu event');
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);
