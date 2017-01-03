import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';

import aliases from './aliases';
import rootReducer from './reducers';
import Config from './config';

const config = new Config();
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
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: 'Login',
  contexts: ['browser_action'],
  id: 'mm-btn-login',
});

function onClickHandler(info) {
  switch (info.menuItemId) {
    case 'mm-btn-logout': {
      console.log('trigger logout');
      const data = {
        type: 'AUTH_LOGOUT',
        payload: {},
      };
      store.dispatch(data);
    }
      break;
    case 'mm-btn-login':
    case 'mm-btn-show':
      {
        console.log('show login form');
        const data = {
          type: 'OPEN_MODAL',
          payload: {},
        };
        store.dispatch(data);
      }
      break;
    default:
      console.log('No processing for this ctx menu event');
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// firebase auth

// init firebase
firebase.initializeApp({
  apiKey: config.firebaseKey,
  databaseURL: config.firebaseDB,
  storageBucket: config.firebaseStore,
});

function initFirebaseApp() {
  console.log('initFirebaseApp');
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged((user) => {
    console.log('firebase => User state change detected from the Background script of the Chrome Extension:', user);
  });
}

window.onload = () => {
  initFirebaseApp();
};
